const requeteService = require('../services/requeteService');
const workflowService = require('../services/workflowService');

const requeteController = {
  async lister(req, res) {
    try {
      const { role, etudiant, personnel } = req.user;
      let requetes;

      if (role === 'ETUDIANT') {
        requetes = await requeteService.getRequetesEtudiant(etudiant.id);
      } else {
        requetes = await requeteService.getRequetesParRole(role, personnel?.id);
      }

      res.json(requetes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async creer(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const requete = await requeteService.creerRequete(etudiant_id, req.body);
      res.status(201).json(requete);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async detail(req, res) {
    try {
      const requete = await requeteService.getRequete(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });

      if (req.userRole === 'ETUDIANT' && requete.etudiant_id !== req.user.etudiant?.id) {
        return res.status(403).json({ message: 'Accès refusé' });
      }

      res.json(requete);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async changerStatut(req, res) {
    try {
      const { statut, motif } = req.body;
      const { nom, prenom, role } = req.user;
      const changedBy = `${prenom} ${nom} (${role})`;
      const personnel_id = req.user.personnel?.id;

      const requete = await workflowService.changerStatut(
        req.params.id, statut, changedBy, motif, personnel_id, `Changement statut par ${role}`
      );

      res.json(requete);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async historique(req, res) {
    try {
      const { HistoriqueStatut } = require('../models');
      const historique = await HistoriqueStatut.findAll({
        where: { requete_id: req.params.id },
        order: [['dateChangement', 'DESC']],
      });
      res.json(historique);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = requeteController;
