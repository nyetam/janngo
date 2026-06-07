const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(100), allowNull: false },
    type: {
      type: DataTypes.ENUM('QUITUS','CNI','LETTRE','PROFIL','FICHE_REQUETE','COPIE_NOTE','AUTRE'),
      allowNull: false,
    },
    cheminFichier: { type: DataTypes.STRING(255), allowNull: false },
    taille: { type: DataTypes.BIGINT, allowNull: false },
    dateUpload: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    // Par défaut valide=true (présumé valide jusqu'à rejet explicite par le personnel)
    valide: { type: DataTypes.BOOLEAN, defaultValue: true },
    // Renseigné seulement quand le personnel rejette un document
    motifRejet: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
    requete_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Requetes', key: 'id' },
    },
  }, { tableName: 'Documents', timestamps: false });

  Document.associate = (models) => {
    Document.belongsTo(models.Requete, { foreignKey: 'requete_id', as: 'requete' });
  };

  return Document;
};
