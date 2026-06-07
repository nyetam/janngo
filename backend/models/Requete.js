const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Requete = sequelize.define('Requete', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    type: {
      type: DataTypes.ENUM('ATTESTATION','CORRECTION_NOM','CONTESTATION_NOTE'),
      allowNull: false,
    },
    statut: {
      type: DataTypes.ENUM('EN_ATTENTE','EN_COURS','ATTENTE_INFO','VALIDEE','REJETEE','CLOTUREE'),
      defaultValue: 'EN_ATTENTE',
    },
    dateDepot: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dateMiseAJour: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    description: { type: DataTypes.TEXT, allowNull: true },
    priorite: { type: DataTypes.ENUM('NORMALE','URGENTE'), defaultValue: 'NORMALE' },
    etudiant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Etudiants', key: 'id' },
    },
  }, { tableName: 'Requetes', timestamps: false });

  Requete.associate = (models) => {
    Requete.belongsTo(models.Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });
    Requete.hasOne(models.RequeteAttestation, { foreignKey: 'id', as: 'attestation' });
    Requete.hasOne(models.RequeteCorrectionNom, { foreignKey: 'id', as: 'correctionNom' });
    Requete.hasOne(models.RequeteContestationNote, { foreignKey: 'id', as: 'contestationNote' });
    Requete.hasMany(models.Document, { foreignKey: 'requete_id', as: 'documents' });
    Requete.hasMany(models.Notification, { foreignKey: 'requete_id', as: 'notifications' });
    Requete.hasMany(models.Traitement, { foreignKey: 'requete_id', as: 'traitements' });
    Requete.hasMany(models.HistoriqueStatut, { foreignKey: 'requete_id', as: 'historique' });
  };

  return Requete;
};
