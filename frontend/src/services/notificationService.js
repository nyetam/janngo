import api from './api';

const notificationService = {
  async mesNotifications() {
    const { data } = await api.get('/notifications');
    return data;
  },

  async marquerLu(id) {
    const { data } = await api.patch(`/notifications/${id}/lire`);
    return data;
  },
};

export default notificationService;
