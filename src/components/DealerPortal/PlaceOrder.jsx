import React, { useState, useEffect } from 'react';

const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', delivery_date: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/stock-management/track-inventory');
      const data = await res.json();
      if (data.success) {
        setProducts(data.inventory.filter(p => p.current_stock > 0));
      }
    } catch (err) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/dealer-portal/dealer/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(`Order placed successfully! Order ID: ${data.orderId}`);
        setFormData({ product_id: '', quantity: '', delivery_date: '', notes: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));

  return (
    <div className="place-order">
      <h1>Place New Order</h1>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="order-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Product</label>
            <select 
              value={formData.product_id} 
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
              required
            >
              <option value="">-- Select Product --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.product_name} - ${p.unit_price} (Stock: {p.current_stock})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && (
            <div className="product-info">
              <p><strong>Unit Price:</strong> ${selectedProduct.unit_price}</p>
              <p><strong>Available Stock:</strong> {selectedProduct.current_stock} {selectedProduct.unit}</p>
            </div>
          )}

          <div className="form-group">
            <label>Quantity</label>
            <input 
              type="number" 
              min="1" 
              max={selectedProduct?.current_stock || 1}
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Expected Delivery Date</label>
            <input 
              type="date" 
              value={formData.delivery_date}
              onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special instructions..."
              rows="3"
            />
          </div>

          {formData.product_id && formData.quantity && (
            <div className="order-summary">
              <h3>Order Summary</h3>
              <p><strong>Total Amount:</strong> ${(selectedProduct?.unit_price || 0) * (parseInt(formData.quantity) || 0).toLocaleString()}</p>
            </div>
          )}

          <button type="submit" className="submit-btn">Place Order</button>
        </form>
      </div>

      <style>{`
        .place-order h1 { color: #27ae60; margin-bottom: 20px; }
        .success-message { color: #27ae60; padding: 15px; background: #d4edda; border-radius: 5px; margin-bottom: 20px; }
        .error-message { color: #e74c3c; padding: 15px; background: #f8d7da; border-radius: 5px; margin-bottom: 20px; }
        .order-form { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #333; }
        .form-group input, .form-group select, .form-group textarea {
          width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 14px;
        }
        .product-info { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .product-info p { margin: 5px 0; color: #666; }
        .order-summary { background: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .order-summary h3 { margin: 0 0 10px; color: #27ae60; }
        .order-summary p { margin: 5px 0; font-size: 18px; }
        .submit-btn { width: 100%; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 5px; font-size: 16px; cursor: pointer; }
        .submit-btn:hover { background: #219a52; }
      `}</style>
    </div>
  );
};

export default PlaceOrder;