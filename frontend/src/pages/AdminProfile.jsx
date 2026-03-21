import { useEffect, useState } from 'react';
import { fetchMyProfile, updateMyProfile } from '../services/userService.js';

const initialForm = {
  fullName: '',
  email: '',
  newPassword: '',
  confirmPassword: '',
};

function Alert({ type = 'success', message }) {
  if (!message) return null;

  const styles =
    type === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-emerald-200 bg-emerald-50 text-emerald-700';

  return <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${styles}`}>{message}</div>;
}

export default function AdminProfile() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const data = await fetchMyProfile();
        setForm((prev) => ({
          ...prev,
          fullName: data?.user?.fullName || '',
          email: data?.user?.email || '',
        }));
      } catch (error) {
        setErrorMessage(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (form.newPassword && form.newPassword.length < 8) {
      nextErrors.newPassword = 'Password must be at least 8 characters.';
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await updateMyProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.newPassword,
      });

      setSuccessMessage(response?.message || 'Profile updated successfully');
      setForm((prev) => ({
        ...prev,
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Admin Profile</h1>
        <p className="mt-2 text-sm text-slate-600 sm:text-base">Update your account details</p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Alert type="success" message={successMessage} />
        <Alert type="error" message={errorMessage} />

        {loading ? (
          <p className="text-sm text-slate-600">Loading profile...</p>
        ) : (
          <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
              <input id="fullName" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="Your full name" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">New Password (optional)</label>
              <input id="newPassword" name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="Leave blank to keep current password" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.newPassword && <p className="mt-1 text-xs font-medium text-rose-600">{errors.newPassword}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">Confirm Password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200" />
              {errors.confirmPassword && <p className="mt-1 text-xs font-medium text-rose-600">{errors.confirmPassword}</p>}
            </div>

            <div className="md:col-span-2 pt-2">
              <button type="submit" disabled={saving} className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-sky-400">
                {saving ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
