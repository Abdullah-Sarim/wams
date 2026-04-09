import React, { useState, useEffect } from 'react';

const SupplierProfile = () => {
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSupplierInfo();
  }, []);

  const fetchSupplierInfo = async () => {
    try {
      const res = await fetch('/api/supplier-portal/supplier/profile');
      const data = await res.json();
      if (data.success) {
        setSupplier(data.supplier);
      }
    } catch (err) {}
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="supplier-profile">
      <h1>My Profile</h1>
      
      <div className="profile-card">
        <div className="profile-field">
          <label>Company Name:</label>
          <p>{supplier?.name}</p>
        </div>
        <div className="profile-field">
          <label>Contact Person:</label>
          <p>{supplier?.contact_person}</p>
        </div>
        <div className="profile-field">
          <label>Email:</label>
          <p>{supplier?.email || 'Not provided'}</p>
        </div>
        <div className="profile-field">
          <label>Phone:</label>
          <p>{supplier?.phone || 'Not provided'}</p>
        </div>
        <div className="profile-field">
          <label>Address:</label>
          <p>{supplier?.address || 'Not provided'}</p>
        </div>
      </div>

      <style>{`
        .supplier-profile h1 { color: #8e44ad; margin-bottom: 20px; }
        .profile-card { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; }
        .profile-field { margin-bottom: 15px; }
        .profile-field label { display: block; font-weight: 500; color: #666; margin-bottom: 5px; }
        .profile-field p { margin: 0; color: #333; font-size: 16px; }
      `}</style>
    </div>
  );
};

export default SupplierProfile;