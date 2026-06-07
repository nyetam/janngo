const { Requete, HistoriqueStatut, Traitement } = require('../models');
const notificationService = require('./notificationService');

const workflowService = {
  async changerStatut(requete_id, nouveauStatut, changedBy, motif = null, personnel_id = null, etape = null) {
    const requete = await Requete.findByPk(requete_id, {
      include: [{ association: 'etudiant' }],
    });

    if (!requete) throw new Error('Requête introuvable');

    const ancienStatut = requete.statut;

    await HistoriqueStatut.create({
      ancienStatut,
      nouveauStatut,
      motif,
      changedBy,
      requete_id,
    });

    requete.statut = nouveauStatut;
    requete.dateMiseAJour = new Date();
    await requete.save();

    if (personnel_id && etape) {
      await Traitement.create({
        etape,
        commentaire: motif,
        decision: nouveauStatut === 'VALIDEE' ? 'APPROUVE' : nouveauStatut === 'REJETEE' ? 'REJETE' : 'EN_ATTENTE',
        requete_id,
        personnel_id,
      });
    }

    await notificationService.creerNotification(requete.etudiant_id, requete_id, nouveauStatut, motif);

    return requete;
  },

  async validerTransition(ancienStatut, nouveauStatut) {
    const transitions = {
      EN_ATTENTE: ['EN_COURS', 'REJETEE'],
      EN_COURS: ['ATTENTE_INFO', 'VALIDEE', 'REJETEE', 'CLOTUREE'],
      ATTENTE_INFO: ['EN_COURS', 'REJETEE'],
      VALIDEE: ['CLOTUREE'],
      REJETEE: [],
      CLOTUREE: [],
    };

    return transitions[ancienStatut]?.includes(nouveauStatut) ?? false;
  },
};

module.exports = workflowService;
