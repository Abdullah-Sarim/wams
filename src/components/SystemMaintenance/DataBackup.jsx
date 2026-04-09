import React, { useState, useEffect } from 'react';

const DataBackup = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => { fetchBackups(); }, []);

  const fetchBackups = async () => {
    const res = await fetch('/api/system-maintenance/backups');
    const data = await res.json();
    if (data.success) setBackups(data.backups);
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/system-maintenance/backup', { method: 'GET' });
      const data = await res.json();
      if (data.success) { setSuccess('Backup created!'); fetchBackups(); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteBackup = async (filename) => {
    if (!confirm('Delete this backup?')) return;
    await fetch(`/api/system-maintenance/backups/${filename}`, { method: 'DELETE' });
    fetchBackups();
  };

  return (
    <div className="page-container">
      <h1>Data Backup</h1>
      <div className="card">
        <button className="btn btn-primary" onClick={createBackup} disabled={loading}>{loading ? 'Creating...' : 'Create Backup'}</button>
        {success && <div className="success" style={{ marginTop: '10px' }}>{success}</div>}
      </div>
      <div className="card">
        <h3>Available Backups</h3>
        {backups.length === 0 ? <p>No backups available</p> : (
          <table>
            <thead><tr><th>Filename</th><th>Size</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>{backups.map(b => <tr key={b.name}><td>{b.name}</td><td>{(b.size / 1024).toFixed(2)} KB</td><td>{new Date(b.created).toLocaleString()}</td><td><button className="btn btn-danger" onClick={() => deleteBackup(b.name)}>Delete</button></td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataBackup;