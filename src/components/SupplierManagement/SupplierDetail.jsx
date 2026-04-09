import React, { useState, useEffect } from 'react';

const SupplierDetail = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: '', contact_person: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch('/api/supplier-management/suppliers');
    const data = await res.json();
    if (data.success) setSuppliers(data.suppliers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/supplier-management/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) { setSuccess(true); fetchSuppliers(); setFormData({ name: '', contact_person: '', email: '', phone: '', address: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to create supplier'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    await fetch(`/api/supplier-management/suppliers/${id}`, { method: 'DELETE' });
    fetchSuppliers();
  };

  return (
    <div className="page-container">
      <h1>Supplier Details</h1>
      <div className="card">
        <h3>Add New Supplier</h3>
        {success && <div className="success">Supplier added!</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group"><label>Company Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
          <div className="form-group"><label>Contact Person</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({...formData, contact_person: e.target.value})} /></div>
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
          <div className="form-group"><label>Phone</label><input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
          <div className="form-group"><label>Address</label><input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></div>
          <div><button type="submit" className="btn btn-primary">Add Supplier</button></div>
        </form>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Address</th><th>Actions</th></tr></thead>
        <tbody>{suppliers.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.contact_person}</td><td>{s.email}</td><td>{s.phone}</td><td>{s.address}</td><td><button className="btn btn-danger" onClick={() => handleDelete(s.id)}>Delete</button></td></tr>)}</tbody>
      </table>
    </div>
  );
};

export default SupplierDetail;