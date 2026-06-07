const chatbotService = require('../services/chatbotService');

const chatbotController = {
  async envoyerMessage(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const { contenu, conversation_id } = req.body;
      if (!contenu?.trim()) return res.status(400).json({ message: 'Message vide' });

      const result = await chatbotService.envoyerMessage(etudiant_id, contenu, conversation_id || null);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async historique(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const { conversation_id } = req.query;
      if (!conversation_id) return res.status(400).json({ message: 'conversation_id requis' });

      const conv = await chatbotService.getHistorique(etudiant_id, conversation_id);
      res.json(conv || { messages: [] });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = chatbotController;
