import React, { useState, useEffect } from 'react';

const StockReport = () => {
  const [inventory, setInventory] = useState([]);
  const [summary, setSummary] = useState({ totalValue: 0, lowStockCount: 0, outOfStockCount: 0, count: 0 });

  useEffect(() => {
    fetch('/api/reporting/stock-report')
      .then(res => res.json())
      .then(data => { if (data.success) { setInventory(data.inventory); setSummary({ totalValue: data.totalValue, lowStockCount: data.lowStockCount, outOfStockCount: data.outOfStockCount, count: data.count }); } });
  }, []);

  return (
    <div className="page-container">
      <h1>Stock Report</h1>
      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div><h4>Total Products</h4><p>{summary.count}</p></div>
          <div><h4>Total Value</h4><p>${summary.totalValue.toLocaleString()}</p></div>
          <div><h4>Low Stock</h4><p style={{ color: '#f39c12' }}>{summary.lowStockCount}</p></div>
          <div><h4>Out of Stock</h4><p style={{ color: '#e74c3c' }}>{summary.outOfStockCount}</p></div>
        </div>
        <table>
          <thead><tr><th>ID</th><th>Product</th><th>Code</th><th>Current Stock</th><th>Min Stock</th><th>Reorder Level</th><th>Value</th><th>Status</th></tr></thead>
          <tbody>{inventory.map(i => <tr key={i.id}><td>{i.id}</td><td>{i.product_name}</td><td>{i.product_code}</td><td>{i.current_stock}</td><td>{i.min_stock_level}</td><td>{i.reorder_level}</td><td>${(i.current_stock * i.unit_price).toLocaleString()}</td><td>{i.stock_status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default StockReport;