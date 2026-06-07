const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequeteCorrectionNom = sequelize.define('RequeteCorrectionNom', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Requetes', key: 'id' },
    },
    ancienNom: { type: DataTypes.STRING(100), allowNull: false },
    nouveauNom: { type: DataTypes.STRING(100), allowNull: false },
    serviceTraitant: {
      type: DataTypes.ENUM('DEPARTEMENT','SCOLARITE'),
      allowNull: true,
    },
  }, { tableName: 'RequeteCorrectionNoms', timestamps: false });

  RequeteCorrectionNom.associate = (models) => {
    RequeteCorrectionNom.belongsTo(models.Requete, { foreignKey: 'id', as: 'requete' });
  };

  return RequeteCorrectionNom;
};
