import { NavLink } from 'react-router-dom';

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

function IconProfile(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
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

const getItemsByRole = (role) => {
  if (role === 'Admin') {
    return {
      sectionLabel: 'Admin Panel',
      items: [
        { to: '/admin-dashboard', label: 'Admin Dashboard', icon: IconDashboard, end: true },
        { to: '/manage-staff', label: 'Manage Staff', icon: IconStaff, end: true },
        { to: '/admin-profile', label: 'Profile', icon: IconProfile, end: true },
      ],
    };
  }

  if (role === 'Nurse' || role === 'Doctor') {
    return {
      sectionLabel: 'Staff Panel',
      items: [
        { to: '/staff-dashboard', label: 'Staff Dashboard', icon: IconDashboard, end: true },
      ],
    };
  }

  return {
    sectionLabel: 'Patient Panel',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: IconDashboard, end: true },
      { to: '/dashboard/reports', label: 'Reports', icon: IconReports },
      { to: '/dashboard/upload', label: 'Upload Report', icon: IconUpload },
      { to: '/dashboard/profile', label: 'Profile', icon: IconProfile },
    ],
  };
};

export default function Sidebar({ role, onItemClick, collapsed = false }) {
  const { items, sectionLabel } = getItemsByRole(role);

  return (
    <div className={`flex h-full flex-col gap-6 p-4 ${collapsed ? 'items-center' : ''}`}>
      <div className={`flex w-full items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
          <span className="text-sm font-bold">MR</span>
        </div>
        {!collapsed && (
          <div>
            <p className="text-sm font-bold text-slate-900">MRMS</p>
            <p className="text-xs text-slate-500">Medical Report System</p>
          </div>
        )}
      </div>

      <div className="w-full">
        {!collapsed && (
          <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-sky-700">{sectionLabel}</p>
        )}
        <nav className={`flex flex-col gap-1 ${collapsed ? 'items-center' : ''}`}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onItemClick}
                title={item.label}
                className={({ isActive }) =>
                  isActive
                    ? `group flex items-center rounded-xl bg-sky-50 py-2 text-sky-700 shadow-sm ring-1 ring-sky-100 ${collapsed ? 'w-10 justify-center px-0' : 'gap-3 px-3'}`
                    : `group flex items-center rounded-xl py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${collapsed ? 'w-10 justify-center px-0' : 'gap-3 px-3'}`
                }
              >
                <Icon className="h-5 w-5 flex-none" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="mt-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">Security</p>
          <p className="mt-2 text-sm text-slate-700">Role-based access protects sensitive medical data.</p>
        </div>
      )}
    </div>
  );
}
