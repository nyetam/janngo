import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
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
    const estRouteLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !estRouteLogin) {
      localStorage.removeItem('janngo_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;