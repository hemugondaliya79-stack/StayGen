import axios from 'axios';

// Render production backend URL fallback
const PROD_BACKEND_URL = 'https://staygen.onrender.com/api';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.MODE === 'production') {
    return PROD_BACKEND_URL;
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;
      try {
        const refreshUrl = `${getBaseURL()}/auth/refresh`;
        const res = await axios.post(refreshUrl, {}, { withCredentials: true });
        const { accessToken } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return API(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
