import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateProductionOrder = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ productId: '', quantity: 1, expectedDelivery: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/production-manager/production/finished-products', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/production-manager/production/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert('Production order created!');
        navigate('/production-manager/orders');
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error creating order');
    }
  };

  return (
    <div className="create-order">
      <h1>Create Production Order</h1>
      
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>Product</label>
          <select value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} required>
            <option value="">Select Product</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" min="1" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})} required />
        </div>
        
        <div className="form-group">
          <label>Expected Delivery Date</label>
          <input type="date" value={formData.expectedDelivery} onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})} required />
        </div>
        
        <button type="submit" className="submit-btn">Create Order</button>
      </form>

      <style>{`
        .create-order h1 { color: #e67e22; margin-bottom: 20px; }
        .order-form { background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 500px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; color: #555; font-weight: 500; }
        .form-group input, .form-group select { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
        .submit-btn { width: 100%; padding: 12px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        .submit-btn:hover { background: #d35400; }
      `}</style>
    </div>
  );
};

export default CreateProductionOrder;
