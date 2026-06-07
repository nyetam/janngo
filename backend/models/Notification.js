const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    message: { type: DataTypes.TEXT, allowNull: false },
    dateEnvoi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    lu: { type: DataTypes.BOOLEAN, defaultValue: false },
    canal: { type: DataTypes.ENUM('EMAIL','SMS','IN_APP'), defaultValue: 'IN_APP' },
    type: {
      type: DataTypes.ENUM('CONFIRMATION','VALIDATION','REJET','INFO'),
      allowNull: false,
    },
    etudiant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Etudiants', key: 'id' },
    },
    requete_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Requetes', key: 'id' },
    },
  }, { tableName: 'Notifications', timestamps: false });

  Notification.associate = (models) => {
    Notification.belongsTo(models.Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });
    Notification.belongsTo(models.Requete, { foreignKey: 'requete_id', as: 'requete' });
  };

  return Notification;
};
