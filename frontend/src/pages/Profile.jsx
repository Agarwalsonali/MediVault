import { getFullName, getLoginEmail, getRole } from '../services/authService.js';
import { User, Mail, Shield, CheckCircle, Lock, Edit3 } from 'lucide-react';

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--mv-border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--mv-slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const role     = getRole()      || 'Patient';
  const fullName = getFullName()  || 'Signed-in User';
  const email    = getLoginEmail() || '—';
  const initials = fullName.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dash-page">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">My Profile</h1>
        <p className="dash-page-subtitle">Manage your account details and security preferences</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: 860 }}>

        {/* Avatar card */}
        <div className="mv-card animate-fade-up" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
          {/* Avatar */}
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, var(--mv-teal), var(--mv-teal-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.75rem', fontWeight: 700, color: 'white', boxShadow: '0 4px 20px rgba(13,148,136,0.3)' }}>
            {initials}
          </div>
          <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--mv-navy)', marginBottom: 4 }}>{fullName}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--mv-slate)', marginBottom: '1.25rem' }}>{email}</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="mv-badge mv-badge-teal">
              <CheckCircle size={11} /> Verified
            </span>
            <span className="mv-badge mv-badge-blue">{role}</span>
          </div>

          <div style={{ borderTop: '1px solid var(--mv-border)', marginTop: '1.5rem', paddingTop: '1.25rem' }}>
            <button className="mv-btn mv-btn-outline mv-btn-full" style={{ gap: 8 }}>
              <Edit3 size={15} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Details card */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="mv-card-header">
            <p className="mv-card-title">Account Information</p>
          </div>
          <div className="mv-card-body">
            <InfoRow icon={<User size={17} color="var(--mv-teal)" />}  label="Full Name" value={fullName} />
            <InfoRow icon={<Mail size={17} color="var(--mv-teal)" />}  label="Email Address" value={email} />
            <InfoRow icon={<Shield size={17} color="var(--mv-teal)" />} label="Role" value={role} />
            <div style={{ borderBottom: 'none', padding: '14px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--mv-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Lock size={17} color="var(--mv-success)" />
                </div>
                <div>
                  <p style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>Two-Factor Auth</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--mv-success)' }}>OTP Enabled</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security card */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '200ms', gridColumn: '1 / -1', maxWidth: 860 }}>
          <div className="mv-card-header">
            <p className="mv-card-title">Security Preferences</p>
          </div>
          <div className="mv-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Change Password', desc: 'Update your password to keep your account secure.', btn: 'Change', variant: 'mv-btn-outline' },
                { title: 'Manage OTP Settings', desc: 'Configure your two-factor authentication preferences.', btn: 'Manage', variant: 'mv-btn-outline' },
                { title: 'Active Sessions', desc: 'View and manage all your active login sessions.', btn: 'View', variant: 'mv-btn-ghost' },
              ].map(s => (
                <div key={s.title} style={{ background: 'var(--mv-off-white)', borderRadius: 'var(--radius)', padding: '1rem 1.125rem', border: '1px solid var(--mv-border)' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--mv-slate-dark)', marginBottom: 5 }}>{s.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--mv-slate)', lineHeight: 1.55, marginBottom: '0.875rem' }}>{s.desc}</p>
                  <button className={`mv-btn ${s.variant} mv-btn-sm`}>{s.btn}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
