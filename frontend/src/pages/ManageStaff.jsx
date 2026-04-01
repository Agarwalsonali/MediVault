import { useEffect, useMemo, useState } from 'react';
import { createStaffUser, deleteStaffUser, fetchStaffUsers, updateStaffUser } from '../services/adminService.js';

const STAFF_ROLES = ['Nurse', 'Staff'];

const initialCreateForm = {
  fullName: '',
  email: '',
  role: 'Nurse',
};

const initialEditForm = {
  id: '',
  fullName: '',
  email: '',
  role: 'Nurse',
};

function Alert({ type = 'success', message }) {
  if (!message) return null;

  const styles =
    type === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>{message}</div>;
}

function RoleBadge({ role }) {
  const badgeClass = role === 'Staff' ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${badgeClass}`}>{role}</span>;
}

export default function ManageStaff() {
  const [createForm, setCreateForm] = useState(initialCreateForm);
  const [createErrors, setCreateErrors] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const filteredStaff = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return staffList.filter((staff) => {
      const matchesRole = roleFilter === 'All' ? true : staff.role === roleFilter;
      const searchable = `${staff.fullName || ''} ${staff.email || ''}`.toLowerCase();
      const matchesSearch = query ? searchable.includes(query) : true;

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, searchTerm, staffList]);

  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));

  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [currentPage, filteredStaff]);

  const loadStaffList = async () => {
    setListLoading(true);
    try {
      const response = await fetchStaffUsers();
      setStaffList(response?.staff || []);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to load staff list.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    loadStaffList();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const validateCreateForm = () => {
    const nextErrors = {};

    if (!createForm.fullName.trim()) nextErrors.fullName = 'Full name is required.';

    if (!createForm.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email)) nextErrors.email = 'Please enter a valid email address.';

    if (!STAFF_ROLES.includes(createForm.role)) nextErrors.role = 'Role must be Nurse or Staff.';

    return nextErrors;
  };

  const validateEditForm = () => {
    const nextErrors = {};

    if (!editForm.fullName.trim()) nextErrors.fullName = 'Full name is required.';

    if (!editForm.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) nextErrors.email = 'Please enter a valid email address.';

    if (!STAFF_ROLES.includes(editForm.role)) nextErrors.role = 'Role must be Nurse or Staff.';

    return nextErrors;
  };

  const handleCreateChange = (event) => {
    const { name, value } = event.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
    setCreateErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCreateSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateCreateForm();
    if (Object.keys(validationErrors).length > 0) {
      setCreateErrors(validationErrors);
      return;
    }

    setCreateLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await createStaffUser({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
        role: createForm.role,
      });

      setSuccessMessage('Staff account created. Invite email sent successfully.');
      setCreateForm(initialCreateForm);
      setCreateErrors({});
      await loadStaffList();
    } catch (error) {
      setErrorMessage(error.message || 'Unable to create staff account.');
    } finally {
      setCreateLoading(false);
    }
  };

  const startEdit = (staff) => {
    setIsEditing(true);
    setEditForm({
      id: staff._id || staff.id,
      fullName: staff.fullName || '',
      email: staff.email || '',
      role: staff.role || 'Nurse',
    });
    setEditErrors({});
    setSuccessMessage('');
    setErrorMessage('');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm(initialEditForm);
    setEditErrors({});
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateEditForm();
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    setEditLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await updateStaffUser(editForm.id, {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim().toLowerCase(),
        role: editForm.role,
      });

      setSuccessMessage('Staff updated successfully');
      cancelEdit();
      await loadStaffList();
    } catch (error) {
      setErrorMessage(error.message || 'Unable to update staff account.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (staff) => {
    const id = staff._id || staff.id;
    const confirmDelete = window.confirm(`Delete ${staff.fullName} (${staff.role})?`);
    if (!confirmDelete) return;

    setSuccessMessage('');
    setErrorMessage('');

    try {
      await deleteStaffUser(id);
      setSuccessMessage('Staff deleted successfully');
      await loadStaffList();
    } catch (error) {
      setErrorMessage(error.message || 'Unable to delete staff account.');
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Manage Staff</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">Create, invite, update, and remove Nurse or Staff accounts.</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Create Staff Account</h2>

        <div className="mt-4 space-y-3">
          <Alert type="success" message={successMessage} />
          <Alert type="error" message={errorMessage} />
        </div>

        <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
          <div>
            <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input id="fullName" name="fullName" type="text" value={createForm.fullName} onChange={handleCreateChange} placeholder="Enter staff full name" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
            {createErrors.fullName && <p className="mt-1 text-xs font-medium text-rose-600">{createErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
            <input id="email" name="email" type="email" value={createForm.email} onChange={handleCreateChange} placeholder="staff@example.com" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
            {createErrors.email && <p className="mt-1 text-xs font-medium text-rose-600">{createErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-700">Staff Role</label>
            <select id="role" name="role" value={createForm.role} onChange={handleCreateChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200">
              <option value="Nurse">Nurse</option>
              <option value="Staff">Staff</option>
            </select>
            {createErrors.role && <p className="mt-1 text-xs font-medium text-rose-600">{createErrors.role}</p>}
          </div>

          <div className="md:col-span-2 pt-2">
            <button type="submit" disabled={createLoading} className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400">
              {createLoading ? 'Creating Staff...' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Staff List</h2>
          <button
            type="button"
            onClick={loadStaffList}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="staffSearch" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</label>
            <input
              id="staffSearch"
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name or email"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>

          <div>
            <label htmlFor="roleFilter" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Filter by role</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="All">All roles</option>
              <option value="Staff">Staff</option>
              <option value="Nurse">Nurse</option>
            </select>
          </div>
        </div>

        {listLoading ? (
          <p className="mt-4 text-sm text-slate-600">Loading staff list...</p>
        ) : filteredStaff.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            No staff found
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-170 text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-2 py-2">Full Name</th>
                  <th className="px-2 py-2">Email</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStaff.map((staff) => {
                  const id = staff._id || staff.id;
                  return (
                    <tr key={id} className="border-b border-slate-100 last:border-none">
                      <td className="px-2 py-3 text-sm font-medium text-slate-900">{staff.fullName}</td>
                      <td className="px-2 py-3 text-sm text-slate-700">{staff.email}</td>
                      <td className="px-2 py-3 text-sm"><RoleBadge role={staff.role} /></td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(staff)}
                            className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(staff)}
                            className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredStaff.length)} of {filteredStaff.length}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Prev
                </button>
                <span className="text-xs font-medium text-slate-600">Page {currentPage} of {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900">Edit Staff</h3>
              <button type="button" onClick={cancelEdit} className="rounded-lg px-2 py-1 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                Close
              </button>
            </div>

            <form className="mt-4 grid gap-4" onSubmit={handleEditSubmit}>
              <div>
                <label htmlFor="editFullName" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
                <input id="editFullName" name="fullName" type="text" value={editForm.fullName} onChange={handleEditChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                {editErrors.fullName && <p className="mt-1 text-xs font-medium text-rose-600">{editErrors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="editEmail" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                <input id="editEmail" name="email" type="email" value={editForm.email} onChange={handleEditChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
                {editErrors.email && <p className="mt-1 text-xs font-medium text-rose-600">{editErrors.email}</p>}
              </div>

              <div>
                <label htmlFor="editRole" className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select id="editRole" name="role" value={editForm.role} onChange={handleEditChange} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200">
                  <option value="Nurse">Nurse</option>
                  <option value="Staff">Staff</option>
                </select>
                {editErrors.role && <p className="mt-1 text-xs font-medium text-rose-600">{editErrors.role}</p>}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button type="submit" disabled={editLoading} className="rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-400">
                  {editLoading ? 'Updating...' : 'Save Changes'}
                </button>
                <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
