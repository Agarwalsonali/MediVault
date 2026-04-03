import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { loginUser, getDashboardPathByRole, getLoginEmail } from '../services/authService.js';

export default function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await loginUser({ email: form.email, password: form.password });

      if (result?.twoFactorRequired) {
        // OTP step required — navigate with stored email
        toast.success('Login code sent to your email.');
        navigate('/verify-otp', { state: { email: form.email.trim().toLowerCase() } });
      } else {
        // Direct login (no 2FA) — go to dashboard
        toast.success('Signed in successfully.');
        navigate(getDashboardPathByRole(result?.role));
      }
    } catch (err) {
      toast.error(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">

      {/* ── Left hero ── */}
      <div className="auth-hero-panel">
        <div className="auth-hero-grid" />

        <div className="auth-brand">
          <div className="auth-brand-icon">
            <Activity size={22} color="white" strokeWidth={2} />
          </div>
          <span className="auth-brand-name">MediVault</span>
        </div>

        <div className="auth-hero-content">
          <h2 className="auth-hero-headline">
            Your health records,<br />
            <em>always with you.</em>
          </h2>
          <p className="auth-hero-sub">
            Securely manage, access and share your medical records from anywhere. Built for patients, doctors and healthcare teams.
          </p>
        </div>

        <div className="auth-hero-features">
          {['End-to-end encrypted records', 'Role-based access control', 'Instant OTP verification', 'Multi-device, always in sync'].map(f => (
            <div key={f} className="auth-hero-feature">
              <div className="auth-hero-feature-dot" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card animate-fade-up">

          {/* Mobile brand */}
          <div className="auth-form-mobile-brand">
            <div className="auth-brand-icon" style={{ width: 36, height: 36 }}>
              <Activity size={18} color="white" />
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--mv-navy)' }}>MediVault</span>
          </div>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Welcome back</h1>
            <p className="auth-form-subtitle">Sign in to your MediVault account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="mv-form-group">
              <label className="mv-label" htmlFor="email">Email address</label>
              <div className="mv-input-wrap">
                <span className="mv-input-icon"><Mail size={16} /></span>
                <input
                  id="email" name="email" type="email" autoComplete="email" required
                  placeholder="you@example.com" className="mv-input"
                  value={form.email} onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mv-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="mv-label" htmlFor="password" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" className="mv-link" style={{ fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <div className="mv-input-wrap">
                <span className="mv-input-icon"><Lock size={16} /></span>
                <input
                  id="password" name="password" type={showPass ? 'text' : 'password'}
                  autoComplete="current-password" required placeholder="••••••••"
                  className="mv-input" value={form.password} onChange={handleChange}
                />
                <button type="button" className="mv-input-suffix" onClick={() => setShowPass(p => !p)} aria-label={showPass ? 'Hide' : 'Show'}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
              disabled={loading}
              style={{ marginTop: '0.375rem' }}
            >
              {loading ? <><span className="mv-spinner" /><span>Signing in…</span></> : 'Sign in'}
            </button>
          </form>

          <div className="mv-divider"><span className="mv-divider-text">New to MediVault?</span></div>

          <Link to="/signup" className="mv-btn mv-btn-ghost mv-btn-full" style={{ justifyContent: 'center' }}>
            Create an account
          </Link>

          <p style={{ fontSize: '0.73rem', color: 'var(--mv-slate)', textAlign: 'center', marginTop: '1.5rem', lineHeight: 1.65 }}>
            By continuing you agree to MediVault's{' '}
            <a href="#" className="mv-link" style={{ fontSize: 'inherit' }}>Terms</a> and{' '}
            <a href="#" className="mv-link" style={{ fontSize: 'inherit' }}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
