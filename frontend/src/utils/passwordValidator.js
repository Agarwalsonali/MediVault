/**
 * Validate password strength
 * Password must contain:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character (!@#$%^&*)
 */
export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    return { isValid: false, errors: ['Password is required'], strength: 0 };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit (0-9)');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&* etc.)');
  }

  // Calculate strength (0-4)
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  return {
    isValid: errors.length === 0,
    errors,
    strength: Math.min(strength, 4)
  };
};

export const getPasswordStrengthLabel = (strength) => {
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return labels[strength] || '';
};

export const getPasswordStrengthColor = (strength) => {
  const colors = ['', 'var(--mv-danger)', 'var(--mv-warning)', 'var(--mv-info)', 'var(--mv-success)'];
  return colors[strength] || '';
};
