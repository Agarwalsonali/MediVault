import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/notifications';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000 // 30 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrms_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Retry logic for network errors
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0 || !error.code || (error.code !== 'ECONNABORTED' && error.code !== 'ERR_NETWORK')) {
      throw error;
    }
    
    console.log(`Retrying request... (${retries} attempts remaining)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
};

/**
 * Fetch notifications for the current user
 * @param {number} limit - Number of notifications to fetch
 * @param {number} offset - Offset for pagination
 * @param {boolean} unreadOnly - Only fetch unread notifications
 * @returns {Promise} Notifications data with pagination info
 */
export const getNotifications = async (limit = 10, offset = 0, unreadOnly = false) => {
  return retryRequest(async () => {
    const response = await api.get('/', {
      params: {
        limit,
        offset,
        unreadOnly
      }
    });
    return response.data;
  });
};

/**
 * Get count of unread notifications
 * @returns {Promise} Unread count
 */
export const getUnreadCount = async () => {
  return retryRequest(async () => {
    const response = await api.get('/unread/count');
    return response.data;
  });
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Updated notification
 */
export const markAsRead = async (notificationId) => {
  return retryRequest(async () => {
    const response = await api.patch(`/${notificationId}/read`);
    return response.data;
  });
};

/**
 * Mark all unread notifications as read
 * @returns {Promise} Result message
 */
export const markAllAsRead = async () => {
  return retryRequest(async () => {
    const response = await api.patch('/mark-all-as-read');
    return response.data;
  });
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Result message
 */
export const deleteNotification = async (notificationId) => {
  return retryRequest(async () => {
    const response = await api.delete(`/${notificationId}`);
    return response.data;
  });
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
