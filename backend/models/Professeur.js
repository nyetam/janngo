const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Professeur = sequelize.define('Professeur', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Personnels', key: 'id' },
    },
    specialite: { type: DataTypes.STRING(100), allowNull: false },
    grade: { type: DataTypes.STRING(50), allowNull: false },
  }, { tableName: 'Professeurs', timestamps: false });

  Professeur.associate = (models) => {
    Professeur.belongsTo(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return Professeur;
};
