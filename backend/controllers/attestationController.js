const requeteService = require('../services/requeteService');
const workflowService = require('../services/workflowService');
const { RequeteAttestation, Requete } = require('../models');

const attestationController = {
  async soumettre(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const { typeAttestation, anneeAcademique, nombreExemplaires, description } = req.body;
      if (!typeAttestation || !anneeAcademique) {
        return res.status(400).json({ message: 'typeAttestation et anneeAcademique sont requis' });
      }

      const requete = await requeteService.creerRequete(etudiant_id, {
        type: 'ATTESTATION',
        description,
        priorite: 'NORMALE', // toujours NORMALE — non exposé à l'étudiant
        typeAttestation,
        anneeAcademique,
        nombreExemplaires: nombreExemplaires || 1,
      });

      res.status(201).json(requete);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // SECRÉTARIAT → transmet au DIR_ADJOINT (statut EN_ATTENTE → EN_COURS)
  async transmettre(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'EN_ATTENTE') {
        return res.status(400).json({ message: `Requête déjà traitée (statut : ${requete.statut})` });
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (SECRETAIRE)`;
      const { motif } = req.body;
      const result = await workflowService.changerStatut(
        req.params.id, 'EN_COURS', changedBy,
        motif || 'Dossier réceptionné et éligibilité vérifiée par le secrétariat',
        req.user.personnel?.id, 'Réception secrétariat → Dir. Adjoint'
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DIR. ADJOINT → oriente vers Département ou Scolarité
  async orienter(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id, {
        include: [{ model: RequeteAttestation, as: 'attestation' }],
      });
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });

      // Bloquer l'orientation multiple (Correction 6)
      // La requête vient du secrétariat avec statut EN_COURS
      // Elle ne peut être orientée QUE si serviceTraitant est encore null
      if (requete.statut !== 'EN_COURS') {
        return res.status(400).json({ message: `Requête dans un état incompatible pour l'orientation (statut : ${requete.statut})` });
      }
      if (requete.attestation?.serviceTraitant) {
        return res.status(400).json({ message: 'Cette requête a déjà été orientée vers ' + requete.attestation.serviceTraitant });
      }

      const { serviceTraitant, motif } = req.body;
      if (!serviceTraitant || !['DEPARTEMENT', 'SCOLARITE'].includes(serviceTraitant)) {
        return res.status(400).json({ message: 'serviceTraitant doit être DEPARTEMENT ou SCOLARITE' });
      }

      // Enregistrer la cible
      if (requete.attestation) {
        await RequeteAttestation.update(
          { serviceTraitant },
          { where: { id: req.params.id } }
        );
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (DIR_ADJOINT)`;
      const labelService = serviceTraitant === 'DEPARTEMENT' ? 'Département' : 'Scolarité';
      const result = await workflowService.changerStatut(
        req.params.id, 'EN_COURS', changedBy,
        motif || `Orienté vers : ${labelService}`,
        req.user.personnel?.id, `Orientation Dir. Adjoint → ${labelService}`
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DÉPARTEMENT ou SCOLARITÉ → retourne le résultat
  async retournerResultat(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (!['EN_COURS', 'EN_ATTENTE'].includes(requete.statut)) {
        return res.status(400).json({ message: `Résultat déjà soumis (statut : ${requete.statut})` });
      }

      const { decision, motif } = req.body;
      if (!decision || !['FAVORABLE', 'DEFAVORABLE'].includes(decision)) {
        return res.status(400).json({ message: 'decision doit être FAVORABLE ou DEFAVORABLE' });
      }

      const nouveauStatut = decision === 'FAVORABLE' ? 'VALIDEE' : 'REJETEE';
      const changedBy = `${req.user.prenom} ${req.user.nom} (${req.userRole})`;
      const result = await workflowService.changerStatut(
        req.params.id, nouveauStatut, changedBy,
        motif || `Décision : ${decision}`,
        req.user.personnel?.id, `Résultat traitement attestation — ${decision}`
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = attestationController;
