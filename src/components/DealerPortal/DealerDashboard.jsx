import React, { useState, useEffect } from 'react';

const DealerDashboard = () => {
  const [dealer, setDealer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, completed: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/dealer-portal/dealer/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
        setStats({
          pending: data.orders.filter(o => o.status === 'pending').length,
          approved: data.orders.filter(o => o.status === 'approved').length,
          rejected: data.orders.filter(o => o.status === 'rejected').length,
          completed: data.orders.filter(o => o.status === 'completed').length,
        });
      }
    } catch (err) {}
  };

  return (
    <div className="dealer-dashboard">
      <h1>Welcome to Dealer Portal</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Approved Orders</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Rejected Orders</h3>
            <p>{stats.rejected}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎉</div>
          <div className="stat-info">
            <h3>Completed Orders</h3>
            <p>{stats.completed}</p>
          </div>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 5).map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.product_name}</td>
                <td>{order.quantity}</td>
                <td>{order.order_date}</td>
                <td><span className={`status ${order.status}`}>{order.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .dealer-dashboard h1 { margin: 0 0 20px; color: #27ae60; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; }
        .stat-card.success { border-left: 4px solid #27ae60; }
        .stat-card.danger { border-left: 4px solid #e74c3c; }
        .stat-icon { font-size: 32px; }
        .stat-info h3 { margin: 0 0 5px; font-size: 14px; color: #7f8c8d; }
        .stat-info p { margin: 0; font-size: 28px; font-weight: bold; color: #2c3e50; }
        .recent-orders { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .recent-orders h2 { margin: 0 0 15px; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; }
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

export default DealerDashboard;