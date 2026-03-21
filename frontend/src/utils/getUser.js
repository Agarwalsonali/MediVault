import { decodeJwtToken, getToken } from '../services/authService.js';

export const getUser = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeJwtToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id || decoded._id || null,
    role: decoded.role || null,
    fullName: decoded.fullName || decoded.name || '',
    email: decoded.email || '',
  };
};

export default getUser;
