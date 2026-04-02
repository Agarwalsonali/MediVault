import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Shield, ArrowRight, Activity, TrendingUp } from 'lucide-react';

const STATS = [
  { title: 'Total Staff',     value: '24', sub: 'Active Nurse + Staff accounts', icon: <Users size={22} />,     cls: 'teal'   },
  { title: 'New This Month',  value: '6',  sub: 'Recently onboarded',            icon: <TrendingUp size={22} />, cls: 'green'  },
  { title: 'System Status',   value: 'Secure', sub: 'Role-based access is active', icon: <Shield size={22} />,  cls: 'blue'   },
  { title: 'Active Patients', value: '142', sub: 'Registered patients',          icon: <UserCheck size={22} />, cls: 'purple' },
];

const ACTIVITY = [
  { text: 'New nurse account created',    time: '2 minutes ago',  color: 'var(--mv-teal)' },
  { text: 'Report uploaded for Patient #0047', time: '14 minutes ago', color: 'var(--mv-info)' },
  { text: 'Staff account deactivated',   time: '1 hour ago',     color: 'var(--mv-warning)' },
  { text: 'System backup completed',     time: '3 hours ago',    color: 'var(--mv-success)' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dash-page">
      {/* Welcome banner */}
      <div className="animate-fade-up" style={{
        background: 'linear-gradient(120deg, var(--mv-navy) 0%, var(--mv-navy-soft) 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.75rem 2rem', marginBottom: '1.75rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, borderRadius: '50%', background: 'rgba(13,148,136,0.14)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(45,212,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.04) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
            <Activity size={13} color="var(--mv-teal-glow)" />
            <span style={{ fontSize: '0.72rem', color: 'var(--mv-teal-glow)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Admin Dashboard</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'white', marginBottom: 6 }}>System Overview</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, lineHeight: 1.65 }}>
            Monitor platform health, staff accounts, and patient activity from this central admin hub.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {STATS.map((s, i) => (
          <div key={s.title} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-body">
              <p className="stat-label">{s.title}</p>
              <p className="stat-value">{s.value}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 3 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: quick actions + recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Quick Actions */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '320ms' }}>
          <div className="mv-card-header"><p className="mv-card-title">Quick Actions</p></div>
          <div className="mv-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Manage Staff Accounts', sub: 'Create, edit or remove Nurse/Staff', path: '/manage-staff', cls: 'mv-btn-primary' },
              { label: 'View Admin Profile',     sub: 'Update your admin credentials',      path: '/admin-profile', cls: 'mv-btn-outline' },
            ].map(a => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className={`mv-btn ${a.cls}`} style={{ height: 'auto', padding: '12px 16px', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 2 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600 }}>{a.label}</span>
                  <ArrowRight size={15} style={{ flexShrink: 0 }} />
                </span>
                <span style={{ fontSize: '0.78rem', opacity: 0.72, fontWeight: 400 }}>{a.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="mv-card-header"><p className="mv-card-title">Recent Activity</p></div>
          <div className="mv-card-body" style={{ padding: '0.5rem 1.375rem' }}>
            {ACTIVITY.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: i < ACTIVITY.length - 1 ? '1px solid var(--mv-border)' : 'none' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: 6 }} />
                <div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate-dark)', fontWeight: 500 }}>{a.text}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 2 }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
