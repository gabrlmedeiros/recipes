import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});
// Use cookies (HttpOnly) for auth tokens. Do not attach Authorization header from localStorage.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Let auth store handle user state; redirect to login to refresh session
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);
