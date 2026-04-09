import React, { useState, useEffect } from 'react';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/dealer-portal/dealer/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="my-orders">
      <h1>My Orders</h1>
      
      <div className="filter-buttons">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
        <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>Approved</button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>Rejected</button>
        <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
      </div>

      {loading ? <p>Loading...</p> : filteredOrders.length === 0 ? (
        <p className="no-orders">No orders found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Order Date</th>
              <th>Delivery Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.product_name}</td>
                <td>${order.unit_price}</td>
                <td>{order.quantity}</td>
                <td>${(order.unit_price * order.quantity).toLocaleString()}</td>
                <td>{order.order_date || '-'}</td>
                <td>{order.delivery_date || '-'}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
                <td>{order.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .my-orders h1 { color: #27ae60; margin-bottom: 20px; }
        .filter-buttons { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .filter-buttons button {
          padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;
        }
        .filter-buttons button.active { background: #27ae60; color: white; border-color: #27ae60; }
        .no-orders { text-align: center; color: #999; padding: 40px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #27ae60; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.approved { background: #d4edda; color: #155724; }
        .status.rejected { background: #f8d7da; color: #721c24; }
        .status.completed { background: #d1ecf1; color: #0c5460; }
      `}</style>
    </div>
  );
};

export default MyOrders;