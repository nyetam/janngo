const notificationService = require('../services/notificationService');
const { Notification } = require('../models');

const notificationController = {
  async mesNotifications(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const notifs = await Notification.findAll({
        where: { etudiant_id },
        order: [['dateEnvoi', 'DESC']],
        limit: 50,
      });

      res.json(notifs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async marquerLu(req, res) {
    try {
      const etudiant_id = req.user.etudiant?.id;
      if (!etudiant_id) return res.status(403).json({ message: 'Accès réservé aux étudiants' });

      const notif = await notificationService.marquerCommeLu(req.params.id, etudiant_id);
      if (!notif) return res.status(404).json({ message: 'Notification introuvable' });

      res.json(notif);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = notificationController;
