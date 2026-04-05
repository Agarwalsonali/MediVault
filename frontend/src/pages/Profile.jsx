import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getFullName, getLoginEmail, getRole } from '../services/authService.js';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from '../services/profileService.js';
import { User, Mail, Shield, CheckCircle, Lock, Edit3, AlertCircle, Save, X, Camera, Trash2 } from 'lucide-react';

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--mv-border)' }}>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'var(--mv-teal-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--mv-slate-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const role = getRole() || 'Patient';
  const fullName = getFullName() || 'Signed-in User';
  const email = getLoginEmail() || '—';
  const initials = fullName.trim().split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
        setFormData({
          age: data.age || '',
          gender: data.gender || '',
          bloodGroup: data.bloodGroup || '',
          allergies: data.allergies || ''
        });
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast.error(error.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (formData.age !== '' && formData.age !== null) {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
        newErrors.age = 'Age must be between 0 and 150';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const updated = await updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar must be smaller than 5MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only image files are allowed (jpg, png, gif, webp)');
      return;
    }

    try {
      setUploadingAvatar(true);
      const updated = await uploadAvatar(file);
      setProfile(updated);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('Are you sure you want to delete your avatar?')) return;

    try {
      setDeletingAvatar(true);
      const updated = await deleteAvatar();
      setProfile(updated);
      toast.success('Avatar removed successfully');
    } catch (error) {
      console.error('Failed to delete avatar:', error);
      toast.error(error.message || 'Failed to delete avatar');
    } finally {
      setDeletingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="dash-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'inline-block', width: 40, height: 40, border: '4px solid var(--mv-border)', borderTopColor: 'var(--mv-teal)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dash-page">
        <div className="profile-page-header hidden lg:block" style={{ marginBottom: '1.75rem' }}>
          <h1 className="dash-page-title">My Profile</h1>
          <p className="dash-page-subtitle">Manage your health information and account details</p>
        </div>

      {/* Complete Profile Prompt */}
      {profile && !profile.isProfileComplete && (
        <div className="animate-fade-up profile-complete-banner" style={{
          background: 'linear-gradient(120deg, rgba(251, 146, 60, 0.08), rgba(248, 113, 113, 0.08))',
          border: '1px solid rgba(251, 146, 60, 0.3)',
          borderRadius: 'var(--radius-lg)',
          padding: 'clamp(0.75rem, 3vw, 1.25rem)',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem'
        }}>
          <AlertCircle size={20} style={{ color: 'var(--mv-warning)', marginTop: 3, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: 'var(--mv-warning-dark)', marginBottom: 4 }}>Complete Your Profile</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--mv-slate)', lineHeight: 1.6 }}>
              Add your age, gender, and blood group to complete your medical profile. This information helps healthcare providers better serve you.
            </p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mv-btn mv-btn-primary mv-btn-sm"
                style={{ marginTop: '0.75rem', gap: 6 }}
              >
                <Edit3 size={14} /> Complete Now
              </button>
            )}
          </div>
        </div>
      )}

      <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)', maxWidth: 860, width: '100%' }}>

        {/* Avatar card */}
        <div className="mv-card animate-fade-up profile-avatar-card" style={{ textAlign: 'center', padding: 'clamp(1rem, 5vw, 2rem) clamp(1rem, 4vw, 1.5rem)' }}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
            disabled={uploadingAvatar}
          />

          {/* Avatar with edit overlay */}
          <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 1rem' }}>
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={fullName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  boxShadow: '0 4px 20px rgba(13,148,136,0.3)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--mv-teal), var(--mv-teal-glow))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: 'white',
                  boxShadow: '0 4px 20px rgba(13,148,136,0.3)'
                }}
              >
                {initials}
              </div>
            )}
            {/* Edit button overlay */}
            <button
              onClick={triggerAvatarUpload}
              disabled={uploadingAvatar}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--mv-teal)',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(13,148,136,0.3)',
                opacity: uploadingAvatar ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
              title="Edit avatar"
            >
              {uploadingAvatar ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite'
                  }}
                />
              ) : (
                <Camera size={16} color="white" />
              )}
            </button>
          </div>

          <h2 className="profile-name" style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--mv-navy)', marginBottom: 4 }}>{fullName}</h2>
          <p className="profile-email" style={{ fontSize: '0.85rem', color: 'var(--mv-slate)', marginBottom: '1.25rem' }}>{email}</p>
          {profile?.avatar && (
            <button
              onClick={handleDeleteAvatar}
              disabled={deletingAvatar}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                color: 'var(--mv-red)',
                background: 'transparent',
                border: '1px solid var(--mv-red)',
                borderRadius: 'var(--radius-sm)',
                cursor: deletingAvatar ? 'not-allowed' : 'pointer',
                opacity: deletingAvatar ? 0.6 : 1,
                transition: 'all 0.2s ease',
                marginBottom: '1rem',
                fontWeight: 500
              }}
              title="Delete avatar"
            >
              <Trash2 size={14} />
              {deletingAvatar ? 'Removing...' : 'Remove Avatar'}
            </button>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="mv-badge mv-badge-teal">
              <CheckCircle size={11} /> Verified
            </span>
            <span className="mv-badge mv-badge-blue">{role}</span>
          </div>
        </div>

        {/* Account Information card */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '100ms' }}>
          <div className="mv-card-header">
            <p className="mv-card-title">Account Information</p>
          </div>
          <div className="mv-card-body">
            <InfoRow icon={<User size={17} color="var(--mv-teal)" />} label="Full Name" value={fullName} />
            <InfoRow icon={<Mail size={17} color="var(--mv-teal)" />} label="Email Address" value={email} />
            <InfoRow icon={<Shield size={17} color="var(--mv-teal)" />} label="Role" value={role} />
          </div>
        </div>

        {/* Health Information card */}
        <div className="mv-card animate-fade-up" style={{ animationDelay: '150ms', gridColumn: '1 / -1' }}>
          <div className="mv-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="mv-card-title">Health Information</p>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mv-btn mv-btn-ghost mv-btn-sm"
                style={{ gap: 6 }}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>
          <div className="mv-card-body">
            {isEditing ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
                {/* Age Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--mv-slate)', marginBottom: 6 }}>
                    Age (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="Enter your age"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: errors.age ? '1px solid var(--mv-error)' : '1px solid var(--mv-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  {errors.age && <p style={{ fontSize: '0.75rem', color: 'var(--mv-error)', marginTop: 4 }}>{errors.age}</p>}
                </div>

                {/* Gender Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--mv-slate)', marginBottom: 6 }}>
                    Gender (Optional)
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid var(--mv-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--mv-slate)', marginBottom: 6 }}>
                    Blood Group (Optional)
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      border: '1px solid var(--mv-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Allergies Field (full width) */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--mv-slate)', marginBottom: 6 }}>
                    Allergies (Optional)
                  </label>
                  <textarea
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    placeholder="List any allergies (e.g., Penicillin, Peanuts)"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--mv-border)',
                      borderRadius: 'var(--radius)',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="profile-action-buttons" style={{ gridColumn: '1 / -1', display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', flexDirection: 'row' }}>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        age: profile.age || '',
                        gender: profile.gender || '',
                        bloodGroup: profile.bloodGroup || '',
                        allergies: profile.allergies || ''
                      });
                      setErrors({});
                    }}
                    className="mv-btn mv-btn-outline"
                    style={{ gap: 6, flex: 1, minWidth: 100 }}
                    disabled={saving}
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="mv-btn mv-btn-primary"
                    style={{ gap: 6, flex: 1, minWidth: 100 }}
                    disabled={saving}
                  >
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <InfoRow icon={<User size={17} color="var(--mv-teal)" />} label="Age" value={profile?.age || 'Not provided'} />
                <InfoRow icon={<User size={17} color="var(--mv-teal)" />} label="Gender" value={profile?.gender || 'Not provided'} />
                <InfoRow icon={<User size={17} color="var(--mv-teal)" />} label="Blood Group" value={profile?.bloodGroup || 'Not provided'} />
                <div style={{ borderBottom: 'none', padding: '14px 0' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--mv-slate)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: 6 }}>Allergies</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--mv-slate-900)', lineHeight: 1.6 }}>
                    {profile?.allergies || 'No allergies recorded'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
