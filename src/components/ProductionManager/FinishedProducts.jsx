import React, { useState, useEffect } from 'react';

const FinishedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/production-manager/production/finished-products', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {}
    setLoading(false);
  };

  return (
    <div className="finished-products">
      <h1>Finished Products Inventory</h1>
      
      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <p className="no-data">No finished products in inventory</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Current Stock</th>
              <th>Unit Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>{p.quantity}</td>
                <td>${p.unit_price}</td>
                <td>
                  <span className={`status ${p.quantity > 0 ? 'ok' : 'out'}`}>
                    {p.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style>{`
        .finished-products h1 { color: #e67e22; margin-bottom: 20px; }
        .no-data { text-align: center; color: #999; padding: 40px; }
        table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        th { background: #e67e22; color: white; padding: 12px; text-align: left; }
        td { padding: 12px; border-bottom: 1px solid #eee; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.ok { background: #d4edda; color: #155724; }
        .status.out { background: #f8d7da; color: #721c24; }
      `}</style>
    </div>
  );
};

export default FinishedProducts;
