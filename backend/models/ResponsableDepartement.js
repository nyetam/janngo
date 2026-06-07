const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ResponsableDepartement = sequelize.define('ResponsableDepartement', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    nomDepartement: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'ResponsableDepartements', timestamps: false });

  ResponsableDepartement.associate = (models) => {
    ResponsableDepartement.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return ResponsableDepartement;
};
