import React, { useState, useEffect } from 'react';

const DealerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/dealer-portal/dealer/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err) {}
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/notifications/${id}/read`, { method: 'PUT' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/notifications/read-all', { method: 'PUT' });
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {}
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/notifications/${id}`, { method: 'DELETE' });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {}
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') return notifications.filter(n => !n.is_read);
    if (filter === 'read') return notifications.filter(n => n.is_read);
    return notifications;
  };

  const getTypeIcon = (type) => {
    const icons = {
      order_status: '📦',
      payment_required: '💰',
      quotation_request: '📄',
      order: '🛒',
      default: '🔔'
    };
    return icons[type] || icons.default;
  };

  const getTypeColor = (type) => {
    const colors = {
      order_status: '#3498db',
      payment_required: '#e74c3c',
      quotation_request: '#9b59b6',
      order: '#27ae60',
      default: '#95a5a6'
    };
    return colors[type] || colors.default;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const filtered = getFilteredNotifications();

  if (loading) return <div className="loading-container"><div className="spinner"></div>Loading...</div>;

  return (
    <div className="dealer-notifications">
      <div className="notifications-header">
        <div>
          <h1>🔔 My Notifications</h1>
          <p>You have <strong>{unreadCount}</strong> unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="header-actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="mark-all-btn">Mark All as Read</button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <h3>No Notifications</h3>
          <p>You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {filtered.map(n => (
            <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`}>
              <div className="notification-icon" style={{ background: getTypeColor(n.type) }}>
                {getTypeIcon(n.type)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{n.title}</h3>
                  <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <p>{n.message}</p>
                <div className="notification-meta">
                  <span className="notification-type" style={{ color: getTypeColor(n.type) }}>{n.type}</span>
                </div>
              </div>
              <div className="notification-actions">
                {!n.is_read && (
                  <button onClick={() => markAsRead(n.id)} className="action-btn read-btn" title="Mark as Read">
                    ✓
                  </button>
                )}
                <button onClick={() => deleteNotification(n.id)} className="action-btn delete-btn" title="Delete">
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .dealer-notifications { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        .notifications-header { 
          display: flex; justify-content: space-between; align-items: center; 
          margin-bottom: 25px; padding: 20px; background: white; border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }
        .notifications-header h1 { margin: 0 0 5px; color: #27ae60; font-size: 24px; }
        .notifications-header p { margin: 0; color: #7f8c8d; }
        
        .header-actions { display: flex; gap: 10px; align-items: center; }
        .filter-select { 
          padding: 10px 15px; border: 2px solid #eee; border-radius: 8px; 
          font-size: 14px; cursor: pointer; background: white;
        }
        .mark-all-btn { 
          padding: 10px 20px; background: linear-gradient(135deg, #27ae60, #2ecc71); 
          color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;
          transition: transform 0.2s;
        }
        .mark-all-btn:hover { transform: scale(1.02); }
        
        .notifications-list { display: flex; flex-direction: column; gap: 12px; }
        .notification-item { 
          background: white; padding: 20px; border-radius: 12px; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; gap: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .notification-item:hover { transform: translateX(5px); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .notification-item.unread { border-left: 4px solid #27ae60; background: #f8fff8; }
        
        .notification-icon { 
          width: 50px; height: 50px; border-radius: 12px; 
          display: flex; align-items: center; justify-content: center; 
          font-size: 24px; flex-shrink: 0;
        }
        
        .notification-content { flex: 1; }
        .notification-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .notification-header h3 { margin: 0; color: #2c3e50; font-size: 16px; }
        .notification-time { font-size: 12px; color: #95a5a6; }
        .notification-content p { margin: 0 0 10px; color: #555; line-height: 1.5; }
        .notification-meta { display: flex; gap: 10px; }
        .notification-type { font-size: 12px; font-weight: 500; text-transform: uppercase; }
        
        .notification-actions { display: flex; flex-direction: column; gap: 8px; }
        .action-btn { 
          width: 36px; height: 36px; border: none; border-radius: 8px; 
          cursor: pointer; font-size: 16px; transition: transform 0.2s;
        }
        .action-btn:hover { transform: scale(1.1); }
        .read-btn { background: #27ae60; color: white; }
        .delete-btn { background: #fee; color: #e74c3c; }
        
        .empty-state { 
          text-align: center; padding: 60px 20px; background: white; 
          border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        .empty-icon { font-size: 64px; margin-bottom: 15px; }
        .empty-state h3 { margin: 0 0 10px; color: #2c3e50; }
        .empty-state p { margin: 0; color: #7f8c8d; }
        
        .loading-container { text-align: center; padding: 50px; color: #7f8c8d; }
        .spinner { 
          width: 40px; height: 40px; border: 4px solid #f3f3f3; 
          border-top: 4px solid #27ae60; border-radius: 50%; 
          animation: spin 1s linear infinite; margin: 0 auto 15px;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        @media (max-width: 768px) {
          .notifications-header { flex-direction: column; gap: 15px; text-align: center; }
          .notification-item { flex-direction: column; }
          .notification-actions { flex-direction: row; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
};

export default DealerNotifications;
