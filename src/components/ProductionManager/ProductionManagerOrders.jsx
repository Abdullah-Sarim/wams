import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductionManagerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/production-manager/production/orders', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
  };

  const startProduction = async (orderId) => {
    try {
      const res = await fetch(`/api/production-manager/production/start/${orderId}`, { 
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('Production started!');
        fetchOrders();
      } else {
        alert(data.message || 'Failed to start production');
      }
    } catch (err) {
      alert('Error starting production');
    }
  };

  const completeProduction = async (orderId) => {
    try {
      const res = await fetch(`/api/production-manager/production/complete/${orderId}`, { 
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert(`Production completed! New stock: ${data.newStock}`);
        fetchOrders();
      } else {
        alert(data.message || 'Failed to complete production');
      }
    } catch (err) {
      alert('Error completing production');
    }
  };

  return (
    <div className="pm-orders">
      <h1>Production Orders</h1>
      
      {loading ? <p>Loading...</p> : orders.length === 0 ? (
        <p className="no-data">No production orders</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Start Date</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.product_name}</td>
                <td><span className={`type-badge ${order.product_type}`}>{order.product_type}</span></td>
                <td>{order.quantity}</td>
                <td>{order.start_date || '-'}</td>
                <td>{order.expected_delivery_date || '-'}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>
                  {order.status === 'pending' && (
                    <button onClick={() => startProduction(order.id)} className="action-btn start">Start</button>
                  )}
                  {order.status === 'in_progress' && (
                    <button onClick={() => completeProduction(order.id)} className="action-btn complete">Complete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .pm-orders h1 { color: #e67e22; margin-bottom: 20px; }
        .no-data { text-align: center; color: #999; padding: 40px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #e67e22; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.in_progress { background: #d1ecf1; color: #0c5460; }
        .status.completed { background: #d4edda; color: #155724; }
        .type-badge { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
        .type-badge.finished_product { background: #d4edda; color: #155724; }
        .type-badge.raw_material { background: #fff3cd; color: #856404; }
        .action-btn { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px; }
        .action-btn.start { background: #3498db; color: white; }
        .action-btn.complete { background: #27ae60; color: white; }
      `}</style>
    </div>
  );
};

export default ProductionManagerOrders;