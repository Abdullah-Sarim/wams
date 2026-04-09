import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const DealerDashboard = () => {
  const [dealer, setDealer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [bills, setBills] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, completed: 0, totalAmount: 0, pendingPayment: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, profileRes, billsRes] = await Promise.all([
        fetch('/api/dealer-portal/dealer/orders'),
        fetch('/api/dealer-portal/dealer/profile'),
        fetch('/api/dealer-portal/dealer/bills')
      ]);
      
      const ordersData = await ordersRes.json();
      const profileData = await profileRes.json();
      const billsData = await billsRes.json();
      
      if (ordersData.success) {
        setOrders(ordersData.orders);
        const pending = ordersData.orders.filter(o => o.status === 'pending').length;
        const approved = ordersData.orders.filter(o => o.status === 'approved').length;
        const rejected = ordersData.orders.filter(o => o.status === 'rejected').length;
        const completed = ordersData.orders.filter(o => o.status === 'completed').length;
        const totalAmount = ordersData.orders.reduce((sum, o) => sum + (o.unit_price * o.quantity), 0);
        
        setStats({ pending, approved, rejected, completed, totalAmount, pendingPayment: pending + approved });
      }
      
      if (profileData.success) {
        setDealer(profileData.dealer);
      }

      if (billsData.success) {
        setBills(billsData.bills || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#17a2b8',
      rejected: '#dc3545',
      completed: '#28a745',
      auto_approved: '#17a2b8',
      in_production: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dealer-dashboard">
      <div className="welcome-section">
        <div className="welcome-text">
          <h1>Welcome back, {dealer?.name}! 👋</h1>
          <p>Here's what's happening with your orders today.</p>
        </div>
        <div className="quick-actions">
          <Link to="/dealer/place-order" className="btn btn-primary btn-lg">
            <span>🛒</span> Place New Order
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ffc107, #ff9800)' }}>⏳</div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #17a2b8, #138496)' }}>✓</div>
          <div className="stat-info">
            <h3>Approved</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>✕</div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #28a745, #218838)' }}>✓</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6f42c1, #5a32a3)' }}>💰</div>
          <div className="stat-info">
            <h3>Total Orders Value</h3>
            <p>₹{stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fd7e14, #e96d00)' }}>📋</div>
          <div className="stat-info">
            <h3>Awaiting Payment</h3>
            <p>{stats.pendingPayment}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h2>📦 Recent Orders</h2>
            <Link to="/dealer/my-orders" className="view-all">View All →</Link>
          </div>
          <div className="card-body">
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet</p>
                <Link to="/dealer/place-order" className="btn btn-outline">Place Your First Order</Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <span className="order-id">#{order.id}</span>
                      <span className="order-product">{order.product_name}</span>
                      <span className="order-qty">Qty: {order.quantity}</span>
                    </div>
                    <div className="order-meta">
                      <span className="order-amount">₹{(order.unit_price * order.quantity).toLocaleString()}</span>
                      <span className="order-status" style={{ background: getStatusColor(order.status) }}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>🏢 Company Information</h2>
            <Link to="/dealer/profile" className="view-all">Edit →</Link>
          </div>
          <div className="card-body">
            <div className="company-info">
              <div className="info-item">
                <span className="info-label">Company Name</span>
                <span className="info-value">{dealer?.name || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Contact Person</span>
                <span className="info-value">{dealer?.contact_person || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{dealer?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{dealer?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Address</span>
                <span className="info-value">{dealer?.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dealer-dashboard { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .welcome-section { 
          background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
          padding: 30px; border-radius: 12px; color: white; margin-bottom: 25px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .welcome-text h1 { margin: 0 0 8px; font-size: 28px; }
        .welcome-text p { margin: 0; opacity: 0.9; }
        
        .stats-grid { 
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); 
          gap: 15px; margin-bottom: 25px; 
        }
        .stat-card { 
          background: white; padding: 20px; border-radius: 12px; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
        .stat-card.highlight { border: 2px solid #e8f5e9; }
        .stat-icon { 
          width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; 
          justify-content: center; font-size: 24px; color: white; 
        }
        .stat-info h3 { margin: 0 0 5px; font-size: 13px; color: #7f8c8d; font-weight: 500; }
        .stat-info p { margin: 0; font-size: 24px; font-weight: bold; color: #2c3e50; }
        
        .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .dashboard-card { 
          background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); 
          overflow: hidden; 
        }
        .card-header { 
          padding: 20px; border-bottom: 1px solid #eee; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .card-header h2 { margin: 0; font-size: 18px; color: #2c3e50; }
        .view-all { color: #27ae60; text-decoration: none; font-weight: 500; }
        .card-body { padding: 20px; }
        
        .orders-list { display: flex; flex-direction: column; gap: 12px; }
        .order-item { 
          padding: 15px; border-radius: 8px; background: #f8f9fa; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .order-info { display: flex; flex-direction: column; gap: 4px; }
        .order-id { font-weight: bold; color: #27ae60; }
        .order-product { font-size: 14px; color: #333; }
        .order-qty { font-size: 12px; color: #7f8c8d; }
        .order-meta { text-align: right; }
        .order-amount { display: block; font-weight: bold; color: #2c3e50; margin-bottom: 4px; }
        .order-status { 
          padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; 
        }
        
        .company-info { display: flex; flex-direction: column; gap: 12px; }
        .info-item { display: flex; justify-content: space-between; padding: 10px; background: #f8f9fa; border-radius: 8px; }
        .info-label { color: #7f8c8d; font-size: 13px; }
        .info-value { font-weight: 500; color: #2c3e50; }
        
        .empty-state { text-align: center; padding: 30px; }
        .empty-state p { color: #7f8c8d; margin-bottom: 15px; }
        
        .btn { padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 500; cursor: pointer; border: none; }
        .btn-primary { background: white; color: #27ae60; }
        .btn-primary:hover { background: #f0f0f0; }
        .btn-lg { padding: 12px 25px; font-size: 16px; display: inline-flex; align-items: center; gap: 8px; }
        .btn-outline { border: 2px solid #27ae60; color: #27ae60; background: transparent; }
        
        .loading-container { text-align: center; padding: 50px; color: #7f8c8d; }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid #f3f3f3; 
          border-top: 4px solid #27ae60; border-radius: 50%; 
          animation: spin 1s linear infinite; margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr; }
          .welcome-section { flex-direction: column; text-align: center; gap: 15px; }
        }
      `}</style>
    </div>
  );
};

export default DealerDashboard;
