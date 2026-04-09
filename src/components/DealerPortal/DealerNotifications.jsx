import React, { useState, useEffect } from 'react';

const DealerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="dealer-notifications">
      <div className="header">
        <h1>My Notifications</h1>
        <button onClick={markAllAsRead} className="mark-all-btn">Mark All as Read</button>
      </div>

      {loading ? <p>Loading...</p> : notifications.length === 0 ? (
        <p className="no-notifications">No notifications</p>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.is_read ? 'read' : 'unread'} ${n.type}`}>
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
        .dealer-notifications .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .dealer-notifications h1 { color: #27ae60; margin: 0; }
        .mark-all-btn { padding: 8px 16px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .no-notifications { text-align: center; color: #999; padding: 40px; }
        .notifications-list { display: flex; flex-direction: column; gap: 15px; }
        .notification-item { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
        .notification-item.unread { border-left: 4px solid #27ae60; background: #f8fff8; }
        .notification-item.order_status { border-left: 4px solid #3498db; }
        .notification-content h3 { margin: 0 0 5px; color: #333; }
        .notification-content p { margin: 5px 0; color: #666; }
        .notification-content small { color: #999; }
        .read-btn { padding: 6px 12px; background: #27ae60; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
      `}</style>
    </div>
  );
};

export default DealerNotifications;