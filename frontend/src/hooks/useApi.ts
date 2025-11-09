import axios from 'axios';
import type { AxiosResponse } from 'axios';
import { useAuthStore } from '../stores/authStore';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const useApi = () => {
  const { token } = useAuthStore();

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests if available
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const get = <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.get(url);
  };

  const post = <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.post(url, data);
  };

  const put = <T>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.put(url, data);
  };

  const del = <T>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => {
    return api.delete(url);
  };

  return {
    get,
    post,
    put,
    delete: del,
  };
};