import React, { useState, useEffect } from 'react';

const CreateManufacturingOrder = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', start_date: '', end_date: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/stock-management/track-inventory')
      .then(res => res.json())
      .then(data => { if (data.success) setProducts(data.inventory); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/manufacturing/create-manufacturing-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) { setSuccess('Order created!'); setFormData({ product_id: '', quantity: '', start_date: '', end_date: '', notes: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to create order'); }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2>Create Manufacturing Order</h2>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Product</label><select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required><option value="">Select</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
          <div className="form-group"><label>Quantity</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required /></div>
          <div className="form-group"><label>Start Date</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} /></div>
          <div className="form-group"><label>End Date</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} /></div>
          <div className="form-group"><label>Notes</label><input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
          <button type="submit" className="btn btn-primary">Create Order</button>
        </form>
      </div>
    </div>
  );
};

export default CreateManufacturingOrder;