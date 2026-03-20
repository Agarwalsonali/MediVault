export default function Reports() {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
      <p className="mt-2 text-sm text-slate-600">
        This section is ready for your reports listing, filters, and pagination (demo placeholder).
      </p>

      <div className="mt-6 rounded-2xl border border-slate-100 bg-sky-50/50 p-5">
        <p className="text-sm font-semibold text-sky-800">Next step</p>
        <p className="mt-2 text-sm text-slate-700">
          Wire this page to your backend to fetch report metadata, then render the results in a table
          similar to the dashboard’s “Recent Reports” view.
        </p>
      </div>
    </div>
  );
}

