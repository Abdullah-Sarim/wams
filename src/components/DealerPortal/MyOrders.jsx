import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/dealer-portal/dealer/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {}
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      approved: '#17a2b8',
      rejected: '#dc3545',
      completed: '#28a745',
      auto_approved: '#17a2b8',
      in_production: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      approved: '✓',
      rejected: '✕',
      completed: '✓✓',
      auto_approved: '✓',
      in_production: '⚙️'
    };
    return icons[status] || '📦';
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    approved: orders.filter(o => o.status === 'approved' || o.status === 'auto_approved').length,
    in_production: orders.filter(o => o.status === 'in_production').length,
    completed: orders.filter(o => o.status === 'completed').length,
    rejected: orders.filter(o => o.status === 'rejected').length
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="my-orders">
      <div className="page-header">
        <div>
          <h1>📦 My Orders</h1>
          <p>Track and manage all your orders in one place</p>
        </div>
        <Link to="/dealer/place-order" className="btn btn-primary">
          🛒 Place New Order
        </Link>
      </div>

      <div className="stats-row">
        <div className={`stat-pill ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <span className="stat-count">{stats.all}</span>
          <span className="stat-label">All Orders</span>
        </div>
        <div className={`stat-pill ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>
          <span className="stat-count" style={{ background: '#ffc107' }}>{stats.pending}</span>
          <span className="stat-label">Pending</span>
        </div>
        <div className={`stat-pill ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>
          <span className="stat-count" style={{ background: '#17a2b8' }}>{stats.approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className={`stat-pill ${filter === 'in_production' ? 'active' : ''}`} onClick={() => setFilter('in_production')}>
          <span className="stat-count" style={{ background: '#6c757d' }}>{stats.in_production}</span>
          <span className="stat-label">In Production</span>
        </div>
        <div className={`stat-pill ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
          <span className="stat-count" style={{ background: '#28a745' }}>{stats.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className={`stat-pill ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
          <span className="stat-count" style={{ background: '#dc3545' }}>{stats.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>{filter === 'all' ? "You haven't placed any orders yet." : `You don't have any ${filter} orders.`}</p>
          {filter === 'all' && (
            <Link to="/dealer/place-order" className="btn btn-primary">Place Your First Order</Link>
          )}
        </div>
      ) : (
        <div className="orders-grid">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card" onClick={() => setSelectedOrder(order)}>
              <div className="order-header">
                <span className="order-id">Order #{order.id}</span>
                <span className="order-status" style={{ background: getStatusColor(order.status) }}>
                  {getStatusIcon(order.status)} {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="order-body">
                <div className="order-product">
                  <span className="product-icon">📱</span>
                  <div>
                    <p className="product-name">{order.product_name}</p>
                    <p className="product-qty">Quantity: {order.quantity}</p>
                  </div>
                </div>
                <div className="order-price">
                  <span className="price-label">Total</span>
                  <span className="price-value">₹{(order.unit_price * order.quantity).toLocaleString()}</span>
                </div>
              </div>
              <div className="order-footer">
                <div className="order-dates">
                  <span>📅 {order.order_date || 'N/A'}</span>
                  <span>🚚 {order.delivery_date || 'Pending'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Product</span>
                <span className="detail-value">{selectedOrder.product_name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quantity</span>
                <span className="detail-value">{selectedOrder.quantity}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Unit Price</span>
                <span className="detail-value">₹{selectedOrder.unit_price.toLocaleString()}</span>
              </div>
              <div className="detail-row highlight">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value">₹{(selectedOrder.unit_price * selectedOrder.quantity).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Date</span>
                <span className="detail-value">{selectedOrder.order_date || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Expected Delivery</span>
                <span className="detail-value">{selectedOrder.delivery_date || 'Pending'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className="status-badge" style={{ background: getStatusColor(selectedOrder.status) }}>
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </span>
                </span>
              </div>
              {selectedOrder.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes</span>
                  <span className="detail-value">{selectedOrder.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .my-orders { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .page-header { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 25px;
        }
        .page-header h1 { margin: 0; color: #27ae60; font-size: 28px; }
        .page-header p { margin: 5px 0 0; color: #7f8c8d; }

        .stats-row { 
          display: flex; gap: 10px; margin-bottom: 25px; overflow-x: auto; padding-bottom: 10px;
        }
        .stat-pill { 
          display: flex; align-items: center; gap: 10px; padding: 12px 20px; 
          background: white; border-radius: 30px; cursor: pointer; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: all 0.2s;
          white-space: nowrap;
        }
        .stat-pill:hover, .stat-pill.active { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .stat-count { 
          width: 28px; height: 28px; border-radius: 50%; background: #95a5a6; 
          color: white; display: flex; align-items: center; justify-content: center; 
          font-size: 12px; font-weight: bold;
        }
        .stat-label { font-size: 13px; color: #555; }

        .orders-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); 
          gap: 20px; 
        }
        .order-card { 
          background: white; border-radius: 16px; overflow: hidden; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.08); cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .order-card:hover { transform: translateY(-5px); box-shadow: 0 8px 30px rgba(0,0,0,0.12); }
        
        .order-header { 
          padding: 15px 20px; background: #f8f9fa; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .order-id { font-weight: bold; color: #27ae60; }
        .order-status { 
          padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; color: white; 
        }
        
        .order-body { padding: 20px; }
        .order-product { display: flex; gap: 15px; align-items: center; margin-bottom: 15px; }
        .product-icon { font-size: 32px; }
        .product-name { margin: 0; font-weight: 600; color: #2c3e50; }
        .product-qty { margin: 5px 0 0; font-size: 13px; color: #7f8c8d; }
        
        .order-price { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #eee; }
        .price-label { font-size: 13px; color: #7f8c8d; }
        .price-value { font-size: 20px; font-weight: bold; color: #27ae60; }
        
        .order-footer { padding: 15px 20px; background: #f8f9fa; }
        .order-dates { display: flex; gap: 15px; font-size: 12px; color: #7f8c8d; }

        .empty-state { 
          text-align: center; padding: 60px 20px; background: white; 
          border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .empty-icon { font-size: 64px; margin-bottom: 15px; }
        .empty-state h3 { margin: 0 0 10px; color: #2c3e50; }
        .empty-state p { margin: 0 0 20px; color: #7f8c8d; }

        .btn { padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; }
        .btn-primary { background: #27ae60; color: white; }

        .modal-overlay { 
          position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; 
          z-index: 1000;
        }
        .modal-content { 
          background: white; border-radius: 16px; width: 90%; max-width: 500px; 
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        
        .modal-header { 
          padding: 20px; border-bottom: 1px solid #eee; 
          display: flex; justify-content: space-between; align-items: center;
        }
        .modal-header h2 { margin: 0; color: #27ae60; }
        .close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #7f8c8d; }
        
        .modal-body { padding: 20px; }
        .detail-row { 
          display: flex; justify-content: space-between; padding: 12px 0; 
          border-bottom: 1px solid #f0f0f0;
        }
        .detail-row:last-child { border-bottom: none; }
        .detail-row.highlight { background: #f8fff8; margin: 0 -20px; padding: 15px 20px; }
        .detail-label { color: #7f8c8d; }
        .detail-value { font-weight: 600; color: #2c3e50; }
        .status-badge { padding: 5px 12px; border-radius: 20px; font-size: 12px; color: white; }

        .loading-container { text-align: center; padding: 50px; }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid #f3f3f3; 
          border-top: 4px solid #27ae60; border-radius: 50%; 
          animation: spin 1s linear infinite; margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MyOrders;
