const requeteService = require('../services/requeteService');
const workflowService = require('../services/workflowService');
const { RequeteContestationNote, Requete } = require('../models');

const contestationNoteController = {
  async soumettre(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const { matiere, noteContestee, motifContestation, description } = req.body;
      if (!matiere || noteContestee === undefined || !motifContestation) {
        return res.status(400).json({ message: 'matiere, noteContestee et motifContestation sont requis' });
      }

      const requete = await requeteService.creerRequete(etudiant_id, {
        type: 'CONTESTATION_NOTE',
        description,
        priorite: 'NORMALE',
        matiere,
        noteContestee: parseFloat(noteContestee),
        motifContestation,
      });

      res.status(201).json(requete);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DÉPARTEMENT → réceptionne et marque EN_COURS (analyse recevabilité)
  async analyser(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'EN_ATTENTE') {
        return res.status(400).json({ message: `Requête déjà prise en charge (statut : ${requete.statut})` });
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (RESP_DEPT)`;
      const { motif } = req.body;
      const result = await workflowService.changerStatut(
        req.params.id, 'EN_COURS', changedBy,
        motif || 'Dossier réceptionné et analyse de recevabilité en cours',
        req.user.personnel?.id, 'Analyse département'
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // DÉPARTEMENT → rend le résultat (FAVORABLE → VALIDEE, DEFAVORABLE → REJETEE)
  async retournerResultat(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (!['EN_COURS', 'EN_ATTENTE'].includes(requete.statut)) {
        return res.status(400).json({ message: `Résultat déjà soumis (statut : ${requete.statut})` });
      }

      const { decision, decisionDepartement, noteCorrigee } = req.body;
      if (!decision || !['FAVORABLE', 'DEFAVORABLE'].includes(decision)) {
        return res.status(400).json({ message: 'decision doit être FAVORABLE ou DEFAVORABLE' });
      }

      // Mettre à jour les champs spécifiques
      const updateData = { decisionDepartement: decisionDepartement || `Décision : ${decision}` };
      if (decision === 'FAVORABLE' && noteCorrigee !== undefined) {
        updateData.noteCorrigee = parseFloat(noteCorrigee);
      }
      await RequeteContestationNote.update(updateData, { where: { id: req.params.id } });

      const nouveauStatut = decision === 'FAVORABLE' ? 'VALIDEE' : 'REJETEE';
      const changedBy = `${req.user.prenom} ${req.user.nom} (RESP_DEPT)`;
      const result = await workflowService.changerStatut(
        req.params.id, nouveauStatut, changedBy,
        decisionDepartement || `Décision département : ${decision}`,
        req.user.personnel?.id, `Résultat contestation note — ${decision}`
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // CELLULE INFORMATIQUE → met à jour la note dans le système
  async modifierNote(req, res) {
    try {
      const requete = await Requete.findByPk(req.params.id);
      if (!requete) return res.status(404).json({ message: 'Requête introuvable' });
      if (requete.statut !== 'VALIDEE') {
        return res.status(400).json({ message: `La requête doit être VALIDEE avant mise à jour (statut : ${requete.statut})` });
      }

      const { noteCorrigee, commentaire } = req.body;
      if (noteCorrigee !== undefined) {
        await RequeteContestationNote.update(
          { noteCorrigee: parseFloat(noteCorrigee) },
          { where: { id: req.params.id } }
        );
      }

      const changedBy = `${req.user.prenom} ${req.user.nom} (CELLULE_INFO)`;
      const result = await workflowService.changerStatut(
        req.params.id, 'CLOTUREE', changedBy,
        commentaire || `Note mise à jour dans le système${noteCorrigee !== undefined ? ` : ${noteCorrigee}/20` : ''}`,
        req.user.personnel?.id, 'Mise à jour note — Cellule Informatique'
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};

module.exports = contestationNoteController;
