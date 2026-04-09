// Products Page Module
async function loadProducts(container) {
  try {
    const products = await API.products.list();
    
    // Calculate stats
    const totalValue = products.reduce((sum, p) => sum + (p.current_stock * p.price), 0);
    const lowStockCount = products.filter(p => p.current_stock <= p.min_stock).length;
    
    container.innerHTML = `
      <!-- Summary Cards -->
      <div class="stats-grid" style="margin-bottom: 20px;">
        <div class="stat-card info">
          <h3>Total Products</h3>
          <div class="value">${products.length}</div>
        </div>
        <div class="stat-card danger">
          <h3>Low Stock</h3>
          <div class="value">${lowStockCount}</div>
        </div>
        <div class="stat-card success">
          <h3>Total Value</h3>
          <div class="value">${Utils.formatCurrency(totalValue)}</div>
        </div>
      </div>
      
      <!-- Products Table -->
      <div class="card">
        <div class="card-header">
          <span class="card-title">Products & Inventory</span>
          <button class="btn btn-primary" onclick="showProductModal()">+ Add Product</button>
        </div>
        
        <div class="search-box">
          <input type="text" id="productSearch" placeholder="Search products by name, type..." onkeyup="filterProducts()">
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Product Name</th>
                <th>Type</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="productsTableBody">
              ${products.length === 0 ? `
                <tr>
                  <td colspan="8" class="table-empty">
                    <div>No products found. Add your first product to get started.</div>
                  </td>
                </tr>
              ` : products.map(p => `
                <tr class="product-row ${p.current_stock <= p.min_stock ? 'low-stock-row' : ''}">
                  <td><span class="badge badge-inactive">${p.id}</span></td>
                  <td>
                    <strong>${Utils.escapeHtml(p.name)}</strong>
                    ${p.description ? `<div class="text-muted" style="font-size: 12px;">${Utils.escapeHtml(p.description.substring(0, 50))}${p.description.length > 50 ? '...' : ''}</div>` : ''}
                  </td>
                  <td>
                    ${p.type === 'finished_product' ? '<span class="badge badge-completed">Finished</span>' : 
                      p.type === 'raw_material' ? '<span class="badge badge-pending">Raw Material</span>' : 
                      '<span class="badge badge-planned">Part</span>'}
                  </td>
                  <td class="${p.current_stock <= p.min_stock ? 'text-danger' : 'text-success'}">
                    <strong>${p.current_stock}</strong> ${p.unit}
                  </td>
                  <td>${p.min_stock}</td>
                  <td>${Utils.formatCurrency(p.price)}</td>
                  <td>
                    ${p.current_stock <= p.min_stock ? '<span class="badge badge-danger">Low Stock</span>' : 
                      p.current_stock <= p.min_stock * 2 ? '<span class="badge badge-warning">Medium</span>' : 
                      '<span class="badge badge-success">OK</span>'}
                  </td>
                  <td class="actions">
                    <button class="btn btn-sm btn-outline" onclick="editProduct(${p.id})">✏️ Edit</button>
                    <button class="btn btn-sm btn-warning" onclick="showStockModal(${p.id}, '${Utils.escapeHtml(p.name)}', ${p.current_stock})">📦 Stock</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${p.id})">🗑️</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Add/Edit Product Modal -->
      <div class="modal" id="productModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title" id="productModalTitle">Add New Product</span>
            <button class="modal-close" onclick="Utils.hideModal('productModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="productForm">
              <input type="hidden" name="id">
              <div class="form-group">
                <label>Product Name *</label>
                <input type="text" name="name" required placeholder="Enter product name">
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea name="description" rows="2" placeholder="Product description (optional)"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select name="type">
                    <option value="finished_product">Finished Product</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="part">Part/Component</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Unit</label>
                  <input type="text" name="unit" value="pcs" placeholder="e.g., pcs, kg, units">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Current Stock</label>
                  <input type="number" name="current_stock" value="0" min="0">
                </div>
                <div class="form-group">
                  <label>Min Stock Level</label>
                  <input type="number" name="min_stock" value="10" min="0">
                </div>
              </div>
              <div class="form-group">
                <label>Unit Price (₹)</label>
                <input type="number" name="price" step="0.01" value="0" min="0" placeholder="0.00">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('productModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveProduct()">Save Product</button>
          </div>
        </div>
      </div>
      
      <!-- Stock Adjustment Modal -->
      <div class="modal" id="stockModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">Adjust Stock</span>
            <button class="modal-close" onclick="Utils.hideModal('stockModal')">&times;</button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4" id="stockProductName" style="margin-bottom: 16px;"></div>
            <form id="stockForm">
              <input type="hidden" name="product_id">
              <div class="form-group">
                <label>Current Stock</label>
                <input type="text" id="currentStockDisplay" disabled class="text-center" style="font-size: 18px; font-weight: 600;">
              </div>
              <div class="form-group">
                <label>Adjustment Type</label>
                <select name="type">
                  <option value="in">➕ Add Stock</option>
                  <option value="out">➖ Remove Stock</option>
                  <option value="set">📊 Set Stock</option>
                </select>
              </div>
              <div class="form-group">
                <label>Quantity</label>
                <input type="number" name="quantity" required min="0" placeholder="Enter quantity">
              </div>
              <div class="form-group">
                <label>Notes / Reason</label>
                <textarea name="notes" rows="2" placeholder="Reason for stock adjustment (optional)"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('stockModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveStock()">Update Stock</button>
          </div>
        </div>
      </div>
    `;
    
    window._productsData = products;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

function filterProducts() {
  const search = document.getElementById('productSearch').value.toLowerCase();
  const rows = document.querySelectorAll('.product-row');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}

async function saveProduct() {
  const form = document.getElementById('productForm');
  const data = {
    name: form.name.value,
    description: form.description.value,
    type: form.type.value,
    unit: form.unit.value,
    current_stock: parseInt(form.current_stock.value) || 0,
    min_stock: parseInt(form.min_stock.value) || 0,
    price: parseFloat(form.price.value) || 0
  };
  
  try {
    if (form.id.value) {
      await API.products.update(parseInt(form.id.value), data);
      showToast('Product updated successfully!');
    } else {
      await API.products.create(data);
      showToast('Product added successfully!');
    }
    Utils.hideModal('productModal');
    loadProducts(document.getElementById('pageContent'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editProduct(id) {
  const product = await API.products.get(id);
  const form = document.getElementById('productForm');
  document.getElementById('productModalTitle').textContent = 'Edit Product';
  form.id.value = product.id;
  form.name.value = product.name;
  form.description.value = product.description || '';
  form.type.value = product.type;
  form.unit.value = product.unit;
  form.current_stock.value = product.current_stock;
  form.min_stock.value = product.min_stock;
  form.price.value = product.price;
  Utils.showModal('productModal');
}

async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    try {
      await API.products.delete(id);
      showToast('Product deleted successfully!');
      loadProducts(document.getElementById('pageContent'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

function showProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('productForm').id.value = '';
  document.getElementById('productModalTitle').textContent = 'Add New Product';
  Utils.showModal('productModal');
}

function showStockModal(id, name, stock) {
  const form = document.getElementById('stockForm');
  form.product_id.value = id;
  document.getElementById('stockProductName').innerHTML = `<strong>📦 Product:</strong> ${name}`;
  document.getElementById('currentStockDisplay').value = `${stock} units`;
  form.quantity.value = '';
  form.notes.value = '';
  Utils.showModal('stockModal');
}

async function saveStock() {
  const form = document.getElementById('stockForm');
  try {
    const result = await API.products.adjustStock(parseInt(form.product_id.value), {
      quantity: parseInt(form.quantity.value),
      type: form.type.value,
      notes: form.notes.value
    });
    showToast(`Stock updated! New balance: ${result.new_stock}`);
    Utils.hideModal('stockModal');
    loadProducts(document.getElementById('pageContent'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.loadProducts = loadProducts;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.showProductModal = showProductModal;
window.showStockModal = showStockModal;
window.saveStock = saveStock;
window.filterProducts = filterProducts;