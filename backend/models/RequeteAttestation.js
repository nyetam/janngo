const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RequeteAttestation = sequelize.define('RequeteAttestation', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Requetes', key: 'id' },
    },
    typeAttestation: { type: DataTypes.STRING(100), allowNull: false },
    anneeAcademique: { type: DataTypes.STRING(20), allowNull: false },
    nombreExemplaires: { type: DataTypes.INTEGER, defaultValue: 1 },
    // Service chargé du traitement après orientation par le Dir. Adjoint
    serviceTraitant: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
    },
  }, { tableName: 'RequeteAttestations', timestamps: false });

  RequeteAttestation.associate = (models) => {
    RequeteAttestation.belongsTo(models.Requete, { foreignKey: 'id', as: 'requete' });
  };

  return RequeteAttestation;
};
