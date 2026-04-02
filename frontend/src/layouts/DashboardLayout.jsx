import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, User, Users,
  Shield, LogOut, Menu, Bell, Activity, Stethoscope
} from 'lucide-react';
import { getRole, logout } from '../services/authService.js';
import { getUser } from '../utils/getUser.js';

const NAV_CONFIG = {
  Patient: [
    { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard',     end: true },
    { to: '/dashboard/reports', icon: FileText,         label: 'My Reports' },
    { to: '/dashboard/upload',  icon: Upload,           label: 'Upload Report' },
    { to: '/dashboard/profile', icon: User,             label: 'Profile' },
  ],
  Doctor: [
    { to: '/staff-dashboard',        icon: Stethoscope, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,      label: 'Upload Report' },
  ],
  Nurse: [
    { to: '/staff-dashboard',        icon: Activity, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,   label: 'Upload Report' },
  ],
  Staff: [
    { to: '/staff-dashboard',        icon: Activity, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,   label: 'Upload Report' },
  ],
  Admin: [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard',    end: true },
    { to: '/manage-staff',    icon: Users,           label: 'Manage Staff' },
    { to: '/admin-profile',   icon: Shield,          label: 'Admin Profile' },
  ],
};

const PAGE_TITLES = {
  '/dashboard':             'Dashboard',
  '/dashboard/reports':     'My Reports',
  '/dashboard/upload':      'Upload Report',
  '/dashboard/profile':     'Profile',
  '/staff-dashboard':       'Staff Dashboard',
  '/staff-dashboard/upload':'Upload Report',
  '/admin-dashboard':       'Admin Dashboard',
  '/manage-staff':          'Manage Staff',
  '/admin-profile':         'Admin Profile',
};

function initials(name) {
  if (!name) return 'MV';
  return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const role       = getRole();
  const user       = getUser();
  const navItems   = NAV_CONFIG[role] || NAV_CONFIG.Patient;
  const pageTitle  = PAGE_TITLES[location.pathname] || 'MediVault';
  const userInitials = initials(user?.fullName || user?.name);

  /* Close sidebar on route change */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  /* Lock body scroll when mobile sidebar open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  async function handleLogout() {
    await logout();                              // uses authService.logout()
    navigate('/login');
  }

  const profilePath =
    role === 'Admin' ? '/admin-profile' : '/dashboard/profile';

  return (
    <div className="dash-shell">

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Main navigation">

        {/* Brand */}
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <span className="dash-sidebar-brand-name">MediVault</span>
        </div>

        {/* Nav items */}
        <div className="dash-sidebar-section" style={{ flex: 1 }}>
          <p className="dash-sidebar-section-label">Menu</p>
          <nav>
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User card + logout */}
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-user-card" onClick={() => navigate(profilePath)} role="button" tabIndex={0}>
            <div className="dash-user-avatar">{userInitials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="dash-user-name">{user?.fullName || user?.name || 'User'}</div>
              <div className="dash-user-role">{role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="dash-nav-item"
            style={{ marginTop: 6, color: 'rgba(255,255,255,0.45)' }}
            aria-label="Sign out"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* Topbar */}
        <header className="dash-topbar">
          <button
            className="dash-topbar-hamburger"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} />
          </button>

          <h1 className="dash-topbar-title">{pageTitle}</h1>

          <div className="dash-topbar-actions">
            <button className="dash-topbar-btn" aria-label="Notifications" style={{ position: 'relative' }}>
              <Bell size={17} />
              <span style={{
                position: 'absolute', top: 7, right: 7,
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--mv-danger)', border: '1.5px solid white'
              }} />
            </button>

            <div
              className="dash-topbar-avatar"
              role="button"
              tabIndex={0}
              onClick={() => navigate(profilePath)}
              title="Profile"
            >
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page outlet */}
        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
