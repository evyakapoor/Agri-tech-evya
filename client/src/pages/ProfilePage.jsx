import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/client.js';

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    preferredLanguage: user?.preferredLanguage || 'en',
    district: user?.location?.district || '',
    state: user?.location?.state || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg({ text: '', type: '' });

    try {
      const res = await api.put('/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        preferredLanguage: profileData.preferredLanguage,
        location: {
          district: profileData.district,
          state: profileData.state,
        },
      });

      if (res.data?.success) {
        updateUser(res.data.user);
        setProfileMsg({ text: 'Profile details updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({ text: err.message || 'Failed to update profile.', type: 'danger' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ text: 'New password and confirmation do not match.', type: 'danger' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters.', type: 'danger' });
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data?.success) {
        setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({ text: err.message || 'Failed to update password.', type: 'danger' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold text-forest mb-1">User Profile & Account Settings</h2>
        <p className="text-muted small">Manage your personal credentials, contact info, and language preferences</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card card-agro p-4 shadow-sm border-0">
            <h5 className="fw-bold text-forest mb-3">Personal & Farm Location Information</h5>

            {profileMsg.text && (
              <div className={`alert alert-${profileMsg.type} small py-2`} role="alert">
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Email Address</label>
                <input
                  type="email"
                  className="form-control bg-light"
                  disabled
                  value={user?.email || ''}
                />
                <small className="text-muted">Email address is your account identifier and cannot be changed directly.</small>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">Interface Language</label>
                  <select
                    className="form-select"
                    value={profileData.preferredLanguage}
                    onChange={(e) => setProfileData({ ...profileData, preferredLanguage: e.target.value })}
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">District / Region</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.district}
                    onChange={(e) => setProfileData({ ...profileData, district: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-dark">State</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-forest px-4" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card card-agro p-4 shadow-sm border-0 mb-4">
            <h5 className="fw-bold text-forest mb-3">Change Security Password</h5>

            {passwordMsg.text && (
              <div className={`alert alert-${passwordMsg.type} small py-2`} role="alert">
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-dark">New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  minLength={6}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-dark">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  required
                  minLength={6}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-outline-forest w-100" disabled={passwordLoading}>
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>

          <div className="card card-agro p-3 bg-light border-0">
            <h6 className="fw-bold text-forest mb-2">Account Role & Privileges</h6>
            <div className="d-flex align-items-center justify-content-between">
              <span className="small text-muted">Current Role:</span>
              <span className={`badge ${user?.role === 'admin' ? 'bg-danger' : 'bg-success'} text-capitalize`}>
                {user?.role}
              </span>
            </div>
            <div className="d-flex align-items-center justify-content-between mt-2">
              <span className="small text-muted">Member Since:</span>
              <span className="small text-dark fw-semibold">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
