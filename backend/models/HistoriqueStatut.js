const { DataTypes } = require('sequelize');

const STATUTS = ['EN_ATTENTE','EN_COURS','ATTENTE_INFO','VALIDEE','REJETEE','CLOTUREE'];

module.exports = (sequelize) => {
  const HistoriqueStatut = sequelize.define('HistoriqueStatut', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    ancienStatut: { type: DataTypes.ENUM(...STATUTS), allowNull: false },
    nouveauStatut: { type: DataTypes.ENUM(...STATUTS), allowNull: false },
    dateChangement: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    motif: { type: DataTypes.TEXT, allowNull: true },
    changedBy: { type: DataTypes.STRING(100), allowNull: false },
    requete_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Requetes', key: 'id' },
    },
  }, { tableName: 'HistoriqueStatuts', timestamps: false });

  HistoriqueStatut.associate = (models) => {
    HistoriqueStatut.belongsTo(models.Requete, { foreignKey: 'requete_id', as: 'requete' });
  };

  return HistoriqueStatut;
};
