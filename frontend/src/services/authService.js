import axios from 'axios';
import { sanitizeString, sanitizeEmail } from '../utils/sanitizer.js';

const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const API_BASE_URL = RAW_API_URL
  ? (RAW_API_URL.endsWith('/auth') ? RAW_API_URL : `${RAW_API_URL}/auth`)
  : '/api/auth';

const TOKEN_KEY = 'mrms_jwt';
const ROLE_KEY = 'mrms_role';
const FULL_NAME_KEY = 'mrms_full_name';
const LOGIN_EMAIL_KEY = 'mrms_login_email';
const RESET_EMAIL_KEY = 'mrms_reset_email';
const VERIFY_EMAIL_KEY = 'mrms_verify_email';

const ROLE_ADMIN = 'Admin';
const ROLE_NURSE = 'Nurse';
const ROLE_DOCTOR = 'Doctor';
const ROLE_STAFF = 'Staff';
const ROLE_PATIENT = 'Patient';

const emitAuthChanged = () => {
  window.dispatchEvent(new Event('auth-changed'));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const decodeJwtToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return null;

    const payloadBase64Url = tokenParts[1];
    const payloadBase64 = payloadBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = payloadBase64.padEnd(payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4), '=');
    const payloadJson = atob(paddedBase64);

    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
};

export const getDashboardPathByRole = (role) => {
  if (role === ROLE_ADMIN) return '/admin-dashboard';
  if (role === ROLE_NURSE || role === ROLE_DOCTOR || role === ROLE_STAFF) return '/staff-dashboard';
  return '/dashboard';
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  emitAuthChanged();
};

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const setRole = (role) => {
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
  emitAuthChanged();
};

export const getFullName = () => localStorage.getItem(FULL_NAME_KEY);

export const setFullName = (fullName) => {
  if (fullName) {
    localStorage.setItem(FULL_NAME_KEY, fullName);
  } else {
    localStorage.removeItem(FULL_NAME_KEY);
  }
  emitAuthChanged();
};

export const getLoginEmail = () => localStorage.getItem(LOGIN_EMAIL_KEY);
export const setLoginEmail = (email) =>
  email ? localStorage.setItem(LOGIN_EMAIL_KEY, email) : localStorage.removeItem(LOGIN_EMAIL_KEY);

export const getResetEmail = () => localStorage.getItem(RESET_EMAIL_KEY);
export const setResetEmail = (email) =>
  email ? localStorage.setItem(RESET_EMAIL_KEY, email) : localStorage.removeItem(RESET_EMAIL_KEY);

export const getVerifyEmail = () => localStorage.getItem(VERIFY_EMAIL_KEY);
export const setVerifyEmail = (email) =>
  email ? localStorage.setItem(VERIFY_EMAIL_KEY, email) : localStorage.removeItem(VERIFY_EMAIL_KEY);

export const clearStoredUserData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(FULL_NAME_KEY);
  localStorage.removeItem(LOGIN_EMAIL_KEY);
  localStorage.removeItem(RESET_EMAIL_KEY);
  localStorage.removeItem(VERIFY_EMAIL_KEY);
  emitAuthChanged();
};

const syncIdentityFromToken = (token, fallback = {}) => {
  const decoded = decodeJwtToken(token) || {};

  const resolvedRole = decoded.role || fallback.role || ROLE_PATIENT;
  const resolvedName = decoded.name || decoded.fullName || fallback.fullName || fallback.name || '';

  setToken(token);
  setRole(resolvedRole);
  setFullName(resolvedName);

  return { role: resolvedRole, name: resolvedName };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
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

// 1. Signup → /register
export const registerUser = async ({ fullName, email, password }) => {
  try {
    // Sanitize inputs
    const sanitizedFullName = sanitizeString(fullName);
    const sanitizedEmail = sanitizeEmail(email);
    
    const res = await api.post('/register', { 
      fullName: sanitizedFullName, 
      email: sanitizedEmail, 
      password 
    });
    // store email for verification step
    setVerifyEmail(sanitizedEmail);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 1b. Verify Email → /verify-email
export const verifyEmail = async ({ email, otp }) => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedOtp = sanitizeString(otp);
    
    const res = await api.post('/verify-email', { 
      email: sanitizedEmail, 
      otp: sanitizedOtp 
    });
    // clear verification email after success
    setVerifyEmail(null);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const resendVerificationOtp = async ({ email }) => {
  try {
    // Sanitize input
    const sanitizedEmail = sanitizeEmail(email);
    
    const res = await api.post('/resend-verification-otp', { 
      email: sanitizedEmail 
    });
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 2. Login → /login (returns JWT immediately, no OTP required)
export const loginUser = async ({ email, password }) => {
  try {
    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(email);
    
    const res = await api.post('/login', { 
      email: sanitizedEmail, 
      password 
    });
    const data = res.data;
    
    // Decode JWT and store identity
    const identity = syncIdentityFromToken(data.token, {
      role: data.role,
      fullName: data.fullName,
    });

    // Store login email for user experience
    setLoginEmail(sanitizedEmail);
    
    return {
      ...data,
      role: identity.role,
      name: identity.name,
    };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 3. Verify OTP → /verify-otp
export const verifyOtp = async ({ email, otp }) => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedOtp = sanitizeString(otp);
    
    const res = await api.post('/verify-otp', { 
      email: sanitizedEmail, 
      otp: sanitizedOtp 
    });
    const { token, role, fullName } = res.data;
    let identity = { role: role || ROLE_PATIENT, name: fullName || '' };

    if (token) {
      identity = syncIdentityFromToken(token, { role, fullName });
    }

    // keep identity for the logged-in user experience
    setLoginEmail(sanitizedEmail);
    return {
      ...res.data,
      role: identity.role,
      name: identity.name,
    }; // { message, token, role, name }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 4. Forgot Password → /forgot-password
export const requestPasswordReset = async ({ email }) => {
  try {
    // Sanitize input
    const sanitizedEmail = sanitizeEmail(email);
    
    const res = await api.post('/forgot-password', { 
      email: sanitizedEmail 
    });
    // store email for reset step
    setResetEmail(sanitizedEmail);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 5. Reset Password → /reset-password
export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(email);
    const sanitizedOtp = sanitizeString(otp);
    
    const res = await api.post('/reset-password', { 
      email: sanitizedEmail, 
      otp: sanitizedOtp, 
      newPassword 
    });
    // clear reset email after successful reset
    setResetEmail(null);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const setPasswordFromInvite = async ({ token, password }) => {
  try {
    const res = await api.post('/set-password', { token, password });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logout = async () => {
  // Always clear client auth state first so logout is instant in UI.
  clearStoredUserData();

  try {
    await api.post('/logout');
  } catch {
    // Best effort only: client is already logged out locally.
  }
};

export default {
  registerUser,
  verifyEmail,
  resendVerificationOtp,
  loginUser,
  verifyOtp,
  requestPasswordReset,
  resetPassword,
  setPasswordFromInvite,
  logout,
  clearStoredUserData,
  getToken,
  getRole,
  getFullName,
  getLoginEmail,
  getResetEmail,
  getVerifyEmail,
};

