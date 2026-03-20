import { useState } from 'react';
import Input from '../components/Input.jsx';

export default function UploadReport() {
  const [patientName, setPatientName] = useState('');
  const [reportType, setReportType] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!patientName.trim()) return setMessage('Please enter a patient name.');
    if (!reportType.trim()) return setMessage('Please enter a report type.');
    if (!file) return setMessage('Please choose a report file to upload.');

    // Demo-only: replace with real API upload later.
    setSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 650));
      setMessage(`Upload complete (demo): ${file.name}`);
      setFile(null);
      setPatientName('');
      setReportType('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Upload Report</h1>
          <p className="mt-1 text-sm text-slate-600">Securely upload a patient medical report (demo UI).</p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-teal-100">
          Encrypted transfer
        </div>
      </div>

      <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <div className="sm:col-span-1">
          <Input label="Patient Name" name="patientName" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="e.g., John Smith" />
        </div>

        <div className="sm:col-span-1">
          <Input label="Report Type" name="reportType" value={reportType} onChange={(e) => setReportType(e.target.value)} placeholder="e.g., Blood Test" />
        </div>

        <div className="sm:col-span-2">
          <div className="space-y-1">
            <label htmlFor="file" className="block text-sm font-medium text-slate-700">
              Report File
            </label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              accept=".pdf,.png,.jpg,.jpeg"
            />
            <p className="text-xs text-slate-500">
              Accepted: PDF, PNG, JPG/JPEG. (Demo-only upload; no backend call.)
            </p>
          </div>
        </div>

        <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
          >
            {submitting ? 'Uploading...' : 'Upload Report'}
          </button>

          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                message.startsWith('Upload complete') ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
              role="status"
            >
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

