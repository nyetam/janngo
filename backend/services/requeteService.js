const {
  Requete, RequeteAttestation, RequeteCorrectionNom, RequeteContestationNote,
  Etudiant, Utilisateur, Document, Traitement, HistoriqueStatut, Personnel,
} = require('../models');
const { Op } = require('sequelize');
const workflowService = require('./workflowService');

const INCLUDE_BASE = [
  {
    model: Etudiant, as: 'etudiant',
    include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom', 'email'] }],
  },
  { model: Document, as: 'documents' },
  {
    model: HistoriqueStatut, as: 'historique',
    separate: true, // évite les doublons avec ORDER BY dans les JOINs
    order: [['dateChangement', 'DESC']],
  },
  {
    model: Traitement, as: 'traitements',
    separate: true,
    order: [['dateTraitement', 'DESC']],
    include: [{
      model: Personnel, as: 'personnel',
      include: [{ model: Utilisateur, as: 'utilisateur', attributes: ['nom', 'prenom'] }],
    }],
  },
  { model: RequeteAttestation, as: 'attestation', required: false },
  { model: RequeteCorrectionNom, as: 'correctionNom', required: false },
  { model: RequeteContestationNote, as: 'contestationNote', required: false },
];

const requeteService = {
  async creerRequete(etudiant_id, data) {
    const { type, description, priorite, ...details } = data;

    const requete = await Requete.create({
      type,
      description,
      priorite: 'NORMALE', // toujours NORMALE — non exposé à l'étudiant
      etudiant_id,
    });

    if (type === 'ATTESTATION') {
      await RequeteAttestation.create({ id: requete.id, ...details });
    } else if (type === 'CORRECTION_NOM') {
      await RequeteCorrectionNom.create({ id: requete.id, ...details });
    } else if (type === 'CONTESTATION_NOTE') {
      await RequeteContestationNote.create({ id: requete.id, ...details });
    }

    await HistoriqueStatut.create({
      ancienStatut: 'EN_ATTENTE',
      nouveauStatut: 'EN_ATTENTE',
      changedBy: `étudiant_${etudiant_id}`,
      motif: 'Soumission initiale de la requête',
      requete_id: requete.id,
    });

    return await requeteService.getRequete(requete.id);
  },

  async getRequete(id) {
    return await Requete.findByPk(id, { include: INCLUDE_BASE });
  },

  async getRequetesEtudiant(etudiant_id) {
    return await Requete.findAll({
      where: { etudiant_id },
      include: INCLUDE_BASE,
      order: [['dateDepot', 'DESC']],
    });
  },

  /**
   * Retourne TOUTES les requêtes pertinentes pour un rôle donné
   * (tous statuts inclus) afin que les dashboards puissent calculer
   * des compteurs précis (en attente, en cours, traitées, etc.)
   */
  async getRequetesParRole(role) {
    let where = {};

    switch (role) {
      case 'SECRETAIRE':
        // Reçoit ATTESTATION et CORRECTION_NOM — retourne toutes pour avoir les compteurs
        where.type = { [Op.in]: ['ATTESTATION', 'CORRECTION_NOM'] };
        break;

      case 'DIR_ADJOINT':
        // Oriente les ATTESTATION — voir tout l'historique
        where.type = 'ATTESTATION';
        break;

      case 'DIRECTEUR':
        // Valide les CORRECTION_NOM — voir tout l'historique
        where.type = 'CORRECTION_NOM';
        break;

      case 'RESP_DEPT':
        // Traite ATTESTATION (orientées) + CONTESTATION_NOTE
        where.type = { [Op.in]: ['ATTESTATION', 'CONTESTATION_NOTE'] };
        break;

      case 'SCOLARITE':
        // Traite ATTESTATION (orientées vers scolarité)
        where.type = 'ATTESTATION';
        break;

      case 'CELLULE_INFO':
        // Modifie dans le système les CORRECTION_NOM validées + CONTESTATION_NOTE validées
        where.type = { [Op.in]: ['CORRECTION_NOM', 'CONTESTATION_NOTE'] };
        break;

      default:
        where.id = { [Op.is]: null }; // rien retourné pour rôle inconnu
    }

    return await Requete.findAll({
      where,
      include: INCLUDE_BASE,
      order: [['dateDepot', 'DESC']],
    });
  },
};

module.exports = requeteService;
