import React, { useState } from 'react';

const ChangePassword = () => {
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      return setError('New passwords do not match');
    }
    setError('');
    
    try {
      const response = await fetch('/api/system-authorization/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 500, margin: '50px auto' }}>
        <h2>Change Password</h2>
        {success ? (
          <div className="success">Password changed successfully!</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={formData.currentPassword} onChange={(e) => setFormData({...formData, currentPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={formData.newPassword} onChange={(e) => setFormData({...formData, newPassword: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn btn-primary">Change Password</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangePassword;