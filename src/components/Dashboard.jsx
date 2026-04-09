import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalDealers: 0,
    totalSuppliers: 0,
    pendingOrders: 0,
    totalBills: 0,
    pendingBills: 0
  });
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [inventoryRes, dealersRes, suppliersRes, ordersRes, billsRes, alertsRes] = await Promise.all([
        fetch('/api/stock-management/track-inventory'),
        fetch('/api/dealer-management/dealers'),
        fetch('/api/supplier-management/suppliers'),
        fetch('/api/dealer-management/dealers-orders'),
        fetch('/api/billing-payment/bills'),
        fetch('/api/notifications/system-alerts')
      ]);

      const [inventory, dealers, suppliers, orders, bills, alerts] = await Promise.all([
        inventoryRes.json(),
        dealersRes.json(),
        suppliersRes.json(),
        ordersRes.json(),
        billsRes.json(),
        alertsRes.json()
      ]);

      const lowStock = inventory.success ? inventory.inventory.filter(i => i.current_stock <= i.reorder_level) : [];
      const pendingOrders = orders.success ? orders.orders.filter(o => o.status === 'pending') : [];
      const pendingBills = bills.success ? bills.bills.filter(b => b.status === 'pending') : [];

      setStats({
        totalProducts: inventory.success ? inventory.inventory.length : 0,
        lowStockItems: lowStock.length,
        totalDealers: dealers.success ? dealers.dealers.length : 0,
        totalSuppliers: suppliers.success ? suppliers.suppliers.length : 0,
        pendingOrders: pendingOrders.length,
        totalBills: bills.success ? bills.bills.length : 0,
        pendingBills: pendingBills.length
      });

      if (alerts.success) {
        setRecentAlerts(alerts.alerts.filter(a => !a.is_resolved).slice(0, 5));
      }

      if (orders.success) {
        setRecentOrders(orders.orders.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock Items</h3>
            <p>{stats.lowStockItems}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-info">
            <h3>Total Dealers</h3>
            <p>{stats.totalDealers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚚</div>
          <div className="stat-info">
            <h3>Total Suppliers</h3>
            <p>{stats.totalSuppliers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-info">
            <h3>Pending Bills</h3>
            <p>{stats.pendingBills}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h2>🔔 Recent Alerts</h2>
          {recentAlerts.length === 0 ? (
            <p className="no-data">No active alerts</p>
          ) : (
            <div className="alerts-list">
              {recentAlerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.severity}`}>
                  <span className="alert-type">{alert.alert_type}</span>
                  <span className="alert-message">{alert.message}</span>
                  {alert.product_name && <span className="alert-product">{alert.product_name}</span>}
                </div>
              ))}
            </div>
          )}
          <Link to="/notifications/system-alerts" className="view-all">View All Alerts →</Link>
        </div>

        <div className="dashboard-section">
          <h2>📦 Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="no-data">No recent orders</p>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dealer</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.dealer_name}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td><span className={`status ${order.status}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Link to="/dealer-management/dealers-orders" className="view-all">View All Orders →</Link>
        </div>
      </div>

      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="links-grid">
          <Link to="/stock-management/track-inventory" className="quick-link">📋 Track Inventory</Link>
          <Link to="/dealer-management/create-dealer-profile" className="quick-link">➕ Add Dealer</Link>
          <Link to="/manufacturing/create-manufacturing-order" className="quick-link">🏭 New Production</Link>
          <Link to="/billing-payment/generate-bill" className="quick-link">💰 Generate Bill</Link>
          <Link to="/stock-management/update-stock" class="quick-link">🔄 Update Stock</Link>
          <Link to="/search-filter" className="quick-link">🔍 Search</Link>
        </div>
      </div>

      <style>{`
        .dashboard-container { padding: 0; }
        .dashboard-container h1 { margin: 0 0 20px 0; color: #2c3e50; }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
          gap: 15px; 
          margin-bottom: 25px; 
        }
        .stat-card { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          display: flex; 
          align-items: center; 
          gap: 15px; 
        }
        .stat-card.warning { border-left: 4px solid #f39c12; }
        .stat-icon { font-size: 32px; }
        .stat-info h3 { margin: 0 0 5px; font-size: 14px; color: #7f8c8d; }
        .stat-info p { margin: 0; font-size: 28px; font-weight: bold; color: #2c3e50; }
        .dashboard-sections { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 25px; 
        }
        .dashboard-section { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .dashboard-section h2 { margin: 0 0 15px; font-size: 18px; color: #2c3e50; }
        .no-data { color: #95a5a6; text-align: center; padding: 20px; }
        .alerts-list { display: flex; flex-direction: column; gap: 10px; }
        .alert-item { 
          padding: 10px; 
          border-radius: 4px; 
          background: #f8f9fa; 
          display: flex; 
          flex-direction: column; 
          gap: 5px; 
        }
        .alert-item.warning { background: #fff3cd; }
        .alert-item.critical { background: #f8d7da; }
        .alert-type { font-weight: bold; font-size: 12px; color: #856404; }
        .alert-message { font-size: 14px; }
        .alert-product { font-size: 12px; color: #666; }
        .mini-table { width: 100%; font-size: 13px; }
        .mini-table th { background: #3498db; color: white; padding: 8px; font-size: 12px; }
        .mini-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .status { padding: 2px 8px; border-radius: 4px; font-size: 11px; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.approved { background: #d4edda; color: #155724; }
        .status.completed { background: #d1ecf1; color: #0c5460; }
        .view-all { 
          display: block; 
          text-align: right; 
          margin-top: 10px; 
          color: #3498db; 
          text-decoration: none; 
        }
        .quick-links { 
          background: white; 
          padding: 20px; 
          border-radius: 8px; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
        }
        .quick-links h2 { margin: 0 0 15px; font-size: 18px; color: #2c3e50; }
        .links-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
          gap: 10px; 
        }
        .quick-link { 
          display: block; 
          padding: 15px; 
          background: #ecf0f1; 
          color: #2c3e50; 
          text-align: center; 
          border-radius: 8px; 
          text-decoration: none; 
          transition: background 0.2s; 
        }
        .quick-link:hover { background: #3498db; color: white; }
      `}</style>
    </div>
  );
};

export default Dashboard;