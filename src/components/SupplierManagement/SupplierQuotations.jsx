import React, { useState, useEffect } from 'react';

const SupplierQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ supplier_id: '', product_id: '', quantity: '', unit_price: '', valid_until: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [qRes, sRes, pRes] = await Promise.all([
      fetch('/api/supplier-management/supplier-quotations'),
      fetch('/api/supplier-management/suppliers'),
      fetch('/api/stock-management/track-inventory')
    ]);
    const [qData, sData, pData] = await Promise.all([qRes.json(), sRes.json(), pRes.json()]);
    if (qData.success) setQuotations(qData.quotations);
    if (sData.success) setSuppliers(sData.suppliers);
    if (pData.success) setProducts(pData.inventory);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/supplier-management/supplier-quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) { fetchData(); setFormData({ supplier_id: '', product_id: '', quantity: '', unit_price: '', valid_until: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to create quotation'); }
  };

  return (
    <div className="page-container">
      <h1>Supplier Quotations</h1>
      <div className="card">
        <h3>Create Quotation</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group"><label>Supplier</label><select value={formData.supplier_id} onChange={(e) => setFormData({...formData, supplier_id: e.target.value})} required><option value="">Select</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label>Product</label><select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required><option value="">Select</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
          <div className="form-group"><label>Quantity</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required /></div>
          <div className="form-group"><label>Unit Price</label><input type="number" step="0.01" value={formData.unit_price} onChange={(e) => setFormData({...formData, unit_price: e.target.value})} required /></div>
          <div className="form-group"><label>Valid Until</label><input type="date" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} /></div>
          <div><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Supplier</th><th>Product</th><th>Quantity</th><th>Unit Price</th><th>Total</th><th>Valid Until</th><th>Status</th></tr></thead>
        <tbody>{quotations.map(q => <tr key={q.id}><td>{q.id}</td><td>{q.supplier_name}</td><td>{q.product_name}</td><td>{q.quantity}</td><td>${q.unit_price}</td><td>${q.total_price}</td><td>{q.valid_until}</td><td>{q.status}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

export default SupplierQuotations;