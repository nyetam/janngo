const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Etudiant = sequelize.define('Etudiant', {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      references: { model: 'Utilisateurs', key: 'id' },
    },
    matricule: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    filiere: { type: DataTypes.STRING(100), allowNull: false },
    niveau: { type: DataTypes.STRING(20), allowNull: false },
    anneeInscription: { type: DataTypes.DATEONLY, allowNull: false },
    statut: {
      type: DataTypes.ENUM('ACTIF','SUSPENDU','DIPLOME'),
      defaultValue: 'ACTIF',
    },
  }, {
    tableName: 'Etudiants',
    timestamps: false,
  });

  Etudiant.associate = (models) => {
    Etudiant.belongsTo(models.Utilisateur, { foreignKey: 'id', as: 'utilisateur' });
    Etudiant.hasMany(models.Requete, { foreignKey: 'etudiant_id', as: 'requetes' });
    Etudiant.hasMany(models.Notification, { foreignKey: 'etudiant_id', as: 'notifications' });
    Etudiant.hasMany(models.ConversationChatbot, { foreignKey: 'etudiant_id', as: 'conversations' });
    Etudiant.hasMany(models.Administration, { foreignKey: 'etudiant_id', as: 'administrations' });
  };

  return Etudiant;
};
