import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProductionManagerDashboard = () => {
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, lowStockRawMaterials: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/production-manager/production/dashboard-stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="pm-dashboard">
      <h1>Production Manager Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending Orders</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-icon">🏭</div>
          <div className="stat-info">
            <h3>In Progress</h3>
            <p>{stats.inProgress}</p>
          </div>
        </div>
        <div className="stat-card completed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>Low Stock Raw Materials</h3>
            <p>{stats.lowStockRawMaterials}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/production-manager/create-order" className="action-btn">Create Production Order</Link>
          <Link to="/production-manager/orders" className="action-btn">View All Orders</Link>
          <Link to="/production-manager/raw-materials" className="action-btn">Check Raw Materials</Link>
        </div>
      </div>

      <style>{`
        .pm-dashboard h1 { color: #e67e22; margin: 0 0 20px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; }
        .stat-card.pending { border-left: 4px solid #f39c12; }
        .stat-card.in-progress { border-left: 4px solid #3498db; }
        .stat-card.completed { border-left: 4px solid #27ae60; }
        .stat-card.warning { border-left: 4px solid #e74c3c; }
        .stat-icon { font-size: 32px; }
        .stat-info h3 { margin: 0 0 5px; font-size: 14px; color: #7f8c8d; }
        .stat-info p { margin: 0; font-size: 28px; font-weight: bold; color: #2c3e50; }
        .quick-actions { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .quick-actions h2 { margin: 0 0 15px; color: #2c3e50; }
        .action-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        .action-btn { padding: 12px 20px; background: #e67e22; color: white; text-decoration: none; border-radius: 5px; }
        .action-btn:hover { background: #d35400; }
      `}</style>
    </div>
  );
};

export default ProductionManagerDashboard;