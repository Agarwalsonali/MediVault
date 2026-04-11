import axios from 'axios';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL || '/api';

/**
 * Generate a 30-minute shareable link for a report
 * @param {string} reportId - The ID of the report to share
 * @returns {Promise<{shareLink: string, expiresIn: string}>}
 */
export const generateShareLink = async (reportId) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.post(
      `${API_BASE_URL}/reports/${reportId}/share`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to generate share link' };
  }
};

/**
 * Access a shared report using a token
 * @param {string} token - The share token from the URL
 * @returns {Promise<{report: object}>}
 */
export const getSharedReport = async (token) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/reports/shared/${token}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to access report' };
  }
};

/**
 * Copy share link to clipboard
 * @param {string} link - The link to copy
 */
export const copyToClipboard = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
