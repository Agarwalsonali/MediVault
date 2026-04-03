import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { registerUser, getVerifyEmail } from '../services/authService.js';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/passwordValidator.js';

export default function Signup() {
  const [form, setForm]         = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    
    // Real-time password validation
    if (e.target.name === 'password') {
      const validation = validatePassword(e.target.value);
      setPasswordErrors(validation.errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match.'); return; }
    
    const validation = validatePassword(form.password);
    if (!validation.isValid) { 
      toast.error(validation.errors[0] || 'Password does not meet requirements.');
      return; 
    }
    
    setLoading(true);
    try {
      await registerUser({ fullName: form.fullName, email: form.email, password: form.password });
      // authService.registerUser stores email via setVerifyEmail internally
      toast.success('Registration successful. Check your email to verify your account.');
      navigate('/verify-email', { state: { email: form.email } });
    } catch (err) {
      toast.error(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /* Password strength */
  const validation = validatePassword(form.password);
  const strength = validation.strength;
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  return (
    <div className="auth-shell">

      {/* ── Left hero ── */}
      <div className="auth-hero-panel">
        <div className="auth-hero-grid" />
        <Link to="/" className="auth-brand">
          <div className="auth-brand-icon"><Activity size={22} color="white" /></div>
          <span className="auth-brand-name">MediVault</span>
        </Link>
        <div className="auth-hero-content">
          <h2 className="auth-hero-headline">Join thousands who<br /><em>trust MediVault.</em></h2>
          <p className="auth-hero-sub">Create your secure health vault in seconds. Prescriptions, reports and records — all in one place.</p>
        </div>
        <div className="auth-hero-features">
          {['Free to create an account', 'Instant email verification', 'Share records with your doctor', 'HIPAA-compliant storage'].map(f => (
            <div key={f} className="auth-hero-feature">
              <div className="auth-hero-feature-dot" /><span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form ── */}
      <div className="auth-form-panel">
        <div className="auth-form-card animate-fade-up">

          <Link to="/" className="auth-form-mobile-brand" style={{ textDecoration: 'none' }}>
            <div className="auth-brand-icon" style={{ width: 36, height: 36 }}><Activity size={18} color="white" /></div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--mv-navy)' }}>MediVault</span>
          </Link>

          <div className="auth-form-header">
            <h1 className="auth-form-title">Create your account</h1>
            <p className="auth-form-subtitle">Get started with MediVault — it's free</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Full name */}
            <div className="mv-form-group">
              <label className="mv-label" htmlFor="fullName">Full name</label>
              <div className="mv-input-wrap">
                <span className="mv-input-icon"><User size={16} /></span>
                <input id="fullName" name="fullName" type="text" autoComplete="name" required
                  placeholder="Your Name" className="mv-input"
                  value={form.fullName} onChange={handleChange} />
              </div>
            </div>

            {/* Email */}
            <div className="mv-form-group">
              <label className="mv-label" htmlFor="email">Email address</label>
              <div className="mv-input-wrap">
                <span className="mv-input-icon"><Mail size={16} /></span>
                <input id="email" name="email" type="email" autoComplete="email" required
                  placeholder="you@example.com" className="mv-input"
                  value={form.email} onChange={handleChange} />
              </div>
            </div>

            {/* Passwords */}
            <div className="mv-form-row">
              <div className="mv-form-group">
                <label className="mv-label" htmlFor="password">Password</label>
                <div className="mv-input-wrap">
                  <span className="mv-input-icon"><Lock size={16} /></span>
                  <input id="password" name="password" type={showPass ? 'text' : 'password'}
                    autoComplete="new-password" required placeholder="Min. 8 chars"
                    className="mv-input" value={form.password} onChange={handleChange} />
                  <button type="button" className="mv-input-suffix" onClick={() => setShowPass(p => !p)}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                      {[1,2,3,4].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : 'var(--mv-border)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.71rem', color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
                    {passwordErrors.length > 0 && (
                      <ul style={{ marginTop: 6, paddingLeft: '1.25rem', fontSize: '0.71rem', color: 'var(--mv-danger)' }}>
                        {passwordErrors.map((err, i) => (
                          <li key={i} style={{ marginBottom: '0.25rem' }}>• {err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div className="mv-form-group">
                <label className="mv-label" htmlFor="confirmPassword">Confirm</label>
                <div className="mv-input-wrap">
                  <span className="mv-input-icon"><Lock size={16} /></span>
                  <input id="confirmPassword" name="confirmPassword"
                    type={showConf ? 'text' : 'password'}
                    autoComplete="new-password" required placeholder="Repeat password"
                    className={`mv-input ${form.confirmPassword && form.password !== form.confirmPassword ? 'error' : ''}`}
                    value={form.confirmPassword} onChange={handleChange} />
                  <button type="button" className="mv-input-suffix" onClick={() => setShowConf(p => !p)}>
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="mv-field-error">Passwords don't match</p>
                )}
              </div>
            </div>

            <button type="submit"
              className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
              disabled={loading} style={{ marginTop: '0.375rem' }}>
              {loading ? <><span className="mv-spinner" /><span>Creating account…</span></> : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--mv-slate)' }}>
            Already have an account? <Link to="/login" className="mv-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
