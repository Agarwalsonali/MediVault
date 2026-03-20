import { useMemo, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getFullName, getLoginEmail, getRole, logout } from '../services/authService.js';

function IconDashboard(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 13h8V3H3v10Z" />
      <path d="M13 21h8V11h-8v10Z" />
      <path d="M13 3h8v8h-8V3Z" />
      <path d="M3 21h8v-6H3v6Z" />
    </svg>
  );
}

function IconReports(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h6" />
    </svg>
  );
}

function IconUpload(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v14" />
    </svg>
  );
}

function IconStaff(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6" />
      <path d="M23 11h-6" />
    </svg>
  );
}

function IconProfile(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
    </svg>
  );
}

function getInitials(text) {
  if (!text) return 'U';
  const parts = String(text)
    .split(/[@\s._-]+/)
    .filter(Boolean);
  const first = parts[0]?.[0] ?? 'U';
  const second = parts.length > 1 ? parts[1]?.[0] : '';
  return (first + second).toUpperCase();
}

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = getRole() || 'Healthcare Staff';
  const email = getLoginEmail();
  const fullName = getFullName() || '';
  const initials = useMemo(() => getInitials(fullName || email), [email, fullName]);

  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard', icon: IconDashboard, end: true },
      { to: '/dashboard/staff', label: 'Staff Dashboard', icon: IconStaff },
      { to: '/dashboard/reports', label: 'Reports', icon: IconReports },
      { to: '/dashboard/upload', label: 'Upload Report', icon: IconUpload },
      { to: '/dashboard/profile', label: 'Profile', icon: IconProfile },
    ],
    [],
  );

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const closeMobileSidebar = () => setSidebarOpen(false);

  const SidebarBody = ({ onItemClick }) => (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
            <span className="text-sm font-bold">MR</span>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">MRMS</p>
            <p className="text-xs text-slate-500">Medical Report System</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onItemClick}
              className={({ isActive }) =>
                isActive
                  ? 'group flex items-center gap-3 rounded-xl bg-sky-50 px-3 py-2 text-sky-700 shadow-sm ring-1 ring-sky-100'
                  : 'group flex items-center gap-3 rounded-xl px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }
            >
              <Icon className="h-5 w-5 flex-none" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">Security</p>
        <p className="mt-2 text-sm text-slate-700">
          Role-based access and secure upload flows to keep patient data protected.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-teal-50">
      <div className="lg:flex">
        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close sidebar"
              onClick={closeMobileSidebar}
            />
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto bg-white shadow-xl">
              <SidebarBody onItemClick={closeMobileSidebar} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur lg:block">
          <SidebarBody onItemClick={() => {}} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top navbar */}
          <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h16" />
                    <path d="M4 6h16" />
                    <path d="M4 18h16" />
                  </svg>
                </button>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Healthcare Dashboard</p>
                  <p className="truncate text-xs text-slate-500">Secure overview for patient reports</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-3 sm:flex">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm">
                    <span className="text-sm font-bold">{initials}</span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-slate-900">{fullName || role}</p>
                    <p className="text-xs text-slate-500">{email || 'Signed in'}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

