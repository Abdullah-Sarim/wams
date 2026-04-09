import React, { useState, useEffect } from 'react';

const PaymentTracking = () => {
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({ bill_id: '', amount: '', payment_date: '', payment_method: '', reference_number: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const [bRes, pRes] = await Promise.all([fetch('/api/billing-payment/bills'), fetch('/api/billing-payment/payments')]);
      const [bData, pData] = await Promise.all([bRes.json(), pRes.json()]);
      if (bData.success) setBills(bData.bills);
      if (pData.success) setPayments(pData.payments);
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/billing-payment/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) { setSuccess('Payment recorded!'); setFormData({ bill_id: '', amount: '', payment_date: '', payment_method: '', reference_number: '', notes: '' }); }
      else setError(data.message);
    } catch (err) { setError('Failed to record payment'); }
  };

  return (
    <div className="page-container">
      <h1>Payment Tracking</h1>
      <div className="card">
        <h3>Record Payment</h3>
        {success && <div className="success">{success}</div>}
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group"><label>Bill</label><select value={formData.bill_id} onChange={(e) => setFormData({...formData, bill_id: e.target.value})} required><option value="">Select</option>{bills.map(b => <option key={b.id} value={b.id}>{b.bill_number} - ${b.total_amount}</option>)}</select></div>
          <div className="form-group"><label>Amount</label><input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required /></div>
          <div className="form-group"><label>Payment Date</label><input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} /></div>
          <div className="form-group"><label>Method</label><select value={formData.payment_method} onChange={(e) => setFormData({...formData, payment_method: e.target.value})}><option value="">Select</option><option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option></select></div>
          <div className="form-group"><label>Reference #</label><input type="text" value={formData.reference_number} onChange={(e) => setFormData({...formData, reference_number: e.target.value})} /></div>
          <div className="form-group"><label>Notes</label><input type="text" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} /></div>
          <div style={{ gridColumn: '1 / -1' }}><button type="submit" className="btn btn-primary">Record Payment</button></div>
        </form>
      </div>
      <h2>Payment History</h2>
      <table>
        <thead><tr><th>ID</th><th>Bill #</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th></tr></thead>
        <tbody>{payments.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.bill_number}</td><td>${p.amount}</td><td>{p.payment_date}</td><td>{p.payment_method}</td><td>{p.reference_number}</td></tr>)}</tbody>
      </table>
    </div>
  );
};

export default PaymentTracking;