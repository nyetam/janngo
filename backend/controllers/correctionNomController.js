const requeteService = require('../services/requeteService');
const workflowService = require('../services/workflowService');
const { Requete } = require('../models');

const correctionNomController = {
  async soumettre(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const { ancienNom, nouveauNom, description } = req.body;
      if (!ancienNom || !nouveauNom) {
        return res.status(400).json({ message: 'ancienNom et nouveauNom sont requis' });
      }

      const requete = await requeteService.creerRequete(etudiant_id, {
        type: 'CORRECTION_NOM',
        description,
        priorite: 'NORMALE',
        ancienNom,
        nouveauNom,
      });

      res.status(201).json(requete);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // SECRÉTARIAT → transmet au DIRECTEUR
  async transmettre(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'EN_ATTENTE') {
        return res.status(400).json({ message: `Dossier déjà transmis (statut : ${requete.statut})` });
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (SECRETAIRE)`;
      const { motif } = req.body;
      const result = await workflowService.changerStatut(
        req.params.id, 'EN_COURS', changedBy,
        motif || 'Dossier réceptionné et vérifié par le secrétariat — transmis au Directeur',
        req.user.personnel?.id, 'Réception secrétariat → Directeur'
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DIRECTEUR → valide ou rejette
  async valider(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'EN_COURS') {
        return res.status(400).json({ message: `Décision déjà prise (statut : ${requete.statut})` });
      }

      const { decision, motif } = req.body;
      if (!decision || !['APPROUVE', 'REJETE'].includes(decision)) {
        return res.status(400).json({ message: 'decision doit être APPROUVE ou REJETE' });
      }

      const nouveauStatut = decision === 'APPROUVE' ? 'VALIDEE' : 'REJETEE';
      const changedBy = `${req.user.prenom} ${req.user.nom} (DIRECTEUR)`;
      const result = await workflowService.changerStatut(
        req.params.id, nouveauStatut, changedBy,
        motif || `Décision du Directeur : ${decision}`,
        req.user.personnel?.id, `Validation Directeur — ${decision}`
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // CELLULE INFORMATIQUE → modifie dans le système et clôture
  async modifier(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'VALIDEE') {
        return res.status(400).json({ message: `La requête doit être VALIDEE avant modification (statut actuel : ${requete.statut})` });
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (CELLULE_INFO)`;
      const { commentaire } = req.body;
      const result = await workflowService.changerStatut(
        req.params.id, 'CLOTUREE', changedBy,
        commentaire || 'Nom modifié dans le système par la cellule informatique',
        req.user.personnel?.id, 'Modification système — Cellule Informatique'
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = correctionNomController;
