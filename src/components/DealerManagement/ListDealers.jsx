import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ListDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDealers();
  }, []);

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/dealer-management/dealers');
      const data = await res.json();
      if (data.success) {
        setDealers(data.dealers);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dealer?')) return;
    try {
      await fetch(`/api/dealer-management/delete-dealer-profile/${id}`, { method: 'DELETE' });
      fetchDealers();
    } catch (err) {}
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dealer Management</h1>
        <Link to="/dealer-management/create-dealer-profile" className="btn btn-primary">➕ Add New Dealer</Link>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dealers.map(dealer => (
              <tr key={dealer.id}>
                <td>{dealer.id}</td>
                <td>{dealer.name}</td>
                <td>{dealer.contact_person || '-'}</td>
                <td>{dealer.email || '-'}</td>
                <td>{dealer.phone || '-'}</td>
                <td>{dealer.address || '-'}</td>
                <td>
                  <Link to={`/dealer-management/update-dealer-profile/${dealer.id}`} className="btn btn-sm btn-secondary">Edit</Link>
                  <button onClick={() => handleDelete(dealer.id)} className="btn btn-sm btn-danger" style={{ marginLeft: '5px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dealers.length === 0 && <p className="no-data">No dealers found. Add a new dealer to get started.</p>}
      </div>

      <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .page-header h1 { margin: 0; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #3498db; color: white; }
        tr:hover { background: #f5f5f5; }
        .btn-sm { padding: 5px 10px; font-size: 12px; }
        .btn-danger { background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn-secondary { background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; }
        .no-data { text-align: center; padding: 40px; color: #999; }
      `}</style>
    </div>
  );
};

export default ListDealers;
