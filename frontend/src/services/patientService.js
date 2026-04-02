import axios from 'axios';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL || '/api';

const API_URL = `${API_BASE_URL}/patients`;

export const getPatients = async () => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.patients || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch patients' };
  }
};

export const searchPatients = async (query) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(`${API_URL}/search`, {
      params: { query },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.patients || [];
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search patients' };
  }
};

export const getPatientById = async (patientId) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.get(`${API_URL}/${patientId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.patient;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch patient' };
  }
};

export const createPatient = async (patientData) => {
  try {
    const token = localStorage.getItem('mrms_jwt');
    const response = await axios.post(API_URL, patientData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.patient;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create patient' };
  }
};
