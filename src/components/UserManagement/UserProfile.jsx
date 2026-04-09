import React, { useState, useEffect } from 'react';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/user-management/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user);
          setFormData({ name: data.user.name, email: data.user.email || '', phone: data.user.phone || '' });
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/user-management/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2>User Profile</h2>
        {user && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={user.username} disabled />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input type="text" value={user.role} disabled />
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
            {error && <div className="error">{error}</div>}
            {success && <div className="success">Profile updated successfully!</div>}
            <button type="submit" className="btn btn-primary">Update Profile</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;