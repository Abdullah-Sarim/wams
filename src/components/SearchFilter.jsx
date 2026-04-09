import React, { useState } from 'react';

const SearchFilter = () => {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('inventory');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/search-filter/search?query=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      if (data.success) setResults(data.results);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div className="page-container">
      <h1>Search & Filter</h1>
      <div className="card">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="text" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="inventory">Inventory</option>
            <option value="dealers">Dealers</option>
            <option value="suppliers">Suppliers</option>
            <option value="bills">Bills</option>
          </select>
          <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>Search</button>
        </div>
        {loading && <div className="loading">Searching...</div>}
        {results && (
          <div>
            {type === 'inventory' && results.inventory?.length > 0 && (
              <table><thead><tr><th>ID</th><th>Name</th><th>Code</th><th>Stock</th><th>Price</th></tr></thead>
                <tbody>{results.inventory.map(i => <tr key={i.id}><td>{i.id}</td><td>{i.product_name}</td><td>{i.product_code}</td><td>{i.current_stock}</td><td>${i.unit_price}</td></tr>)}</tbody></table>
            )}
            {type === 'dealers' && results.dealers?.length > 0 && (
              <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
                <tbody>{results.dealers.map(d => <tr key={d.id}><td>{d.id}</td><td>{d.name}</td><td>{d.email}</td><td>{d.phone}</td></tr>)}</tbody></table>
            )}
            {type === 'suppliers' && results.suppliers?.length > 0 && (
              <table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th></tr></thead>
                <tbody>{results.suppliers.map(s => <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.email}</td><td>{s.phone}</td></tr>)}</tbody></table>
            )}
            {type === 'bills' && results.bills?.length > 0 && (
              <table><thead><tr><th>ID</th><th>Bill #</th><th>Dealer</th><th>Amount</th><th>Status</th></tr></thead>
                <tbody>{results.bills.map(b => <tr key={b.id}><td>{b.id}</td><td>{b.bill_number}</td><td>{b.dealer_name}</td><td>${b.total_amount}</td><td>{b.status}</td></tr>)}</tbody></table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;