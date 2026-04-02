import { useEffect, useMemo, useState } from 'react';
import { User, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { getPatients, searchPatients } from '../services/patientService.js';
import { uploadReport } from '../services/reportService.js';

const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];

function FieldError({ message }) {
  if (!message) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-red-600">
      <AlertCircle size={14} />
      {message}
    </div>
  );
}

export default function StaffDashboard() {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [form, setForm] = useState({
    reportName: '',
    reportType: '',
    reportDate: '',
    notes: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [savedReports, setSavedReports] = useState([]);

  // Fetch all patients on mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        const data = await getPatients();
        setPatients(data);
        setFilteredPatients(data);
      } catch (err) {
        setErrors({ general: err.message || 'Failed to load patients' });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  // Search patients
  useEffect(() => {
    const handleSearch = async () => {
      try {
        if (search.trim().length === 0) {
          setFilteredPatients(patients);
        } else {
          const results = await searchPatients(search);
          setFilteredPatients(results);
        }
      } catch (err) {
        console.error('Search error:', err);
        setFilteredPatients([]);
      }
    };

    const timer = setTimeout(handleSearch, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, patients]);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient._id === selectedPatientId) || null,
    [selectedPatientId, patients],
  );

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setStatusMessage('');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setErrors((prev) => ({ ...prev, file: '' }));
    setStatusMessage('');
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!selectedPatientId) nextErrors.patient = 'Please select a patient.';
    if (!form.reportName.trim()) nextErrors.reportName = 'Report name is required.';
    if (!form.reportType.trim()) nextErrors.reportType = 'Report type is required.';
    if (!form.reportDate) nextErrors.reportDate = 'Report date is required.';
    if (!file) {
      nextErrors.file = 'Please upload a file (PDF or image).';
    } else if (!allowedFileTypes.includes(file.type)) {
      nextErrors.file = 'Invalid file type. Use PDF, PNG, or JPG.';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setUploading(true);
    setErrors({});
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('patientId', selectedPatientId);
      formData.append('reportName', form.reportName.trim());
      formData.append('reportType', form.reportType);
      formData.append('reportDate', form.reportDate);
      formData.append('notes', form.notes.trim());
      formData.append('file', file);

      // Upload report
      const report = await uploadReport(formData);

      // Add to recent reports
      setSavedReports((prev) => [report, ...prev].slice(0, 5));
      setStatusMessage('✓ Report uploaded successfully.');

      // Reset form
      setForm({ reportName: '', reportType: '', reportDate: '', notes: '' });
      setFile(null);
    } catch (err) {
      setErrors({ submit: err.message || 'Failed to upload report' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-3">
          <Loader size={32} className="text-sky-600 animate-spin" />
          <p className="text-slate-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-linear-to-br from-sky-50 to-blue-50 rounded-2xl p-6 border border-sky-100/50">
        <h1 className="text-3xl font-bold text-slate-900">Upload Medical Reports</h1>
        <p className="mt-2 text-slate-600">Search for a patient and upload their medical records securely.</p>
      </div>

      {/* General Error */}
      {errors.general && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
          <AlertCircle size={16} className="text-red-600 flex-none" />
          <p className="text-sm font-medium text-red-700">{errors.general}</p>
        </div>
      )}

      {/* Main Grid: Patient Search + Upload Form */}
      <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
        {/* Left Panel: Patient Search */}
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-5 border border-slate-100/50 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Find Patient</h2>
            <div className="mt-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 placeholder-slate-400 transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Patient List */}
            <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
              {filteredPatients.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3.5 py-8 text-center">
                  <p className="text-sm text-slate-500">
                    {search.trim() ? 'No patients found' : 'No patients available'}
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatientId === patient._id;
                  return (
                    <button
                      key={patient._id}
                      type="button"
                      onClick={() => {
                        setSelectedPatientId(patient._id);
                        setErrors((prev) => ({ ...prev, patient: '' }));
                      }}
                      className={`w-full text-left rounded-xl border px-3.5 py-3 transition ${
                        isSelected
                          ? 'border-sky-300 bg-sky-50 ring-1 ring-sky-200'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{patient.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {patient.patientId} • {patient.age}y • {patient.gender}
                          </p>
                        </div>
                        {isSelected && <CheckCircle size={18} className="text-sky-600 flex-none mt-0.5" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {errors.patient && <FieldError message={errors.patient} />}
          </div>
        </div>

        {/* Right Panel: Upload Form */}
        <div className="space-y-3">
          {/* Selected Patient Card */}
          {selectedPatient && (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-sky-200 flex items-center gap-3">
              <div className="flex-none w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900">{selectedPatient.name}</p>
                <p className="text-xs text-slate-600">{selectedPatient.patientId}</p>
              </div>
            </div>
          )}

          {/* Upload Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm space-y-5"
          >
            {/* Report Details Grid */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="reportName" className="block text-sm font-semibold text-slate-900 mb-2">
                  Report Name
                </label>
                <input
                  id="reportName"
                  name="reportName"
                  value={form.reportName}
                  onChange={handleFieldChange}
                  placeholder="e.g., Blood Test Summary"
                  disabled={!selectedPatient}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <FieldError message={errors.reportName} />
              </div>

              <div>
                <label htmlFor="reportType" className="block text-sm font-semibold text-slate-900 mb-2">
                  Report Type
                </label>
                <select
                  id="reportType"
                  name="reportType"
                  value={form.reportType}
                  onChange={handleFieldChange}
                  disabled={!selectedPatient}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option value="">Select type</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Other">Other</option>
                </select>
                <FieldError message={errors.reportType} />
              </div>

              <div>
                <label htmlFor="reportDate" className="block text-sm font-semibold text-slate-900 mb-2">
                  Report Date
                </label>
                <input
                  id="reportDate"
                  name="reportDate"
                  type="date"
                  value={form.reportDate}
                  onChange={handleFieldChange}
                  disabled={!selectedPatient}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <FieldError message={errors.reportDate} />
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-semibold text-slate-900 mb-2">
                  File Upload
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={!selectedPatient}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 file:mr-3 file:px-2 file:py-0.5 file:rounded file:bg-slate-100 file:text-xs file:font-medium transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                />
                <p className="mt-1.5 text-xs text-slate-500">PDF, PNG, JPG (max 10MB)</p>
                <FieldError message={errors.file} />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-semibold text-slate-900 mb-2">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleFieldChange}
                disabled={!selectedPatient}
                rows={3}
                placeholder="Add any additional notes..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition disabled:bg-slate-50 disabled:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {/* Action Button & Status */}
            <div className="pt-2 flex flex-col gap-3">
              {errors.submit && <FieldError message={errors.submit} />}
              <button
                type="submit"
                disabled={uploading || !selectedPatient}
                className="w-full rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-300 flex items-center justify-center gap-2"
              >
                {uploading && <Loader size={16} className="animate-spin" />}
                {uploading ? 'Uploading...' : 'Upload Report'}
              </button>

              {statusMessage && (
                <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                  <CheckCircle size={16} className="text-emerald-600 flex-none" />
                  <p className="text-sm font-medium text-emerald-700">{statusMessage}</p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Recent Uploads */}
      {savedReports.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100/50 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">Recent Uploads</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 text-xs">Patient</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 text-xs">Report</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 text-xs">Type</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 text-xs">Date</th>
                  <th className="text-left px-3 py-3 font-semibold text-slate-600 text-xs">Uploaded By</th>
                </tr>
              </thead>
              <tbody>
                {savedReports.map((report) => (
                  <tr key={report._id} className="border-b border-slate-100 last:border-none hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-900 font-medium">{report.patientId?.name}</td>
                    <td className="px-3 py-3 text-slate-700">{report.reportName}</td>
                    <td className="px-3 py-3 text-slate-600">{report.reportType}</td>
                    <td className="px-3 py-3 text-slate-600">{new Date(report.reportDate).toLocaleDateString()}</td>
                    <td className="px-3 py-3 text-slate-600 text-xs">{report.uploadedBy?.fullName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
