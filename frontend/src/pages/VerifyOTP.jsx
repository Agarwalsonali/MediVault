import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyOtp, getLoginEmail } from '../services/authService.js';

// Icon components
const ShieldCheckIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

// Security illustration SVG
const SecurityIllustration = () => (
  <div className="relative h-full flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl"></div>
    <svg className="relative w-full max-w-md h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield */}
      <path d="M200 80L120 110V180C120 250 160 310 200 330C240 310 280 250 280 180V110L200 80Z" fill="url(#gradient2)" opacity="0.2"/>
      <path d="M200 80L120 110V180C120 250 160 310 200 330C240 310 280 250 280 180V110L200 80Z" stroke="url(#gradient2)" strokeWidth="8" fill="none"/>
      
      {/* Checkmark */}
      <path d="M160 200L185 225L240 170" stroke="url(#gradient2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      
      {/* Floating elements */}
      <circle cx="100" cy="100" r="6" fill="#10b981" opacity="0.3" className="animate-pulse"/>
      <circle cx="300" cy="120" r="8" fill="#06b6d4" opacity="0.3" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
      <circle cx="320" cy="280" r="7" fill="#10b981" opacity="0.3" className="animate-pulse" style={{animationDelay: '1s'}}/>
      <circle cx="80" cy="300" r="9" fill="#06b6d4" opacity="0.3" className="animate-pulse" style={{animationDelay: '1.5s'}}/>
      
      <defs>
        <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

function VerifyOTP() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedEmail = getLoginEmail();
    if (!storedEmail) {
      navigate('/login', { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setErrors({});
    setServerError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && otp.length === 0) {
      e.preventDefault();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    else if (otp.length !== 6) newErrors.otp = 'OTP must be 6 digits';
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

    try {
      const data = await verifyOtp({ email, otp });
      setInfoMessage(data?.message || 'Login successful');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setServerError(error.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Branding & Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 xl:p-16 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>
          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Verify Your Identity
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              We&apos;ve sent a secure 6-digit code to your email. Enter it below to complete your login.
            </p>
          </div>
        </div>
        <div className="mt-8">
          <SecurityIllustration />
        </div>
        <div className="mt-8 flex items-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Two-Factor Authentication</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure Verification</span>
          </div>
        </div>
      </div>

      {/* Right Column - OTP Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Enter verification code
            </h1>
            <p className="text-slate-600">
              We&apos;ve sent a 6-digit code to{' '}
              <span className="font-semibold text-slate-900">{email}</span>
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
            {/* OTP Input */}
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                One-Time Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <ShieldCheckIcon />
                </div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 text-center text-2xl font-mono tracking-widest ${
                    errors.otp
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-slate-200 focus:border-green-500 focus:ring-green-500/20'
                  } bg-slate-50/50 text-slate-900 placeholder-slate-300 hover:border-slate-300`}
                />
              </div>
              {errors.otp && (
                <p className="text-sm text-red-600">{errors.otp}</p>
              )}
              <p className="text-xs text-slate-500 mt-2">
                Didn&apos;t receive the code? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  try again
                </button>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-sm shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 hover:from-green-700 hover:to-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Verifying...</span>
                </span>
              ) : (
                'Verify & Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;

