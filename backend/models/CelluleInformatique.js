const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CelluleInformatique = sequelize.define('CelluleInformatique', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    systemeGere: { type: DataTypes.STRING(100), allowNull: false },
  }, { tableName: 'CelluleInformatiques', timestamps: false });

  CelluleInformatique.associate = (models) => {
    CelluleInformatique.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return CelluleInformatique;
};
