"use client";

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import LoginService from '../services/login.service'; 

export const setupInterceptors = () => {
  axios.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh')) {
        return config;
      }

      const token = LoginService.getToken();
      
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshSuccess = await LoginService.refreshToken();
            
            if (refreshSuccess) {
              return axios(originalRequest);
            }
          } catch (refreshError) {
            await LoginService.logout();
            return Promise.reject(refreshError);
          }
        }
        
        await LoginService.logout();
      }
      
      return Promise.reject(error);
    }
  );
};