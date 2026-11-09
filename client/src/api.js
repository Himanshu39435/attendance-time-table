
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login')
    ) {
      localStorage.removeItem('token');

      if (!location.pathname.startsWith('/login')) {
        location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const errMsg = (error) =>
  error.response?.data?.message ||
  (error.request
    ? 'Cannot reach the server. Check backend connection.'
    : error.message);

export default api;
