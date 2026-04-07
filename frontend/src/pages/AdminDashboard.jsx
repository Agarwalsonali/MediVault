import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Users, UserCheck, Shield, ArrowRight, Activity, TrendingUp, Loader, AlertCircle } from 'lucide-react';
import { getDashboardStats } from '../services/adminService.js';

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
  const [stats, setStats] = useState({
    totalStaff: 0,
    newStaffThisMonth: 0,
    totalPatients: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats');
        // Keep fallback values if API fails
        setStats({
          totalStaff: 24,
          newStaffThisMonth: 6,
          totalPatients: 142,
          recentActivity: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const dynamicStats = [
    { title: 'Total Staff',     value: stats.totalStaff.toString(), sub: 'Active Nurse + Staff accounts', icon: <Users size={22} />,     cls: 'teal'   },
    { title: 'New This Month',  value: stats.newStaffThisMonth.toString(),  sub: 'Recently onboarded',            icon: <TrendingUp size={22} />, cls: 'green'  },
    { title: 'System Status',   value: 'Secure', sub: 'Role-based access is active', icon: <Shield size={22} />,  cls: 'blue'   },
    { title: 'Active Patients', value: stats.totalPatients.toString(), sub: 'Registered patients',          icon: <UserCheck size={22} />, cls: 'purple' },
  ];

  return (
    <div className="dash-page">
      {/* Error display */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-4">
          <AlertCircle size={16} className="text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
        {dynamicStats.map((s, i) => (
          <div key={s.title} className="stat-card animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
            <div className="stat-body">
              <p className="stat-label">{s.title}</p>
              <p className="stat-value">{loading && i < 3 ? <Loader size={20} className="animate-spin" /> : s.value}</p>
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
              { label: 'Activity Log',           sub: 'View all system activities',         path: '/activity-log', cls: 'mv-btn-outline' },
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

        {/* Activity Summary Card */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '400ms' }}>
          <div className="mv-card-header"><p className="mv-card-title">Activity Summary</p></div>
          <div className="mv-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.recentActivity && stats.recentActivity.length > 0 ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--mv-border)' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--mv-slate)' }}>Recent Events</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--mv-teal)' }}>{stats.recentActivity.length}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', lineHeight: 1.6, margin: '0' }}>
                  Latest system activities recorded in the past 24 hours. View the complete activity log for more details.
                </p>
              </>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--mv-slate)', textAlign: 'center', margin: '12px 0' }}>No recent activity</p>
            )}
            
            <button
              onClick={() => navigate('/activity-log')}
              className="mv-btn mv-btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                height: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: 'auto'
              }}
            >
              View All Activities
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
