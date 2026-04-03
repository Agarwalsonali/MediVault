import { useEffect, useMemo, useState } from 'react';
import { createStaffUser, deleteStaffUser, fetchStaffUsers, updateStaffUser } from '../services/adminService.js';
import { Users, Search, RefreshCw, Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, User, Mail, Shield } from 'lucide-react';
import { toast } from 'react-toastify';

const ROLES = ['Nurse', 'Staff'];
const INIT_CREATE = { fullName: '', email: '', role: 'Nurse' };
const INIT_EDIT   = { id: '', fullName: '', email: '', role: 'Nurse' };

const ROLE_STYLE = {
  Nurse: { cls: 'mv-badge-teal',   label: 'Nurse' },
  Staff: { cls: 'mv-badge-blue',   label: 'Staff' },
  Doctor:{ cls: 'mv-badge-purple', label: 'Doctor' },
};

function FieldErr({ msg }) {
  if (!msg) return null;
  return (
    <p className="mv-field-error">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
      {msg}
    </p>
  );
}

export default function ManageStaff() {
  const [createForm,   setCreateForm]   = useState(INIT_CREATE);
  const [createErrors, setCreateErrors] = useState({});
  const [creating,     setCreating]     = useState(false);
  const [staffList,    setStaffList]    = useState([]);
  const [listLoading,  setListLoading]  = useState(false);
  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('All');
  const [page,         setPage]         = useState(1);
  const PAGE_SIZE = 5;
  const [isEditing,    setIsEditing]    = useState(false);
  const [editForm,     setEditForm]     = useState(INIT_EDIT);
  const [editErrors,   setEditErrors]   = useState({});
  const [editLoading,  setEditLoading]  = useState(false);
  const [, setErrorMsg]     = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return staffList.filter(s =>
      (roleFilter === 'All' || s.role === roleFilter) &&
      (!q || `${s.fullName} ${s.email}`.toLowerCase().includes(q))
    );
  }, [staffList, search, roleFilter]);

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const load = async () => {
    setListLoading(true);
    try {
      const res = await fetchStaffUsers();
      setStaffList(res?.staff || []);
    } catch (e) { toast.error(e.message || 'Failed to load staff.'); }
    finally { setListLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [search, roleFilter]);
  useEffect(() => { if (page > totalPages) setPage(totalPages); }, [page, totalPages]);

  const validateCreate = () => {
    const e = {};
    if (!createForm.fullName.trim()) e.fullName = 'Full name is required.';
    if (!createForm.email.trim())    e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) e.email = 'Enter a valid email.';
    if (!ROLES.includes(createForm.role)) e.role = 'Select a valid role.';
    return e;
  };
  const validateEdit = () => {
    const e = {};
    if (!editForm.fullName.trim()) e.fullName = 'Full name is required.';
    if (!editForm.email.trim())    e.email    = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = 'Enter a valid email.';
    if (!ROLES.includes(editForm.role)) e.role = 'Select a valid role.';
    return e;
  };

  const handleCreateChange = e => {
    const { name, value } = e.target;
    setCreateForm(p => ({ ...p, [name]: value }));
    setCreateErrors(p => ({ ...p, [name]: '' }));
    setErrorMsg('');
  };
  const handleEditChange = e => {
    const { name, value } = e.target;
    setEditForm(p => ({ ...p, [name]: value }));
    setEditErrors(p => ({ ...p, [name]: '' }));
    setErrorMsg('');
  };

  const handleCreate = async e => {
    e.preventDefault();
    const ve = validateCreate();
    if (Object.keys(ve).length) { setCreateErrors(ve); return; }
    setCreating(true); setErrorMsg('');
    try {
      await createStaffUser({ fullName: createForm.fullName.trim(), email: createForm.email.trim().toLowerCase(), role: createForm.role });
      toast.success('Staff account created. Invite email sent.');
      setCreateForm(INIT_CREATE); setCreateErrors({});
      await load();
    } catch (e) { toast.error(e.message || 'Could not create account.'); }
    finally { setCreating(false); }
  };

  const startEdit = s => {
    setIsEditing(true);
    setEditForm({ id: s._id || s.id, fullName: s.fullName || '', email: s.email || '', role: s.role || 'Nurse' });
    setEditErrors({}); setErrorMsg('');
  };
  const cancelEdit = () => { setIsEditing(false); setEditForm(INIT_EDIT); setEditErrors({}); };

  const handleEditSubmit = async e => {
    e.preventDefault();
    const ve = validateEdit();
    if (Object.keys(ve).length) { setEditErrors(ve); return; }
    setEditLoading(true); setErrorMsg('');
    try {
      await updateStaffUser(editForm.id, { fullName: editForm.fullName.trim(), email: editForm.email.trim().toLowerCase(), role: editForm.role });
      toast.success('Staff updated successfully.');
      cancelEdit(); await load();
    } catch (e) { toast.error(e.message || 'Could not update account.'); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async s => {
    if (!window.confirm(`Delete ${s.fullName} (${s.role})?`)) return;
    setErrorMsg('');
    try {
      await deleteStaffUser(s._id || s.id);
      toast.success('Staff deleted successfully.');
      await load();
    } catch (e) { toast.error(e.message || 'Could not delete account.'); }
  };

  return (
    <div className="dash-page">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">Manage Staff</h1>
        <p className="dash-page-subtitle">Create, invite, update and remove Nurse or Staff accounts</p>
      </div>

      {/* Create form */}
      <div className="mv-card animate-fade-up" style={{ marginBottom: '1.25rem' }}>
        <div className="mv-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: 'var(--mv-teal-pale)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={18} color="var(--mv-teal)" />
            </div>
            <p className="mv-card-title">Create Staff Account</p>
          </div>
        </div>
        <div className="mv-card-body">
          <form onSubmit={handleCreate}>
            <div className="mv-form-row">
              {/* Full name */}
              <div className="mv-form-group">
                <label className="mv-label" htmlFor="c-fullName">Full Name</label>
                <div className="mv-input-wrap">
                  <span className="mv-input-icon"><User size={15} /></span>
                  <input id="c-fullName" name="fullName" type="text" value={createForm.fullName}
                    onChange={handleCreateChange} placeholder="Staff full name"
                    className={`mv-input${createErrors.fullName ? ' error' : ''}`} />
                </div>
                <FieldErr msg={createErrors.fullName} />
              </div>

              {/* Email */}
              <div className="mv-form-group">
                <label className="mv-label" htmlFor="c-email">Email Address</label>
                <div className="mv-input-wrap">
                  <span className="mv-input-icon"><Mail size={15} /></span>
                  <input id="c-email" name="email" type="email" value={createForm.email}
                    onChange={handleCreateChange} placeholder="staff@hospital.com"
                    className={`mv-input${createErrors.email ? ' error' : ''}`} />
                </div>
                <FieldErr msg={createErrors.email} />
              </div>

              {/* Role */}
              <div className="mv-form-group">
                <label className="mv-label" htmlFor="c-role">Role</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--mv-slate)', pointerEvents: 'none' }}><Shield size={15} /></span>
                  <select id="c-role" name="role" value={createForm.role}
                    onChange={handleCreateChange}
                    className={`mv-select${createErrors.role ? ' error' : ''}`}
                    style={{ paddingLeft: 42 }}>
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <FieldErr msg={createErrors.role} />
              </div>

              {/* Submit */}
              <div className="mv-form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit"
                  className={`mv-btn mv-btn-primary mv-btn-full ${creating ? 'mv-btn-loading' : ''}`}
                  disabled={creating}>
                  {creating ? <><span className="mv-spinner" /><span>Creating…</span></> : <><Plus size={16} /> Create Account</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Staff list */}
      <div className="mv-card animate-fade-up" style={{ animationDelay: '120ms' }}>
        <div className="mv-card-header" style={{ flexWrap: 'wrap', gap: '0.875rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, background: '#dbeafe', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} color="#2563eb" />
            </div>
            <div>
              <p className="mv-card-title">Staff List</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--mv-slate)', marginTop: 1 }}>{staffList.length} total accounts</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginLeft: 'auto' }}>
            {/* Search */}
            <div className="mv-search" style={{ minWidth: 180 }}>
              <span className="mv-search-icon"><Search size={14} /></span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" />
            </div>
            {/* Role filter */}
            <select className="mv-select" style={{ height: 38, width: 'auto', minWidth: 120 }}
              value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="All">All roles</option>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
            {/* Refresh */}
            <button onClick={load} disabled={listLoading}
              className="mv-btn mv-btn-ghost mv-btn-sm" style={{ gap: 6, padding: '0 12px' }}>
              <RefreshCw size={14} className={listLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {listLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '2rem 1.5rem', color: 'var(--mv-slate)' }}>
            <span className="mv-spinner" style={{ borderTopColor: 'var(--mv-teal)', borderColor: 'var(--mv-border)' }} /> Loading staff…
          </div>
        ) : filtered.length === 0 ? (
          <div className="mv-empty">
            <div className="mv-empty-icon"><Users size={26} /></div>
            <p className="mv-empty-title">No staff found</p>
            <p className="mv-empty-sub">{search || roleFilter !== 'All' ? 'Try adjusting your search or filter.' : 'Create the first staff account above.'}</p>
          </div>
        ) : (
          <>
            <div className="mv-table-wrap">
              <table className="mv-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(s => {
                    const id  = s._id || s.id;
                    const ini = (s.fullName || '?').split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
                    const rs  = ROLE_STYLE[s.role] || { cls: 'mv-badge-gray', label: s.role };
                    return (
                      <tr key={id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,var(--mv-teal),var(--mv-teal-glow))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'white', flexShrink: 0 }}>{ini}</div>
                            <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--mv-slate-900)' }}>{s.fullName}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--mv-slate)' }}>{s.email}</td>
                        <td><span className={`mv-badge ${rs.cls}`}>{rs.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => startEdit(s)}
                              className="mv-btn mv-btn-ghost mv-btn-sm" style={{ gap: 5, color: 'var(--mv-warning)' }}
                              title="Edit">
                              <Edit2 size={13} /> Edit
                            </button>
                            <button onClick={() => handleDelete(s)}
                              className="mv-btn mv-btn-ghost mv-btn-sm" style={{ gap: 5, color: 'var(--mv-danger)' }}
                              title="Delete">
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ padding: '0.875rem 1.375rem', borderTop: '1px solid var(--mv-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--mv-slate)' }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="mv-btn mv-btn-ghost mv-btn-sm" style={{ padding: '0 10px' }}>
                  <ChevronLeft size={15} />
                </button>
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--mv-slate-dark)', padding: '0 4px' }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="mv-btn mv-btn-ghost mv-btn-sm" style={{ padding: '0 10px' }}>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Edit modal */}
      {isEditing && (
        <div className="mv-overlay">
          <div className="mv-modal animate-scale-in" style={{ maxWidth: 480 }}>
            <div className="mv-modal-header">
              <p className="mv-modal-title">Edit Staff Member</p>
              <button onClick={cancelEdit} className="mv-btn mv-btn-ghost mv-btn-sm" style={{ padding: '0 8px', border: 'none' }}>
                <X size={18} />
              </button>
            </div>
            <div className="mv-modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="e-fullName">Full Name</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><User size={15} /></span>
                    <input id="e-fullName" name="fullName" type="text" value={editForm.fullName}
                      onChange={handleEditChange} placeholder="Full name"
                      className={`mv-input${editErrors.fullName ? ' error' : ''}`} />
                  </div>
                  <FieldErr msg={editErrors.fullName} />
                </div>

                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="e-email">Email Address</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><Mail size={15} /></span>
                    <input id="e-email" name="email" type="email" value={editForm.email}
                      onChange={handleEditChange} placeholder="email@example.com"
                      className={`mv-input${editErrors.email ? ' error' : ''}`} />
                  </div>
                  <FieldErr msg={editErrors.email} />
                </div>

                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="e-role">Role</label>
                  <select id="e-role" name="role" value={editForm.role}
                    onChange={handleEditChange} className="mv-select">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <FieldErr msg={editErrors.role} />
                </div>

                <div className="mv-modal-footer" style={{ padding: '0', paddingTop: '0.5rem' }}>
                  <button type="button" onClick={cancelEdit} className="mv-btn mv-btn-ghost" style={{ flex: 1 }}>Cancel</button>
                  <button type="submit"
                    className={`mv-btn mv-btn-primary ${editLoading ? 'mv-btn-loading' : ''}`}
                    disabled={editLoading} style={{ flex: 1 }}>
                    {editLoading ? <><span className="mv-spinner" /><span>Saving…</span></> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
