import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PlaceOrder = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ product_id: '', quantity: '', delivery_date: '', notes: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
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
        setSuccess(`🎉 Order placed successfully! Your Order ID is #${data.orderId}`);
        setFormData({ product_id: '', quantity: '', delivery_date: '', notes: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to place order');
    }
  };

  const selectedProduct = products.find(p => p.id === parseInt(formData.product_id));
  const totalAmount = (selectedProduct?.unit_price || 0) * (parseInt(formData.quantity) || 0);

  return (
    <div className="place-order">
      <div className="page-header">
        <div>
          <h1>🛒 Place New Order</h1>
          <p>Select products and place your order</p>
        </div>
        <Link to="/dealer/my-orders" className="btn btn-outline">📦 View My Orders</Link>
      </div>

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <div>
            <strong>Success!</strong>
            <p>{success}</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">!</span>
          <div>
            <strong>Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="order-container">
        <div className="products-section">
          <h2>Available Products</h2>
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className={`product-card ${formData.product_id === String(product.id) ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, product_id: String(product.id) })}
                >
                  <div className="product-header">
                    <span className="product-icon">📦</span>
                    <span className="product-name">{product.product_name}</span>
                  </div>
                  <div className="product-details">
                    <div className="product-price">₹{product.unit_price.toLocaleString()}</div>
                    <div className="product-stock">
                      <span className="stock-label">Available:</span>
                      <span className="stock-value">{product.current_stock} {product.unit}</span>
                    </div>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="no-products">
                  <p>No products available for order</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2>Order Details</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Selected Product</label>
                <div className="selected-product">
                  {selectedProduct ? (
                    <>
                      <span className="product-icon">📦</span>
                      <div>
                        <strong>{selectedProduct.product_name}</strong>
                        <span>₹{selectedProduct.unit_price.toLocaleString()} per {selectedProduct.unit}</span>
                      </div>
                    </>
                  ) : (
                    <span className="placeholder">Click a product to select</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input 
                  type="number" 
                  min="1" 
                  max={selectedProduct?.current_stock || 1}
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="Enter quantity"
                  required
                />
                {selectedProduct && (
                  <small className="helper-text">Max: {selectedProduct.current_stock} {selectedProduct.unit} available</small>
                )}
              </div>

              <div className="form-group">
                <label>Expected Delivery Date</label>
                <input 
                  type="date" 
                  value={formData.delivery_date}
                  onChange={(e) => setFormData({...formData, delivery_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special instructions or requirements..."
                  rows="3"
                />
              </div>

              {formData.product_id && formData.quantity && (
                <div className="order-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-row">
                    <span>Product</span>
                    <span>{selectedProduct?.product_name}</span>
                  </div>
                  <div className="summary-row">
                    <span>Quantity</span>
                    <span>{formData.quantity} {selectedProduct?.unit}</span>
                  </div>
                  <div className="summary-row">
                    <span>Unit Price</span>
                    <span>₹{selectedProduct?.unit_price.toLocaleString()}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Amount</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="submit-btn"
                disabled={!formData.product_id || !formData.quantity}
              >
                🛒 Place Order
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .place-order { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .page-header { 
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;
        }
        .page-header h1 { margin: 0; color: #27ae60; font-size: 28px; }
        .page-header p { margin: 5px 0 0; color: #7f8c8d; }

        .alert { 
          display: flex; gap: 15px; padding: 20px; border-radius: 12px; margin-bottom: 25px;
        }
        .alert-success { background: #d4edda; border-left: 4px solid #28a745; }
        .alert-error { background: #f8d7da; border-left: 4px solid #dc3545; }
        .alert-icon { 
          width: 40px; height: 40px; border-radius: 50%; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 20px; font-weight: bold;
        }
        .alert-success .alert-icon { background: #28a745; color: white; }
        .alert-error .alert-icon { background: #dc3545; color: white; }
        .alert strong { display: block; margin-bottom: 5px; }
        .alert p { margin: 0; }

        .order-container { 
          display: grid; grid-template-columns: 1fr 400px; gap: 25px; 
        }

        .products-section h2, .form-section h2 { 
          margin: 0 0 20px; color: #2c3e50; font-size: 20px; 
        }

        .products-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); 
          gap: 15px; 
        }
        .product-card { 
          background: white; padding: 20px; border-radius: 12px; 
          cursor: pointer; transition: all 0.2s;
          border: 2px solid transparent;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .product-card:hover { transform: translateY(-3px); box-shadow: 0 5px 20px rgba(0,0,0,0.1); }
        .product-card.selected { border-color: #27ae60; background: #f8fff8; }
        
        .product-header { display: flex; gap: 10px; align-items: center; margin-bottom: 15px; }
        .product-icon { font-size: 24px; }
        .product-name { font-weight: 600; color: #2c3e50; }
        
        .product-details { display: flex; justify-content: space-between; align-items: center; }
        .product-price { font-size: 18px; font-weight: bold; color: #27ae60; }
        .product-stock { text-align: right; }
        .stock-label { display: block; font-size: 11px; color: #7f8c8d; }
        .stock-value { font-weight: 600; color: #2c3e50; }

        .form-card { 
          background: white; padding: 30px; border-radius: 16px; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); position: sticky; top: 20px;
        }

        .selected-product { 
          display: flex; gap: 15px; padding: 15px; background: #f8fff8; 
          border-radius: 8px; border: 2px solid #27ae60;
        }
        .selected-product .product-icon { font-size: 32px; }
        .selected-product strong { display: block; color: #2c3e50; }
        .selected-product span { font-size: 13px; color: #7f8c8d; }
        .placeholder { color: #95a5a6; font-style: italic; }

        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #555; }
        .form-group input, .form-group textarea {
          width: 100%; padding: 12px; border: 2px solid #eee; border-radius: 8px; font-size: 14px;
          transition: border-color 0.2s; box-sizing: border-box;
        }
        .form-group input:focus, .form-group textarea:focus { border-color: #27ae60; outline: none; }
        .helper-text { display: block; margin-top: 5px; color: #7f8c8d; font-size: 12px; }

        .order-summary { 
          background: #f8fff8; padding: 20px; border-radius: 12px; margin-bottom: 20px; 
          border: 2px solid #27ae60;
        }
        .order-summary h3 { margin: 0 0 15px; color: #27ae60; }
        .summary-row { 
          display: flex; justify-content: space-between; padding: 8px 0; 
          border-bottom: 1px solid #e0e0e0;
        }
        .summary-row:last-child { border-bottom: none; }
        .summary-row.total { 
          margin-top: 10px; padding-top: 15px; border-top: 2px solid #27ae60; 
          font-size: 18px; font-weight: bold; color: #27ae60; 
        }

        .submit-btn { 
          width: 100%; padding: 15px; background: linear-gradient(135deg, #27ae60, #2ecc71); 
          color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; 
          cursor: pointer; transition: transform 0.2s;
        }
        .submit-btn:hover:not(:disabled) { transform: scale(1.02); }
        .submit-btn:disabled { background: #ccc; cursor: not-allowed; }

        .btn { padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .btn-outline { border: 2px solid #27ae60; color: #27ae60; }

        .no-products { text-align: center; padding: 40px; color: #7f8c8d; }

        @media (max-width: 900px) {
          .order-container { grid-template-columns: 1fr; }
          .form-card { position: static; }
        }
      `}</style>
    </div>
  );
};

export default PlaceOrder;
