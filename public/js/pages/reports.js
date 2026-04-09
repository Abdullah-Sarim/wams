// Reports Page Module
async function loadReports(container) {
  try {
    const stock = await API.reports.stock();
    const dealers = await API.reports.dealers();
    
    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card danger">
          <h3>Low Stock Items</h3>
          <div class="value">${stock.filter(p => p.current_stock <= p.min_stock).length}</div>
        </div>
        <div class="stat-card">
          <h3>Total Stock Value</h3>
          <div class="value">${Utils.formatCurrency(stock.reduce((sum, p) => sum + (p.current_stock * p.price), 0))}</div>
        </div>
        <div class="stat-card success">
          <h3>Total Dealers</h3>
          <div class="value">${dealers.length}</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">Stock Status</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Type</th>
              <th>Current Stock</th>
              <th>Min Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${stock.map(p => `
              <tr>
                <td>${Utils.escapeHtml(p.name)}</td>
                <td>${p.type}</td>
                <td>${p.current_stock} ${p.unit}</td>
                <td>${p.min_stock}</td>
                <td>${p.current_stock <= p.min_stock ? '<span class="badge badge-rejected">Low</span>' : '<span class="badge badge-approved">OK</span>'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="card">
        <div class="card-header">
          <span class="card-title">Dealer Summary</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Dealer</th>
              <th>Total Requests</th>
              <th>Total Purchases</th>
            </tr>
          </thead>
          <tbody>
            ${dealers.map(d => `
              <tr>
                <td>${Utils.escapeHtml(d.name)}</td>
                <td>${d.total_requests}</td>
                <td>${Utils.formatCurrency(d.total_purchases || 0)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

function loadSettings(container) {
  container.innerHTML = `
    <div class="card">
      <div class="card-header">
        <span class="card-title">System Settings</span>
      </div>
      <p class="text-muted">Settings functionality coming soon...</p>
    </div>
  `;
}

window.loadReports = loadReports;
window.loadSettings = loadSettings;