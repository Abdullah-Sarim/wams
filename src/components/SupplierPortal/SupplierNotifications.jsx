import React, { useState, useEffect } from 'react';

const SupplierNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/supplier-portal/supplier/notifications');
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

  return (
    <div className="supplier-notifications">
      <h1>My Notifications</h1>

      {loading ? <p>Loading...</p> : notifications.length === 0 ? (
        <p className="no-data">No notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'}`}>
              <div className="notification-content">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <small>{n.created_at}</small>
              </div>
              {!n.is_read && (
                <button onClick={() => markAsRead(n.id)} className="read-btn">Mark as Read</button>
              )}
            </div>
          ))}
        </div>
      )}

      <style>{`
        .supplier-notifications h1 { color: #8e44ad; margin-bottom: 20px; }
        .no-data { text-align: center; color: #999; padding: 40px; }
        .notifications-list { display: flex; flex-direction: column; gap: 15px; }
        .notification-item { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .notification-item.unread { border-left: 4px solid #8e44ad; background: #f8f7fc; }
        .notification-content h3 { margin: 0 0 5px; color: #333; }
        .notification-content p { margin: 5px 0; color: #666; }
        .notification-content small { color: #999; }
        .read-btn { padding: 6px 12px; background: #8e44ad; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default SupplierNotifications;