const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Scolarite = sequelize.define('Scolarite', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    sectionGeree: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'Scolarites', timestamps: false });

  Scolarite.associate = (models) => {
    Scolarite.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return Scolarite;
};
