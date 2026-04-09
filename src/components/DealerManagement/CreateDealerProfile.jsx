import React, { useState } from 'react';

const CreateDealerProfile = () => {
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dealer-management/create-dealer-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setFormData({ name: '', contact_person: '', email: '', phone: '', address: '', password: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to create dealer profile');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2>Create Dealer Profile</h2>
        {success && <div className="success">Dealer created successfully!</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Contact Person</label>
            <input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Default: dealer123" />
          </div>
          <button type="submit" className="btn btn-primary">Create Dealer</button>
        </form>
      </div>
    </div>
  );
};

export default CreateDealerProfile;