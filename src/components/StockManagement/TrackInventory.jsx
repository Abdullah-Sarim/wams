import React, { useState, useEffect } from 'react';

const TrackInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/stock-management/track-inventory');
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (item) => {
    if (item.current_stock === 0) return { label: 'Out of Stock', class: 'danger' };
    if (item.current_stock <= item.reorder_level) return { label: 'Low Stock', class: 'warning' };
    if (item.current_stock <= item.min_stock_level) return { label: 'Critical', class: 'danger' };
    return { label: 'In Stock', class: 'success' };
  };

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="track-inventory-container">
      <div className="page-header">
        <h1>Track Inventory</h1>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Total Products</h3>
          <p>{inventory.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Value</h3>
          <p>${inventory.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0).toLocaleString()}</p>
        </div>
        <div className="summary-card warning">
          <h3>Low Stock Items</h3>
          <p>{inventory.filter(i => i.current_stock <= i.reorder_level).length}</p>
        </div>
        <div className="summary-card danger">
          <h3>Out of Stock</h3>
          <p>{inventory.filter(i => i.current_stock === 0).length}</p>
        </div>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Unit</th>
            <th>Current Stock</th>
            <th>Min Stock</th>
            <th>Reorder Level</th>
            <th>Unit Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventory.map(item => {
            const status = getStockStatus(item);
            return (
              <tr key={item.id} className={status.class}>
                <td>{item.id}</td>
                <td>{item.product_code}</td>
                <td>{item.product_name}</td>
                <td>{item.category}</td>
                <td>{item.unit}</td>
                <td className="stock-count">{item.current_stock}</td>
                <td>{item.min_stock_level}</td>
                <td>{item.reorder_level}</td>
                <td>${item.unit_price.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${status.class}`}>{status.label}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .track-inventory-container {
          padding: 20px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .page-header h1 {
          margin: 0;
          color: #333;
        }
        .search-box input {
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 5px;
          width: 300px;
          font-size: 14px;
        }
        .inventory-summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        .summary-card {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px;
          font-size: 14px;
          color: #666;
        }
        .summary-card p {
          margin: 0;
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .summary-card.warning p { color: #f39c12; }
        .summary-card.danger p { color: #e74c3c; }
        .inventory-table {
          width: 100%;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border-collapse: collapse;
          overflow: hidden;
        }
        .inventory-table thead {
          background: #3498db;
          color: #fff;
        }
        .inventory-table th, .inventory-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .inventory-table tbody tr:hover {
          background: #f8f9fa;
        }
        .inventory-table tbody tr.warning { background: #fff3cd; }
        .inventory-table tbody tr.danger { background: #f8d7da; }
        .stock-count {
          font-weight: bold;
        }
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .status-badge.success { background: #d4edda; color: #155724; }
        .status-badge.warning { background: #fff3cd; color: #856404; }
        .status-badge.danger { background: #f8d7da; color: #721c24; }
        .loading, .error {
          padding: 20px;
          text-align: center;
          font-size: 16px;
        }
        .error { color: #e74c3c; }
      `}</style>
    </div>
  );
};

export default TrackInventory;
