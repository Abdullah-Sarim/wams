import React, { useState, useEffect } from 'react';

const RawMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await fetch('/api/production-manager/production/raw-materials', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="raw-materials">
      <h1>Raw Materials Inventory</h1>
      
      {loading ? <p>Loading...</p> : materials.length === 0 ? (
        <p className="no-data">No raw materials in inventory</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id}>
                <td>#{m.id}</td>
                <td>{m.name}</td>
                <td>{m.sku}</td>
                <td>{m.quantity}</td>
                <td>{m.reorder_level}</td>
                <td>
                  <span className={`status ${m.quantity <= m.reorder_level ? 'low' : 'ok'}`}>
                    {m.quantity <= m.reorder_level ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .raw-materials h1 { color: #e67e22; margin-bottom: 20px; }
        .no-data { text-align: center; color: #999; padding: 40px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #e67e22; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.low { background: #f8d7da; color: #721c24; }
        .status.ok { background: #d4edda; color: #155724; }
      `}</style>
    </div>
  );
};

export default RawMaterials;
