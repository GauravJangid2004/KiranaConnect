import axios from 'axios';

const TOKEN_KEY = 'kc_token';
const USER_KEY = 'kc_user';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const nextConfig = config;
  const token = localStorage.getItem(TOKEN_KEY);

  nextConfig.headers = nextConfig.headers || {};

  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  } else {
    delete nextConfig.headers.Authorization;
  }

  return nextConfig;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }

    return Promise.reject(error.response?.data || { error: 'Network error' });
  }
);

export default api;
