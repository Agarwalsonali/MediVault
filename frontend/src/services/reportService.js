import axios from 'axios';
import { sanitizeString, sanitizeFileName } from '../utils/sanitizer.js';

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
    // Create new FormData with sanitized inputs
    const sanitizedFormData = new FormData();
    
    // Sanitize text fields
    if (formData.has('patientId')) {
      sanitizedFormData.append('patientId', formData.get('patientId'));
    }
    if (formData.has('reportName')) {
      sanitizedFormData.append('reportName', sanitizeString(formData.get('reportName')));
    }
    if (formData.has('reportType')) {
      sanitizedFormData.append('reportType', sanitizeString(formData.get('reportType')));
    }
    if (formData.has('reportDate')) {
      sanitizedFormData.append('reportDate', formData.get('reportDate'));
    }
    if (formData.has('notes')) {
      sanitizedFormData.append('notes', sanitizeString(formData.get('notes')));
    }
    if (formData.has('doctorName')) {
      sanitizedFormData.append('doctorName', sanitizeString(formData.get('doctorName')));
    }
    
    // File should be added as-is (already handled by file input)
    if (formData.has('file')) {
      const file = formData.get('file');
      sanitizedFormData.append('file', file);
    }
    
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.post(API_URL, sanitizedFormData, {
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
