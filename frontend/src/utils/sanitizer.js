import DOMPurify from 'dompurify';

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Use DOMPurify to remove any potential XSS
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  }).trim();
};

/**
 * Sanitize email address
 * @param {string} email - The email to sanitize
 * @returns {string} - The sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  return sanitizeString(email)
    .toLowerCase()
    .replace(/[^\w\.\-@]/g, ''); // Remove invalid email characters
};

/**
 * Sanitize HTML content (allows safe HTML tags)
 * @param {string} html - The HTML to sanitize
 * @returns {string} - The sanitized HTML
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

/**
 * Sanitize alphanumeric strings (names, usernames, etc)
 * @param {string} input - The input string
 * @returns {string} - The sanitized string
 */
export const sanitizeAlphanumeric = (input) => {
  if (typeof input !== 'string') return input;
  
  return sanitizeString(input)
    .replace(/[^a-zA-Z0-9\s\-']/g, '') // Allow letters, numbers, spaces, hyphens, apostrophes
    .trim();
};

/**
 * Sanitize numeric input
 * @param {*} input - The input to sanitize
 * @returns {number|null} - The sanitized number or null
 */
export const sanitizeNumber = (input) => {
  const num = Number(input);
  return Number.isNaN(num) ? null : num;
};

/**
 * Sanitize URL
 * @param {string} url - The URL to sanitize
 * @returns {string} - The sanitized URL
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.href;
  } catch {
    return '';
  }
};

/**
 * Sanitize object fields recursively
 * @param {object} obj - The object to sanitize
 * @returns {object} - The sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(v => 
        typeof v === 'string' ? sanitizeString(v) : v
      );
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Escape HTML special characters
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, char => map[char]);
};

/**
 * Validate and sanitize file names
 * @param {string} fileName - The file name to sanitize
 * @returns {string} - The sanitized file name
 */
export const sanitizeFileName = (fileName) => {
  if (typeof fileName !== 'string') return 'file';
  
  // Remove path traversal attempts and special characters
  return fileName
    .replace(/\.\./g, '') // Remove ..
    .replace(/[/\\:*?"<>|]/g, '') // Remove special characters
    .trim()
    .substring(0, 255); // Limit length
};
