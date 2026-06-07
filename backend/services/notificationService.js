const { Notification } = require('../models');

const MESSAGES = {
  EN_ATTENTE: 'Votre requête a été soumise avec succès et est en attente de traitement.',
  EN_COURS: 'Votre requête est en cours de traitement.',
  ATTENTE_INFO: 'Des informations complémentaires sont requises pour votre requête.',
  VALIDEE: 'Votre requête a été validée avec succès.',
  REJETEE: 'Votre requête a été rejetée.',
  CLOTUREE: 'Votre requête a été clôturée.',
};

const TYPE_MAP = {
  EN_ATTENTE: 'CONFIRMATION',
  EN_COURS: 'INFO',
  ATTENTE_INFO: 'INFO',
  VALIDEE: 'VALIDATION',
  REJETEE: 'REJET',
  CLOTUREE: 'INFO',
};

const notificationService = {
  async creerNotification(etudiant_id, requete_id, statut, messagePersonnalise = null) {
    const message = messagePersonnalise || MESSAGES[statut] || 'Votre requête a été mise à jour.';
    const type = TYPE_MAP[statut] || 'INFO';

    return await Notification.create({
      message,
      canal: 'IN_APP',
      type,
      etudiant_id,
      requete_id,
    });
  },

  async getNotificationsNonLues(etudiant_id) {
    return await Notification.findAll({
      where: { etudiant_id, lu: false },
      order: [['dateEnvoi', 'DESC']],
    });
  },

  async marquerCommeLu(id, etudiant_id) {
    const notif = await Notification.findOne({ where: { id, etudiant_id } });
    if (!notif) return null;
    notif.lu = true;
    await notif.save();
    return notif;
  },
};

module.exports = notificationService;
