const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Personnel = sequelize.define('Personnel', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Utilisateurs', key: 'id' },
    },
    matriculePersonnel: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    poste: { type: DataTypes.STRING(100), allowNull: false },
    service: { type: DataTypes.STRING(100), allowNull: false },
    departement: { type: DataTypes.STRING(100), allowNull: true },
    dateEmbauche: { type: DataTypes.DATEONLY, allowNull: false },
  }, {
    tableName: 'Personnels',
    timestamps: false,
  });

  Personnel.associate = (models) => {
    Personnel.belongsTo(models.Utilisateur, { foreignKey: 'id', as: 'utilisateur' });
    Personnel.hasOne(models.Secretaire, { foreignKey: 'id', as: 'secretaire' });
    Personnel.hasOne(models.Directeur, { foreignKey: 'id', as: 'directeur' });
    Personnel.hasOne(models.DirecteurAdjoint, { foreignKey: 'id', as: 'directeurAdjoint' });
    Personnel.hasOne(models.Professeur, { foreignKey: 'id', as: 'professeur' });
    Personnel.hasOne(models.ResponsableDepartement, { foreignKey: 'id', as: 'responsableDepartement' });
    Personnel.hasOne(models.Scolarite, { foreignKey: 'id', as: 'scolarite' });
    Personnel.hasOne(models.CelluleInformatique, { foreignKey: 'id', as: 'celluleInformatique' });
    Personnel.hasMany(models.Traitement, { foreignKey: 'personnel_id', as: 'traitements' });
    Personnel.hasMany(models.Administration, { foreignKey: 'personnel_id', as: 'administrations' });
  };

  return Personnel;
};
