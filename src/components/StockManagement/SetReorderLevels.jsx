import React, { useState } from 'react';

const SetReorderLevels = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', reorder_level: '', min_stock_level: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    fetch('/api/stock-management/track-inventory')
      .then(res => res.json())
      .then(data => { if (data.success) setProducts(data.inventory); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/stock-management/set-reorder-levels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Reorder levels set successfully!');
        setFormData({ product_id: '', reorder_level: '', min_stock_level: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to set reorder levels');
    }
  };

  return (
    <div className="page-container">
      <h1>Set Reorder Levels</h1>
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reorder Level</label>
            <input type="number" value={formData.reorder_level} onChange={(e) => setFormData({...formData, reorder_level: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Minimum Stock Level</label>
            <input type="number" value={formData.min_stock_level} onChange={(e) => setFormData({...formData, min_stock_level: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary">Set Levels</button>
        </form>
      </div>
    </div>
  );
};

export default SetReorderLevels;