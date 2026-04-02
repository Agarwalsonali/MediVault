import { useNavigate } from 'react-router-dom';
import { getFullName, getLoginEmail } from '../services/authService.js';
import { FileText, Clock, Calendar, Upload, ArrowRight, Activity } from 'lucide-react';

const REPORTS = [
  { id: 1, name: 'Blood Test Summary',  type: 'Lab Report',   date: 'Mar 18, 2026', status: 'normal' },
  { id: 2, name: 'Chest X-Ray',         type: 'Radiology',    date: 'Mar 15, 2026', status: 'review' },
  { id: 3, name: 'Cardiology Checkup',  type: 'Consultation', date: 'Mar 10, 2026', status: 'normal' },
  { id: 4, name: 'MRI Brain Scan',      type: 'Imaging',      date: 'Mar 02, 2026', status: 'normal' },
  { id: 5, name: 'Vitamin Profile',     type: 'Lab Report',   date: 'Feb 26, 2026', status: 'normal' },
];

const TYPE_COLORS = {
  'Lab Report':   'mv-badge-teal',
  'Radiology':    'mv-badge-blue',
  'Consultation': 'mv-badge-purple',
  'Imaging':      'mv-badge-amber',
  'Prescription': 'mv-badge-green',
};

const STATUS = {
  normal: { cls: 'mv-badge-green', label: 'Normal' },
  review: { cls: 'mv-badge-amber', label: 'Review' },
  urgent: { cls: 'mv-badge-red',   label: 'Urgent' },
};

function StatCard({ title, value, sub, icon, iconCls, delay }) {
  return (
    <div className="stat-card animate-fade-up" style={{ animationDelay: delay }}>
      <div className={`stat-icon ${iconCls}`}>{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{title}</p>
        <p className="stat-value">{value}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--mv-slate)', marginTop: 3 }}>{sub}</p>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const fullName = (getFullName() || '').trim();
  const email    = getLoginEmail() || '';
  const name     = fullName || email.split('@')[0].split(/[._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Patient';

  const recent   = REPORTS.filter(r => r.date.includes('Mar')).length;
  const lastDate = REPORTS[0]?.date || '—';

  return (
    <div className="dash-page">
      {/* Welcome banner */}
      <div className="animate-fade-up" style={{
        background: 'linear-gradient(120deg, var(--mv-navy) 0%, var(--mv-navy-soft) 60%, #1a3a5c 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2rem 2.25rem',
        marginBottom: '1.75rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'rgba(13,148,136,0.14)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, right: 120, width: 120, height: 120, borderRadius: '50%', background: 'rgba(45,212,191,0.08)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(45,212,191,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(45,212,191,0.04) 1px,transparent 1px)', backgroundSize: '36px 36px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Activity size={14} color="var(--mv-teal-glow)" />
            <span style={{ fontSize: '0.775rem', color: 'var(--mv-teal-glow)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Patient Dashboard</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem,3vw,2.25rem)', color: 'white', lineHeight: 1.2, marginBottom: 8 }}>
            Welcome back, <em style={{ color: 'var(--mv-teal-glow)', fontStyle: 'italic' }}>{name}</em> 👋
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', maxWidth: 520, lineHeight: 1.7 }}>
            Here's your health report overview, latest uploads, and quick actions all in one place.
          </p>
          <button
            onClick={() => navigate('/dashboard/upload')}
            className="mv-btn mv-btn-primary"
            style={{ marginTop: '1.25rem', gap: 8 }}
          >
            <Upload size={16} /> Upload Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard title="Total Reports" value={REPORTS.length} sub="All uploaded reports" iconCls="teal" delay="100ms"
          icon={<FileText size={22} />} />
        <StatCard title="This Month" value={recent} sub="Uploaded in March" iconCls="green" delay="200ms"
          icon={<Clock size={22} />} />
        <StatCard title="Last Upload" value={lastDate} sub="Most recent report" iconCls="blue" delay="300ms"
          icon={<Calendar size={22} />} />
      </div>

      {/* Reports table */}
      <div className="mv-card animate-fade-up" style={{ animationDelay: '400ms' }}>
        <div className="mv-card-header">
          <div>
            <p className="mv-card-title">Your Reports</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--mv-slate)', marginTop: 2 }}>Manage and review your uploaded medical records</p>
          </div>
          <button onClick={() => navigate('/dashboard/upload')} className="mv-btn mv-btn-primary mv-btn-sm">
            <Upload size={14} /> Upload New
          </button>
        </div>

        <div className="mv-table-wrap">
          <table className="mv-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {REPORTS.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500, color: 'var(--mv-slate-900)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={15} color="var(--mv-teal)" />
                      </div>
                      {r.name}
                    </div>
                  </td>
                  <td><span className={`mv-badge ${TYPE_COLORS[r.type] || 'mv-badge-gray'}`}>{r.type}</span></td>
                  <td style={{ color: 'var(--mv-slate)', fontSize: '0.85rem' }}>{r.date}</td>
                  <td><span className={`mv-badge ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span></td>
                  <td>
                    <button className="mv-btn mv-btn-ghost mv-btn-sm" style={{ gap: 5 }}>
                      View <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
