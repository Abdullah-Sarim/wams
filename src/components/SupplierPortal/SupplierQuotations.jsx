import React, { useState, useEffect } from 'react';

const SupplierQuotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [responseForm, setResponseForm] = useState({ status: '', delivery_date: '', notes: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    try {
      const res = await fetch('/api/supplier-portal/supplier/quotations');
      const data = await res.json();
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleRespond = (quotation) => {
    setSelectedQuotation(quotation);
    setResponseForm({ status: 'approved', delivery_date: '', notes: '' });
  };

  const submitResponse = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/supplier-portal/supplier/quotations/${selectedQuotation.id}/respond`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseForm)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Response submitted successfully!');
        setSelectedQuotation(null);
        fetchQuotations();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to submit response');
    }
  };

  return (
    <div className="supplier-quotations">
      <h1>My Quotations</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? <p>Loading...</p> : quotations.length === 0 ? (
        <p className="no-data">No quotations found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quotations.map(q => (
              <tr key={q.id}>
                <td>#{q.id}</td>
                <td>{q.product_name}</td>
                <td>{q.quantity}</td>
                <td>${q.unit_price}</td>
                <td>${q.total_price}</td>
                <td>{q.valid_until || '-'}</td>
                <td><span className={`status ${q.status}`}>{q.status}</span></td>
                <td>
                  {q.status === 'pending' && (
                    <button onClick={() => handleRespond(q)} className="respond-btn">Respond</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedQuotation && (
        <div className="modal">
          <div className="modal-content">
            <h2>Respond to Quotation #{selectedQuotation.id}</h2>
            <form onSubmit={submitResponse}>
              <div className="form-group">
                <label>Response</label>
                <select value={responseForm.status} onChange={(e) => setResponseForm({...responseForm, status: e.target.value})} required>
                  <option value="approved">Accept (Approved)</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input type="date" value={responseForm.delivery_date} onChange={(e) => setResponseForm({...responseForm, delivery_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea value={responseForm.notes} onChange={(e) => setResponseForm({...responseForm, notes: e.target.value})} rows="3" placeholder="Any additional notes..." />
              </div>
              <div className="modal-actions">
                <button type="submit" className="submit-btn">Submit Response</button>
                <button type="button" onClick={() => setSelectedQuotation(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .supplier-quotations h1 { color: #8e44ad; margin-bottom: 20px; }
        .error-message { color: #e74c3c; padding: 10px; background: #f8d7da; border-radius: 5px; margin-bottom: 15px; }
        .success-message { color: #27ae60; padding: 10px; background: #d4edda; border-radius: 5px; margin-bottom: 15px; }
        .no-data { text-align: center; color: #999; padding: 40px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #8e44ad; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.pending { background: #fff3cd; color: #856404; }
        .status.approved { background: #d4edda; color: #155724; }
        .status.rejected { background: #f8d7da; color: #721c24; }
        .respond-btn { padding: 6px 12px; background: #8e44ad; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 25px; border-radius: 8px; width: 400px; }
        .modal-content h2 { margin: 0 0 20px; color: #8e44ad; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
        .submit-btn { flex: 1; padding: 10px; background: #8e44ad; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .cancel-btn { flex: 1; padding: 10px; background: #ddd; color: #333; border: none; border-radius: 5px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default SupplierQuotations;