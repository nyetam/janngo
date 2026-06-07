import api from './api';

const authService = {
  async login(identifiant, motDePasse) {
    const { data } = await api.post('/auth/login', { identifiant, motDePasse });
    localStorage.setItem('janngo_token', data.token);
    return data;
  },

  async logout() {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('janngo_token');
  },

  async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export default authService;
