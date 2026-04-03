import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Activity } from 'lucide-react';
import { toast } from 'react-toastify';
import { requestPasswordReset } from '../services/authService.js';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset({ email });   // authService stores email via setResetEmail
      setSent(true);
      toast.success('Reset code sent to your email.');
    } catch (err) {
      toast.error(err?.message || 'Could not send reset code. Check your email address.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mv-off-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }} className="animate-scale-in">

        <div className="mv-card" style={{ borderRadius: 'var(--radius-xl)', padding: '2.5rem 2rem', boxShadow: 'var(--shadow-lg)' }}>

          {!sent ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
                <div style={{ width: 70, height: 70, background: 'var(--mv-teal-pale)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <Mail size={30} color="var(--mv-teal)" />
                </div>
                <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 6 }}>Forgot password?</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.65 }}>
                  Enter your email and we'll send you a reset code.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="email">Email address</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><Mail size={16} /></span>
                    <input id="email" type="email" required placeholder="you@example.com"
                      className="mv-input" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }} />
                  </div>
                </div>
                <button type="submit"
                  className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${loading ? 'mv-btn-loading' : ''}`}
                  disabled={loading}>
                  {loading ? <><span className="mv-spinner" /><span>Sending…</span></> : 'Send reset code'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 70, height: 70, background: 'var(--mv-success-bg)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mv-navy)', marginBottom: 8 }}>Check your inbox</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                We sent a password reset code to<br />
                <strong style={{ color: 'var(--mv-slate-dark)' }}>{email}</strong>
              </p>
              <Link
                to="/reset-password"
                state={{ email }}
                className="mv-btn mv-btn-primary mv-btn-full"
                style={{ justifyContent: 'center' }}
              >
                Enter reset code →
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/login" style={{ fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--mv-slate)', textDecoration: 'none' }}>
              <ArrowLeft size={14} /> Back to sign in
            </Link>
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
