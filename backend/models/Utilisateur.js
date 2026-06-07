const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Utilisateur = sequelize.define('Utilisateur', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    nom: { type: DataTypes.STRING(50), allowNull: false },
    prenom: { type: DataTypes.STRING(50), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    motDePasse: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('ETUDIANT','SECRETAIRE','DIRECTEUR','DIR_ADJOINT','RESP_DEPT','SCOLARITE','CELLULE_INFO'),
      allowNull: false,
    },
    actif: { type: DataTypes.BOOLEAN, defaultValue: true },
    dateCreation: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'Utilisateurs',
    timestamps: false,
  });

  Utilisateur.associate = (models) => {
    Utilisateur.hasOne(models.Etudiant, { foreignKey: 'id', as: 'etudiant' });
    Utilisateur.hasOne(models.Personnel, { foreignKey: 'id', as: 'personnel' });
  };

  return Utilisateur;
};
