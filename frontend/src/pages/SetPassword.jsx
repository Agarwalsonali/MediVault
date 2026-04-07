import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Activity, CheckCircle, Sun, Moon } from 'lucide-react';
import { setPasswordFromInvite } from '../services/authService.js';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/passwordValidator.js';
import { useTheme } from '../hooks/useTheme.js';

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const token = searchParams.get('token') || '';

  const validation = validatePassword(password);
  const strength = validation.strength;
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
    const val = validatePassword(e.target.value);
    setPasswordErrors(val.errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    
    const validation = validatePassword(password);
    if (!validation.isValid) { 
      setError(validation.errors[0] || 'Password does not meet requirements.'); 
      return; 
    }
    
    if (!token) { setError('Invalid invite link. Please contact your administrator.'); return; }
    setLoading(true); setError('');
    try {
      await setPasswordFromInvite({ token, password }); // authService.setPasswordFromInvite
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Failed to set password. The link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
      <button
        onClick={toggleTheme}
        className="mv-btn mv-btn-ghost"
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '8px 12px' }}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      </button>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-scale-in">

        <div className="mv-card" style={{ borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

          {!done ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: 70, height: 70, background: 'var(--mv-teal-pale)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Lock size={30} color="var(--mv-teal)" />
                </div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 6 }}>Set your password</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.65 }}>
                  Welcome to MediVault! Create a strong password to activate your account.
                </p>
              </div>

              {error && (
                <div className="mv-alert mv-alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="password">New password</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><Lock size={16} /></span>
                    <input id="password" type={showPass ? 'text' : 'password'} required
                      placeholder="Min. 8 characters" className="mv-input"
                      value={password} onChange={handlePasswordChange} />
                    <button type="button" className="mv-input-suffix" onClick={() => setShowPass(p => !p)}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password && (
                    <div style={{ marginTop: 7 }}>
                      <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : 'var(--mv-border)', transition: 'background 0.3s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: strengthColor, fontWeight: 500 }}>{strengthLabel}</span>
                      {passwordErrors.length > 0 && (
                        <ul style={{ marginTop: 6, paddingLeft: '1.25rem', fontSize: '0.7rem', color: 'var(--mv-danger)' }}>
                          {passwordErrors.map((err, i) => (
                            <li key={i} style={{ marginBottom: '0.25rem' }}>• {err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="confirm">Confirm password</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><Lock size={16} /></span>
                    <input id="confirm" type="password" required placeholder="Repeat password"
                      className={`mv-input ${confirm && password !== confirm ? 'error' : ''}`}
                      value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} />
                  </div>
                  {confirm && password !== confirm && (
                    <p className="mv-field-error">Passwords don't match</p>
                  )}
                </div>

                <button type="submit"
                  className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
                  disabled={loading}>
                  {loading ? <><span className="mv-spinner" /><span>Activating account…</span></> : 'Activate account'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, background: 'var(--mv-success-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <CheckCircle size={32} color="var(--mv-success)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 8 }}>Account activated!</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                Your MediVault account is ready. Sign in to get started.
              </p>
              <button onClick={() => navigate('/login')} className="mv-btn mv-btn-primary mv-btn-full mv-btn-lg" style={{ justifyContent: 'center' }}>
                Go to sign in
              </button>
            </div>
          )}
        </div>

        <Link to="/" style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,var(--mv-teal),var(--mv-teal-glow))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={13} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--mv-slate-dark)' }}>MediVault</span>
        </Link>
      </div>
    </div>
  );
}
