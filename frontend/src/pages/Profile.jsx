import { getFullName, getLoginEmail, getRole } from '../services/authService.js';

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

export default function Profile() {
  const role = getRole() || 'Healthcare Staff';
  const fullName = getFullName() || 'Signed in user';
  const email = getLoginEmail() || 'Signed in user';

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your account details (demo placeholder).</p>
        </div>
        <div className="inline-flex items-center rounded-2xl bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-800 ring-1 ring-sky-100">
          Verified access
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <StatRow label="Full Name" value={fullName} />
        <StatRow label="Role" value={role} />
        <StatRow label="Email" value={email} />
        <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-800">Security preferences</p>
          <p className="mt-2 text-sm text-slate-600">
            Connect this section to your backend to let users update profile data, change password, and manage OTP settings.
          </p>
        </div>
      </div>
    </div>
  );
}

