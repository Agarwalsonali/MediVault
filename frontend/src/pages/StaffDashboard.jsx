import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Upload, Search,
  TrendingUp, Clock, CheckCircle, AlertCircle, Loader,
  ArrowRight, Activity
} from 'lucide-react';
import { getAllPatientUsers } from '../services/patientService.js';
import { getAllReports } from '../services/reportService.js';
import { getUser } from '../utils/getUser.js';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients]       = useState([]);
  const [reports, setReports]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [greeting, setGreeting]       = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12)      setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else                setGreeting('Good evening');

    const fetchData = async () => {
      try {
        setLoading(true);
        const [patientData, reportData] = await Promise.all([
          getAllPatientUsers().catch(() => []),
          getAllReports().catch(() => [])
        ]);
        setPatients(patientData || []);
        setReports(reportData || []);
        setError('');
      } catch (err) {
        setError(err?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const user = getUser();
  const staffName = user?.fullName || user?.name || user?.username || 'Staff';

  // Derive quick stats from patient and report data
  const totalPatients  = patients.length;
  const recentPatients = patients.filter(p => {
    const created = new Date(p.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  }).length;

  // Reports Today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const reportsToday = reports.filter(r => {
    const reportDate = new Date(r.createdAt);
    reportDate.setHours(0, 0, 0, 0);
    return reportDate.getTime() === today.getTime();
  }).length;

  // Active Records (patients with reports)
  const patientsWithReports = new Set(reports.map(r => r.patientId?._id)).size;

  const filteredPatients = patients.filter(p =>
    p.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p._id?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="text-sky-600 animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">

      {/* ── Welcome Banner ── */}
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
            <span style={{ fontSize: '0.72rem', color: 'var(--mv-teal-glow)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Staff Dashboard</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem,2.5vw,2rem)', color: 'white', marginBottom: 6 }}>{greeting}, {staffName}</h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', maxWidth: 480, lineHeight: 1.65 }}>
            Manage patient records, upload medical reports, and track daily activities from your staff portal.
          </p>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="text-red-500 flex-none" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="stat-grid">
        <div className="stat-card animate-fade-up" style={{ animationDelay: '0ms' }}>
          <div className="stat-icon teal"><Users size={22} /></div>
          <div className="stat-body">
            <p className="stat-label">Total Patients</p>
            <p className="stat-value">{totalPatients}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 3 }}>Registered patients</p>
          </div>
        </div>
        <div className="stat-card animate-fade-up" style={{ animationDelay: '80ms' }}>
          <div className="stat-icon emerald"><TrendingUp size={22} /></div>
          <div className="stat-body">
            <p className="stat-label">New This Week</p>
            <p className="stat-value">{recentPatients}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 3 }}>Recently registered</p>
          </div>
        </div>
        <div className="stat-card animate-fade-up" style={{ animationDelay: '160ms' }}>
          <div className="stat-icon violet"><FileText size={22} /></div>
          <div className="stat-body">
            <p className="stat-label">Reports Today</p>
            <p className="stat-value">{reportsToday}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 3 }}>{reportsToday > 0 ? `${reportsToday} uploaded` : 'No reports yet'}</p>
          </div>
        </div>
        <div className="stat-card animate-fade-up" style={{ animationDelay: '240ms' }}>
          <div className="stat-icon amber"><Activity size={22} /></div>
          <div className="stat-body">
            <p className="stat-label">Active Records</p>
            <p className="stat-value">{patientsWithReports}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 3 }}>{patientsWithReports} patients</p>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="mv-card animate-fade-up" style={{ animationDelay: '320ms' }}>
        <div className="mv-card-header"><p className="mv-card-title">Quick Actions</p></div>
        <div className="mv-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button onClick={() => navigate('/staff-dashboard/upload')}
            className="mv-btn mv-btn-primary" style={{ height: 'auto', padding: '12px 16px', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Upload Report</span>
              <ArrowRight size={15} style={{ flexShrink: 0 }} />
            </span>
            <span style={{ fontSize: '0.78rem', opacity: 0.72, fontWeight: 400 }}>Add a new lab, X-ray, prescription or any medical report</span>
          </button>
          <button onClick={() => document.getElementById('patient-list')?.scrollIntoView({ behavior: 'smooth' })}
            className="mv-btn mv-btn-outline" style={{ height: 'auto', padding: '12px 16px', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', gap: 2 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>Search Patients</span>
              <ArrowRight size={15} style={{ flexShrink: 0 }} />
            </span>
            <span style={{ fontSize: '0.78rem', opacity: 0.72, fontWeight: 400 }}>Find a patient by name or ID and view their records</span>
          </button>
        </div>
      </div>

      {/* ── Patient List ── */}
      <div id="patient-list" className="mv-card animate-fade-up" style={{ animationDelay: '400ms' }}>
        <div className="mv-card-header">
          <p className="mv-card-title">Patients</p>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            className="mv-input"
            style={{ width: '200px' }}
          />
        </div>
        <div className="mv-card-body">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'var(--mv-slate)' }}>
              {search ? 'No patients match your search.' : 'No patients registered yet.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {filteredPatients.map(patient => (
                <div
                  key={patient._id}
                  onClick={() => navigate(`/patients/${patient._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'background var(--t-base)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--mv-mist)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'var(--mv-teal-pale)', color: 'var(--mv-teal)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.875rem', fontWeight: 600, flexShrink: 0
                    }}>
                      {patient.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mv-slate-900)' }}>{patient.fullName}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)' }}>{patient._id} · {patient.age}y · {patient.gender}</p>
                    </div>
                  </div>
                  <ArrowRight size={16} style={{ color: 'var(--mv-slate)', flexShrink: 0 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="mv-card animate-fade-up" style={{ animationDelay: '480ms' }}>
        <div className="mv-card-header"><p className="mv-card-title">Recent Activity</p></div>
        <div className="mv-card-body">
          {reports.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 0', textAlign: 'center', color: 'var(--mv-slate)' }}>
              <Clock size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.875rem' }}>No activity yet.</p>
              <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Recent uploads will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {reports.slice(0, 5).map((report) => {
                const uploadDate = new Date(report.createdAt);
                const isToday = uploadDate.toDateString() === new Date().toDateString();
                const timeStr = isToday 
                  ? uploadDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                  : uploadDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                
                return (
                  <div key={report._id} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--mv-border)' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: 'var(--radius-sm)',
                      background: 'var(--mv-teal-pale)', color: 'var(--mv-teal)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mv-slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {report.reportName} · {report.reportType}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', marginTop: '0.25rem' }}>
                        {report.patientId?.name} · By {report.uploadedBy?.fullName || 'Staff'}
                      </p>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', flexShrink: 0 }}>{timeStr}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}