import { useState, useRef } from 'react';
import Input from '../components/Input.jsx';
import { Upload, FileText, X, Lock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UploadReport() {
  const [patientName, setPatientName] = useState('');
  const [reportType,  setReportType]  = useState('');
  const [file,        setFile]        = useState(null);
  const [dragover,    setDragover]    = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ok = ['application/pdf','image/png','image/jpeg'].includes(f.type);
    if (!ok) { toast.error('Invalid file type. Please use PDF, PNG or JPG.'); return; }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragover(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) { toast.error('Please enter a patient name.'); return; }
    if (!reportType.trim())  { toast.error('Please select a report type.'); return; }
    if (!file)               { toast.error('Please choose a file to upload.'); return; }

    setSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      toast.success(`Report "${file.name}" uploaded successfully!`);
      setFile(null); setPatientName(''); setReportType('');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="dash-page">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">Upload Report</h1>
        <p className="dash-page-subtitle">Securely upload a patient medical report</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: 780 }}>

        {/* Form card */}
        <div className="mv-card animate-fade-up" style={{ gridColumn: '1 / -1', maxWidth: 620 }}>
          {/* Header strip */}
          <div style={{ background: 'var(--mv-navy)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(13,148,136,0.25)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Upload size={18} color="var(--mv-teal-glow)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9375rem' }}>Upload Medical Report</p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>All transfers are encrypted</p>
              </div>
            </div>
            <span style={{ background: 'rgba(13,148,136,0.18)', color: 'var(--mv-teal-glow)', fontSize: '0.72rem', fontWeight: 600, padding: '4px 10px', borderRadius: 'var(--radius-full)', border: '1px solid rgba(45,212,191,0.2)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Lock size={11} /> Encrypted
            </span>
          </div>

          <div className="mv-card-body">
            <form onSubmit={handleSubmit}>
              <div className="mv-form-row">
                <Input label="Patient Name" name="patientName" value={patientName}
                  onChange={e => setPatientName(e.target.value)} placeholder="e.g. John Smith" />
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="reportType">Report Type</label>
                  <select id="reportType" className="mv-select" value={reportType}
                    onChange={e => setReportType(e.target.value)}>
                    <option value="">Select type…</option>
                    {['Lab Report','Radiology','Prescription','Discharge Summary','Consultation','Imaging','Other'].map(t =>
                      <option key={t}>{t}</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Drop zone */}
              <div className="mv-form-group">
                <label className="mv-label">Report File</label>
                <div
                  className={`mv-dropzone ${dragover ? 'dragover' : ''}`}
                  onDragOver={e => { e.preventDefault(); setDragover(true); }}
                  onDragLeave={() => setDragover(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files?.[0])} />

                  {file ? (
                    <>
                      <div className="mv-dropzone-icon" style={{ background: 'var(--mv-success-bg)', color: 'var(--mv-success)' }}>
                        <FileText size={24} />
                      </div>
                      <p className="mv-dropzone-title" style={{ color: 'var(--mv-success)' }}>{file.name}</p>
                      <p className="mv-dropzone-sub">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button type="button" onClick={e => { e.stopPropagation(); setFile(null); }}
                        className="mv-btn mv-btn-ghost mv-btn-sm" style={{ marginTop: 10, gap: 5 }}>
                        <X size={13} /> Remove
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mv-dropzone-icon"><Upload size={24} /></div>
                      <p className="mv-dropzone-title">Drop your file here, or click to browse</p>
                      <p className="mv-dropzone-sub">PDF, PNG, JPG — max 10 MB</p>
                    </>
                  )}
                </div>
              </div>

              <button type="submit"
                className={`mv-btn mv-btn-primary mv-btn-lg mv-btn-full ${submitting ? 'mv-btn-loading' : ''}`}
                disabled={submitting} style={{ marginTop: '0.5rem' }}>
                {submitting ? <><span className="mv-spinner" /><span>Uploading…</span></> : <><Upload size={16} /> Upload Report</>}
              </button>
            </form>
          </div>
        </div>

        {/* Info tips */}
        <div style={{ gridColumn: '1 / -1', maxWidth: 620 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            {[
              { icon: '🔒', title: 'End-to-end encrypted', desc: 'All files are encrypted before transfer.' },
              { icon: '📋', title: 'Accepted formats', desc: 'PDF, PNG, and JPG/JPEG files up to 10 MB.' },
              { icon: '⚡', title: 'Instant processing', desc: 'Files are indexed and available right away.' },
            ].map(tip => (
              <div key={tip.title} style={{ background: 'var(--mv-white)', border: '1px solid var(--mv-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.125rem', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 6 }}>{tip.icon}</div>
                <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--mv-slate-dark)', marginBottom: 3 }}>{tip.title}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', lineHeight: 1.55 }}>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
