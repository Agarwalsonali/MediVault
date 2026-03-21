import { useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import { getFullName, getLoginEmail, logout } from '../services/authService.js';
import { getUser } from '../utils/getUser.js';

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const role = getUser()?.role || 'Healthcare Staff';
  const email = getLoginEmail();
  const fullName = getFullName() || '';
  const initials = useMemo(() => getInitials(fullName || email), [email, fullName]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileSidebar = () => setMobileSidebarOpen(false);

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 via-white to-teal-50">
      <div className="lg:flex">
        {/* Mobile sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
            <button
              type="button"
              className="absolute inset-0 bg-slate-900/40"
              aria-label="Close sidebar"
              onClick={closeMobileSidebar}
            />
            <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs overflow-y-auto bg-white shadow-xl">
              <Sidebar role={role} onItemClick={closeMobileSidebar} collapsed={false} />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside className={`hidden h-screen shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur transition-all duration-300 lg:block ${sidebarOpen ? 'w-64' : 'w-16'}`}>
          <Sidebar role={role} onItemClick={() => {}} collapsed={!sidebarOpen} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top navbar */}
          <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 lg:inline-flex"
                  onClick={() => setSidebarOpen((prev) => !prev)}
                  aria-label="Toggle sidebar"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12h16" />
                    <path d="M4 6h16" />
                    <path d="M4 18h16" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 lg:hidden"
                  onClick={() => setMobileSidebarOpen(true)}
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

