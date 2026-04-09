import React, { useState, useEffect } from 'react';

const SupplierReport = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetch('/api/reporting/supplier-report')
      .then(res => res.json())
      .then(data => { if (data.success) setSuppliers(data.suppliers); });
  }, []);

  return (
    <div className="page-container">
      <h1>Supplier Report</h1>
      <div className="card">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Contact Person</th><th>Email</th><th>Quotations</th><th>Total Approved</th></tr></thead>
          <tbody>{suppliers.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.contact_person}</td><td>{s.email}</td><td>{s.quotation_count}</td><td>${s.total_approved || 0}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierReport;