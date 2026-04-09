import React, { useState, useEffect } from 'react';

const DataRecovery = () => {
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/system-maintenance/backups')
      .then(res => res.json())
      .then(data => { if (data.success) setBackups(data.backups); });
  }, []);

  const restoreBackup = async (path) => {
    if (!confirm('This will replace current data. Continue?')) return;
    try {
      const res = await fetch('/api/system-maintenance/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupPath: path })
      });
      const data = await res.json();
      if (data.success) setSuccess('Database restored successfully! Please restart the server.');
      else setError(data.message);
    } catch (err) { setError('Failed to restore backup'); }
  };

  return (
    <div className="page-container">
      <h1>Data Recovery</h1>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div className="card">
        <h3>Available Backups</h3>
        {backups.length === 0 ? <p>No backups available</p> : (
          <table>
            <thead><tr><th>Filename</th><th>Size</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>{backups.map(b => <tr key={b.name}><td>{b.name}</td><td>{(b.size / 1024).toFixed(2)} KB</td><td>{new Date(b.created).toLocaleString()}</td><td><button className="btn btn-warning" onClick={() => restoreBackup(b.path)}>Restore</button></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataRecovery;