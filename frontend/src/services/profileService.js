import axios from 'axios';
import { sanitizeString, sanitizeNumber } from '../utils/sanitizer.js';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL || '/api';
const PROFILE_API_URL = `${API_BASE_URL}/profile`;

const getToken = () => localStorage.getItem('mrms_jwt');

/**
 * Get logged-in patient's profile
 */
export const getProfile = async () => {
  try {
    const token = getToken();
    const response = await axios.get(PROFILE_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.profile;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch profile' };
  }
};

/**
 * Update patient's profile
 * @param {Object} profileData - Profile data to update (age, gender, bloodGroup, allergies)
 */
export const updateProfile = async (profileData) => {
  try {
    // Sanitize inputs
    const sanitizedData = {};
    
    if (profileData.age !== undefined) {
      sanitizedData.age = sanitizeNumber(profileData.age);
    }
    if (profileData.gender !== undefined) {
      sanitizedData.gender = sanitizeString(profileData.gender);
    }
    if (profileData.bloodGroup !== undefined) {
      sanitizedData.bloodGroup = sanitizeString(profileData.bloodGroup);
    }
    if (profileData.allergies !== undefined) {
      sanitizedData.allergies = sanitizeString(profileData.allergies);
    }
    
    const token = getToken();
    const response = await axios.put(PROFILE_API_URL, sanitizedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.profile;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update profile' };
  }
};

/**
 * Upload user avatar
 * @param {File} file - Avatar image file
 */
export const uploadAvatar = async (file) => {
  try {
    const token = getToken();
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${PROFILE_API_URL}/avatar`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.profile;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to upload avatar' };
  }
};

/**
 * Delete user avatar
 */
export const deleteAvatar = async () => {
  try {
    const token = getToken();
    const response = await axios.delete(`${PROFILE_API_URL}/avatar`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.profile;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete avatar' };
  }
};

/**
 * Get patient's medical reports
 */
export const getPatientReports = async () => {
  try {
    const token = getToken();
    const response = await axios.get(`${PROFILE_API_URL}/reports`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.reports || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch reports' };
  }
};

/**
 * Get download authorization and file URL for a report
 * Handles both encrypted (blob) and unencrypted (JSON URL) responses
 * @param {string} reportId - Report ID
 */
export const getReportDownloadUrl = async (reportId) => {
  try {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/reports/download/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer', // Handle both JSON and binary responses
    });

    // Check if response is JSON or binary
    const contentType = response.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      // Unencrypted file - contains fileUrl in JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(response.data);
      const jsonData = JSON.parse(jsonString);
      return jsonData.download;
    } else {
      // Encrypted file - binary data received, create blob URL
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'report';
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (fileNameMatch) {
          fileName = decodeURIComponent(fileNameMatch[1]);
        }
      }
      
      const mimeType = contentType || 'application/octet-stream';
      const blob = new Blob([response.data], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      
      return {
        fileUrl: blobUrl,
        fileName: fileName,
        isBlob: true,
        mimeType: mimeType
      };
    }
  } catch (error) {
    throw error.response?.data || { message: 'Failed to authorize download' };
  }
};

/**
 * Download a report file
 * Handles both blob and URL downloads
 * @param {string} reportId - Report ID
 */
export const downloadReport = async (reportId) => {
  try {
    const downloadData = await getReportDownloadUrl(reportId);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = downloadData.fileUrl;
    link.download = downloadData.fileName || 'report';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL after download
    if (downloadData.isBlob) {
      setTimeout(() => URL.revokeObjectURL(downloadData.fileUrl), 100);
    }
    
    return downloadData;
  } catch (error) {
    throw error;
  }
};

/**
 * View a report file (opens in new tab)
 * Handles both blob and URL viewing
 * @param {string} reportId - Report ID
 */
export const viewReport = async (reportId) => {
  try {
    const downloadData = await getReportDownloadUrl(reportId);
    const win = window.open(downloadData.fileUrl, '_blank');
    // Browser will handle blob URL cleanup when tab closes
    return downloadData;
  } catch (error) {
    throw error;
  }
};
