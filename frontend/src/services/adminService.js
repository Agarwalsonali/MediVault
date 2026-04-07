import axios from 'axios';
import { getToken } from './authService.js';

const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

adminApi.interceptors.request.use((config) => {
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

export const createStaffUser = async ({ fullName, email, role }) => {
  try {
    const response = await adminApi.post('/admin/create-staff', {
      fullName,
      email,
      role,
    });

    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const fetchStaffUsers = async () => {
  try {
    const response = await adminApi.get('/admin/staff');
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const updateStaffUser = async (id, { fullName, email, role }) => {
  try {
    const response = await adminApi.put(`/admin/staff/${id}`, {
      fullName,
      email,
      role,
    });
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const deleteStaffUser = async (id) => {
  try {
    const response = await adminApi.delete(`/admin/staff/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await adminApi.get('/admin/dashboard-stats');
    return response.data.stats;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export default {
  createStaffUser,
  fetchStaffUsers,
  updateStaffUser,
  deleteStaffUser,
  getDashboardStats,
};
