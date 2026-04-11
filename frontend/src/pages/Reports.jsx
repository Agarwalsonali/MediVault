import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FileText, Search, Download, Eye, Filter, Trash2, Share2 } from 'lucide-react';
import { viewReport, downloadReport } from '../services/profileService.js';
import { getMyPatientReports, deleteMyPatientReport } from '../services/patientReportService.js';
import { generateShareLink, copyToClipboard } from '../services/sharedReportService.js';

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

const getReportType = (report) => report.reportType || 'Other';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [downloading, setDownloading] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [sharing, setSharing] = useState(null);

  // Fetch reports on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getMyPatientReports();
        setReports(data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        toast.error(error.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Get unique report types for filter
  const uniqueTypes = ['All', ...new Set(reports.map(r => getReportType(r)))];

  // Filter reports
  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    const rType = getReportType(r);
    return (typeFilter === 'All' || rType === typeFilter) &&
      (!q || r.reportName.toLowerCase().includes(q) || (r.uploadedBy?.fullName || '').toLowerCase().includes(q));
  });

  const getUploaderTag = (report) => report.uploadedByRole || report.uploaded_by;

  // Handle view report
  const handleView = async (reportId) => {
    try {
      setViewing(reportId);
      await viewReport(reportId);
      toast.success('Opening report...');
    } catch (error) {
      console.error('Failed to view report:', error);
      toast.error(error.message || 'Failed to open report');
    } finally {
      setViewing(null);
    }
  };

  // Handle download report
  const handleDownload = async (reportId) => {
    try {
      setDownloading(reportId);
      await downloadReport(reportId);
      toast.success('Download started');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error(error.message || 'Failed to download report');
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (reportId) => {
    const confirmed = window.confirm('Are you sure you want to delete this report? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(reportId);
      await deleteMyPatientReport(reportId);
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success('Report deleted successfully');
    } catch (error) {
      console.error('Failed to delete report:', error);
      toast.error(error.message || 'Failed to delete report');
    } finally {
      setDeleting(null);
    }
  };

  const handleShare = async (reportId) => {
    try {
      setSharing(reportId);
      const data = await generateShareLink(reportId);
      const copied = await copyToClipboard(data.shareLink);
      
      if (copied) {
        toast.success('Share link copied to clipboard!');
      } else {
        toast.info('Share link: ' + data.shareLink);
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      toast.error(error.message || 'Failed to generate share link');
    } finally {
      setSharing(null);
    }
  };

  // Calculate stats
  const totalReports = reports.length;
  const thisMonthCount = reports.filter(r => {
    const date = new Date(r.reportDate || r.createdAt);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="dash-page">
      {/* Header */}
      <div className="reports-top-intro" style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">My Reports</h1>
        <p className="dash-page-subtitle">All your uploaded medical records in one place</p>
      </div>

      {/* Summary badges */}
      <div className="reports-top-intro" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', val: totalReports, cls: 'mv-badge-teal' },
          { label: 'This Month', val: thisMonthCount, cls: 'mv-badge-blue' },
        ].map(b => (
          <div key={b.label} style={{ background: 'var(--mv-white)', border: '1px solid var(--mv-border)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 100, boxShadow: 'var(--shadow-xs)' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{b.label}</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--mv-navy)', lineHeight: 1 }}>{b.val}</span>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      {totalReports > 0 && (
        <div className="mv-card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="mv-search" style={{ flex: 1, minWidth: 200 }}>
              <span className="mv-search-icon"><Search size={15} /></span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search reports or doctors…"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Filter size={15} color="var(--mv-slate)" />
              <select
                className="mv-select"
                style={{ height: 38, width: 'auto', minWidth: 140 }}
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                {uniqueTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Table / Empty State */}
      <div className="mv-card animate-fade-up">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid var(--mv-border)', borderTopColor: 'var(--mv-teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: 'var(--mv-slate)', fontSize: '0.9rem' }}>Loading reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mv-empty">
            <div className="mv-empty-icon"><FileText size={26} /></div>
            <p className="mv-empty-title">No reports found</p>
            <p className="mv-empty-sub">
              {totalReports === 0
                ? "You don't have any reports yet. Upload your first medical report to get started."
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="mv-table-wrap">
            <table className="mv-table">
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Size</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FileText size={16} color="var(--mv-teal)" />
                        </div>
                        <span style={{ fontWeight: 500, color: 'var(--mv-slate-900)', fontSize: '0.875rem' }}>{r.reportName}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`mv-badge ${TYPE_COLORS[getReportType(r)] || 'mv-badge-gray'}`}>
                        {getReportType(r)}
                      </span>
                    </td>
                    <td>
                      {getUploaderTag(r) === 'PATIENT' ? (
                        <span className="mv-badge mv-badge-amber">Self Uploaded</span>
                      ) : (
                        <span className="mv-badge mv-badge-green">Verified</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate-dark)' }}>
                      {r.doctorName || r.uploadedBy?.fullName || 'Staff'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate)' }}>
                      {formatDate(r.reportDate || r.createdAt)}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate)', fontFamily: 'var(--font-mono)' }}>
                      {formatFileSize(r.fileSize)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => handleView(r._id)}
                          disabled={viewing === r._id}
                          className="mv-btn mv-btn-ghost mv-btn-sm"
                          title="View"
                          style={{ padding: '0 10px' }}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDownload(r._id)}
                          disabled={downloading === r._id}
                          className="mv-btn mv-btn-ghost mv-btn-sm"
                          title="Download"
                          style={{ padding: '0 10px' }}
                        >
                          <Download size={14} />
                        </button>
                        <button
                          onClick={() => handleShare(r._id)}
                          disabled={sharing === r._id}
                          className="mv-btn mv-btn-ghost mv-btn-sm"
                          title="Share with Doctor"
                          style={{ padding: '0 10px' }}
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r._id)}
                          disabled={deleting === r._id}
                          className="mv-btn mv-btn-ghost mv-btn-sm"
                          title="Delete"
                          style={{ padding: '0 10px' }}
                        >
                          <Trash2 size={14} />
                        </button>
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
            <p style={{ fontSize: '0.8rem', color: 'var(--mv-slate)' }}>
              Showing {filtered.length} of {totalReports} report{totalReports !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
