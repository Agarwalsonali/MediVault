import { useMemo, useState } from 'react';

const dummyPatients = [
  { id: 'P-1001', name: 'John Smith', age: 48, gender: 'Male' },
  { id: 'P-1002', name: 'Emily Carter', age: 34, gender: 'Female' },
  { id: 'P-1003', name: 'Michael Brown', age: 56, gender: 'Male' },
  { id: 'P-1004', name: 'Sophia Wilson', age: 29, gender: 'Female' },
  { id: 'P-1005', name: 'William Johnson', age: 63, gender: 'Male' },
  { id: 'P-1006', name: 'Ava Patel', age: 41, gender: 'Female' },
];

const allowedFileTypes = ['application/pdf', 'image/png', 'image/jpeg'];

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-medium text-rose-600">{message}</p>;
}

export default function StaffDashboard() {
  const [search, setSearch] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [form, setForm] = useState({
    reportName: '',
    reportType: '',
    reportDate: '',
    notes: '',
  });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [savedReports, setSavedReports] = useState([]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dummyPatients;

    return dummyPatients.filter((patient) => {
      const searchable = `${patient.id} ${patient.name}`.toLowerCase();
      return searchable.includes(query);
    });
  }, [search]);

  const selectedPatient = useMemo(
    () => dummyPatients.find((patient) => patient.id === selectedPatientId) || null,
    [selectedPatientId],
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

    if (!selectedPatientId) nextErrors.patient = 'Please select a patient from the list.';
    if (!form.reportName.trim()) nextErrors.reportName = 'Report name is required.';
    if (!form.reportType.trim()) nextErrors.reportType = 'Please select a report type.';
    if (!form.reportDate) nextErrors.reportDate = 'Please choose a report date.';
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

    setSaving(true);
    setErrors({});

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      const savedItem = {
        id: `R-${Date.now()}`,
        patientName: selectedPatient?.name || 'Unknown',
        reportName: form.reportName.trim(),
        reportType: form.reportType,
        reportDate: form.reportDate,
        fileName: file?.name || '',
      };

      setSavedReports((prev) => [savedItem, ...prev].slice(0, 5));
      setStatusMessage('Report details saved successfully (demo).');

      setForm({
        reportName: '',
        reportType: '',
        reportDate: '',
        notes: '',
      });
      setFile(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Staff Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Search patients, upload medical reports, and save report details in a secure workflow.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Patient Search</h2>
          <p className="mt-1 text-sm text-slate-600">Find a patient and select them before uploading.</p>

          <div className="mt-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or patient ID"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div className="mt-4 space-y-2">
            {filteredPatients.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                No patients found.
              </p>
            ) : (
              filteredPatients.map((patient) => {
                const selected = selectedPatientId === patient.id;
                return (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setErrors((prev) => ({ ...prev, patient: '' }));
                    }}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      selected
                        ? 'border-sky-200 bg-sky-50 ring-1 ring-sky-100'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{patient.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {patient.id} • {patient.gender}, {patient.age}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          <FieldError message={errors.patient} />
        </aside>

        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Upload Medical Report</h2>
                <p className="mt-1 text-sm text-slate-600">Fill report details and upload PDF/image file.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {selectedPatient ? `Patient: ${selectedPatient.name}` : 'No patient selected'}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-1">
                <label htmlFor="reportName" className="block text-sm font-medium text-slate-700">
                  Report Name
                </label>
                <input
                  id="reportName"
                  name="reportName"
                  value={form.reportName}
                  onChange={handleFieldChange}
                  placeholder="e.g., Blood Test Summary"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <FieldError message={errors.reportName} />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="reportType" className="block text-sm font-medium text-slate-700">
                  Report Type
                </label>
                <select
                  id="reportType"
                  name="reportType"
                  value={form.reportType}
                  onChange={handleFieldChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="">Select type</option>
                  <option value="Lab Report">Lab Report</option>
                  <option value="Radiology">Radiology</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                </select>
                <FieldError message={errors.reportType} />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700">
                  Report Date
                </label>
                <input
                  id="reportDate"
                  name="reportDate"
                  type="date"
                  value={form.reportDate}
                  onChange={handleFieldChange}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <FieldError message={errors.reportDate} />
              </div>

              <div className="md:col-span-1">
                <label htmlFor="file" className="block text-sm font-medium text-slate-700">
                  Upload File (PDF/Image)
                </label>
                <input
                  id="file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  className="mt-1 block w-full cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <p className="mt-1 text-xs text-slate-500">Accepted: PDF, PNG, JPG/JPEG</p>
                <FieldError message={errors.file} />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleFieldChange}
                  rows={4}
                  placeholder="Add additional notes for staff review"
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400"
              >
                {saving ? 'Saving...' : 'Save Report Details'}
              </button>

              {statusMessage && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                  {statusMessage}
                </p>
              )}
            </div>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Recently Saved Reports</h3>
            <p className="mt-1 text-sm text-slate-600">Latest saved entries from this session (demo).</p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-165 text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-2 py-2">Patient</th>
                    <th className="px-2 py-2">Report</th>
                    <th className="px-2 py-2">Type</th>
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">File</th>
                  </tr>
                </thead>
                <tbody>
                  {savedReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-2 py-4 text-sm text-slate-500">
                        No saved reports yet.
                      </td>
                    </tr>
                  ) : (
                    savedReports.map((report) => (
                      <tr key={report.id} className="border-b border-slate-100 last:border-none">
                        <td className="px-2 py-3 text-sm font-medium text-slate-900">{report.patientName}</td>
                        <td className="px-2 py-3 text-sm text-slate-700">{report.reportName}</td>
                        <td className="px-2 py-3 text-sm text-slate-600">{report.reportType}</td>
                        <td className="px-2 py-3 text-sm text-slate-600">{report.reportDate}</td>
                        <td className="px-2 py-3 text-sm text-slate-600">{report.fileName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
