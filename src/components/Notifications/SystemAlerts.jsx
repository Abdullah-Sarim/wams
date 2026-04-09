import React, { useState, useEffect } from 'react';

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/notifications/system-alerts')
      .then(res => res.json())
      .then(data => { if (data.success) setAlerts(data.alerts); });
  }, []);

  const resolveAlert = async (id) => {
    await fetch(`/api/notifications/system-alerts/${id}/resolve`, { method: 'PUT' });
    setAlerts(alerts.map(a => a.id === id ? { ...a, is_resolved: 1 } : a));
  };

  return (
    <div className="page-container">
      <h1>System Alerts</h1>
      {alerts.length === 0 ? <p>No alerts</p> : alerts.map(a => (
        <div key={a.id} style={{ padding: '15px', border: '1px solid #ddd', marginBottom: '10px', borderRadius: '5px', background: a.severity === 'critical' ? '#ffebee' : a.severity === 'warning' ? '#fff3e0' : '#e8f5e9' }}>
          <h3>{a.alert_type} {a.product_name && `- ${a.product_name}`}</h3>
          <p>{a.message}</p>
          <small>{a.created_at}</small>
          {!a.is_resolved && <button className="btn btn-success" onClick={() => resolveAlert(a.id)} style={{ marginLeft: '10px' }}>Resolve</button>}
        </div>
      ))}
    </div>
  );
};

export default SystemAlerts;