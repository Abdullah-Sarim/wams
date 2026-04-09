// Requests Page Module
async function loadRequests(container) {
  try {
    const requests = await API.requests.list();
    const dealers = await API.dealers.list();
    const products = await API.products.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Dealer Requests</span>
          <button class="btn btn-primary" onclick="showRequestModal()">New Request</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Dealer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Requested Date</th>
              <th>Delivery Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => `
              <tr>
                <td>${r.id}</td>
                <td>${Utils.escapeHtml(r.dealer_name)}</td>
                <td>${Utils.escapeHtml(r.product_name)}</td>
                <td>${r.quantity}</td>
                <td>${Utils.getStatusBadge(r.status)}</td>
                <td>${Utils.formatDate(r.requested_date)}</td>
                <td>${Utils.formatDate(r.delivery_date)}</td>
                <td class="actions">
                  ${r.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="updateRequest(${r.id}, 'approved')">Approve</button>
                    <button class="btn btn-sm btn-danger" onclick="updateRequest(${r.id}, 'rejected')">Reject</button>
                  ` : ''}
                  ${r.status === 'approved' ? `
                    <button class="btn btn-sm btn-primary" onclick="updateRequest(${r.id}, 'completed')">Complete</button>
                  ` : ''}
                  <button class="btn btn-sm btn-outline" onclick="deleteRequest(${r.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="requestModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">New Request</span>
            <button class="modal-close" onclick="Utils.hideModal('requestModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="requestForm">
              <div class="form-group">
                <label>Dealer *</label>
                <select name="dealer_id" required>
                  <option value="">Select Dealer</option>
                  ${dealers.map(d => `<option value="${d.id}">${Utils.escapeHtml(d.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Product *</label>
                <select name="product_id" required>
                  <option value="">Select Product</option>
                  ${products.map(p => `<option value="${p.id}">${Utils.escapeHtml(p.name)}</option>`).join('')}
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Quantity *</label>
                  <input type="number" name="quantity" required>
                </div>
                <div class="form-group">
                  <label>Requested Date</label>
                  <input type="date" name="requested_date" value="${Utils.today()}">
                </div>
              </div>
              <div class="form-group">
                <label>Expected Delivery Date</label>
                <input type="date" name="delivery_date">
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea name="notes" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('requestModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveRequest()">Submit</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function saveRequest() {
  const form = document.getElementById('requestForm');
  const data = {
    dealer_id: parseInt(form.dealer_id.value),
    product_id: parseInt(form.product_id.value),
    quantity: parseInt(form.quantity.value),
    requested_date: form.requested_date.value,
    delivery_date: form.delivery_date.value,
    notes: form.notes.value
  };
  
  try {
    await API.requests.create(data);
    Utils.hideModal('requestModal');
    loadRequests(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function updateRequest(id, status) {
  try {
    await API.requests.update(id, { status });
    loadRequests(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function deleteRequest(id) {
  if (confirm('Are you sure?')) {
    try {
      await API.requests.delete(id);
      loadRequests(document.getElementById('pageContent'));
    } catch (err) {
      alert(err.message);
    }
  }
}

function showRequestModal() {
  document.getElementById('requestForm').reset();
  Utils.showModal('requestModal');
}

window.loadRequests = loadRequests;
window.saveRequest = saveRequest;
window.updateRequest = updateRequest;
window.deleteRequest = deleteRequest;
window.showRequestModal = showRequestModal;