import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/** 将后端返回的相对路径(如 /uploads/xxx.jpg)拼接为完整URL */
export function getBackendUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${path}`;
}

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: unwrap data, handle 401
request.interceptors.response.use(
  (response) => {
    const responseData = response.data;
    // If the API wraps responses in { code, message, data }, unwrap it
    if (responseData && typeof responseData === 'object' && 'code' in responseData) {
      if (responseData.code === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error(responseData.message || 'Unauthorized'));
      }
      if (responseData.code !== 0 && responseData.code !== 200) {
        return Promise.reject(new Error(responseData.message || 'Request failed'));
      }
      return responseData.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default request;
