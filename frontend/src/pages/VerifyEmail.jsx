import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, RotateCcw, CheckCircle, Activity } from 'lucide-react';
import { verifyEmail, resendVerificationOtp, getVerifyEmail } from '../services/authService.js';

const LEN = 6;

export default function VerifyEmail() {
  const [digits, setDigits]     = useState(Array(LEN).fill(''));
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [cooldown, setCooldown] = useState(60);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  /* Email from nav state or localStorage (set by registerUser) */
  const email = location.state?.email || getVerifyEmail() || '';

  useEffect(() => { refs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (i, val) => {
    const ch = val.replace(/\D/g, '').slice(-1);
    const next = [...digits]; next[i] = ch; setDigits(next);
    if (error) setError('');
    if (ch && i < LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (digits[i]) { const n = [...digits]; n[i] = ''; setDigits(n); }
      else if (i > 0) refs.current[i - 1]?.focus();
    }
    if (e.key === 'ArrowLeft'  && i > 0)       refs.current[i - 1]?.focus();
    if (e.key === 'ArrowRight' && i < LEN - 1) refs.current[i + 1]?.focus();
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

  const otp = digits.join('');

  const submit = async () => {
    if (otp.length < LEN) { setError('Please enter all 6 digits.'); return; }
    setLoading(true); setError('');
    try {
      await verifyEmail({ email, otp });          // authService.verifyEmail
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      setError(err?.message || 'Invalid or expired code. Please try again.');
      setDigits(Array(LEN).fill(''));
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  useEffect(() => { if (otp.length === LEN && !loading) submit(); }, [otp]);

  const handleResend = async () => {
    setResending(true); setError(''); setSuccess('');
    try {
      await resendVerificationOtp({ email });      // authService.resendVerificationOtp
      setSuccess('A new code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      setError(err?.message || 'Could not resend. Please try again.');
    } finally { setResending(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-scale-in">

        <div className="mv-card" style={{ borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ width: 70, height: 70, background: '#dbeafe', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Mail size={32} color="#2563eb" />
            </div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 6 }}>Verify your email</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.65 }}>
              Enter the 6-digit code sent to<br />
              <strong style={{ color: 'var(--mv-slate-dark)' }}>{email}</strong>
            </p>
          </div>

          {error && (
            <div className="mv-alert mv-alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mv-alert mv-alert-success animate-fade-in" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle size={15} /><span>{success}</span>
            </div>
          )}

          <div className="otp-grid" onPaste={handlePaste} style={{ marginBottom: '1.75rem' }}>
            {digits.map((d, i) => (
              <input key={i} ref={el => refs.current[i] = el}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)}
                className={`otp-digit ${d ? 'filled' : ''}`}
                aria-label={`Digit ${i + 1}`}
                autoComplete={i === 0 ? 'one-time-code' : 'off'} />
            ))}
          </div>

          <button type="button" onClick={submit}
            className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
            disabled={loading || otp.length < LEN}>
            {loading ? <><span className="mv-spinner" /><span>Verifying…</span></> : 'Verify Email'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.375rem' }}>
            {cooldown > 0 ? (
              <p style={{ fontSize: '0.84rem', color: 'var(--mv-slate)' }}>
                Resend in <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--mv-slate-dark)' }}>{cooldown}s</strong>
              </p>
            ) : (
              <button type="button" onClick={handleResend} disabled={resending}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--mv-teal)', fontWeight: 500, fontSize: '0.875rem' }}>
                <RotateCcw size={14} />{resending ? 'Sending…' : 'Resend code'}
              </button>
            )}
          </div>
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
