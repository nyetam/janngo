const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Administration = sequelize.define('Administration', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    dateAction: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    typeAction: {
      type: DataTypes.ENUM('CREATION','MODIFICATION','SUSPENSION','CONSULTATION'),
      allowNull: false,
    },
    commentaire: { type: DataTypes.TEXT, allowNull: true },
    ancienneValeur: { type: DataTypes.STRING(255), allowNull: true },
    nouvelleValeur: { type: DataTypes.STRING(255), allowNull: true },
    personnel_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Personnels', key: 'id' },
    },
    etudiant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Etudiants', key: 'id' },
    },
  }, { tableName: 'Administrations', timestamps: false });

  Administration.associate = (models) => {
    Administration.belongsTo(models.Personnel, { foreignKey: 'personnel_id', as: 'personnel' });
    Administration.belongsTo(models.Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });
  };

  return Administration;
};
