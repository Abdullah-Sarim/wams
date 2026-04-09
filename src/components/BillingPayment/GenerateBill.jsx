import React, { useState, useEffect } from 'react';

const GenerateBill = () => {
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([{ product_id: '', quantity: '', unit_price: '' }]);
  const [formData, setFormData] = useState({ dealer_id: '', bill_date: '', due_date: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [dRes, pRes] = await Promise.all([fetch('/api/dealer-management/dealers'), fetch('/api/stock-management/track-inventory')]);
      const [dData, pData] = await Promise.all([dRes.json(), pRes.json()]);
      if (dData.success) setDealers(dData.dealers);
      if (pData.success) setProducts(pData.inventory);
    };
    fetchData();
  }, []);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { product_id: '', quantity: '', unit_price: '' }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/billing-payment/generate-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, items })
      });
      const data = await res.json();
      if (data.success) { setSuccess(`Bill ${data.billNumber} generated!`); setItems([{ product_id: '', quantity: '', unit_price: '' }]); setFormData({ dealer_id: '', bill_date: '', due_date: '', notes: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to generate bill'); }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Generate Bill</h2>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group"><label>Dealer</label><select value={formData.dealer_id} onChange={(e) => setFormData({...formData, dealer_id: e.target.value})} required><option value="">Select</option>{dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="form-group"><label>Bill Date</label><input type="date" value={formData.bill_date} onChange={(e) => setFormData({...formData, bill_date: e.target.value})} /></div>
            <div className="form-group"><label>Due Date</label><input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} /></div>
            <div className="form-group"><label>Notes</label><input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
          </div>
          <h3>Bill Items</h3>
          {items.map((item, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <select value={item.product_id} onChange={(e) => handleItemChange(index, 'product_id', e.target.value)} required><option value="">Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select>
              <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
              <input type="number" placeholder="Unit Price" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} required />
              <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-warning" onClick={addItem} style={{ marginBottom: '15px' }}>Add Item</button>
          <button type="submit" className="btn btn-primary" style={{ marginLeft: '10px' }}>Generate Bill</button>
        </form>
      </div>
    </div>
  );
};

export default GenerateBill;