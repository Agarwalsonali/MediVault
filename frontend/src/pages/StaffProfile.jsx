import { useEffect, useRef, useState } from 'react';
import { fetchMyProfile, updateMyProfile, uploadMyProfileImage, removeMyProfileImage } from '../services/userService.js';
import { getRole } from '../services/authService.js';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, Shield, Edit3, Camera } from 'lucide-react';

const INIT = { fullName: '', email: '', newPassword: '', confirmPassword: '' };

const getRoleBadgeClass = (role) => {
  if (role === 'Nurse') return 'mv-badge-teal';
  if (role === 'Doctor') return 'mv-badge-purple';
  return 'mv-badge-blue';
};

export default function StaffProfile() {
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showCon, setShowCon] = useState(false);
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [role, setRole] = useState(getRole() || 'Staff');
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMyProfile();
        setForm((p) => ({ ...p, fullName: data?.user?.fullName || '', email: data?.user?.email || '' }));
        setAvatarUrl(data?.user?.avatarUrl || '');
        setRole(data?.user?.role || getRole() || 'Staff');
      } catch (e) {
        setErrMsg(e.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
    setSuccess('');
    setErrMsg('');
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.';
    if (form.newPassword && form.newPassword.length < 8) e.newPassword = 'Min 8 characters.';
    if (form.newPassword && form.newPassword !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ve = validate();
    if (Object.keys(ve).length) {
      setErrors(ve);
      return;
    }

    setSaving(true);
    setSuccess('');
    setErrMsg('');
    try {
      const res = await updateMyProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.newPassword,
      });
      setSuccess(res?.message || 'Profile updated successfully.');
      setForm((p) => ({ ...p, newPassword: '', confirmPassword: '' }));
      setEditing(false);
    } catch (e2) {
      setErrMsg(e2.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const openImagePicker = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrMsg('Please select a valid image file.');
      e.target.value = '';
      return;
    }

    setUploadingImage(true);
    setErrMsg('');
    setSuccess('');

    try {
      const res = await uploadMyProfileImage(file);
      setAvatarUrl(res?.avatarUrl || res?.user?.avatarUrl || '');
      setSuccess(res?.message || 'Profile image updated successfully.');
    } catch (error) {
      setErrMsg(error.message || 'Failed to upload profile image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!avatarUrl) return;

    setUploadingImage(true);
    setErrMsg('');
    setSuccess('');

    try {
      const res = await removeMyProfileImage();
      setAvatarUrl(res?.avatarUrl || res?.user?.avatarUrl || '');
      setSuccess(res?.message || 'Profile image removed successfully.');
    } catch (error) {
      setErrMsg(error.message || 'Failed to remove profile image.');
    } finally {
      setUploadingImage(false);
    }
  };

  const initials = form.fullName.trim().split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'ST';

  return (
    <div className="dash-page">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 className="dash-page-title">Staff Profile</h1>
        <p className="dash-page-subtitle">Manage your staff account details and credentials</p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--mv-slate)', padding: '3rem' }}>
          <span className="mv-spinner" style={{ borderTopColor: 'var(--mv-teal)', borderColor: 'var(--mv-border)' }} />
          Loading profile…
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: 860 }}>
          <div className="mv-card animate-fade-up" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            <div style={{ width: 88, margin: '0 auto 1rem' }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, var(--mv-teal), var(--mv-teal-glow))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(13,148,136,0.32)',
                  fontWeight: 700,
                  fontSize: '1.75rem',
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>

              <button
                type="button"
                onClick={openImagePicker}
                className="mv-btn mv-btn-outline"
                disabled={uploadingImage}
                style={{
                  display: 'flex',
                  marginTop: '0.6rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.72rem',
                  lineHeight: 1.2,
                  gap: 6,
                  whiteSpace: 'nowrap',
                  marginInline: 'auto',
                }}
              >
                <Camera size={12} />
                {uploadingImage ? 'Uploading...' : 'Edit Image'}
              </button>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span className={`mv-badge ${getRoleBadgeClass(role)}`}><Shield size={11} /> {role}</span>
              <span className="mv-badge mv-badge-teal"><CheckCircle size={11} /> Verified</span>
            </div>

            <div style={{ borderTop: '1px solid var(--mv-border)', paddingTop: '1.25rem' }}>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="mv-btn mv-btn-ghost mv-btn-full"
                  disabled={uploadingImage}
                  style={{ marginBottom: '0.5rem' }}
                >
                  {uploadingImage ? 'Removing image...' : 'Remove Image'}
                </button>
              )}
              <button onClick={() => setEditing((e) => !e)} className="mv-btn mv-btn-outline mv-btn-full" style={{ gap: 8 }}>
                <Edit3 size={15} /> {editing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div className="mv-card animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="mv-card-header">
              <p className="mv-card-title">Account Details</p>
              {!editing && <span className="mv-badge mv-badge-gray" style={{ fontSize: '0.72rem' }}>Read-only</span>}
            </div>
            <div className="mv-card-body">
              {success && (
                <div className="mv-alert mv-alert-success animate-fade-in" style={{ marginBottom: '1.125rem' }}>
                  <CheckCircle size={15} />
                  <span>{success}</span>
                </div>
              )}
              {errMsg && (
                <div className="mv-alert mv-alert-error animate-fade-in" style={{ marginBottom: '1.125rem' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <span>{errMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="fullName">Full Name</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><User size={15} /></span>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      disabled={!editing}
                      className="mv-input"
                    />
                  </div>
                </div>

                <div className="mv-form-group">
                  <label className="mv-label" htmlFor="email">Email Address</label>
                  <div className="mv-input-wrap">
                    <span className="mv-input-icon"><Mail size={15} /></span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="staff@example.com"
                      disabled={!editing}
                      className={`mv-input${errors.email ? ' error' : ''}`}
                    />
                  </div>
                  {errors.email && <p className="mv-field-error"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>{errors.email}</p>}
                </div>

                {editing && (
                  <>
                    <div style={{ borderTop: '1px solid var(--mv-border)', margin: '1rem 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -10, left: 12, background: 'var(--mv-white)', padding: '0 6px', fontSize: '0.72rem', color: 'var(--mv-slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Password</span>
                    </div>

                    <div className="mv-form-group">
                      <label className="mv-label" htmlFor="newPassword">New Password <span style={{ color: 'var(--mv-slate)', fontWeight: 400 }}>(optional)</span></label>
                      <div className="mv-input-wrap">
                        <span className="mv-input-icon"><Lock size={15} /></span>
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={showNew ? 'text' : 'password'}
                          value={form.newPassword}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current"
                          className={`mv-input${errors.newPassword ? ' error' : ''}`}
                        />
                        <button type="button" className="mv-input-suffix" onClick={() => setShowNew((p) => !p)}>
                          {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.newPassword && <p className="mv-field-error"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>{errors.newPassword}</p>}
                    </div>

                    <div className="mv-form-group">
                      <label className="mv-label" htmlFor="confirmPassword">Confirm Password</label>
                      <div className="mv-input-wrap">
                        <span className="mv-input-icon"><Lock size={15} /></span>
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showCon ? 'text' : 'password'}
                          value={form.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repeat new password"
                          className={`mv-input${errors.confirmPassword ? ' error' : ''}`}
                        />
                        <button type="button" className="mv-input-suffix" onClick={() => setShowCon((p) => !p)}>
                          {showCon ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mv-field-error"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /></svg>{errors.confirmPassword}</p>}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <button type="submit" className={`mv-btn mv-btn-primary ${saving ? 'mv-btn-loading' : ''}`} disabled={saving} style={{ flex: 1, minWidth: 120 }}>
                        {saving ? <><span className="mv-spinner" /><span>Saving…</span></> : 'Save Changes'}
                      </button>
                      <button type="button" onClick={() => setEditing(false)} className="mv-btn mv-btn-ghost" style={{ flex: 1, minWidth: 100 }}>
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
