const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Directeur = sequelize.define('Directeur', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    domaineSupervision: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'Directeurs', timestamps: false });

  Directeur.associate = (models) => {
    Directeur.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return Directeur;
};
