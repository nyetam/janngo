const { Requete, Etudiant, Utilisateur, Traitement, sequelize } = require('../models');
const { Op } = require('sequelize');

const rapportController = {
  async activite(req, res) {
    try {
      const { debut, fin } = req.query;
      const where = {};

      if (debut && fin) {
        where.dateDepot = { [Op.between]: [new Date(debut), new Date(fin)] };
      }

      const totalRequetes = await Requete.count({ where });
      const parType = await Requete.findAll({
        where,
        attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
        group: ['type'],
        raw: true,
      });
      const parStatut = await Requete.findAll({
        where,
        attributes: ['statut', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
        group: ['statut'],
        raw: true,
      });

      res.json({ totalRequetes, parType, parStatut });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  async statistiquesRequetes(req, res) {
    try {
      const { Op, fn, col, literal } = require('sequelize');

      const stats = await Requete.findAll({
        attributes: [
          'type', 'statut', 'priorite',
          [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
          [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('dateDepot')), 'mois'],
        ],
        group: ['type', 'statut', 'priorite', sequelize.fn('DATE_TRUNC', 'month', sequelize.col('dateDepot'))],
        order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('dateDepot')), 'DESC']],
        raw: true,
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = rapportController;
