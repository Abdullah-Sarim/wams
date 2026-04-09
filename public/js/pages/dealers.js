// Dealers Page Module
async function loadDealers(container) {
  try {
    const dealers = await API.dealers.list();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Dealers Management</span>
          <button class="btn btn-primary" onclick="showDealerModal()">+ Add Dealer</button>
        </div>
        
        <div class="search-box">
          <input type="text" id="dealerSearch" placeholder="Search dealers by name, email, or phone..." onkeyup="filterDealers()">
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company Name</th>
                <th>Contact Person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="dealersTableBody">
              ${dealers.length === 0 ? `
                <tr>
                  <td colspan="6" class="table-empty">
                    <div>No dealers found. Add your first dealer to get started.</div>
                  </td>
                </tr>
              ` : dealers.map(d => `
                <tr class="dealer-row">
                  <td><span class="badge badge-active">${d.id}</span></td>
                  <td><strong>${Utils.escapeHtml(d.name)}</strong></td>
                  <td>${Utils.escapeHtml(d.contact_person || '-')}</td>
                  <td>${Utils.escapeHtml(d.email || '-')}</td>
                  <td>${Utils.escapeHtml(d.phone || '-')}</td>
                  <td class="actions">
                    <button class="btn btn-sm btn-outline" onclick="editDealer(${d.id})">✏️ Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteDealer(${d.id})">🗑️ Delete</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="modal" id="dealerModal">
        <div class="modal-content">
          <div class="modal-header">
            <span class="modal-title" id="dealerModalTitle">Add New Dealer</span>
            <button class="modal-close" onclick="Utils.hideModal('dealerModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="dealerForm">
              <input type="hidden" name="id">
              <div class="form-group">
                <label>Company Name *</label>
                <input type="text" name="name" required placeholder="Enter company name">
              </div>
              <div class="form-group">
                <label>Contact Person</label>
                <input type="text" name="contact_person" placeholder="Enter contact person name">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="email@example.com">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="text" name="phone" placeholder="Phone number">
                </div>
              </div>
              <div class="form-group">
                <label>Address</label>
                <textarea name="address" rows="2" placeholder="Full address"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('dealerModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveDealer()">Save Dealer</button>
          </div>
        </div>
      </div>
    `;
    
    window._dealersData = dealers;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

function filterDealers() {
  const search = document.getElementById('dealerSearch').value.toLowerCase();
  const rows = document.querySelectorAll('.dealer-row');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}

async function saveDealer() {
  const form = document.getElementById('dealerForm');
  const data = {
    name: form.name.value,
    contact_person: form.contact_person.value,
    email: form.email.value,
    phone: form.phone.value,
    address: form.address.value
  };
  
  try {
    if (form.id.value) {
      await API.dealers.update(parseInt(form.id.value), data);
      showToast('Dealer updated successfully!');
    } else {
      await API.dealers.create(data);
      showToast('Dealer added successfully!');
    }
    Utils.hideModal('dealerModal');
    loadDealers(document.getElementById('pageContent'));
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function editDealer(id) {
  const dealer = await API.dealers.get(id);
  const form = document.getElementById('dealerForm');
  document.getElementById('dealerModalTitle').textContent = 'Edit Dealer';
  form.id.value = dealer.id;
  form.name.value = dealer.name;
  form.contact_person.value = dealer.contact_person || '';
  form.email.value = dealer.email || '';
  form.phone.value = dealer.phone || '';
  form.address.value = dealer.address || '';
  Utils.showModal('dealerModal');
}

async function deleteDealer(id) {
  if (confirm('Are you sure you want to delete this dealer? This action cannot be undone.')) {
    try {
      await API.dealers.delete(id);
      showToast('Dealer deleted successfully!');
      loadDealers(document.getElementById('pageContent'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
}

function showDealerModal() {
  document.getElementById('dealerForm').reset();
  document.getElementById('dealerForm').id.value = '';
  document.getElementById('dealerModalTitle').textContent = 'Add New Dealer';
  Utils.showModal('dealerModal');
}

window.loadDealers = loadDealers;
window.saveDealer = saveDealer;
window.editDealer = editDealer;
window.deleteDealer = deleteDealer;
window.showDealerModal = showDealerModal;
window.filterDealers = filterDealers;