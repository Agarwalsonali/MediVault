import { useState } from 'react';
import { FileText, Search, Download, Eye, Filter, ArrowRight } from 'lucide-react';

const SAMPLE_REPORTS = [
  { id: 1, name: 'Blood Test Summary',  type: 'Lab Report',      date: 'Mar 18, 2026', doctor: 'Dr. Sharma',   size: '1.2 MB', status: 'normal' },
  { id: 2, name: 'Chest X-Ray',         type: 'Radiology',       date: 'Mar 15, 2026', doctor: 'Dr. Patel',    size: '4.8 MB', status: 'review' },
  { id: 3, name: 'Cardiology Checkup',  type: 'Consultation',    date: 'Mar 10, 2026', doctor: 'Dr. Mehta',    size: '0.8 MB', status: 'normal' },
  { id: 4, name: 'MRI Brain Scan',      type: 'Imaging',         date: 'Mar 02, 2026', doctor: 'Dr. Joshi',    size: '12.3 MB', status: 'normal' },
  { id: 5, name: 'Vitamin Profile',     type: 'Lab Report',      date: 'Feb 26, 2026', doctor: 'Dr. Singh',    size: '0.5 MB', status: 'normal' },
  { id: 6, name: 'Prescription – Feb',  type: 'Prescription',    date: 'Feb 14, 2026', doctor: 'Dr. Sharma',   size: '0.2 MB', status: 'normal' },
];

const TYPE_COLORS = { 'Lab Report': 'mv-badge-teal', 'Radiology': 'mv-badge-blue', 'Consultation': 'mv-badge-purple', 'Imaging': 'mv-badge-amber', 'Prescription': 'mv-badge-green' };
const STATUS_MAP = { normal: { cls: 'mv-badge-green', label: 'Normal' }, review: { cls: 'mv-badge-amber', label: 'Review' } };
const ALL_TYPES = ['All', ...new Set(SAMPLE_REPORTS.map(r => r.type))];

export default function Reports() {
  const [search, setSearch]   = useState('');
  const [typeFilter, setType] = useState('All');

  const filtered = SAMPLE_REPORTS.filter(r => {
    const q = search.toLowerCase();
    return (typeFilter === 'All' || r.type === typeFilter) &&
      (!q || r.name.toLowerCase().includes(q) || r.doctor.toLowerCase().includes(q));
  });

  return (
    <div className="dash-page">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">My Reports</h1>
        <p className="dash-page-subtitle">All your uploaded medical records in one place</p>
      </div>

      {/* Summary badges */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: SAMPLE_REPORTS.length, cls: 'mv-badge-teal' },
          { label: 'This Month', val: 4, cls: 'mv-badge-blue' },
          { label: 'Lab Reports', val: SAMPLE_REPORTS.filter(r=>r.type==='Lab Report').length, cls: 'mv-badge-green' },
        ].map(b => (
          <div key={b.label} style={{ background: 'var(--mv-white)', border: '1px solid var(--mv-border)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100, boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{b.label}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-navy)', lineHeight: 1 }}>{b.val}</span>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="mv-card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="mv-search" style={{ flex: 1, minWidth: 200 }}>
            <span className="mv-search-icon"><Search size={15} /></span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search reports or doctors…" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--mv-slate)" />
            <select className="mv-select" style={{ height: 38, width: 'auto', minWidth: 140 }}
              value={typeFilter} onChange={e => setType(e.target.value)}>
              {ALL_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mv-card animate-fade-up">
        {filtered.length === 0 ? (
          <div className="mv-empty">
            <div className="mv-empty-icon"><FileText size={26} /></div>
            <p className="mv-empty-title">No reports found</p>
            <p className="mv-empty-sub">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="mv-table-wrap">
            <table className="mv-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Type</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={16} color="var(--mv-teal)" />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--mv-slate-900)', fontSize: '0.875rem' }}>{r.name}</span>
                      </div>
                    </td>
                    <td><span className={`mv-badge ${TYPE_COLORS[r.type] || 'mv-badge-gray'}`}>{r.type}</span></td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate-dark)' }}>{r.doctor}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate)' }}>{r.date}</td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate)', fontFamily: 'var(--font-mono)' }}>{r.size}</td>
                    <td><span className={`mv-badge ${STATUS_MAP[r.status].cls}`}>{STATUS_MAP[r.status].label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="mv-btn mv-btn-ghost mv-btn-sm" title="View" style={{ padding: '0 10px' }}><Eye size={14} /></button>
                        <button className="mv-btn mv-btn-ghost mv-btn-sm" title="Download" style={{ padding: '0 10px' }}><Download size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ padding: '0.875rem 1.375rem', borderTop: '1px solid var(--mv-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--mv-slate)' }}>Showing {filtered.length} of {SAMPLE_REPORTS.length} reports</p>
            <button className="mv-btn mv-btn-ghost mv-btn-sm" style={{ gap: 5 }}>View all <ArrowRight size={13} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
