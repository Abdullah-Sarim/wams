import React, { useState, useEffect } from 'react';

const DealerProfile = () => {
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealerInfo();
  }, []);

  const fetchDealerInfo = async () => {
    try {
      const res = await fetch('/api/system-authorization/current-user');
      const data = await res.json();
      if (data.user) {
        setDealer(data.user);
      }
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="dealer-profile">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        <div className="profile-field">
          <label>Company Name:</label>
          <p>{dealer?.name}</p>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <p>{dealer?.email || 'Not provided'}</p>
        </div>
        <div className="profile-field">
          <label>Phone:</label>
          <p>{dealer?.phone || 'Not provided'}</p>
        </div>
        <div className="profile-field">
          <label>Role:</label>
          <p>{dealer?.role}</p>
        </div>
      </div>

      <style>{`
        .dealer-profile h1 { color: #27ae60; margin-bottom: 20px; }
        .profile-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; }
        .profile-field { margin-bottom: 15px; }
        .profile-field label { display: block; font-weight: 500; color: #666; margin-bottom: 5px; }
        .profile-field p { margin: 0; color: #333; font-size: 16px; }
      `}</style>
    </div>
  );
};

export default DealerProfile;