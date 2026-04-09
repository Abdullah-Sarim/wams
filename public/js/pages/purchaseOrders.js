// Purchase Orders Page Module
async function loadPurchaseOrders(container) {
  try {
    const orders = await API.purchaseOrders.list();
    const suppliers = await API.suppliers.list();
    const quotations = await API.quotations.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Purchase Orders</span>
          <button class="btn btn-primary" onclick="showPOModal()">New Order</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Order Date</th>
              <th>Expected Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td>${o.id}</td>
                <td>${Utils.escapeHtml(o.supplier_name)}</td>
                <td>${Utils.formatDate(o.order_date)}</td>
                <td>${Utils.formatDate(o.expected_date)}</td>
                <td>${Utils.getStatusBadge(o.status)}</td>
                <td class="actions">
                  ${o.status === 'confirmed' ? `
                    <button class="btn btn-sm btn-success" onclick="receiveOrder(${o.id})">Receive</button>
                  ` : ''}
                  ${o.status === 'pending' ? `
                    <button class="btn btn-sm btn-warning" onclick="updatePO(${o.id}, 'confirmed')">Confirm</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="poModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">New Purchase Order</span>
            <button class="modal-close" onclick="Utils.hideModal('poModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="poForm">
              <div class="form-group">
                <label>Supplier *</label>
                <select name="supplier_id" required>
                  <option value="">Select Supplier</option>
                  ${suppliers.map(s => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Quotation (Optional)</label>
                <select name="quotation_id">
                  <option value="">No Quotation</option>
                  ${quotations.filter(q => q.status === 'accepted').map(q => `<option value="${q.id}">${q.id} - ${Utils.escapeHtml(q.product_name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Order Date</label>
                  <input type="date" name="order_date" value="${Utils.today()}">
                </div>
                <div class="form-group">
                  <label>Expected Date</label>
                  <input type="date" name="expected_date">
                </div>
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('poModal')">Cancel</button>
            <button class="btn btn-primary" onclick="savePO()">Create Order</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function savePO() {
  const form = document.getElementById('poForm');
  const data = {
    supplier_id: parseInt(form.supplier_id.value),
    quotation_id: form.quotation_id.value ? parseInt(form.quotation_id.value) : null,
    order_date: form.order_date.value,
    expected_date: form.expected_date.value,
    notes: form.notes.value
  };
  
  try {
    await API.purchaseOrders.create(data);
    Utils.hideModal('poModal');
    loadPurchaseOrders(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function updatePO(id, status) {
  try {
    await API.purchaseOrders.update(id, { status });
    loadPurchaseOrders(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function receiveOrder(id) {
  try {
    await API.purchaseOrders.receive(id);
    alert('Stock updated successfully!');
    loadPurchaseOrders(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

function showPOModal() {
  document.getElementById('poForm').reset();
  Utils.showModal('poModal');
}

window.loadPurchaseOrders = loadPurchaseOrders;
window.savePO = savePO;
window.updatePO = updatePO;
window.receiveOrder = receiveOrder;
window.showPOModal = showPOModal;