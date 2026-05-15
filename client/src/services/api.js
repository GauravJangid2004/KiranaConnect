import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach stored token on every request (handles page refresh)
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kc_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Centralized error normalization
api.interceptors.response.use(
  res => res,
  err => Promise.reject(err.response?.data || { error: 'Network error' })
);

export default api;
