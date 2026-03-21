import axios from 'axios';
import { getToken } from './authService.js';

const AUTH_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = AUTH_BASE_URL.endsWith('/auth') ? AUTH_BASE_URL.slice(0, -5) : AUTH_BASE_URL || '/api';

const userApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

userApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const extractErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  return error.message || 'Something went wrong. Please try again.';
};

export const fetchMyProfile = async () => {
  try {
    const response = await userApi.get('/user/profile');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateMyProfile = async ({ fullName, email, password }) => {
  try {
    const payload = {
      fullName,
      email,
    };

    if (password?.trim()) {
      payload.password = password;
    }

    const response = await userApi.put('/user/update-profile', payload);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export default {
  fetchMyProfile,
  updateMyProfile,
};
