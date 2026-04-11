import { useState, useEffect, useRef } from 'react';
import { Search, X, CheckCircle, AlertCircle, Loader, User } from 'lucide-react';
import { getAllPatientUsers } from '../services/patientService.js';


const REPORT_TYPES = [
  'Blood Test', 'Urine Test', 'X-Ray', 'MRI Scan', 'CT Scan',
  'Ultrasound', 'ECG / EKG', 'Echocardiogram', 'Prescription',
  'Discharge Summary', 'Pathology Report', 'Radiology Report',
  'Vaccination Record', 'Allergy Test', 'COVID-19 Test',
  'Biopsy Report', 'Dental Record', 'Ophthalmology Report', 'Other',
];

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.webp,.tiff,.tif,.dcm,.doc,.docx';

export default function UploadReport() {
  // Patient search state
  const [allPatients, setAllPatients]       = useState([]);
  const [searchText, setSearchText]         = useState('');
  const [showDropdown, setShowDropdown]     = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsLoadError, setPatientsLoadError] = useState('');
  const searchRef = useRef(null);

  // Form state
  const [reportName, setReportName]   = useState('');
  const [reportType, setReportType]   = useState('');
  const [reportDate, setReportDate]   = useState('');
  const [doctorName, setDoctorName]   = useState('');
  const [notes, setNotes]             = useState('');
  const [file, setFile]               = useState(null);

  // UI state
  const [submitting, setSubmitting]   = useState(false);
  const [progress, setProgress]       = useState(0);
  const [message, setMessage]         = useState({ text: '', ok: true });
  const [errors, setErrors]           = useState({});

  // Load patients once
  useEffect(() => {
    setPatientsLoading(true);
    getAllPatientUsers()
      .then(data => {
        setAllPatients(data || []);
        setPatientsLoadError('');
      })
      .catch((err) => {
        setAllPatients([]);
        setPatientsLoadError(err?.message || 'Failed to load patients');
      })
      .finally(() => setPatientsLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Filter patients by typed text
  const filtered = searchText.trim().length === 0
    ? allPatients
    : allPatients.filter(p =>
        p.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        p._id?.toLowerCase().includes(searchText.toLowerCase())
      );

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearchText(patient.fullName);
    setShowDropdown(false);
    setErrors(prev => ({ ...prev, patient: '' }));
  };

  const clearPatient = () => {
    setSelectedPatient(null);
    setSearchText('');
    setShowDropdown(false);
  };

  const validate = () => {
    const e = {};
    if (!selectedPatient)      e.patient    = 'Please select a patient.';
    if (!reportName.trim())    e.reportName = 'Report name is required.';
    if (!reportType)           e.reportType = 'Please select a report type.';
    if (!reportDate)           e.reportDate = 'Please select a date.';
    if (!file)                 e.file       = 'Please attach a file.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', ok: true });

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    const formData = new FormData();
    formData.append('patientId',  selectedPatient._id);
    formData.append('reportName', reportName.trim());
    formData.append('reportType', reportType);
    formData.append('reportDate', reportDate);
    formData.append('doctorName', doctorName.trim());
    formData.append('notes',      notes.trim());
    formData.append('file',       file);

    setSubmitting(true);
    setProgress(10);

    try {
      const token = localStorage.getItem('mrms_jwt');
      const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/+$/, '') + '/reports';

      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', apiUrl);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable)
            setProgress(Math.round((ev.loaded / ev.total) * 90));
        };

        xhr.onload = () => {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status === 201) resolve(data);
          else reject(new Error(data.message || 'Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      setProgress(100);
      setMessage({ text: `✓ Report uploaded successfully for ${selectedPatient.fullName}!`, ok: true });

      // Reset
      clearPatient();
      setReportName(''); setReportType(''); setReportDate('');
      setDoctorName(''); setNotes(''); setFile(null);
      document.getElementById('report-file').value = '';

    } catch (err) {
      setMessage({ text: err.message, ok: false });
    } finally {
      setSubmitting(false);
      setTimeout(() => setProgress(0), 1500);
    }
  };

  const fmtSize = (b) => !b ? '' : b < 1048576
    ? `${(b / 1024).toFixed(1)} KB`
    : `${(b / 1048576).toFixed(1)} MB`;

  return (
    <div className="dash-page">
      <div className="w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 lg:p-8 shadow-sm">

      {/* Desktop intro */}
      <div className="hidden lg:flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Medical Report</h1>
          <p className="mt-1 text-sm text-slate-500">Supports all formats — lab, X-ray, prescription, DICOM & more.</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
          🔒 Secure Cloud Storage
        </span>
      </div>

      <form className="grid gap-4 sm:gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>

        {/* ── Patient Search Combobox ── */}
        <div className="sm:col-span-2" ref={searchRef}>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Patient <span className="text-rose-500">*</span>
          </label>

          {/* Selected patient badge */}
          {selectedPatient ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold flex-none">
                {selectedPatient.fullName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{selectedPatient.fullName}</p>
                <p className="text-xs text-slate-500">{selectedPatient.email} · {selectedPatient.age}y · {selectedPatient.gender}</p>
              </div>
              <button type="button" onClick={clearPatient} className="ml-auto text-slate-400 hover:text-slate-600 shrink-0">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Search input */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchText}
                  onChange={e => { setSearchText(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Type name or patient ID to search…"
                  className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Dropdown list */}
              {showDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-52 overflow-y-auto">
                  {patientsLoading ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">Loading patients…</div>
                  ) : patientsLoadError ? (
                    <div className="px-4 py-6 text-center text-sm text-rose-500">{patientsLoadError}</div>
                  ) : filtered.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-400">
                      No patients found
                    </div>
                  ) : (
                    filtered.map(p => (
                      <button
                        key={p._id}
                        type="button"
                        onMouseDown={() => selectPatient(p)}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-none"
                      >
                        <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold flex-none">
                          {p.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{p.fullName}</p>
                          <p className="text-xs text-slate-400">{p.email} · {p.age}y · {p.gender}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {errors.patient && <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1"><AlertCircle size={12}/> {errors.patient}</p>}
        </div>

        {/* Report Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Report Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={reportName}
            onChange={e => { setReportName(e.target.value); setErrors(p => ({...p, reportName: ''})); }}
            placeholder="e.g., CBC Blood Panel – Jan 2025"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.reportName && <p className="mt-1 text-xs text-rose-600">{errors.reportName}</p>}
        </div>

        {/* Report Type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Report Type <span className="text-rose-500">*</span>
          </label>
          <select
            value={reportType}
            onChange={e => { setReportType(e.target.value); setErrors(p => ({...p, reportType: ''})); }}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">— Select type —</option>
            {REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.reportType && <p className="mt-1 text-xs text-rose-600">{errors.reportType}</p>}
        </div>

        {/* Report Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Report Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={reportDate}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => { setReportDate(e.target.value); setErrors(p => ({...p, reportDate: ''})); }}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {errors.reportDate && <p className="mt-1 text-xs text-rose-600">{errors.reportDate}</p>}
        </div>

        {/* Doctor / Lab Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Doctor / Lab Name</label>
          <input
            type="text"
            value={doctorName}
            onChange={e => setDoctorName(e.target.value)}
            placeholder="e.g., Dr. Sharma / PathCare Labs"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Notes <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Any observations or additional context…"
            className="mv-textarea"
          />
        </div>

        {/* File Upload */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Report File <span className="text-rose-500">*</span>
          </label>
          <input
            id="report-file"
            type="file"
            accept={ACCEPTED}
            onChange={e => { setFile(e.target.files?.[0] ?? null); setErrors(p => ({...p, file: ''})); }}
            className="w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <p className="mt-1 text-xs text-slate-400">PDF, JPG, PNG, WEBP, TIFF, DICOM, DOC/DOCX · Max 25 MB</p>
          {errors.file && <p className="mt-1 text-xs text-rose-600">{errors.file}</p>}

          {file && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-600">
              <span className="font-medium truncate">{file.name}</span>
              <span className="ml-auto text-slate-400 shrink-0">{fmtSize(file.size)}</span>
            </div>
          )}
        </div>

        {/* Progress */}
        {progress > 0 && (
          <div className="sm:col-span-2">
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">
              {progress < 100 ? `Uploading… ${progress}%` : 'Processing…'}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting && <Loader size={15} className="animate-spin" />}
            {submitting ? 'Uploading to Cloud…' : 'Upload Report'}
          </button>

          {message.text && (
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm flex-1 ${
              message.ok
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}>
              {message.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
              {message.text}
            </div>
          )}
        </div>
      </form>
      </div>
    </div>
  );
}