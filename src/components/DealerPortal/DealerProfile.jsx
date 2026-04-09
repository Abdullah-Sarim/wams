import React, { useState, useEffect } from 'react';

const DealerProfile = () => {
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchDealerInfo();
  }, []);

  const fetchDealerInfo = async () => {
    try {
      const res = await fetch('/api/dealer-portal/dealer/profile');
      const data = await res.json();
      if (data.success) {
        setDealer(data.dealer);
        setFormData(data.dealer);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/dealer-management/update-dealer-profile/${dealer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
        setDealer(formData);
        setEditing(false);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {}
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dealer-profile">
      <div className="profile-header">
        <div className="avatar">
          {dealer?.name?.charAt(0).toUpperCase() || 'D'}
        </div>
        <div className="header-info">
          <h1>{dealer?.name}</h1>
          <span className="dealer-badge">🏪 Authorized Dealer</span>
        </div>
        {!editing && (
          <button onClick={() => setEditing(true)} className="edit-btn">✏️ Edit Profile</button>
        )}
      </div>

      {message && <div className="success-message">{message}</div>}

      <div className="profile-card">
        {editing ? (
          <form onSubmit={handleSubmit} className="edit-form">
            <h2>Edit Profile Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Company Name</label>
                <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Contact Person</label>
                <input type="text" name="contact_person" value={formData.contact_person || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
              </div>
              <div className="form-group full-width">
                <label>Address</label>
                <textarea name="address" value={formData.address || ''} onChange={handleChange} rows="3" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">💾 Save Changes</button>
              <button type="button" onClick={() => { setEditing(false); setFormData(dealer); }} className="btn btn-secondary">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h2>Profile Information</h2>
            <div className="info-grid">
              <div className="info-card">
                <span className="info-icon">🏢</span>
                <div className="info-content">
                  <label>Company Name</label>
                  <p>{dealer?.name || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-card">
                <span className="info-icon">👤</span>
                <div className="info-content">
                  <label>Contact Person</label>
                  <p>{dealer?.contact_person || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-card">
                <span className="info-icon">📧</span>
                <div className="info-content">
                  <label>Email Address</label>
                  <p>{dealer?.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-card">
                <span className="info-icon">📱</span>
                <div className="info-content">
                  <label>Phone Number</label>
                  <p>{dealer?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-card full-width">
                <span className="info-icon">📍</span>
                <div className="info-content">
                  <label>Address</label>
                  <p>{dealer?.address || 'Not provided'}</p>
                </div>
              </div>
              <div className="info-card">
                <span className="info-icon">📅</span>
                <div className="info-content">
                  <label>Member Since</label>
                  <p>{dealer?.created_at ? new Date(dealer.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              <div className="info-card">
                <span className="info-icon">🔑</span>
                <div className="info-content">
                  <label>Dealer ID</label>
                  <p>#{dealer?.id}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="security-section">
        <div className="security-card">
          <h3>🔒 Security</h3>
          <p>To change your password, please contact the administrator.</p>
          <div className="security-info">
            <span>Your account is secured with encrypted password.</span>
          </div>
        </div>
      </div>

      <style>{`
        .dealer-profile { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .profile-header { 
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
          padding: 30px; border-radius: 16px; color: white; margin-bottom: 25px;
          display: flex; align-items: center; gap: 20px;
        }
        .avatar { 
          width: 80px; height: 80px; background: white; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 36px; font-weight: bold; color: #27ae60;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .header-info { flex: 1; }
        .header-info h1 { margin: 0 0 8px; font-size: 28px; }
        .dealer-badge { 
          background: rgba(255,255,255,0.2); padding: 6px 15px; 
          border-radius: 20px; font-size: 14px; 
        }
        .edit-btn { 
          padding: 12px 25px; background: white; color: #27ae60; 
          border: none; border-radius: 8px; font-weight: 600; cursor: pointer;
          transition: transform 0.2s;
        }
        .edit-btn:hover { transform: scale(1.05); }
        
        .success-message { 
          background: #d4edda; color: #155724; padding: 15px; 
          border-radius: 8px; margin-bottom: 20px; text-align: center;
        }
        
        .profile-card { 
          background: white; padding: 30px; border-radius: 16px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin-bottom: 25px;
        }
        .profile-card h2 { margin: 0 0 25px; color: #2c3e50; font-size: 20px; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .info-card { 
          display: flex; gap: 15px; padding: 20px; background: #f8f9fa; 
          border-radius: 12px; 
        }
        .info-card.full-width { grid-column: 1 / -1; }
        .info-icon { 
          width: 45px; height: 45px; background: linear-gradient(135deg, #27ae60, #2ecc71); 
          border-radius: 10px; display: flex; align-items: center; justify-content: center; 
          font-size: 20px; flex-shrink: 0;
        }
        .info-content label { display: block; font-size: 12px; color: #7f8c8d; margin-bottom: 5px; }
        .info-content p { margin: 0; font-size: 16px; font-weight: 500; color: #2c3e50; }
        
        .edit-form .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-weight: 500; color: #555; }
        .form-group input, .form-group textarea { 
          padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 14px;
          transition: border-color 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #27ae60; outline: none; }
        
        .form-actions { margin-top: 25px; display: flex; gap: 15px; }
        .btn { padding: 12px 25px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
        .btn-primary { background: #27ae60; color: white; }
        .btn-secondary { background: #95a5a6; color: white; }
        
        .security-section { margin-bottom: 25px; }
        .security-card { 
          background: white; padding: 25px; border-radius: 16px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); 
        }
        .security-card h3 { margin: 0 0 10px; color: #2c3e50; }
        .security-card p { margin: 0 0 15px; color: #7f8c8d; }
        .security-info { 
          background: #f8f9fa; padding: 15px; border-radius: 8px; 
          color: #27ae60; font-weight: 500; 
        }
        
        .loading-container { text-align: center; padding: 50px; color: #7f8c8d; }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid #f3f3f3; 
          border-top: 4px solid #27ae60; border-radius: 50%; 
          animation: spin 1s linear infinite; margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .profile-header { flex-direction: column; text-align: center; }
          .info-grid { grid-template-columns: 1fr; }
          .edit-form .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default DealerProfile;
