import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Eye, EyeOff, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { resetPassword, getResetEmail } from '../services/authService.js';
import { validatePassword, getPasswordStrengthLabel, getPasswordStrengthColor } from '../utils/passwordValidator.js';

const LEN = 6;

export default function ResetPassword() {
  const [digits, setDigits]   = useState(Array(LEN).fill(''));
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  /* Email from nav state or localStorage (set by requestPasswordReset) */
  const email = location.state?.email || getResetEmail() || '';

  const validation = validatePassword(password);
  const strength = validation.strength;
  const strengthLabel = getPasswordStrengthLabel(strength);
  const strengthColor = getPasswordStrengthColor(strength);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const handleChange = (i, val) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (ch && i < LEN - 1) refs.current[i + 1]?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n); }
      else if (i > 0) refs.current[i - 1]?.focus();
    }
  };
  const handlePaste = (e) => {
    const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!p) return;
    e.preventDefault();
    const next = Array(LEN).fill('');
    p.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    refs.current[Math.min(p.length, LEN - 1)]?.focus();
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    const val = validatePassword(e.target.value);
    setPasswordErrors(val.errors);
  };

  const otp = digits.join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < LEN)     { toast.error('Enter the full 6-digit OTP.'); return; }
    if (password !== confirm)  { toast.error('Passwords do not match.'); return; }
    
    const validation = validatePassword(password);
    if (!validation.isValid) { 
      toast.error(validation.errors[0] || 'Password does not meet requirements.'); 
      return; 
    }
    
    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password }); // authService.resetPassword
      toast.success('Password reset successful.');
      navigate('/login', { state: { passwordReset: true } });
    } catch (err) {
      toast.error(err?.message || 'Reset failed. The code may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 440 }} className="animate-scale-in">

        <div className="mv-card" style={{ borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: 70, height: 70, background: 'var(--mv-teal-pale)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Lock size={30} color="var(--mv-teal)" />
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 6 }}>Reset your password</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.65 }}>
              Enter the code sent to <strong style={{ color: 'var(--mv-slate-dark)' }}>{email}</strong><br />and choose a new password.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP */}
            <div className="mv-form-group">
              <label className="mv-label">Verification code</label>
              <div className="otp-grid" onPaste={handlePaste} style={{ justifyContent: 'flex-start', gap: 7 }}>
                {digits.map((d, i) => (
                  <input key={i} ref={el => refs.current[i] = el}
                    type="text" inputMode="numeric" maxLength={1} value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    className={`otp-digit ${d ? 'filled' : ''}`}
                    style={{ width: 46, height: 54, fontSize: '1.2rem' }}
                    aria-label={`Digit ${i + 1}`} />
                ))}
              </div>
            </div>

            {/* New password */}
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
                <div style={{ marginTop: 6 }}>
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

            {/* Confirm */}
            <div className="mv-form-group">
              <label className="mv-label" htmlFor="confirm">Confirm new password</label>
              <div className="mv-input-wrap">
                <span className="mv-input-icon"><Lock size={16} /></span>
                <input id="confirm" type="password" required
                  placeholder="Repeat password"
                  className={`mv-input ${confirm && password !== confirm ? 'error' : ''}`}
                  value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
              {confirm && password !== confirm && (
                <p className="mv-field-error">Passwords don't match</p>
              )}
            </div>

            <button type="submit"
              className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
              disabled={loading}>
              {loading ? <><span className="mv-spinner" /><span>Resetting…</span></> : 'Reset password'}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg,var(--mv-teal),var(--mv-teal-glow))', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={13} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--mv-slate-dark)' }}>MediVault</span>
        </div>
      </div>
    </div>
  );
}
