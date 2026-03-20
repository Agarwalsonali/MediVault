import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TOKEN_KEY = 'mrms_jwt';
const ROLE_KEY = 'mrms_role';
const FULL_NAME_KEY = 'mrms_full_name';
const LOGIN_EMAIL_KEY = 'mrms_login_email';
const RESET_EMAIL_KEY = 'mrms_reset_email';
const VERIFY_EMAIL_KEY = 'mrms_verify_email';

const emitAuthChanged = () => {
  window.dispatchEvent(new Event('auth-changed'));
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

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
    const res = await api.post('/register', { fullName, email, password });
    // store email for verification step
    setVerifyEmail(email);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 1b. Verify Email → /verify-email
export const verifyEmail = async ({ email, otp }) => {
  try {
    const res = await api.post('/verify-email', { email, otp });
    // clear verification email after success
    setVerifyEmail(null);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const resendVerificationOtp = async ({ email }) => {
  try {
    const res = await api.post('/resend-verification-otp', { email });
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 2. Login → /login (may return JWT immediately if 2FA is disabled)
export const loginUser = async ({ email, password }) => {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    const res = await api.post('/login', { email: normalizedEmail, password });
    const data = res.data;
    // Keep user identity available for dashboard/profile display.
    setLoginEmail(normalizedEmail);

    if (data?.token) {
      // 2FA disabled: backend returned JWT directly
      setToken(data.token);
      setRole(data.role);
      setFullName(data.fullName);
    } else if (data?.twoFactorRequired) {
      // 2FA enabled: store email for OTP verification step
      setLoginEmail(normalizedEmail);
      setRole(data.role);
      setFullName(data.fullName);
    }
    return data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 3. Verify OTP → /verify-otp
export const verifyOtp = async ({ email, otp }) => {
  try {
    const res = await api.post('/verify-otp', { email, otp });
    const { token, role, fullName } = res.data;
    const normalizedEmail = email.trim().toLowerCase();
    if (token) {
      setToken(token);
    }
    if (role) {
      setRole(role);
    }
    if (fullName) {
      setFullName(fullName);
    }
    // keep identity for the logged-in user experience
    setLoginEmail(normalizedEmail);
    return res.data; // { message, token, role }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 4. Forgot Password → /forgot-password
export const requestPasswordReset = async ({ email }) => {
  try {
    const res = await api.post('/forgot-password', { email });
    // store email for reset step
    setResetEmail(email);
    return res.data; // { message }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

// 5. Reset Password → /reset-password
export const resetPassword = async ({ email, otp, newPassword }) => {
  try {
    const res = await api.post('/reset-password', { email, otp, newPassword });
    // clear reset email after successful reset
    setResetEmail(null);
    return res.data; // { message }
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
  logout,
  clearStoredUserData,
  getToken,
  getRole,
  getFullName,
  getLoginEmail,
  getResetEmail,
  getVerifyEmail,
};

