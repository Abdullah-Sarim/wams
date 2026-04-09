// Suppliers Page Module
async function loadSuppliers(container) {
  try {
    const suppliers = await API.suppliers.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Suppliers List</span>
          <button class="btn btn-primary" onclick="showSupplierModal()">Add Supplier</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${suppliers.map(s => `
              <tr>
                <td>${s.id}</td>
                <td>${Utils.escapeHtml(s.name)}</td>
                <td>${Utils.escapeHtml(s.contact_person || '-')}</td>
                <td>${Utils.escapeHtml(s.email || '-')}</td>
                <td>${Utils.escapeHtml(s.phone || '-')}</td>
                <td class="actions">
                  <button class="btn btn-sm btn-outline" onclick="editSupplier(${s.id})">Edit</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteSupplier(${s.id})">Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="supplierModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title">Add/Edit Supplier</span>
            <button class="modal-close" onclick="Utils.hideModal('supplierModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="supplierForm">
              <input type="hidden" name="id">
              <div class="form-group">
                <label>Company Name *</label>
                <input type="text" name="name" required>
              </div>
              <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contact_person">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" name="email">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone">
                </div>
              </div>
              <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('supplierModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveSupplier()">Save</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

async function saveSupplier() {
  const form = document.getElementById('supplierForm');
  const data = {
    name: form.name.value,
    contact_person: form.contact_person.value,
    email: form.email.value,
    phone: form.phone.value,
    address: form.address.value
  };
  
  try {
    if (form.id.value) {
      await API.suppliers.update(parseInt(form.id.value), data);
    } else {
      await API.suppliers.create(data);
    }
    Utils.hideModal('supplierModal');
    loadSuppliers(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function editSupplier(id) {
  const supplier = await API.suppliers.get(id);
  const form = document.getElementById('supplierForm');
  form.id.value = supplier.id;
  form.name.value = supplier.name;
  form.contact_person.value = supplier.contact_person || '';
  form.email.value = supplier.email || '';
  form.phone.value = supplier.phone || '';
  form.address.value = supplier.address || '';
  Utils.showModal('supplierModal');
}

async function deleteSupplier(id) {
  if (confirm('Are you sure you want to delete this supplier?')) {
    try {
      await API.suppliers.delete(id);
      loadSuppliers(document.getElementById('pageContent'));
    } catch (err) {
      alert(err.message);
    }
  }
}

function showSupplierModal() {
  document.getElementById('supplierForm').reset();
  document.getElementById('supplierForm').id.value = '';
  Utils.showModal('supplierModal');
}

window.loadSuppliers = loadSuppliers;
window.saveSupplier = saveSupplier;
window.editSupplier = editSupplier;
window.deleteSupplier = deleteSupplier;
window.showSupplierModal = showSupplierModal;