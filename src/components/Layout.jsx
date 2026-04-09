import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkSession();
    fetchNotifications();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/check-session');
      const data = await res.json();
      if (data.authenticated) {
        const userRes = await fetch('/api/system-authorization/current-user');
        const userData = await userRes.json();
        if (userData.user) {
          setUser(userData.user);
        }
      } else {
        window.location.href = '/login';
      }
    } catch (err) {
      window.location.href = '/login';
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications.filter(n => !n.is_read));
      }
    } catch (err) {}
  };

  const handleLogout = async () => {
    await fetch('/api/system-authorization/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/user-management/user-profile', label: 'User Profile', icon: '👤' },
    { path: '/user-management/manage-user-role', label: 'Manage Users', icon: '👥' },
    { path: '/dealer-management/create-dealer-profile', label: 'Dealer Management', icon: '🏪' },
    { path: '/dealer-management/dealers-orders', label: 'Dealer Orders', icon: '📦' },
    { path: '/stock-management/track-inventory', label: 'Track Inventory', icon: '📋' },
    { path: '/stock-management/update-stock', label: 'Update Stock', icon: '🔄' },
    { path: '/stock-management/set-reorder-levels', label: 'Set Reorder Levels', icon: '⚙️' },
    { path: '/supplier-management/supplier-detail', label: 'Suppliers', icon: '🚚' },
    { path: '/supplier-management/supplier-quotations', label: 'Quotations', icon: '📄' },
    { path: '/manufacturing/create-manufacturing-order', label: 'Manufacturing', icon: '🏭' },
    { path: '/manufacturing/manufacturing-completion', label: 'Production', icon: '✅' },
    { path: '/billing-payment/generate-bill', label: 'Generate Bill', icon: '💰' },
    { path: '/billing-payment/payment-tracking', label: 'Payments', icon: '💳' },
    { path: '/search-filter', label: 'Search', icon: '🔍' },
    { path: '/notifications', label: 'Notifications', icon: '🔔', badge: notifications.length },
    { path: '/notifications/system-alerts', label: 'System Alerts', icon: '⚠️' },
    { path: '/reporting/sales-report', label: 'Sales Report', icon: '📈' },
    { path: '/reporting/stock-report', label: 'Stock Report', icon: '📉' },
    { path: '/reporting/supplier-report', label: 'Supplier Report', icon: '📊' },
    { path: '/system-maintenance/data-backup', label: 'Data Backup', icon: '💾' },
    { path: '/system-maintenance/data-recovery', label: 'Data Recovery', icon: '🔧' },
    { path: '/system-authorization/change-password', label: 'Change Password', icon: '🔑' },
  ];

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>WAMS</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
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
          {user && (
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-role">{user.role}</span>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <header className="top-bar">
          <h1>Web-Based Automated Manufacturing System</h1>
          <div className="top-bar-actions">
            {notifications.length > 0 && (
              <Link to="/notifications" className="notification-btn">
                🔔 {notifications.length}
              </Link>
            )}
          </div>
        </header>
        <div className="content-area">
          {children}
        </div>
      </main>
      <style>{`
        .app-layout { display: flex; min-height: 100vh; }
        .sidebar { 
          width: ${sidebarOpen ? '250px' : '60px'}; 
          background: #2c3e50; 
          color: white; 
          display: flex; 
          flex-direction: column;
          transition: width 0.3s;
          position: fixed;
          height: 100vh;
          z-index: 100;
        }
        .sidebar-header { 
          padding: 15px; 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          border-bottom: 1px solid #34495e;
        }
        .sidebar-header h2 { margin: 0; color: #3498db; }
        .toggle-btn { 
          background: none; 
          border: none; 
          color: white; 
          cursor: pointer;
          font-size: 16px;
        }
        .sidebar-nav { 
          flex: 1; 
          overflow-y: auto; 
          padding: 10px 0; 
        }
        .nav-item { 
          display: flex; 
          align-items: center; 
          padding: 12px 15px; 
          color: #ecf0f1; 
          text-decoration: none;
          transition: background 0.2s;
        }
        .nav-item:hover, .nav-item.active { 
          background: #34495e; 
        }
        .nav-item.active { 
          border-left: 3px solid #3498db; 
        }
        .nav-icon { 
          margin-right: 10px; 
          font-size: 18px;
          width: 24px;
          text-align: center;
        }
        .nav-label { 
          flex: 1; 
          white-space: nowrap;
        }
        .nav-badge { 
          background: #e74c3c; 
          color: white; 
          padding: 2px 8px; 
          border-radius: 10px; 
          font-size: 12px;
        }
        .sidebar-footer { 
          padding: 15px; 
          border-top: 1px solid #34495e; 
        }
        .user-info { 
          margin-bottom: 10px; 
        }
        .user-name { 
          display: block; 
          font-weight: bold; 
        }
        .user-role { 
          font-size: 12px; 
          color: #95a5a6; 
        }
        .logout-btn { 
          width: 100%; 
          padding: 8px; 
          background: #e74c3c; 
          color: white; 
          border: none; 
          border-radius: 4px; 
          cursor: pointer; 
        }
        .main-content { 
          flex: 1; 
          margin-left: ${sidebarOpen ? '250px' : '60px'};
          transition: margin-left 0.3s;
          display: flex;
          flex-direction: column;
        }
        .top-bar { 
          background: white; 
          padding: 15px 20px; 
          border-bottom: 1px solid #ddd;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .top-bar h1 { 
          margin: 0; 
          font-size: 20px; 
          color: #2c3e50; 
        }
        .notification-btn { 
          background: #3498db; 
          color: white; 
          padding: 8px 15px; 
          border-radius: 4px; 
          text-decoration: none;
        }
        .content-area { 
          padding: 20px; 
          flex: 1; 
          background: #f5f5f5; 
        }
      `}</style>
    </div>
  );
};

export default Layout;