import { NavLink } from 'react-router-dom';

// SVG icons — kept from original, styled for new system
function IconDashboard(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 13h8V3H3v10Z"/><path d="M13 21h8V11h-8v10Z"/><path d="M13 3h8v8h-8V3Z"/><path d="M3 21h8v-6H3v6Z"/></svg>;
}
function IconReports(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/><path d="M8 7h8"/><path d="M8 11h8"/><path d="M8 15h6"/></svg>;
}
function IconUpload(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5-5 5 5"/><path d="M12 5v14"/></svg>;
}
function IconProfile(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 21a8 8 0 0 0-16 0"/><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"/></svg>;
}
function IconStaff(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>;
}
function IconShield(props) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}

const getItemsByRole = (role) => {
  if (role === 'Admin') return {
    sectionLabel: 'Admin Panel',
    items: [
      { to: '/admin-dashboard', label: 'Dashboard',    icon: IconDashboard, end: true },
      { to: '/manage-staff',    label: 'Manage Staff', icon: IconStaff,     end: true },
      { to: '/admin-profile',   label: 'Profile',      icon: IconProfile,   end: true },
    ],
  };
  if (role === 'Nurse' || role === 'Doctor' || role === 'Staff') return {
    sectionLabel: 'Staff Panel',
    items: [
      { to: '/staff-dashboard',        label: 'Dashboard',     icon: IconDashboard, end: true },
      { to: '/staff-dashboard/upload', label: 'Upload Report', icon: IconUpload },
    ],
  };
  return {
    sectionLabel: 'Patient Panel',
    items: [
      { to: '/dashboard',         label: 'Dashboard',     icon: IconDashboard, end: true },
      { to: '/dashboard/reports', label: 'Reports',       icon: IconReports },
      { to: '/dashboard/upload-report',  label: 'Upload Your Report', icon: IconUpload },
      { to: '/dashboard/profile', label: 'Profile',       icon: IconProfile },
    ],
  };
};

export default function Sidebar({ role, onItemClick, collapsed = false }) {
  const { items, sectionLabel } = getItemsByRole(role);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 0 }}>

      {/* Brand */}
      <div className="dash-sidebar-brand">
        <div className="dash-sidebar-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        {!collapsed && <span className="dash-sidebar-brand-name">MediVault</span>}
      </div>

      {/* Nav */}
      <div className="dash-sidebar-section" style={{ flex: 1 }}>
        {!collapsed && <p className="dash-sidebar-section-label">{sectionLabel}</p>}
        <nav>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onItemClick}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => `dash-nav-item ${isActive ? 'active' : ''}`}
                style={collapsed ? { justifyContent: 'center', padding: '10px 0' } : {}}
              >
                <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Security note */}
      {!collapsed && (
        <div style={{
          margin: '0 0.75rem 1rem',
          background: 'rgba(13,148,136,0.12)',
          borderRadius: 'var(--radius)',
          padding: '12px 14px',
          border: '1px solid rgba(45,212,191,0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
            <IconShield style={{ width: 13, height: 13, color: 'var(--mv-teal-glow)', flexShrink: 0 }} />
            <p style={{ fontSize: '0.69rem', fontWeight: 600, color: 'var(--mv-teal-glow)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Security</p>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>Role-based access protects sensitive medical data.</p>
        </div>
      )}
    </div>
  );
}
