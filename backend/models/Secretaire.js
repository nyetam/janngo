const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Secretaire = sequelize.define('Secretaire', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    bureau: { type: DataTypes.STRING(50), allowNull: false },
  }, { tableName: 'Secretaires', timestamps: false });

  Secretaire.associate = (models) => {
    Secretaire.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return Secretaire;
};
