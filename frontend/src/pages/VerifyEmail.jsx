import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, RotateCcw, Activity, Sun, Moon } from 'lucide-react';
import { toast } from 'react-toastify';
import { verifyEmail, resendVerificationOtp, getVerifyEmail } from '../services/authService.js';
import { useTheme } from '../hooks/useTheme.js';

const LEN = 6;

export default function VerifyEmail() {
  const [digits, setDigits]     = useState(Array(LEN).fill(''));
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const refs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

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
    if (otp.length < LEN) { toast.error('Please enter all 6 digits.'); return; }
    setLoading(true);
    try {
      await verifyEmail({ email, otp });          // authService.verifyEmail
      toast.success('Email verified successfully.');
      navigate('/login', { state: { verified: true } });
    } catch (err) {
      toast.error(err?.message || 'Invalid or expired code. Please try again.');
      setDigits(Array(LEN).fill(''));
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  useEffect(() => { if (otp.length === LEN && !loading) submit(); }, [otp]);

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationOtp({ email });      // authService.resendVerificationOtp
      toast.success('A new code has been sent to your email.');
      setCooldown(60);
    } catch (err) {
      toast.error(err?.message || 'Could not resend. Please try again.');
    } finally { setResending(false); }
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
