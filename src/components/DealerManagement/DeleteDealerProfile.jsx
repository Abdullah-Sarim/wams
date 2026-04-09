import React, { useState, useEffect } from 'react';

const DeleteDealerProfile = () => {
  const [dealer, setDealer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const id = window.location.pathname.split('/').pop();
    fetch(`/api/dealer-management/dealers/${id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setDealer(data.dealer); });
  }, []);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this dealer?')) return;
    const id = window.location.pathname.split('/').pop();
    try {
      const response = await fetch(`/api/dealer-management/delete-dealer-profile/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => window.location.href = '/dealer-management/create-dealer-profile', 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete dealer');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 500, margin: '50px auto' }}>
        <h2>Delete Dealer Profile</h2>
        {success ? <div className="success">Dealer deleted successfully! Redirecting...</div> : (
          <>
            {dealer && <div><p><strong>Name:</strong> {dealer.name}</p><p><strong>Email:</strong> {dealer.email}</p></div>}
            {error && <div className="error">{error}</div>}
            <button onClick={handleDelete} className="btn btn-danger">Confirm Delete</button>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteDealerProfile;