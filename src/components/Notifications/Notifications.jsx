import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/notifications/notifications')
      .then(res => res.json())
      .then(data => { if (data.success) setNotifications(data.notifications); });
  }, []);

  const markAsRead = async (id) => {
    await fetch(`/api/notifications/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  const markAllAsRead = async () => {
    await fetch('/api/notifications/notifications/read-all', { method: 'PUT' });
    setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Notifications</h1>
        <button className="btn btn-primary" onClick={markAllAsRead}>Mark All as Read</button>
      </div>
      <div>
        {notifications.length === 0 ? <p>No notifications</p> : notifications.map(n => (
          <div key={n.id} style={{ padding: '15px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '5px', background: n.is_read ? '#fff' : '#e3f2fd' }}>
            <h3>{n.title}</h3>
            <p>{n.message}</p>
            <small>{n.created_at}</small>
            {!n.is_read && <button onClick={() => markAsRead(n.id)} style={{ marginLeft: '10px' }}>Mark as Read</button>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;