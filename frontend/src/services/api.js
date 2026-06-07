import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('janngo_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ne pas rediriger si c'est la route de login elle-même qui retourne 401
    // (identifiants incorrects) — le composant Login gère ce cas localement.
    const estRouteLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !estRouteLogin) {
      localStorage.removeItem('janngo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
