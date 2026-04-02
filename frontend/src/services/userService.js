import axios from 'axios';
import { getToken } from './authService.js';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL
  ? (RAW_API_URL.endsWith('/auth') ? RAW_API_URL.slice(0, -5) : RAW_API_URL)
  : '/api';
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

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

const toAbsoluteAssetUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return `${API_ORIGIN}${normalized}`;
};

export const fetchMyProfile = async () => {
  try {
    const response = await userApi.get('/user/profile');
    const data = response.data;
    if (data?.user?.avatarUrl) {
      data.user.avatarUrl = toAbsoluteAssetUrl(data.user.avatarUrl);
    }
    return data;
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

export const uploadMyProfileImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await userApi.post('/user/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    if (data?.avatarUrl) {
      data.avatarUrl = toAbsoluteAssetUrl(data.avatarUrl);
    }
    if (data?.user?.avatarUrl) {
      data.user.avatarUrl = toAbsoluteAssetUrl(data.user.avatarUrl);
    }
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const removeMyProfileImage = async () => {
  try {
    const response = await userApi.delete('/user/profile-image');
    const data = response.data;
    if (data?.avatarUrl) {
      data.avatarUrl = toAbsoluteAssetUrl(data.avatarUrl);
    }
    if (data?.user?.avatarUrl) {
      data.user.avatarUrl = toAbsoluteAssetUrl(data.user.avatarUrl);
    }
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export default {
  fetchMyProfile,
  updateMyProfile,
  uploadMyProfileImage,
  removeMyProfileImage,
};
