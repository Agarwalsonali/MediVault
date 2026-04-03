import { useEffect, useMemo, useState } from 'react';
import { User, CheckCircle, AlertCircle, Loader, Upload, Search, FileText, Calendar, ClipboardList } from 'lucide-react';
import { getPatients, searchPatients } from '../services/patientService.js';
import { uploadReport } from '../services/reportService.js';

const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const REPORT_TYPES  = ['Lab Report', 'Radiology', 'Prescription', 'Discharge Summary', 'Other'];

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="mv-field-error" style={{ marginTop: 5 }}>
      <AlertCircle size={13} style={{ flexShrink: 0 }} /> {message}
    </p>
  );
}

export default function StaffDashboard() {
  const [search,            setSearch]            = useState('');
  const [selectedId,        setSelectedId]        = useState('');
  const [patients,          setPatients]          = useState([]);
  const [filteredPatients,  setFilteredPatients]  = useState([]);
  const [form,              setForm]              = useState({ reportName: '', reportType: '', reportDate: '', notes: '' });
  const [file,              setFile]              = useState(null);
  const [errors,            setErrors]            = useState({});
  const [uploading,         setUploading]         = useState(false);
  const [pageLoading,       setPageLoading]       = useState(true);
  const [statusMsg,         setStatusMsg]         = useState('');
  const [savedReports,      setSavedReports]      = useState([]);
  const [isDragOver,        setIsDragOver]        = useState(false);

  /* Load all patients */
  useEffect(() => {
    (async () => {
      try {
        const data = await getPatients();
        setPatients(data); setFilteredPatients(data);
      } catch (e) {
        setErrors({ general: e.message || 'Failed to load patients.' });
      } finally { setPageLoading(false); }
    })();
  }, []);

  /* Debounced patient search */
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        if (!search.trim()) { setFilteredPatients(patients); return; }
        const res = await searchPatients(search);
        setFilteredPatients(res);
      } catch { setFilteredPatients([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, patients]);

  const selectedPatient = useMemo(
    () => patients.find(p => p._id === selectedId) || null,
    [selectedId, patients]
  );

  const handleField = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: '' }));
    setStatusMsg('');
  };

  const handleFile = f => {
    if (!f) return;
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErrors(p => ({ ...p, file: 'Invalid file type. Use PDF, PNG or JPG.' }));
      return;
    }
    setFile(f); setErrors(p => ({ ...p, file: '' })); setStatusMsg('');
  };

  const validate = () => {
    const e = {};
    if (!selectedId)          e.patient    = 'Please select a patient.';
    if (!form.reportName.trim()) e.reportName = 'Report name is required.';
    if (!form.reportType.trim()) e.reportType = 'Report type is required.';
    if (!form.reportDate)     e.reportDate = 'Report date is required.';
    if (!file)                e.file       = 'Please upload a file.';
    else if (!ALLOWED_TYPES.includes(file.type)) e.file = 'Invalid file type.';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setStatusMsg('');
    const ve = validate();
    if (Object.keys(ve).length) { setErrors(ve); return; }
    setUploading(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append('patientId',  selectedId);
      fd.append('reportName', form.reportName.trim());
      fd.append('reportType', form.reportType);
      fd.append('reportDate', form.reportDate);
      fd.append('notes',      form.notes.trim());
      fd.append('file',       file);
      const report = await uploadReport(fd);
      setSavedReports(p => [report, ...p].slice(0, 5));
      setStatusMsg('Report uploaded successfully.');
      setForm({ reportName: '', reportType: '', reportDate: '', notes: '' });
      setFile(null);
    } catch (e) {
      setErrors({ submit: e.message || 'Upload failed.' });
    } finally { setUploading(false); }
  };

  if (pageLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ textAlign: 'center' }}>
        <Loader size={36} color="var(--mv-teal)" className="animate-spin" style={{ margin: '0 auto 12px' }} />
        <p style={{ color: 'var(--mv-slate)', fontSize: '0.9rem' }}>Loading patients…</p>
      </div>
    </div>
  );

  return (
    <div className="dash-page">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">Upload Medical Reports</h1>
        <p className="dash-page-subtitle">Search for a patient and securely upload their medical records</p>
      </div>

      {/* General error */}
      {errors.general && (
        <div className="mv-alert mv-alert-error animate-fade-in" style={{ marginBottom: '1.25rem' }}>
          <AlertCircle size={15} /><span>{errors.general}</span>
        </div>
      )}

      {/* Two-panel grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,340px) 1fr', gap: '1.25rem', alignItems: 'start' }}>

        {/* ── Left: Patient Search ── */}
        <div className="mv-card animate-fade-up">
          <div className="mv-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 32, height: 32, background: 'var(--mv-teal-pale)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Search size={16} color="var(--mv-teal)" />
              </div>
              <p className="mv-card-title">Find Patient</p>
            </div>
          </div>
          <div style={{ padding: '1rem 1.25rem 0.5rem' }}>
            <div className="mv-search" style={{ maxWidth: '100%' }}>
              <span className="mv-search-icon"><Search size={14} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or ID…" style={{ width: '100%', borderRadius: 'var(--radius)' }} />
            </div>
          </div>

          {/* Patient list */}
          <div style={{ maxHeight: 380, overflowY: 'auto', padding: '0.5rem 1rem 1rem' }}>
            {filteredPatients.length === 0 ? (
              <div className="mv-empty" style={{ padding: '2rem 1rem' }}>
                <div className="mv-empty-icon"><User size={22} /></div>
                <p className="mv-empty-title" style={{ fontSize: '0.85rem' }}>
                  {search.trim() ? 'No patients found' : 'No patients available'}
                </p>
              </div>
            ) : filteredPatients.map(p => {
              const sel = selectedId === p._id;
              const ini = (p.name || '?').split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);
              return (
                <button key={p._id} type="button"
                  onClick={() => { setSelectedId(p._id); setErrors(e => ({ ...e, patient: '' })); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 'var(--radius)',
                    marginBottom: 4, border: `1.5px solid ${sel ? 'var(--mv-teal)' : 'var(--mv-border)'}`,
                    background: sel ? 'var(--mv-teal-50)' : 'var(--mv-white)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all var(--t-base)',
                    boxShadow: sel ? 'var(--shadow-teal)' : 'none',
                  }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: sel ? 'var(--mv-teal)' : 'var(--mv-mist)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 600, color: sel ? 'white' : 'var(--mv-slate-dark)', flexShrink: 0, transition: 'all var(--t-base)' }}>{ini}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: sel ? 'var(--mv-teal)' : 'var(--mv-slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--mv-slate)', marginTop: 2 }}>{p.patientId} · {p.age}y · {p.gender}</p>
                  </div>
                  {sel && <CheckCircle size={17} color="var(--mv-teal)" style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>
          {errors.patient && <div style={{ padding: '0 1.25rem 1rem' }}><FieldError message={errors.patient} /></div>}
        </div>

        {/* ── Right: Upload form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>

          {/* Selected patient badge */}
          {selectedPatient && (
            <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0.875rem 1.25rem', background: 'var(--mv-teal-50)', border: '1.5px solid var(--mv-teal-pale)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-teal)' }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--mv-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <User size={20} color="white" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--mv-teal)' }}>{selectedPatient.name}</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 2 }}>{selectedPatient.patientId}</p>
              </div>
              <span className="mv-badge mv-badge-teal" style={{ marginLeft: 'auto' }}>Selected</span>
            </div>
          )}

          {/* Upload form card */}
          <div className="mv-card animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="mv-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <div style={{ width: 32, height: 32, background: '#dbeafe', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Upload size={16} color="#2563eb" />
                </div>
                <p className="mv-card-title">Report Details</p>
              </div>
              {!selectedPatient && (
                <span className="mv-badge mv-badge-amber">Select a patient first</span>
              )}
            </div>
            <div className="mv-card-body">
              <form onSubmit={handleSubmit}>
                <div className="mv-form-row">
                  {/* Report name */}
                  <div className="mv-form-group">
                    <label className="mv-label" htmlFor="reportName">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={13} /> Report Name</span>
                    </label>
                    <input id="reportName" name="reportName" type="text" value={form.reportName}
                      onChange={handleField} placeholder="e.g. Blood Test Summary"
                      disabled={!selectedPatient}
                      className={`mv-input${errors.reportName ? ' error' : ''}`} />
                    <FieldError message={errors.reportName} />
                  </div>

                  {/* Report type */}
                  <div className="mv-form-group">
                    <label className="mv-label" htmlFor="reportType">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ClipboardList size={13} /> Report Type</span>
                    </label>
                    <select id="reportType" name="reportType" value={form.reportType}
                      onChange={handleField} disabled={!selectedPatient}
                      className={`mv-select${errors.reportType ? ' error' : ''}`}>
                      <option value="">Select type…</option>
                      {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                    <FieldError message={errors.reportType} />
                  </div>

                  {/* Report date */}
                  <div className="mv-form-group">
                    <label className="mv-label" htmlFor="reportDate">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={13} /> Report Date</span>
                    </label>
                    <input id="reportDate" name="reportDate" type="date" value={form.reportDate}
                      onChange={handleField} disabled={!selectedPatient}
                      className={`mv-input${errors.reportDate ? ' error' : ''}`} />
                    <FieldError message={errors.reportDate} />
                  </div>

                  {/* File */}
                  <div className="mv-form-group">
                    <label className="mv-label" htmlFor="file">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Upload size={13} /> File Upload</span>
                    </label>
                    <div
                      onDragOver={e => { e.preventDefault(); if (selectedPatient) setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={e => { e.preventDefault(); setIsDragOver(false); if (selectedPatient) handleFile(e.dataTransfer.files?.[0]); }}
                      onClick={() => selectedPatient && document.getElementById('file').click()}
                      style={{
                        border: `2px dashed ${isDragOver ? 'var(--mv-teal)' : errors.file ? 'var(--mv-danger)' : file ? 'var(--mv-teal)' : 'var(--mv-border-mid)'}`,
                        borderRadius: 'var(--radius)',
                        padding: '1rem',
                        textAlign: 'center',
                        cursor: selectedPatient ? 'pointer' : 'not-allowed',
                        background: isDragOver ? 'var(--mv-teal-50)' : file ? 'var(--mv-teal-50)' : 'var(--mv-off-white)',
                        transition: 'all var(--t-base)',
                        opacity: selectedPatient ? 1 : 0.55,
                      }}>
                      <input id="file" type="file" accept=".pdf,.png,.jpg,.jpeg"
                        style={{ display: 'none' }}
                        onChange={e => handleFile(e.target.files?.[0])}
                        disabled={!selectedPatient} />
                      {file ? (
                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--mv-teal)' }}>
                          ✓ {file.name} <span style={{ color: 'var(--mv-slate)', fontWeight: 400 }}>({(file.size/1024/1024).toFixed(2)} MB)</span>
                        </p>
                      ) : (
                        <p style={{ fontSize: '0.82rem', color: 'var(--mv-slate)' }}>Drop file here or click to browse · PDF, PNG, JPG</p>
                      )}
                    </div>
                    <FieldError message={errors.file} />
                  </div>
                </div>

                {/* Notes */}
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="notes">Notes <span style={{ color: 'var(--mv-slate)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea id="notes" name="notes" value={form.notes} onChange={handleField}
                    disabled={!selectedPatient} rows={3}
                    placeholder="Any additional notes about this report…"
                    className="mv-textarea" />
                </div>

                {/* Submit + status */}
                {errors.submit && (
                  <div className="mv-alert mv-alert-error animate-fade-in" style={{ marginBottom: '0.875rem' }}>
                    <AlertCircle size={15} /><span>{errors.submit}</span>
                  </div>
                )}
                {statusMsg && (
                  <div className="mv-alert mv-alert-success animate-fade-in" style={{ marginBottom: '0.875rem' }}>
                    <CheckCircle size={15} /><span>{statusMsg}</span>
                  </div>
                )}

                <button type="submit"
                  className={`mv-btn mv-btn-primary mv-btn-full mv-btn-lg ${uploading ? 'mv-btn-loading' : ''}`}
                  disabled={uploading || !selectedPatient}>
                  {uploading
                    ? <><span className="mv-spinner" /><span>Uploading…</span></>
                    : <><Upload size={17} /> Upload Report</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Recent uploads table */}
      {savedReports.length > 0 && (
        <div className="mv-card animate-fade-up" style={{ marginTop: '1.25rem' }}>
          <div className="mv-card-header">
            <p className="mv-card-title">Recent Uploads</p>
            <span className="mv-badge mv-badge-green">{savedReports.length} new</span>
          </div>
          <div className="mv-table-wrap">
            <table className="mv-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Report</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Uploaded By</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.patientId?.name}</td>
                    <td>{r.reportName}</td>
                    <td><span className="mv-badge mv-badge-teal">{r.reportType}</span></td>
                    <td style={{ color: 'var(--mv-slate)', fontSize: '0.85rem' }}>{new Date(r.reportDate).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--mv-slate)', fontSize: '0.85rem' }}>{r.uploadedBy?.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile responsive: stack columns on small screens */}
      <style>{`
        @media (max-width: 768px) {
          .dash-page > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}