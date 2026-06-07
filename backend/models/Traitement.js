const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Traitement = sequelize.define('Traitement', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    dateTraitement: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    commentaire: { type: DataTypes.TEXT, allowNull: true },
    decision: {
      type: DataTypes.ENUM('APPROUVE','REJETE','EN_ATTENTE'),
      allowNull: true,
    },
    etape: { type: DataTypes.STRING(100), allowNull: false },
    dureeTraitement: { type: DataTypes.INTEGER, allowNull: true },
    requete_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Requetes', key: 'id' },
    },
    personnel_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Personnels', key: 'id' },
    },
  }, { tableName: 'Traitements', timestamps: false });

  Traitement.associate = (models) => {
    Traitement.belongsTo(models.Requete, { foreignKey: 'requete_id', as: 'requete' });
    Traitement.belongsTo(models.Personnel, { foreignKey: 'personnel_id', as: 'personnel' });
  };

  return Traitement;
};
