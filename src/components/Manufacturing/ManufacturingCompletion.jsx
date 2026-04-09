import React, { useState, useEffect } from 'react';

const ManufacturingCompletion = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/manufacturing/manufacturing-orders')
      .then(res => res.json())
      .then(data => { if (data.success) setOrders(data.orders); });
  }, []);

  const handleComplete = async (orderId) => {
    try {
      const res = await fetch(`/api/manufacturing/complete-manufacturing-order/${orderId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Order completed! New stock: ${data.new_stock}`);
        const updated = await fetch('/api/manufacturing/manufacturing-orders').then(r => r.json());
        if (updated.success) setOrders(updated.orders);
      } else {
        setError(data.message);
      }
    } catch (err) { setError('Failed to complete order'); }
  };

  return (
    <div className="page-container">
      <h1>Manufacturing Orders</h1>
      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}
      <table>
        <thead><tr><th>ID</th><th>Product</th><th>Quantity</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id}><td>{o.id}</td><td>{o.product_name}</td><td>{o.quantity}</td><td>{o.start_date}</td><td>{o.end_date}</td><td>{o.status}</td><td>{o.status === 'pending' && <button className="btn btn-success" onClick={() => handleComplete(o.id)}>Complete</button>}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

export default ManufacturingCompletion;