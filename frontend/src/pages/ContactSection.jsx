/**
 * ContactSection.jsx
 * Drop-in replacement for <section className="home-cta"> in Home.jsx
 * Wired to contactService.js → submitContactMessage({ name, email, role, issueType, message })
 *
 * Place this file at:  frontend/src/pages/ContactSection.jsx
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContactMessage } from '../services/contactService';

/* ── static data ───────────────────────────────────────── */
const INFO = [
  { icon: Mail,  label: 'Email',  value: 'support@medivault.health', href: 'mailto:support@medivault.health' },
  { icon: Phone, label: 'Phone',  value: '+1 (800) 555-0198',        href: 'tel:+18005550198'               },
  { icon: MapPin,label: 'Office', value: 'Sector 62, Noida — 201309', href: '#'                              },
];

const ROLES        = ['Patient', 'Staff', 'Admin', 'Other'];
const ISSUE_TYPES  = ['General Enquiry', 'Technical Support', 'Report Issue', 'Billing', 'Demo Request', 'Other'];

/* ── component ─────────────────────────────────────────── */
export default function ContactSection() {
  const EMPTY = { name: '', email: '', role: '', issueType: '', message: '' };
  const [form,   setForm]   = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [apiErr, setApiErr] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name      = 'Required';
    if (!form.email.trim()) e.email     = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.role)         e.role      = 'Required';
    if (!form.issueType)    e.issueType = 'Required';
    if (!form.message.trim()) e.message = 'Required';
    return e;
  };

  const handle = ({ target: { name, value } }) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus('sending'); setApiErr('');
    try {
      await submitContactMessage(form);
      setStatus('sent');
      setForm(EMPTY);
    } catch (err) {
      setApiErr(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <>
      {/* ── scoped styles — only .cs-* classes, nothing global ── */}
      <style>{`
        /* keyframes */
        @keyframes cs-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes cs-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.6)} }
        @keyframes cs-spin     { to{transform:rotate(360deg)} }
        @keyframes cs-pop      { from{transform:scale(0);opacity:0} 70%{transform:scale(1.15)} to{transform:scale(1);opacity:1} }

        /* wrapper — inherits home-cta position in the flow */
        .cs-wrap {
          padding: clamp(48px,8vw,88px) clamp(1.5rem,6vw,5rem);
          position: relative;
        }
        .cs-wrap::before {
          content: '';
          position: absolute; top: 0; left: 8%; right: 8%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent);
        }

        /* header */
        .cs-head { text-align: center; margin-bottom: 44px; }
        .cs-badge {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: .72rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: var(--color-primary, #00c2a8);
          border: 1px solid rgba(0,194,168,.25);
          background: rgba(0,194,168,.08);
          padding: 5px 13px; border-radius: 999px; margin-bottom: 12px;
        }
        .cs-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-primary, #00c2a8);
          animation: cs-pulse 2s ease-in-out infinite;
        }
        .cs-title {
          font-size: clamp(1.7rem,3.4vw,2.35rem);
          font-weight: 700; letter-spacing: -.025em; line-height: 1.15; color: #fff;
          margin-bottom: 10px;
        }
        .cs-title em {
          font-style: normal;
          background: linear-gradient(90deg, var(--color-primary,#00c2a8), #3b82f6);
          background-size: 200% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          animation: cs-shimmer 4s linear infinite;
        }
        .cs-sub {
          font-size: .93rem; color: var(--color-text-muted, #7a8ba5);
          max-width: 420px; margin: 0 auto; line-height: 1.65;
        }

        /* two-column grid */
        .cs-grid {
          display: grid;
          grid-template-columns: 1fr 1.35fr;
          gap: 22px;
          max-width: 1020px;
          margin: 0 auto;
          align-items: start;
        }
        @media (max-width: 800px) { .cs-grid { grid-template-columns: 1fr; } }

        /* ── LEFT card ── */
        .cs-left {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.03);
          overflow: hidden;
          display: flex; flex-direction: column;
        }

        /* CTA strip */
        .cs-cta {
          padding: 26px 24px 22px;
          background: linear-gradient(135deg, rgba(0,194,168,.08), rgba(59,130,246,.05));
          border-bottom: 1px solid rgba(255,255,255,.06);
        }
        .cs-cta h3 {
          font-size: 1.05rem; font-weight: 700; color: #fff;
          margin-bottom: 6px; line-height: 1.35;
        }
        .cs-cta p {
          font-size: .82rem; color: var(--color-text-muted,#7a8ba5);
          line-height: 1.6; margin-bottom: 16px;
        }
        .cs-cta-btns { display: flex; flex-direction: column; gap: 8px; }

        /* re-use existing mv-btn classes from the project */
        .cs-cta-btns .mv-btn { justify-content: center; width: 100%; }

        /* info rows */
        .cs-info { padding: 4px 0; }
        .cs-info-row {
          display: flex; align-items: center; gap: 13px;
          padding: 14px 24px;
          border-bottom: 1px solid rgba(255,255,255,.05);
          text-decoration: none; color: inherit;
          transition: background .18s;
        }
        .cs-info-row:last-child { border-bottom: none; }
        .cs-info-row:hover { background: rgba(255,255,255,.03); }
        .cs-info-icon {
          width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0,194,168,.10); color: var(--color-primary,#00c2a8);
          transition: transform .2s;
        }
        .cs-info-row:hover .cs-info-icon { transform: scale(1.1); }
        .cs-info-lbl { font-size: .68rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--color-text-muted,#7a8ba5); margin-bottom: 2px; }
        .cs-info-val { font-size: .88rem; font-weight: 500; color: #e8f0fe; }

        /* live badge */
        .cs-live {
          display: flex; align-items: center; gap: 9px;
          padding: 12px 24px;
          background: rgba(0,194,168,.05);
          border-top: 1px solid rgba(255,255,255,.05);
        }
        .cs-live-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: var(--color-primary,#00c2a8);
          box-shadow: 0 0 0 3px rgba(0,194,168,.2);
          animation: cs-pulse 2s ease-in-out infinite;
        }
        .cs-live-txt { font-size: .78rem; font-weight: 500; color: var(--color-primary,#00c2a8); }

        /* ── RIGHT form card ── */
        .cs-form-card {
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.07);
          background: rgba(255,255,255,.03);
          padding: clamp(22px,3.5vw,32px) clamp(20px,3.5vw,30px);
          position: relative; overflow: hidden;
        }
        /* animated top bar */
        .cs-form-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg,#00c2a8,#3b82f6,#a78bfa,#00c2a8);
          background-size: 200% auto;
          animation: cs-shimmer 3.5s linear infinite;
        }

        .cs-form-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 4px;
        }
        .cs-form-title svg { color: var(--color-primary,#00c2a8); }
        .cs-form-desc { font-size: .82rem; color: var(--color-text-muted,#7a8ba5); margin-bottom: 20px; line-height: 1.55; }

        /* api error */
        .cs-api-err {
          display: flex; align-items: flex-start; gap: 8px;
          background: rgba(248,113,113,.08); border: 1px solid rgba(248,113,113,.25);
          border-radius: 9px; padding: 10px 12px; margin-bottom: 14px;
          font-size: .82rem; color: #f87171; line-height: 1.5;
        }

        /* rows */
        .cs-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .cs-row { grid-template-columns: 1fr; } }

        /* field */
        .cs-field { margin-bottom: 12px; }
        .cs-label {
          display: block; font-size: .68rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--color-text-muted,#7a8ba5); margin-bottom: 5px;
          transition: color .2s;
        }
        .cs-field:focus-within .cs-label { color: var(--color-primary,#00c2a8); }

        .cs-input, .cs-select, .cs-textarea {
          width: 100%;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 9px; padding: 10px 12px;
          color: #e8f0fe; font-family: inherit; font-size: .87rem;
          outline: none; resize: none; -webkit-appearance: none;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .cs-input::placeholder,.cs-textarea::placeholder { color: rgba(122,139,165,.45); }
        .cs-input:focus,.cs-select:focus,.cs-textarea:focus {
          border-color: var(--color-primary,#00c2a8);
          box-shadow: 0 0 0 3px rgba(0,194,168,.12);
          background: rgba(0,194,168,.025);
        }
        .cs-field.err .cs-input,
        .cs-field.err .cs-select,
        .cs-field.err .cs-textarea {
          border-color: #f87171;
          box-shadow: 0 0 0 3px rgba(248,113,113,.10);
        }
        .cs-select option { background: #0a1628; color: #e8f0fe; }
        .cs-textarea { min-height: 106px; }

        .cs-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; min-height: 18px; }
        .cs-err { display: flex; align-items: center; gap: 4px; font-size: .71rem; color: #f87171; }
        .cs-counter { font-size: .7rem; color: var(--color-text-muted,#7a8ba5); }

        /* submit */
        .cs-submit {
          width: 100%; margin-top: 4px; padding: 12px 20px;
          background: linear-gradient(135deg,#00c2a8,#00a896);
          color: #03191c; font-family: inherit; font-size: .93rem; font-weight: 700;
          border: none; border-radius: 10px; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          box-shadow: 0 4px 18px rgba(0,194,168,.28);
          transition: transform .2s, box-shadow .2s, filter .2s;
        }
        .cs-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 7px 26px rgba(0,194,168,.40); filter: brightness(1.07); }
        .cs-submit:active  { transform: translateY(0); }
        .cs-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
        .cs-spinner { width:16px;height:16px;border-radius:50%;border:2px solid rgba(3,25,28,.3);border-top-color:#03191c;animation:cs-spin .7s linear infinite; }

        /* success */
        .cs-success { display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 16px;text-align:center; }
        .cs-success-ring { width:64px;height:64px;border-radius:50%;background:rgba(0,194,168,.12);border:2px solid rgba(0,194,168,.35);display:flex;align-items:center;justify-content:center;color:var(--color-primary,#00c2a8);animation:cs-pop .45s cubic-bezier(.34,1.56,.64,1) both; }
        .cs-success-title { font-size:1.15rem;font-weight:700;color:#fff; }
        .cs-success-sub   { font-size:.84rem;color:var(--color-text-muted,#7a8ba5);max-width:280px;line-height:1.6; }
        .cs-success-reset { font-size:.8rem;color:var(--color-primary,#00c2a8);cursor:pointer;background:none;border:none;font-family:inherit;text-decoration:underline;text-underline-offset:3px;margin-top:4px; }
      `}</style>

      <section className="cs-wrap animate-scale-in delay-300" id="contact">

        {/* header */}
        <div className="cs-head">
          <div className="cs-badge"><span className="cs-badge-dot" />Contact &amp; Support</div>
          <h2 className="cs-title">
            Ready to simplify your<br /><em>hospital workflow?</em>
          </h2>
          <p className="cs-sub">
            Start with MediVault, or reach out — our team is happy to help with demos, support, and enterprise plans.
          </p>
        </div>

        <div className="cs-grid">

          {/* ── LEFT: CTA + contact info ── */}
          <div className="cs-left">
            <div className="cs-cta">
              <h3>Get started in minutes</h3>
              <p>Modernize your operations with role-based dashboards and secure report handling — no setup headaches.</p>
              <div className="cs-cta-btns">
                <Link to="/signup" className="mv-btn mv-btn-primary">
                  Create Free Account <ArrowRight size={14} />
                </Link>
                <Link to="/login" className="mv-btn mv-btn-ghost">
                  I already have an account
                </Link>
              </div>
            </div>

            <div className="cs-info">
              {INFO.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="cs-info-row">
                  <div className="cs-info-icon"><Icon size={16} /></div>
                  <div>
                    <div className="cs-info-lbl">{label}</div>
                    <div className="cs-info-val">{value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="cs-live">
              <span className="cs-live-dot" />
              <span className="cs-live-txt">Support online · avg. reply in 18 min</span>
            </div>
          </div>

          {/* ── RIGHT: contact form ── */}
          <div className="cs-form-card">
            {status === 'sent' ? (
              <div className="cs-success">
                <div className="cs-success-ring"><CheckCircle2 size={28} /></div>
                <div className="cs-success-title">Message sent!</div>
                <p className="cs-success-sub">A MediVault specialist will get back to you within 24 hours.</p>
                <button className="cs-success-reset" onClick={() => setStatus('idle')}>Send another message</button>
              </div>
            ) : (
              <>
                <div className="cs-form-title"><Send size={15} /> Send us a message</div>
                <p className="cs-form-desc">Fill in the form and we'll respond promptly.</p>

                {status === 'error' && apiErr && (
                  <div className="cs-api-err">
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{apiErr}</span>
                  </div>
                )}

                <form onSubmit={submit} noValidate>
                  {/* name + email */}
                  <div className="cs-row">
                    <div className={`cs-field ${errors.name ? 'err' : ''}`}>
                      <label className="cs-label" htmlFor="cs-name">Full Name *</label>
                      <input id="cs-name" name="name" className="cs-input"
                        placeholder="Dr. Priya Sharma"
                        value={form.name} onChange={handle} />
                      {errors.name && (
                        <div className="cs-foot">
                          <span className="cs-err"><AlertCircle size={11} />{errors.name}</span>
                        </div>
                      )}
                    </div>
                    <div className={`cs-field ${errors.email ? 'err' : ''}`}>
                      <label className="cs-label" htmlFor="cs-email">Email *</label>
                      <input id="cs-email" name="email" type="email" className="cs-input"
                        placeholder="priya@hospital.org"
                        value={form.email} onChange={handle} />
                      {errors.email && (
                        <div className="cs-foot">
                          <span className="cs-err"><AlertCircle size={11} />{errors.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* role + issueType — exact field names from contactService.js */}
                  <div className="cs-row">
                    <div className={`cs-field ${errors.role ? 'err' : ''}`}>
                      <label className="cs-label" htmlFor="cs-role">Role *</label>
                      <select id="cs-role" name="role" className="cs-select"
                        value={form.role} onChange={handle}>
                        <option value="">Select…</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errors.role && (
                        <div className="cs-foot">
                          <span className="cs-err"><AlertCircle size={11} />{errors.role}</span>
                        </div>
                      )}
                    </div>
                    <div className={`cs-field ${errors.issueType ? 'err' : ''}`}>
                      <label className="cs-label" htmlFor="cs-issue">Issue Type *</label>
                      <select id="cs-issue" name="issueType" className="cs-select"
                        value={form.issueType} onChange={handle}>
                        <option value="">Select…</option>
                        {ISSUE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.issueType && (
                        <div className="cs-foot">
                          <span className="cs-err"><AlertCircle size={11} />{errors.issueType}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* message */}
                  <div className={`cs-field ${errors.message ? 'err' : ''}`}>
                    <label className="cs-label" htmlFor="cs-msg">Message *</label>
                    <textarea id="cs-msg" name="message" className="cs-textarea"
                      placeholder="Tell us how we can help your healthcare team…"
                      value={form.message} onChange={handle} maxLength={500} />
                    <div className="cs-foot">
                      {errors.message
                        ? <span className="cs-err"><AlertCircle size={11} />{errors.message}</span>
                        : <span />}
                      <span className="cs-counter">{form.message.length}/500</span>
                    </div>
                  </div>

                  <button type="submit" className="cs-submit" disabled={status === 'sending'}>
                    {status === 'sending'
                      ? <><span className="cs-spinner" /> Sending…</>
                      : <><Send size={14} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </section>
    </>
  );
}
