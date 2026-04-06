import axios from 'axios';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL || '/api';

const API_URL = `${API_BASE_URL}/reports`;

export const getAllReports = async () => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.reports || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

export const uploadReport = async (formData) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.post(API_URL, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.report;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload report' };
  }
};

export const getReportsByPatient = async (patientId) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(`${API_URL}/patient/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.reports || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

export const getReportById = async (reportId) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(`${API_URL}/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.report;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch report' };
  }
};

export const deleteReport = async (reportId) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.delete(`${API_URL}/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete report' };
  }
};
