import { getFullName, getLoginEmail } from '../services/authService.js';

function StatCard({ title, value, subtitle, icon, accent }) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

export default function DashboardHome() {
  const fullName = (getFullName() || '').trim();
  const loggedEmail = getLoginEmail() || '';
  const emailName = loggedEmail.split('@')[0] || '';
  const fallbackName = emailName
    ? emailName
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    : 'Patient';
  const patientName = fullName || fallbackName;

  const reports = [
    { id: 1, name: 'Blood Test Summary', type: 'Lab Report', date: 'Mar 18, 2026' },
    { id: 2, name: 'Chest X-Ray', type: 'Radiology', date: 'Mar 15, 2026' },
    { id: 3, name: 'Cardiology Checkup', type: 'Consultation', date: 'Mar 10, 2026' },
    { id: 4, name: 'MRI Brain Scan', type: 'Imaging', date: 'Mar 02, 2026' },
    { id: 5, name: 'Vitamin Profile', type: 'Lab Report', date: 'Feb 26, 2026' },
  ];

  const stats = {
    totalReports: reports.length,
    recentReports: reports.filter((r) => r.date.includes('Mar')).length,
    lastUpload: reports[0]?.date || 'N/A',
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-sky-100 bg-linear-to-r from-sky-600 via-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/20 sm:p-8">
        <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/15" />
        <div className="pointer-events-none absolute bottom-0 right-20 h-20 w-20 rounded-full bg-white/10" />
        <p className="text-sm font-medium text-blue-100">Patient Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Welcome back, {patientName} 👋</h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
          Here&apos;s your health report overview, latest uploads, and quick actions in one place.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          subtitle="All uploaded reports"
          accent="bg-blue-50 text-blue-700 ring-1 ring-blue-100"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
              <path d="M16 13H8" />
              <path d="M16 17H8" />
            </svg>
          }
        />

        <StatCard
          title="Recent Reports"
          value={stats.recentReports}
          subtitle="Uploaded this month"
          accent="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4l3 3" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          }
        />

        <StatCard
          title="Last Upload"
          value={stats.lastUpload}
          subtitle="Most recent report date"
          accent="bg-violet-50 text-violet-700 ring-1 ring-violet-100"
          icon={
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 7V3" />
              <path d="M16 7V3" />
              <path d="M3 11h18" />
              <rect x="3" y="5" width="18" height="16" rx="2" />
            </svg>
          }
        />
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/95 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Your Reports</h2>
            <p className="mt-1 text-sm text-slate-600">Manage and review your uploaded medical reports.</p>
          </div>
          <button
            type="button"
            className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700"
          >
            Upload New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left">
            <thead className="bg-slate-50/70">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="transition hover:bg-sky-50/40">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{report.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{report.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{report.date}</td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

