const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DirecteurAdjoint = sequelize.define('DirecteurAdjoint', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    domaineDelegation: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'DirecteurAdjoints', timestamps: false });

  DirecteurAdjoint.associate = (models) => {
    DirecteurAdjoint.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return DirecteurAdjoint;
};
