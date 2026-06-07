const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MessageChatbot = sequelize.define('MessageChatbot', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    contenu: { type: DataTypes.TEXT, allowNull: false },
    dateEnvoi: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    expediteur: { type: DataTypes.ENUM('ETUDIANT','CHATBOT'), allowNull: false },
    type: {
      type: DataTypes.ENUM('QUESTION','REPONSE','GUIDAGE','FORMULAIRE'),
      allowNull: false,
    },
    conversation_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'ConversationChatbots', key: 'id' },
    },
  }, { tableName: 'MessageChatbots', timestamps: false });

  MessageChatbot.associate = (models) => {
    MessageChatbot.belongsTo(models.ConversationChatbot, { foreignKey: 'conversation_id', as: 'conversation' });
  };

  return MessageChatbot;
};
