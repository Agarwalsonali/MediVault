import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  getVerifyEmail,
  verifyEmail as verifyEmailApi,
  resendVerificationOtp as resendVerificationOtpApi,
} from '../services/authService.js';

const MailIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM7 7a8 8 0 1014.907 3.32l-2.457 2.457H17v2h-2v2h-2v2H9.5v-2.5l7.277-7.277A7.963 7.963 0 007 7z" />
  </svg>
);

// Reuse the same visual language as Login/Signup pages
const HealthcareIllustration = () => (
  <div className="relative h-full flex items-center justify-center">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl"></div>
    <svg className="relative w-full max-w-md h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="200" cy="200" r="120" fill="url(#gradient1)" opacity="0.1"/>
      <rect x="180" y="120" width="40" height="160" rx="8" fill="url(#gradient1)"/>
      <rect x="120" y="180" width="160" height="40" rx="8" fill="url(#gradient1)"/>

      <circle cx="100" cy="100" r="8" fill="#3b82f6" opacity="0.3" className="animate-pulse"/>
      <circle cx="300" cy="120" r="6" fill="#8b5cf6" opacity="0.3" className="animate-pulse" style={{animationDelay: '0.5s'}}/>
      <circle cx="320" cy="280" r="10" fill="#06b6d4" opacity="0.3" className="animate-pulse" style={{animationDelay: '1s'}}/>
      <circle cx="80" cy="300" r="7" fill="#3b82f6" opacity="0.3" className="animate-pulse" style={{animationDelay: '1.5s'}}/>

      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function VerifyEmail() {
  const navigate = useNavigate();
  const query = useQuery();

  const [form, setForm] = useState({ email: '', otp: '' });
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const fromQuery = query.get('email');
    const fromStorage = getVerifyEmail();
    const prefill = fromQuery || fromStorage || '';

    if (!prefill) {
      navigate('/signup', { replace: true });
      return;
    }

    setForm((prev) => ({ ...prev, email: prefill }));
  }, [navigate, query]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    setSuccessMessage('');

    try {
      const data = await verifyEmailApi({
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
      });
      setSuccessMessage(data?.message || 'Email verified successfully');
      navigate('/login', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setServerError('');
    setSuccessMessage('');
    try {
      const data = await resendVerificationOtpApi({ email: form.email.trim().toLowerCase() });
      setSuccessMessage(data?.message || 'Verification OTP resent to your email');
    } catch (err) {
      setServerError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column - Branding & Illustration */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between lg:p-12 xl:p-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Verify your account
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Confirm your email to activate your account and continue securely.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <HealthcareIllustration />
        </div>

        <div className="mt-8 flex items-center space-x-6 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>

      {/* Right Column - Verification Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-12 xl:px-16 py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-900">MRMS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Verify your email
            </h1>
            <p className="text-slate-600">
              Enter the 6-digit OTP sent to your email to activate your account.
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

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start space-x-3 animate-fade-in">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-slate-700">
                OTP
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyIcon />
                </div>
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  value={form.otp}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setForm((prev) => ({ ...prev, otp: digitsOnly }));
                    setServerError('');
                  }}
                  placeholder="123456"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 tracking-widest"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">OTP expires in 10 minutes.</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || !form.email.trim()}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resendLoading ? 'Resending...' : 'Resend OTP'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
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
                'Verify email'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-600">
            Already verified?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200">
              Go to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

