import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProductionManagerLayout = ({ children }) => {
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/notifications', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications.filter(n => !n.is_read));
      }
    } catch (err) {}
  };

  const handleLogout = async () => {
    localStorage.clear();
    await fetch('/api/system-authorization/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/production-manager/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/production-manager/orders', label: 'Production Orders', icon: '🏭' },
    { path: '/production-manager/create-order', label: 'Create Order', icon: '➕' },
    { path: '/production-manager/raw-materials', label: 'Raw Materials', icon: '📦' },
    { path: '/production-manager/finished-products', label: 'Finished Products', icon: '✅' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: notifications.length },
  ];

  const filteredMenuItems = menuItems.filter(item => item.path !== '/notifications' || notifications.length > 0);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Production Manager</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {filteredMenuItems.map(item => (
            <Link key={item.path} to={item.path} className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </>
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <h1>Production Manager - WAMS</h1>
          <div className="top-bar-actions">
            {notifications.length > 0 && <Link to="/notifications" className="notification-btn">🔔 {notifications.length}</Link>}
          </div>
        </header>
        <div className="content-area">{children}</div>
      </main>
      <style>{`
        .app-layout { display: flex; min-height: 100vh; }
        .sidebar { width: ${sidebarOpen ? '250px' : '60px'}; background: #e67e22; color: white; display: flex; flex-direction: column; transition: width 0.3s; position: fixed; height: 100vh; z-index: 100; }
        .sidebar-header { padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #d35400; }
        .sidebar-header h2 { margin: 0; color: white; font-size: 16px; }
        .toggle-btn { background: none; border: none; color: white; cursor: pointer; font-size: 16px; }
        .sidebar-nav { flex: 1; overflow-y: auto; padding: 10px 0; }
        .nav-item { display: flex; align-items: center; padding: 12px 15px; color: white; text-decoration: none; }
        .nav-item:hover, .nav-item.active { background: #d35400; }
        .nav-item.active { border-left: 3px solid white; }
        .nav-icon { margin-right: 10px; font-size: 18px; }
        .nav-label { flex: 1; white-space: nowrap; }
        .nav-badge { background: #e74c3c; padding: 2px 8px; border-radius: 10px; font-size: 12px; }
        .sidebar-footer { padding: 15px; border-top: 1px solid #d35400; }
        .logout-btn { width: 100%; padding: 8px; background: #c0392b; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .main-content { flex: 1; margin-left: ${sidebarOpen ? '250px' : '60px'}; transition: margin-left 0.3s; display: flex; flex-direction: column; }
        .top-bar { background: white; padding: 15px 20px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
        .top-bar h1 { margin: 0; font-size: 20px; color: #e67e22; }
        .notification-btn { background: #e67e22; color: white; padding: 8px 15px; border-radius: 4px; text-decoration: none; }
        .content-area { padding: 20px; flex: 1; background: #f5f5f5; }
      `}</style>
    </div>
  );
};

export default ProductionManagerLayout;