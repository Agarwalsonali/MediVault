import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredUserData, getToken } from '../services/authService.js';

/**
 * Session timeout hook - logs out user after specified inactivity period
 * Tracks user activity (mouse, keyboard, focus) and logs them out if inactive
 * Also checks on mount if session has expired based on stored last activity timestamp
 * 
 * @param {number} timeoutMinutes - Minutes of inactivity before automatic logout (default: 30)
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Only set up timeout if timeoutMinutes is a valid number and user is authenticated
    if (!timeoutMinutes || typeof timeoutMinutes !== 'number' || timeoutMinutes <= 0) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const timeoutMs = timeoutMinutes * 60 * 1000;
    const LAST_ACTIVITY_KEY = 'mrms_last_activity';
    let timeoutId;
    let warningTimeoutId;
    let activityCheckInterval;

    // Check if session has already expired
    const checkSessionValidity = () => {
      const lastActivityStr = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivityStr) return true; // Allow if no previous activity stored

      const lastActivity = parseInt(lastActivityStr, 10);
      const now = Date.now();
      const inactiveMs = now - lastActivity;

      if (inactiveMs > timeoutMs) {
        handleLogout();
        return false;
      }
      return true;
    };

    // Check on mount if session is still valid
    if (!checkSessionValidity()) {
      return;
    }

    const resetTimeout = () => {
      // Update last activity timestamp in localStorage
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());

      // Clear existing timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);

      // Set warning timeout (5 minutes before logout for 2 days)
      const warningTime = Math.max(timeoutMs - 5 * 60 * 1000, 1000);
      warningTimeoutId = setTimeout(() => {
        console.warn(`Session about to expire in 5 minutes due to inactivity (timeout: ${timeoutMinutes} min)`);
        // Emit event so components can show warning if needed
        window.dispatchEvent(new Event('session-warning'));
      }, warningTime);

      // Set logout timeout
      timeoutId = setTimeout(() => {
        handleLogout();
      }, timeoutMs);
    };

    const handleLogout = () => {
      console.log(`Session expired due to ${timeoutMinutes} minutes of inactivity`);
      localStorage.removeItem(LAST_ACTIVITY_KEY);
      clearStoredUserData();
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login', { 
        state: { 
          message: `Your session has expired due to ${timeoutMinutes === 2880 ? '2 days' : `${timeoutMinutes} minutes`} of inactivity. Please login again.`,
          sessionExpired: true 
        } 
      });
    };

    // List of events to track activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      resetTimeout();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Also track window focus/blur
    const handleFocus = () => {
      // When user focuses back on tab, check if session is still valid
      if (!checkSessionValidity()) {
        return;
      }
      resetTimeout();
    };

    const handleBlur = () => {
      // Clear timeouts when user leaves tab, will restart on focus
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Initialize timeout
    resetTimeout();

    // Cleanup on component unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (activityCheckInterval) clearInterval(activityCheckInterval);
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [timeoutMinutes, navigate]);
};
