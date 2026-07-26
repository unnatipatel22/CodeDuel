import axios from 'axios';

// In production the panel normally sits behind the same domain as the API.
// For a separately deployed panel, set VITE_API_BASE to the public backend URL
// (for example: https://codeduel-backend.onrender.com/api).
const apiBaseUrl = import.meta.env.VITE_API_BASE || '/api';

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000,
});

// Auto-attach admin token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 / 403
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default client;
