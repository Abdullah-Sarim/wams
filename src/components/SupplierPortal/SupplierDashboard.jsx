import React, { useState, useEffect } from 'react';

const SupplierDashboard = () => {
  const [quotations, setQuotations] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await fetch('/api/supplier-portal/supplier/quotations');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations);
        setStats({
          pending: data.quotations.filter(q => q.status === 'pending').length,
          approved: data.quotations.filter(q => q.status === 'approved').length,
          rejected: data.quotations.filter(q => q.status === 'rejected').length,
          total: data.quotations.length
        });
      }
    } catch (err) {}
  };

  return (
    <div className="supplier-dashboard">
      <h1>Welcome to Supplier Portal</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>Total Quotations</h3>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p>{stats.pending}</p>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Approved</h3>
            <p>{stats.approved}</p>
          </div>
        </div>
        <div className="stat-card danger">
          <div className="stat-icon">❌</div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p>{stats.rejected}</p>
          </div>
        </div>
      </div>

      <div className="recent-quotations">
        <h2>Recent Quotations</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Valid Until</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {quotations.slice(0, 5).map(q => (
              <tr key={q.id}>
                <td>#{q.id}</td>
                <td>{q.product_name}</td>
                <td>{q.quantity}</td>
                <td>${q.unit_price}</td>
                <td>${q.total_price}</td>
                <td>{q.valid_until || '-'}</td>
                <td><span className={`status ${q.status}`}>{q.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .supplier-dashboard h1 { margin: 0 0 20px; color: #8e44ad; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 25px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 15px; }
        .stat-card.warning { border-left: 4px solid #f39c12; }
        .stat-card.success { border-left: 4px solid #27ae60; }
        .stat-card.danger { border-left: 4px solid #e74c3c; }
        .stat-icon { font-size: 32px; }
        .stat-info h3 { margin: 0 0 5px; font-size: 14px; color: #7f8c8d; }
        .stat-info p { margin: 0; font-size: 28px; font-weight: bold; color: #2c3e50; }
        .recent-quotations { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .recent-quotations h2 { margin: 0 0 15px; color: #2c3e50; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #8e44ad; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.approved { background: #d4edda; color: #155724; }
        .status.rejected { background: #f8d7da; color: #721c24; }
      `}</style>
    </div>
  );
};

export default SupplierDashboard;