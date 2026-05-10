import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Upload, User, Users,
  Shield, LogOut, Menu, Bell, Activity, Stethoscope, ClipboardList, Sun, Moon,
  Check, Trash2, ChevronDown
} from 'lucide-react';
import { getRole, logout } from '../services/authService.js';
import { getUser } from '../utils/getUser.js';
import { useTheme } from '../hooks/useTheme.js';
import * as notificationService from '../services/notificationService.js';

const NAV_CONFIG = {
  Patient: [
    { to: '/dashboard',         icon: LayoutDashboard, label: 'Dashboard',     end: true },
    { to: '/dashboard/reports', icon: FileText,         label: 'My Reports' },
    { to: '/dashboard/upload-report',  icon: Upload,           label: 'Upload Your Report' },
    { to: '/dashboard/profile', icon: User,             label: 'Profile' },
  ],
  Doctor: [
    { to: '/staff-dashboard',        icon: Stethoscope, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,      label: 'Upload Report' },
    { to: '/staff-dashboard/profile', icon: User,        label: 'Profile' },
  ],
  Nurse: [
    { to: '/staff-dashboard',        icon: Activity, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,   label: 'Upload Report' },
    { to: '/staff-dashboard/profile', icon: User,     label: 'Profile' },
  ],
  Staff: [
    { to: '/staff-dashboard',        icon: Activity, label: 'Dashboard',     end: true },
    { to: '/staff-dashboard/upload', icon: Upload,   label: 'Upload Report' },
    { to: '/staff-dashboard/profile', icon: User,     label: 'Profile' },
  ],
  Admin: [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard',    end: true },
    { to: '/manage-staff',    icon: Users,           label: 'Manage Staff' },
    { to: '/activity-log',    icon: ClipboardList,   label: 'Activity Log' },
    { to: '/admin-profile',   icon: Shield,          label: 'Admin Profile' },
  ],
};

const PAGE_TITLES = {
  '/dashboard':             'Dashboard',
  '/dashboard/reports':     'My Reports',
  '/dashboard/upload':      'Upload Your Report',
  '/dashboard/upload-report':'Upload Your Report',
  '/dashboard/profile':     'Profile',
  '/staff-dashboard':       'Staff Dashboard',
  '/staff-dashboard/upload':'Upload Report',
  '/staff-dashboard/profile':'Staff Profile',
  '/admin-dashboard':       'Admin Dashboard',
  '/manage-staff':          'Manage Staff',
  '/activity-log':          'Activity Log',
  '/admin-profile':         'Admin Profile',
};

