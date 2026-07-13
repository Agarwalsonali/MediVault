import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/api/notifications';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mrms_jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Fetch notifications for the current user
 * @param {number} limit - Number of notifications to fetch
 * @param {number} offset - Offset for pagination
 * @param {boolean} unreadOnly - Only fetch unread notifications
 * @returns {Promise} Notifications data with pagination info
 */
export const getNotifications = async (limit = 10, offset = 0, unreadOnly = false) => {
  try {
    const response = await api.get('/', {
      params: {
        limit,
        offset,
        unreadOnly
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Get count of unread notifications
 * @returns {Promise} Unread count
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/unread/count');
    return response.data;
  } catch (error) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Updated notification
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all unread notifications as read
 * @returns {Promise} Result message
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/mark-all/read');
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Result message
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/${notificationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
