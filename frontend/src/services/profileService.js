import axios from 'axios';

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
    const token = getToken();
    const response = await axios.put(PROFILE_API_URL, profileData, {
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
    });
    return response.data.download;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to authorize download' };
  }
};

/**
 * Download a report file
 * @param {string} reportId - Report ID
 */
export const downloadReport = async (reportId) => {
  try {
    const downloadData = await getReportDownloadUrl(reportId);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = downloadData.fileUrl;
    link.download = downloadData.fileName || 'report';
    
    // For PDFs and images, we might want to open in new tab instead
    // But for actual download, use this:
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return downloadData;
  } catch (error) {
    throw error;
  }
};

/**
 * View a report file (opens in new tab)
 * @param {string} reportId - Report ID
 */
export const viewReport = async (reportId) => {
  try {
    const downloadData = await getReportDownloadUrl(reportId);
    window.open(downloadData.fileUrl, '_blank');
    return downloadData;
  } catch (error) {
    throw error;
  }
};
