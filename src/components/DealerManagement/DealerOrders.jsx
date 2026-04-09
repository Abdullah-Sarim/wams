import React, { useState, useEffect } from 'react';

const DealerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ dealer_id: '', product_id: '', quantity: '', order_date: '', delivery_date: '', notes: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [ordersRes, dealersRes, productsRes] = await Promise.all([
      fetch('/api/dealer-management/dealers-orders'),
      fetch('/api/dealer-management/dealers'),
      fetch('/api/stock-management/track-inventory')
    ]);
    const [ordersData, dealersData, productsData] = await Promise.all([ordersRes.json(), dealersRes.json(), productsRes.json()]);
    if (ordersData.success) setOrders(ordersData.orders);
    if (dealersData.success) setDealers(dealersData.dealers);
    if (productsData.success) setProducts(productsData.inventory);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/dealer-management/create-dealer-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) { fetchData(); setFormData({ dealer_id: '', product_id: '', quantity: '', order_date: '', delivery_date: '', notes: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to create order'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const response = await fetch(`/api/workflow/update-order-status/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
        if (data.billGenerated) {
          setError('');
          alert(`Bill generated: ${data.billNumber} - Rs. ${data.totalAmount}`);
        }
      } else {
        setError(data.message || 'Failed to update status');
      }
    } catch (err) { 
      setError('Failed to update status'); 
    }
  };

  return (
    <div className="page-container">
      <h1>Dealer Orders</h1>
      <div className="card">
        <h3>Create New Order</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group"><label>Dealer</label><select value={formData.dealer_id} onChange={(e) => setFormData({...formData, dealer_id: e.target.value})} required><option value="">Select Dealer</option>{dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div className="form-group"><label>Product</label><select value={formData.product_id} onChange={(e) => setFormData({...formData, product_id: e.target.value})} required><option value="">Select Product</option>{products.map(p => <option key={p.id} value={p.id}>{p.product_name}</option>)}</select></div>
          <div className="form-group"><label>Quantity</label><input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required /></div>
          <div className="form-group"><label>Order Date</label><input type="date" value={formData.order_date} onChange={(e) => setFormData({...formData, order_date: e.target.value})} /></div>
          <div className="form-group"><label>Delivery Date</label><input type="date" value={formData.delivery_date} onChange={(e) => setFormData({...formData, delivery_date: e.target.value})} /></div>
          <div className="form-group"><label>Notes</label><input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
          <div style={{ gridColumn: '1 / -1' }}><button type="submit" className="btn btn-primary">Create Order</button></div>
        </form>
      </div>
      <table>
        <thead><tr><th>ID</th><th>Dealer</th><th>Product</th><th>Quantity</th><th>Order Date</th><th>Delivery Date</th><th>Status</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.dealer_name}</td><td>{o.product_name}</td><td>{o.quantity}</td><td>{o.order_date}</td><td>{o.delivery_date}</td><td><select value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="completed">Completed</option><option value="rejected">Rejected</option><option value="cancelled">Cancelled</option></select></td></tr>)}</tbody>
      </table>
    </div>
  );
};

export default DealerOrders;