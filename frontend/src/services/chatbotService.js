import api from './api';

const chatbotService = {
  async envoyerMessage(contenu, conversation_id = null) {
    const { data } = await api.post('/chatbot/message', { contenu, conversation_id });
    return data;
  },

  async historique(conversation_id) {
    const { data } = await api.get(`/chatbot/historique?conversation_id=${conversation_id}`);
    return data;
  },
};

export default chatbotService;
