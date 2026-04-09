import React, { useState, useEffect } from 'react';

const UpdateDealerProfile = () => {
  const [dealer, setDealer] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    fetch(`/api/dealer-management/dealers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDealer(data.dealer);
          setFormData({ name: data.dealer.name, contact_person: data.dealer.contact_person || '', email: data.dealer.email || '', phone: data.dealer.phone || '', address: data.dealer.address || '' });
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const id = window.location.pathname.split('/').pop();
    try {
      const response = await fetch(`/api/dealer-management/update-dealer-profile/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update dealer');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2>Update Dealer Profile</h2>
        {success && <div className="success">Dealer updated successfully!</div>}
        {error && <div className="error">{error}</div>}
        {dealer && (
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Company Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
            <div className="form-group"><label>Contact Person</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required /></div>
            <div className="form-group"><label>Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            <div className="form-group"><label>Address</label><textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
            <button type="submit" className="btn btn-primary">Update Dealer</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateDealerProfile;