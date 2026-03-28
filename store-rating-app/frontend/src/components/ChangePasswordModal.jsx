import { useState } from 'react';
import api from '../api/axios';

export default function ChangePasswordModal({ onClose }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    if (!form.currentPassword) return 'Current password is required';
    if (form.newPassword.length < 8 || form.newPassword.length > 16) return 'New password must be 8–16 characters';
    if (!/[A-Z]/.test(form.newPassword)) return 'New password must have at least one uppercase letter';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.newPassword)) return 'New password must have at least one special character';
    if (form.newPassword !== form.confirmPassword) return 'Passwords do not match';
    if (form.newPassword === form.currentPassword) return 'New password must be different from current password';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const validationError = validate();
    if (validationError) return setError(validationError);

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Change Password</h2>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={form.currentPassword}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>New Password <span className="text-muted">(8–16 chars, 1 uppercase, 1 special)</span></label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={16}
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
