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

export const getActivityLogs = async (query = {}) => {
  try {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page);
    if (query.limit) params.append('limit', query.limit);
    if (query.action) params.append('action', query.action);
    if (query.userRole) params.append('userRole', query.userRole);
    if (query.resourceType) params.append('resourceType', query.resourceType);
    if (query.status) params.append('status', query.status);
    if (query.userName) params.append('userName', query.userName);

    const response = await adminApi.get(`/activity/?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getFailedLogins = async (query = {}) => {
  try {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await adminApi.get(`/activity/failed-logins?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const getActivityStats = async (query = {}) => {
  try {
    const params = new URLSearchParams();
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await adminApi.get(`/activity/stats?${params.toString()}`);
    return response.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const exportActivityLogs = async (query = {}) => {
  try {
    const params = new URLSearchParams();
    if (query.action) params.append('action', query.action);
    if (query.userRole) params.append('userRole', query.userRole);
    if (query.resourceType) params.append('resourceType', query.resourceType);
    if (query.status) params.append('status', query.status);

    const response = await adminApi.get(`/activity/export/csv?${params.toString()}`, {
      responseType: 'blob'
    });

    // Create a blob and download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/**
 * Delete old activity logs (cleanup)
 * @param {number} daysToKeep - Number of days to keep logs (default 90)
 * @returns {Promise} Result with deleted count
 */
export const cleanupOldActivityLogs = async (daysToKeep = 90) => {
  try {
    const response = await adminApi.delete('/activity/cleanup', {
      data: { daysToKeep }
    });
    return response.data;
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
  getActivityLogs,
  getFailedLogins,
  getActivityStats,
  exportActivityLogs,
  cleanupOldActivityLogs,
};
