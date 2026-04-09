// Production Page Module
async function loadProduction(container) {
  try {
    const production = await API.production.list();
    const products = await API.products.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Production Orders</span>
          <button class="btn btn-primary" onclick="showProductionModal()">New Production</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${production.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${Utils.escapeHtml(p.product_name)}</td>
                <td>${p.quantity}</td>
                <td>${Utils.formatDate(p.start_date)}</td>
                <td>${Utils.formatDate(p.end_date)}</td>
                <td>${Utils.getStatusBadge(p.status)}</td>
                <td class="actions">
                  ${p.status === 'planned' ? `
                    <button class="btn btn-sm btn-warning" onclick="updateProduction(${p.id}, 'in_progress')">Start</button>
                  ` : ''}
                  ${p.status === 'in_progress' ? `
                    <button class="btn btn-sm btn-success" onclick="updateProduction(${p.id}, 'completed')">Complete</button>
                  ` : ''}
                  <button class="btn btn-sm btn-outline" onclick="deleteProduction(${p.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="productionModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">New Production Order</span>
            <button class="modal-close" onclick="Utils.hideModal('productionModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="productionForm">
              <div class="form-group">
                <label>Product *</label>
                <select name="product_id" required>
                  <option value="">Select Product</option>
                  ${products.filter(p => p.type === 'finished_product').map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Quantity *</label>
                  <input type="number" name="quantity" required>
                </div>
                <div class="form-group">
                  <label>Start Date</label>
                  <input type="date" name="start_date" value="${Utils.today()}">
                </div>
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" name="end_date">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('productionModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveProduction()">Create</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function saveProduction() {
  const form = document.getElementById('productionForm');
  const data = {
    product_id: parseInt(form.product_id.value),
    quantity: parseInt(form.quantity.value),
    start_date: form.start_date.value,
    end_date: form.end_date.value,
    notes: form.notes.value
  };
  
  try {
    await API.production.create(data);
    Utils.hideModal('productionModal');
    loadProduction(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function updateProduction(id, status) {
  try {
    await API.production.update(id, { status, end_date: Utils.today() });
    if (status === 'completed') {
      alert('Production completed! Stock updated.');
    }
    loadProduction(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function deleteProduction(id) {
  if (confirm('Are you sure?')) {
    try {
      await API.production.delete(id);
      loadProduction(document.getElementById('pageContent'));
    } catch (err) {
      alert(err.message);
    }
  }
}

function showProductionModal() {
  document.getElementById('productionForm').reset();
  Utils.showModal('productionModal');
}

window.loadProduction = loadProduction;
window.saveProduction = saveProduction;
window.updateProduction = updateProduction;
window.deleteProduction = deleteProduction;
window.showProductionModal = showProductionModal;