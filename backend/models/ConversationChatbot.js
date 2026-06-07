const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ConversationChatbot = sequelize.define('ConversationChatbot', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    dateDebut: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    dateFin: { type: DataTypes.DATE, allowNull: true },
    contexte: {
      type: DataTypes.ENUM('ATTESTATION','CORRECTION_NOM','CONTESTATION_NOTE'),
      allowNull: true,
    },
    langue: { type: DataTypes.STRING(10), defaultValue: 'fr' },
    etudiant_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'Etudiants', key: 'id' },
    },
  }, { tableName: 'ConversationChatbots', timestamps: false });

  ConversationChatbot.associate = (models) => {
    ConversationChatbot.belongsTo(models.Etudiant, { foreignKey: 'etudiant_id', as: 'etudiant' });
    ConversationChatbot.hasMany(models.MessageChatbot, { foreignKey: 'conversation_id', as: 'messages' });
  };

  return ConversationChatbot;
};
