import axios from 'axios';

const defaultApiUrl = (import.meta as any).env?.PROD
  ? 'https://sheeneeka-nursery-api.onrender.com'
  : 'http://localhost:8080';

const API_URL = (import.meta as any).env?.VITE_API_URL || defaultApiUrl;

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach bearer token header for cross-domain cookie restriction resilience
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