function initials(name) {
  if (!name) return 'MV';
  return name.trim().split(/\s+/).map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const navigate   = useNavigate();
  const location   = useLocation();
  const role       = getRole();
  const user       = getUser();
  const { theme, toggleTheme } = useTheme();
  const navItems   = NAV_CONFIG[role] || NAV_CONFIG.Patient;
  const pageTitle  = PAGE_TITLES[location.pathname] || 'MediVault';
  const isPatientUploadPage = location.pathname === '/dashboard/upload-report' || location.pathname === '/dashboard/upload';
  const isPatientDashboardHome = role === 'Patient' && location.pathname === '/dashboard';
  const userInitials = initials(user?.fullName || user?.name);

  /* Close sidebar on route change */
  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  /* Lock body scroll when mobile sidebar open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  /* Fetch notifications on mount and auto-refresh every 30 seconds */
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setNotificationsLoading(true);
        const result = await notificationService.getNotifications(10, 0, false);
        setNotifications(result.data || []);
        setUnreadCount(result.pagination?.unreadCount || 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();

    // Auto-refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  /* Handle marking notification as read */
  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  /* Handle deleting notification */
  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - (notifications.find(n => n._id === notificationId)?.isRead ? 0 : 1)));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  /* Handle marking all as read */
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  async function handleLogout() {
    await logout();                              // uses authService.logout()
    navigate('/login');
  }

  function handleSidebarToggle() {
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  }

  const profilePath = role === 'Admin'
    ? '/admin-profile'
    : (role === 'Doctor' || role === 'Nurse' || role === 'Staff')
      ? '/staff-dashboard/profile'
      : '/dashboard/profile';

  return (
    <div className="dash-shell">

      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* ── SIDEBAR ── */}
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Main navigation">

        {/* Brand */}
        <div className="dash-sidebar-brand">
          <div className="dash-sidebar-brand-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          {!sidebarCollapsed && <span className="dash-sidebar-brand-name">MediVault</span>}
        </div>

        {/* Nav items */}
        <div className="dash-sidebar-section" style={{ flex: 1 }}>
          {!sidebarCollapsed && <p className="dash-sidebar-section-label">Menu</p>}
          <nav>
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? label : undefined}
                style={sidebarCollapsed ? { justifyContent: 'center', padding: '10px 0' } : {}}
              >
                <Icon size={18} />
                {!sidebarCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User card + logout */}
        <div className="dash-sidebar-user">
          <div className="dash-sidebar-user-card" onClick={() => navigate(profilePath)} role="button" tabIndex={0}>
            <div className="dash-user-avatar">{userInitials}</div>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dash-user-name" style={{ color: '#ffffff' }}>{user?.fullName || user?.name || 'User'}</div>
                <div className="dash-user-role">{role}</div>
              </div>
            )}
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
      <div className={`dash-main ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>

        {/* Topbar */}
        <header className="dash-topbar">
          <button
            className="dash-topbar-hamburger"
            onClick={handleSidebarToggle}
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen || !sidebarCollapsed}
          >
            <Menu size={20} />
          </button>

          <h1 className={`dash-topbar-title ${isPatientUploadPage ? 'patient-upload-topbar-title' : ''} ${isPatientDashboardHome ? 'patient-dashboard-mobile-no-title' : ''}`}>{pageTitle}</h1>

          <div className="dash-topbar-actions">
            <button
              className="dash-topbar-btn"
              aria-label="Toggle theme"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <div style={{ position: 'relative' }}>
              <button
                className="dash-topbar-btn"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((prev) => !prev)}
                style={{ position: 'relative' }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 7, right: 7,
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--mv-danger)', border: '1.5px solid white'
                  }} />
                )}
              </button>

              {notificationsOpen && (
                <div className="dash-notification-popover" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '380px',
                  maxHeight: '500px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--mv-bg)',
                  border: '1px solid var(--mv-border)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Header */}
                  <div style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--mv-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--mv-slate-dark)' }}>
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: 'var(--mv-danger)',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem'
                        }}>
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--mv-primary)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          padding: '0.25rem 0.5rem'
                        }}
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications list */}
                  <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    maxHeight: '400px'
                  }}>
                    {notificationsLoading ? (
                      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--mv-slate)' }}>
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--mv-slate)' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          onClick={() => {
                            if (notification.actionUrl) navigate(notification.actionUrl);
                            if (!notification.isRead) handleMarkAsRead(notification._id, { stopPropagation: () => {} });
                          }}
                          style={{
                            padding: '0.875rem 1rem',
                            borderBottom: '1px solid var(--mv-border)',
                            backgroundColor: notification.isRead ? 'transparent' : 'var(--mv-primary)',
                            backgroundOpacity: notification.isRead ? 1 : 0.05,
                            cursor: notification.actionUrl ? 'pointer' : 'default',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                          }}
                          onMouseEnter={(e) => {
                            if (!notification.isRead) e.currentTarget.style.backgroundColor = 'rgba(var(--mv-primary-rgb), 0.08)';
                          }}
                          onMouseLeave={(e) => {
                            if (!notification.isRead) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {/* Notification icon */}
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: notification.isRead ? 'transparent' : 'var(--mv-primary)',
                            marginTop: '0.375rem',
                            flexShrink: 0
                          }} />

                          {/* Notification content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: 'var(--mv-slate-dark)',
                              marginBottom: '0.25rem'
                            }}>
                              {notification.title}
                            </div>
                            <div style={{
                              fontSize: '0.8rem',
                              color: 'var(--mv-slate)',
                              marginBottom: '0.375rem',
                              lineHeight: 1.4
                            }}>
                              {notification.message}
                            </div>
                            <div style={{
                              fontSize: '0.7rem',
                              color: 'var(--mv-slate)',
                              display: 'flex',
                              gap: '0.5rem',
                              alignItems: 'center'
                            }}>
                              {new Date(notification.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div style={{
                            display: 'flex',
                            gap: '0.375rem',
                            flexShrink: 0
                          }}>
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0.375rem',
                                  color: 'var(--mv-slate)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '0.375rem'
                                }}
                                title="Mark as read"
                              >
                                <Check size={16} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '0.375rem',
                                color: 'var(--mv-slate)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '0.375rem'
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

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
