// Dashboard Page Module
async function loadDashboard(container) {
  try {
    const stats = await API.dashboard.stats();
    const lowStock = await API.products.lowStock();
    const requests = await API.requests.list();
    
    // Get recent activity
    const recentRequests = requests.slice(0, 5);
    const pendingRequests = requests.filter(r => r.status === 'pending').length;
    
    let lowStockItems = '';
    if (lowStock.length > 0) {
      lowStockItems = lowStock.slice(0, 3).map(p => `
        <div class="flex flex-between items-center p-2" style="background: #fff5f5; border-radius: 4px; margin-bottom: 8px;">
          <span>${Utils.escapeHtml(p.name)}</span>
          <span class="text-danger">${p.current_stock} left</span>
        </div>
      `).join('');
    }
    
    container.innerHTML = `
      <!-- Alert Banner -->
      ${lowStock.length > 0 ? `
        <div class="alert alert-warning">
          <span>⚠️</span>
          <div>
            <strong>Low Stock Alert:</strong> ${lowStock.length} items need restocking
            <button class="btn btn-sm btn-warning ml-2" onclick="navigateTo('products')">View Items</button>
          </div>
        </div>
      ` : ''}
      
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card info">
          <div class="icon">📦</div>
          <h3>Total Products</h3>
          <div class="value">${stats.totalProducts}</div>
        </div>
        <div class="stat-card danger">
          <div class="icon">⚠️</div>
          <h3>Low Stock Items</h3>
          <div class="value">${stats.lowStock}</div>
        </div>
        <div class="stat-card warning">
          <div class="icon">📝</div>
          <h3>Pending Requests</h3>
          <div class="value">${stats.pendingOrders}</div>
        </div>
        <div class="stat-card success">
          <div class="icon">🏢</div>
          <h3>Total Dealers</h3>
          <div class="value">${stats.totalDealers}</div>
        </div>
        <div class="stat-card">
          <div class="icon">🚚</div>
          <h3>Total Suppliers</h3>
          <div class="value">${stats.totalSuppliers}</div>
        </div>
        <div class="stat-card warning">
          <div class="icon">📄</div>
          <h3>Pending Bills</h3>
          <div class="value">${stats.pendingBills}</div>
        </div>
      </div>
      
      <!-- Quick Actions & Alerts -->
      <div class="flex gap-4" style="margin-bottom: 24px;">
        <div class="card" style="flex: 1;">
          <div class="card-header">
            <span class="card-title">🚀 Quick Actions</span>
          </div>
          <div class="flex gap-2" style="flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="navigateTo('products')">📦 Products</button>
            <button class="btn btn-success" onclick="navigateTo('requests')">📝 Requests</button>
            <button class="btn btn-warning" onclick="navigateTo('billing')">📄 Create Bill</button>
            <button class="btn btn-info" onclick="navigateTo('production')">⚙️ Production</button>
            <button class="btn btn-outline" onclick="navigateTo('reports')">📈 Reports</button>
          </div>
        </div>
      </div>
      
      <!-- Two Column Layout -->
      <div class="flex gap-4">
        <!-- Low Stock Items -->
        <div class="card" style="flex: 1;">
          <div class="card-header">
            <span class="card-title">⚠️ Low Stock Alerts</span>
            <span class="badge badge-danger">${lowStock.length}</span>
          </div>
          ${lowStock.length > 0 ? `
            <div>
              ${lowStockItems}
              ${lowStock.length > 3 ? `<button class="btn btn-sm btn-outline w-full mt-2" onclick="navigateTo('products')">View All ${lowStock.length} Items →</button>` : ''}
            </div>
          ` : `
            <div class="table-empty">
              <div>✅ All products are well stocked</div>
            </div>
          `}
        </div>
        
        <!-- Recent Requests -->
        <div class="card" style="flex: 1;">
          <div class="card-header">
            <span class="card-title">📋 Recent Requests</span>
            <span class="badge badge-pending">${pendingRequests} pending</span>
          </div>
          ${recentRequests.length > 0 ? `
            <div>
              ${recentRequests.map(r => `
                <div class="flex flex-between items-center p-2" style="border-bottom: 1px solid var(--border);">
                  <div>
                    <strong>${Utils.escapeHtml(r.dealer_name)}</strong>
                    <div class="text-muted">${Utils.escapeHtml(r.product_name)} × ${r.quantity}</div>
                  </div>
                  ${Utils.getStatusBadge(r.status)}
                </div>
              `).join('')}
              <button class="btn btn-sm btn-outline w-full mt-2" onclick="navigateTo('requests')">View All Requests →</button>
            </div>
          ` : `
            <div class="table-empty">
              <div>No requests yet</div>
            </div>
          `}
        </div>
      </div>
      
      <!-- System Info -->
      <div class="card mt-4">
        <div class="flex flex-between items-center">
          <span class="text-muted">Web Based Automated Manufacturing System (WAMS)</span>
          <span class="text-muted">v1.0.0</span>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error loading dashboard: ${err.message}</div>`;
  }
}

window.loadDashboard = loadDashboard;