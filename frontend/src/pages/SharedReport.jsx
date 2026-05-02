import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Download, Eye, AlertCircle, Loader, ArrowLeft } from 'lucide-react';
import { getSharedReport } from '../services/sharedReportService.js';
import { toast } from 'react-toastify';

export default function SharedReport() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [viewing, setViewing] = useState(false);

  // Fetch shared report on mount
  useEffect(() => {
    const fetchSharedReport = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getSharedReport(token);
        console.log('Shared report data:', data); // Debug log
        setReport(data.report);
      } catch (err) {
        const errorMsg = err.message || 'Failed to access report';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSharedReport();
    }
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleView = () => {
    if (token) {
      setViewing(true);
      // Use the decryption endpoint to view the file
      const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
      const API_BASE_URL = RAW_API_URL || '/api';
      const viewUrl = `${API_BASE_URL}/reports/shared/${token}/download`;
      window.open(viewUrl, '_blank');
      setTimeout(() => setViewing(false), 1000);
    }
  };

  const handleDownload = async () => {
    if (token && report?.fileName) {
      try {
        setDownloading(true);
        
        const RAW_API_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
        const API_BASE_URL = RAW_API_URL || '/api';
        
        // Fetch the decrypted file from the backend
        const response = await fetch(`${API_BASE_URL}/reports/shared/${token}/download`);
        
        if (!response.ok) {
          throw new Error('Failed to download report');
        }
        
        const blob = await response.blob();
        
        // Create blob URL and trigger download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = report.fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          setDownloading(false);
        }, 100);
        
        toast.success('Download started');
      } catch (error) {
        console.error('Download error:', error);
        toast.error('Failed to download report');
        setDownloading(false);
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--mv-white)',
        padding: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-block', 
            width: 40, 
            height: 40, 
            border: '4px solid var(--mv-border)', 
            borderTopColor: 'var(--mv-teal)', 
            borderRadius: '50%', 
            animation: 'spin 0.8s linear infinite' 
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--mv-slate)', fontSize: '0.9rem' }}>
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--mv-white)',
        padding: '1rem'
      }}>
        <div style={{ 
          maxWidth: 400, 
          textAlign: 'center',
          background: 'var(--mv-off-white)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--mv-border)'
        }}>
          <AlertCircle size={48} style={{ color: 'var(--mv-danger)', margin: '0 auto 1rem' }} />
          <h2 style={{ color: 'var(--mv-slate-900)', marginBottom: '0.5rem' }}>
            {error === 'Link expired' ? 'Link Expired' : 'Invalid Link'}
          </h2>
          <p style={{ color: 'var(--mv-slate)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            {error === 'Link expired' 
              ? 'The share link has expired. Please request a new one from the report owner.'
              : 'The share link is invalid or no longer available.'}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'var(--mv-teal)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Report display
  if (report) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--mv-off-white)',
        padding: '1rem'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--mv-teal)',
                fontWeight: 500,
                marginBottom: '1rem'
              }}
            >
              <ArrowLeft size={16} />
              Back to Home
            </button>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: 'var(--mv-slate-900)',
              marginBottom: '0.25rem'
            }}>
              Shared Medical Report
            </h1>
            <p style={{ color: 'var(--mv-slate)', fontSize: '0.9rem' }}>
              This link is valid for 30 minutes
            </p>
          </div>

          {/* Main card */}
          <div style={{
            background: 'var(--mv-white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--mv-border)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* Report header section */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius)',
                background: 'var(--mv-teal-pale)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <FileText size={28} color='var(--mv-teal)' />
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 600, 
                  color: 'var(--mv-slate-900)',
                  marginBottom: '0.25rem'
                }}>
                  {report.reportName}
                </h2>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--mv-teal-pale)',
                  color: 'var(--mv-teal)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginTop: '0.5rem'
                }}>
                  {report.reportType}
                </span>
              </div>
            </div>

            {/* Details grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
              paddingBottom: '1.5rem',
              borderBottom: '1px solid var(--mv-border)'
            }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Report Date
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--mv-slate-900)', fontWeight: 500 }}>
                  {formatDate(report.reportDate)}
                </p>
              </div>

              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
                  File Size
                </p>
                <p style={{ fontSize: '0.9rem', color: 'var(--mv-slate-900)', fontWeight: 500 }}>
                  {formatFileSize(report.fileSize)}
                </p>
              </div>

              {report.doctorName && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Doctor
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--mv-slate-900)', fontWeight: 500 }}>
                    {report.doctorName}
                  </p>
                </div>
              )}

              {report.patientId && (
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Patient
                  </p>
                  <p style={{ fontSize: '0.9rem', color: 'var(--mv-slate-900)', fontWeight: 500 }}>
                    {typeof report.patientId === 'object' && report.patientId?.name 
                      ? report.patientId.name 
                      : typeof report.patientId === 'string'
                      ? report.patientId
                      : '—'}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleView}
                disabled={viewing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--mv-teal)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius)',
                  cursor: viewing ? 'default' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  opacity: viewing ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {viewing ? <Loader size={16} className='animate-spin' /> : <Eye size={16} />}
                View Report
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  background: downloading ? 'var(--mv-teal)' : 'var(--mv-off-white)',
                  color: downloading ? 'white' : 'var(--mv-teal)',
                  border: downloading ? 'none' : '1px solid var(--mv-border)',
                  borderRadius: 'var(--radius)',
                  cursor: downloading ? 'default' : 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  opacity: downloading ? 0.7 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {downloading ? <Loader size={16} className='animate-spin' /> : <Download size={16} />}
                Download Report
              </button>
            </div>

            {/* Security notice */}
            <div style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1rem',
              background: 'var(--mv-info-bg)',
              border: '1px solid var(--mv-info)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ color: 'var(--mv-info)', marginTop: '0.1rem', flexShrink: 0 }} />
              <p style={{ fontSize: '0.8rem', color: 'var(--mv-info)', lineHeight: 1.5 }}>
                This is a secure, temporary link. It will expire after 30 minutes. Do not share this link with others.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
