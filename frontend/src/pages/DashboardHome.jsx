import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFullName, getLoginEmail } from '../services/authService.js';
import { getMyPatientReports } from '../services/patientReportService.js';
import { FileText, Clock, Calendar, Upload, ArrowRight, Activity } from 'lucide-react';

const TYPE_COLORS = {
  'Blood Test': 'mv-badge-teal',
  'Urine Test': 'mv-badge-teal',
  'Lab Report': 'mv-badge-teal',
  'X-Ray': 'mv-badge-blue',
  'Radiology': 'mv-badge-blue',
  'Radiology Report': 'mv-badge-blue',
  'MRI Scan': 'mv-badge-blue',
  'CT Scan': 'mv-badge-blue',
  'Ultrasound': 'mv-badge-blue',
  'Consultation': 'mv-badge-purple',
  'Imaging': 'mv-badge-amber',
  'ECG / EKG': 'mv-badge-amber',
  'Echocardiogram': 'mv-badge-amber',
  'Prescription': 'mv-badge-green',
  'Discharge Summary': 'mv-badge-green',
  'Pathology Report': 'mv-badge-purple',
  'Vaccination Record': 'mv-badge-green',
  'Allergy Test': 'mv-badge-purple',
  'COVID-19 Test': 'mv-badge-orange',
  'Biopsy Report': 'mv-badge-red',
  'Dental Record': 'mv-badge-blue',
  'Ophthalmology Report': 'mv-badge-blue',
  'Other': 'mv-badge-gray',
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
  const email = getLoginEmail() || '';
  const name = fullName || email.split('@')[0].split(/[._-]+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'Patient';

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getMyPatientReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        // Don't show error toast on dashboard, silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Calculate stats
  const totalReports = reports.length;
  const thisMonthReports = reports.filter(r => {
    const date = new Date(r.reportDate || r.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const lastDate = reports.length > 0 ? formatDate(reports[0]?.reportDate || reports[0]?.createdAt) : '—';
  const recentReports = reports.slice(0, 5);

  return (
    <div className="dash-page">
      {/* Welcome banner */}
      <div className="animate-fade-up dashboard-top-intro" style={{
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
            onClick={() => navigate('/dashboard/upload-report')}
            className="mv-btn mv-btn-primary"
            style={{ marginTop: '1.25rem', gap: 8 }}
          >
            <Upload size={16} /> Upload Your Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid dashboard-top-intro">
        <StatCard
          title="Total Reports"
          value={totalReports}
          sub="All uploaded reports"
          iconCls="teal"
          delay="100ms"
          icon={<FileText size={22} />}
        />
        <StatCard
          title="This Month"
          value={thisMonthReports.length}
          sub="Uploaded this month"
          iconCls="green"
          delay="200ms"
          icon={<Clock size={22} />}
        />
        <StatCard
          title="Last Upload"
          value={lastDate}
          sub="Most recent report"
          iconCls="blue"
          delay="300ms"
          icon={<Calendar size={22} />}
        />
      </div>

      {/* Reports table */}
      <div className="mv-card animate-fade-up" style={{ animationDelay: '400ms' }}>
        <div className="mv-card-header">
          <div>
            <p className="mv-card-title">Your Recent Reports</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--mv-slate)', marginTop: 2 }}>Your latest uploaded medical records</p>
          </div>
          <button onClick={() => navigate('/dashboard/upload-report')} className="mv-btn mv-btn-primary mv-btn-sm">
            <Upload size={14} /> Upload New
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid var(--mv-border)', borderTopColor: 'var(--mv-teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : reports.length === 0 ? (
          <div className="mv-empty">
            <div className="mv-empty-icon"><FileText size={26} /></div>
            <p className="mv-empty-title">No reports yet</p>
            <p className="mv-empty-sub">Start by uploading your first medical report.</p>
          </div>
        ) : (
          <div className="mv-table-wrap">
            <table className="mv-table">
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500, color: 'var(--mv-slate-900)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={15} color="var(--mv-teal)" />
                        </div>
                        {r.reportName}
                      </div>
                    </td>
                    <td>
                      <span className={`mv-badge ${TYPE_COLORS[r.reportType] || 'mv-badge-gray'}`}>
                        {r.reportType}
                      </span>
                    </td>
                    <td style={{ color: 'var(--mv-slate)', fontSize: '0.85rem' }}>{formatDate(r.reportDate || r.createdAt)}</td>
                    <td>
                      <button
                        onClick={() => navigate('/dashboard/reports')}
                        className="mv-btn mv-btn-ghost mv-btn-sm"
                        style={{ gap: 5 }}
                      >
                        View <ArrowRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* View all button */}
        {reports.length > 5 && (
          <div style={{ padding: '0.875rem 1.375rem', borderTop: '1px solid var(--mv-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/dashboard/reports')}
              className="mv-btn mv-btn-ghost mv-btn-sm"
              style={{ gap: 5 }}
            >
              View all {reports.length} reports <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
