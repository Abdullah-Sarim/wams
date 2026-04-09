import React, { useState } from 'react';

const UpdateStock = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', transaction_type: 'purchase', notes: '' });
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
      const response = await fetch('/api/stock-management/update-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setSuccess(`Stock updated! New stock: ${data.new_stock}`);
        setFormData({ product_id: '', quantity: '', transaction_type: 'purchase', notes: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update stock');
    }
  };

  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2>Update Stock</h2>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required>
              <option value="">Select Product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.product_name} (Current: {p.current_stock})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Transaction Type</label>
            <select value={formData.transaction_type} onChange={(e) => setFormData({...formData, transaction_type: e.target.value})}>
              <option value="purchase">Purchase</option>
              <option value="sale">Sale</option>
              <option value="production">Production</option>
              <option value="adjustment">Adjustment</option>
              <option value="return">Return</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary">Update Stock</button>
        </form>
      </div>
    </div>
  );
};

export default UpdateStock;