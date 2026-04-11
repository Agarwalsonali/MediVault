import xss from 'xss';
import { body, query, param, validationResult } from 'express-validator';

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove XSS attacks using xss library
  let sanitized = xss(input, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoredTag: true,
  });
  
  // Additional cleanup: trim and limit length
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Sanitize email address
 * @param {string} email - The email to sanitize
 * @returns {string} - The sanitized email
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w\.\-@]/g, ''); // Remove invalid email characters
};

/**
 * Sanitize alphanumeric strings (names, etc)
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
 * Validation rules for user registration
 */
export const validateRegisterInput = [
  body('fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .customSanitizer(value => sanitizeString(value))
    .custom(value => {
      if (!/^[a-zA-Z\s'-]+$/.test(value)) {
        throw new Error('Full name can only contain letters, spaces, hyphens, and apostrophes');
      }
      return true;
    }),
  
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer(value => sanitizeEmail(value))
    .isLength({ max: 255 }).withMessage('Email is too long'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('role')
    .optional()
    .trim()
    .isIn(['Patient', 'Staff', 'Doctor', 'Nurse']).withMessage('Invalid role'),
];

/**
 * Validation rules for login
 */
export const validateLoginInput = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer(value => sanitizeEmail(value)),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for patient profile
 */
export const validatePatientProfileInput = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters')
    .customSanitizer(value => sanitizeString(value)),
  
  body('age')
    .optional()
    .custom(value => {
      if (value !== null && value !== undefined) {
        const ageNum = parseInt(value, 10);
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
          throw new Error('Age must be a number between 0 and 150');
        }
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .trim()
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
  
  body('bloodGroup')
    .optional()
    .trim()
    .isIn(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']).withMessage('Invalid blood group'),
  
  body('allergies')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Allergies description is too long')
    .customSanitizer(value => sanitizeString(value)),
];

/**
 * Validation rules for contact form
 */
export const validateContactInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .customSanitizer(value => sanitizeString(value)),
  
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer(value => sanitizeEmail(value)),
  
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(['Patient', 'Staff']).withMessage('Invalid role'),
  
  body('issueType')
    .trim()
    .notEmpty().withMessage('Issue type is required')
    .isIn(['Bug', 'Feedback', 'Report Issue', 'Other']).withMessage('Invalid issue type'),
  
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 5, max: 2000 }).withMessage('Message must be between 5 and 2000 characters')
    .customSanitizer(value => sanitizeString(value)),
];

/**
 * Validation rules for patient creation/search
 */
export const validatePatientInput = [
  body('name')
    .trim()
    .notEmpty().withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .customSanitizer(value => sanitizeString(value)),
  
  body('age')
    .custom(value => {
      const ageNum = parseInt(value, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        throw new Error('Age must be a number between 0 and 150');
      }
      return true;
    }),
  
  body('gender')
    .trim()
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
];

/**
 * Validation rules for report upload
 */
export const validateReportInput = [
  body('patientId')
    .trim()
    .notEmpty().withMessage('Patient ID is required')
    .isMongoId().withMessage('Invalid patient ID'),
  
  body('reportName')
    .trim()
    .notEmpty().withMessage('Report name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Report name must be between 2 and 200 characters')
    .customSanitizer(value => sanitizeString(value)),
  
  body('reportType')
    .trim()
    .notEmpty().withMessage('Report type is required')
    .isIn([
      'Blood Test', 'Urine Test', 'X-Ray', 'MRI Scan', 'CT Scan', 'Ultrasound',
      'ECG / EKG', 'Echocardiogram', 'Prescription', 'Discharge Summary',
      'Pathology Report', 'Radiology Report', 'Vaccination Record', 'Allergy Test',
      'COVID-19 Test', 'Biopsy Report', 'Dental Record', 'Ophthalmology Report', 'Other'
    ]).withMessage('Invalid report type'),
  
  body('reportDate')
    .trim()
    .notEmpty().withMessage('Report date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must be less than 1000 characters')
    .customSanitizer(value => sanitizeString(value)),
  
  body('doctorName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Doctor name is too long')
    .customSanitizer(value => sanitizeString(value)),
];

/**
 * Validation rules for OTP verification
 */
export const validateOtpInput = [
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers'),
];

/**
 * Validation rules for password reset
 */
export const validatePasswordResetInput = [
  body('email')
    .trim()
    .isEmail().withMessage('Please provide a valid email address')
    .customSanitizer(value => sanitizeEmail(value)),
];

/**
 * Middleware to validate and return errors
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Sanitize query parameters
 * @param {object} query - The query object
 * @returns {object} - Sanitized query object
 */
export const sanitizeQuery = (query) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Validate URL parameters (IDs)
 */
export const validateIdParam = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
];
