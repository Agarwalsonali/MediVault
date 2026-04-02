import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredUserData } from '../services/authService.js';

/**
 * Session timeout hook - logs out user after specified inactivity period
 * Tracks user activity (mouse, keyboard, focus) and logs them out if inactive
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

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timeoutId;
    let warningTimeoutId;

    const resetTimeout = () => {
      // Clear existing timeouts
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);

      // Set warning timeout (2 minutes before logout)
      const warningTime = Math.max(timeoutMs - 2 * 60 * 1000, 1000);
      warningTimeoutId = setTimeout(() => {
        console.warn('Session about to expire in 2 minutes due to inactivity');
        // Emit event so components can show warning if needed
        window.dispatchEvent(new Event('session-warning'));
      }, warningTime);

      // Set logout timeout
      timeoutId = setTimeout(() => {
        handleLogout();
      }, timeoutMs);
    };

    const handleLogout = () => {
      console.log('Session expired due to inactivity');
      clearStoredUserData();
      window.dispatchEvent(new Event('auth-changed'));
      navigate('/login', { 
        state: { 
          message: 'Your session has expired due to inactivity. Please login again.',
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
      resetTimeout();
    };

    const handleBlur = () => {
      // Optionally, you can clear the timeout when user is not on the tab
      // and restart it when they come back
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
      
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [timeoutMinutes, navigate]);
};
