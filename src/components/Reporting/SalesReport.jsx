import React, { useState, useEffect } from 'react';

const SalesReport = () => {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState({ totalSales: 0, paidAmount: 0, pendingAmount: 0, count: 0 });
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  useEffect(() => {
    fetchSalesReport();
  }, [filters]);

  const fetchSalesReport = async () => {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/reporting/sales-report?${params}`);
    const data = await res.json();
    if (data.success) { setBills(data.bills); setSummary({ totalSales: data.totalSales, paidAmount: data.paidAmount, pendingAmount: data.pendingAmount, count: data.count }); }
  };

  return (
    <div className="page-container">
      <h1>Sales Report</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
          <input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div><h4>Total Sales</h4><p>${summary.totalSales.toLocaleString()}</p></div>
          <div><h4>Paid Amount</h4><p>${summary.paidAmount.toLocaleString()}</p></div>
          <div><h4>Pending Amount</h4><p>${summary.pendingAmount.toLocaleString()}</p></div>
          <div><h4>Total Bills</h4><p>{summary.count}</p></div>
        </div>
        <table>
          <thead><tr><th>Bill #</th><th>Dealer</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>{bills.map(b => <tr key={b.id}><td>{b.bill_number}</td><td>{b.dealer_name}</td><td>{b.bill_date}</td><td>${b.total_amount}</td><td>{b.status}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;