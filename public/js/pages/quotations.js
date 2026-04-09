// Quotations Page Module
async function loadQuotations(container) {
  try {
    const quotations = await API.quotations.list();
    const suppliers = await API.suppliers.list();
    const products = await API.products.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Quotations</span>
          <button class="btn btn-primary" onclick="showQuotationModal()">New Quotation</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${quotations.map(q => `
              <tr>
                <td>${q.id}</td>
                <td>${Utils.escapeHtml(q.supplier_name)}</td>
                <td>${Utils.escapeHtml(q.product_name)}</td>
                <td>${q.quantity}</td>
                <td>${Utils.formatCurrency(q.unit_price)}</td>
                <td>${Utils.formatCurrency(q.total_price)}</td>
                <td>${Utils.formatDate(q.valid_until)}</td>
                <td>${Utils.getStatusBadge(q.status)}</td>
                <td class="actions">
                  ${q.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="updateQuotation(${q.id}, 'accepted')">Accept</button>
                    <button class="btn btn-sm btn-danger" onclick="updateQuotation(${q.id}, 'rejected')">Reject</button>
                  ` : ''}
                  <button class="btn btn-sm btn-outline" onclick="deleteQuotation(${q.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="quotationModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">New Quotation</span>
            <button class="modal-close" onclick="Utils.hideModal('quotationModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="quotationForm">
              <div class="form-group">
                <label>Supplier *</label>
                <select name="supplier_id" required>
                  <option value="">Select Supplier</option>
                  ${suppliers.map(s => `<option value="${s.id}">${Utils.escapeHtml(s.name)}</option>`).join('')}
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
                  <label>Unit Price *</label>
                  <input type="number" name="unit_price" step="0.01" required>
                </div>
              </div>
              <div class="form-group">
                <label>Valid Until</label>
                <input type="date" name="valid_until">
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('quotationModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveQuotation()">Submit</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function saveQuotation() {
  const form = document.getElementById('quotationForm');
  const data = {
    supplier_id: parseInt(form.supplier_id.value),
    product_id: parseInt(form.product_id.value),
    quantity: parseInt(form.quantity.value),
    unit_price: parseFloat(form.unit_price.value),
    valid_until: form.valid_until.value
  };
  
  try {
    await API.quotations.create(data);
    Utils.hideModal('quotationModal');
    loadQuotations(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function updateQuotation(id, status) {
  try {
    await API.quotations.update(id, { status });
    loadQuotations(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function deleteQuotation(id) {
  if (confirm('Are you sure?')) {
    try {
      await API.quotations.delete(id);
      loadQuotations(document.getElementById('pageContent'));
    } catch (err) {
      alert(err.message);
    }
  }
}

function showQuotationModal() {
  document.getElementById('quotationForm').reset();
  Utils.showModal('quotationModal');
}

window.loadQuotations = loadQuotations;
window.saveQuotation = saveQuotation;
window.updateQuotation = updateQuotation;
window.deleteQuotation = deleteQuotation;
window.showQuotationModal = showQuotationModal;