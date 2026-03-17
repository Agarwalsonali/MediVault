import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/authService.js';

// Icon components
const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

// Recovery illustration SVG
const RecoveryIllustration = () => (
  <div className="relative h-full flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl"></div>
    <svg className="relative w-full max-w-md h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Key */}
      <path d="M200 120C240 120 280 140 280 180C280 220 240 240 200 240C160 240 120 220 120 180C120 140 160 120 200 120Z" fill="url(#gradient3)" opacity="0.2"/>
      <path d="M200 120C240 120 280 140 280 180C280 220 240 240 200 240C160 240 120 220 120 180C120 140 160 120 200 120Z" stroke="url(#gradient3)" strokeWidth="8" fill="none"/>
      <rect x="270" y="170" width="40" height="20" rx="4" fill="url(#gradient3)"/>
      <rect x="300" y="160" width="20" height="40" rx="4" fill="url(#gradient3)"/>
      
      {/* Mail */}
      <rect x="140" y="240" width="120" height="80" rx="8" fill="url(#gradient3)" opacity="0.2"/>
      <path d="M140 240L200 280L260 240" stroke="url(#gradient3)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <rect x="140" y="240" width="120" height="80" rx="8" stroke="url(#gradient3)" strokeWidth="8" fill="none"/>
      
      {/* Floating elements */}
      <circle cx="100" cy="100" r="7" fill="#f59e0b" opacity="0.3" className="animate-pulse"/>
      <circle cx="300" cy="120" r="9" fill="#f97316" opacity="0.3" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
      <circle cx="320" cy="280" r="6" fill="#f59e0b" opacity="0.3" className="animate-pulse" style={{animationDelay: '1s'}}/>
      <circle cx="80" cy="300" r="8" fill="#f97316" opacity="0.3" className="animate-pulse" style={{animationDelay: '1.5s'}}/>
      
      <defs>
        <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    setInfoMessage('');

    try {
      const data = await requestPasswordReset({ email });
      setInfoMessage(data?.message || 'Reset OTP sent to email');
      setTimeout(() => {
        navigate('/reset-password');
      }, 800);
    } catch (error) {
      setServerError(error.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Branding & Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 xl:p-16 bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Reset Your Password
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              No worries! Enter your email address and we&apos;ll send you a secure reset code to create a new password.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <RecoveryIllustration />
        </div>
        <div className="mt-8 flex items-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Recovery</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>Email Verification</span>
          </div>
        </div>
      </div>

      {/* Right Column - Forgot Password Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Forgot password?
            </h1>
            <p className="text-slate-600">
              Enter your email address and we&apos;ll send you a reset code
            </p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 animate-fade-in">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-800">{serverError}</p>
            </div>
          )}

          {infoMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start space-x-3 animate-fade-in">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MailIcon />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                    errors.email
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-orange-500 focus:ring-orange-500/20'
                  } bg-slate-50/50 text-slate-900 placeholder-slate-400 hover:border-slate-300`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold text-sm shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:from-orange-700 hover:to-amber-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending OTP...</span>
                </span>
              ) : (
                'Send reset code'
              )}
            </button>
          </form>

          {/* Back to Login Link */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;

