// Billing Page Module
async function loadBilling(container) {
  try {
    const bills = await API.bills.list();
    const dealers = await API.dealers.list();
    const products = await API.products.list();
    
    window._billProducts = products;
    window._billDealers = dealers;
    
    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <span class="card-title">Bills/Invoices</span>
          <button class="btn btn-primary" onclick="showBillModal()">Create Bill</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Bill #</th>
              <th>Dealer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${bills.map(b => `
              <tr>
                <td>${Utils.escapeHtml(b.bill_number)}</td>
                <td>${Utils.escapeHtml(b.dealer_name)}</td>
                <td>${Utils.formatDate(b.bill_date)}</td>
                <td>${Utils.formatCurrency(b.total_amount)}</td>
                <td>${Utils.formatDate(b.due_date)}</td>
                <td>${Utils.getStatusBadge(b.status)}</td>
                <td class="actions">
                  ${b.status === 'pending' ? `
                    <button class="btn btn-sm btn-success" onclick="updateBill(${b.id}, 'paid')">Mark Paid</button>
                  ` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="modal" id="billModal">
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <span class="modal-title">Create Bill</span>
            <button class="modal-close" onclick="Utils.hideModal('billModal')">&times;</button>
          </div>
          <div class="modal-body">
            <form id="billForm">
              <div class="form-row">
                <div class="form-group">
                  <label>Dealer *</label>
                  <select name="dealer_id" required>
                    <option value="">Select Dealer</option>
                    ${dealers.map(d => `<option value="${d.id}">${Utils.escapeHtml(d.name)}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label>Bill Date</label>
                  <input type="date" name="bill_date" value="${Utils.today()}">
                </div>
              </div>
              <div class="form-group">
                <label>Due Date</label>
                <input type="date" name="due_date">
              </div>
              <div class="form-group">
                <label>Items</label>
                <div id="billItems">
                  <div class="flex gap-2 mb-2 item-row">
                    <select class="product-select" style="flex:2">
                      <option value="">Select Product</option>
                      ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${Utils.escapeHtml(p.name)}</option>`).join('')}
                    </select>
                    <input type="number" placeholder="Qty" class="item-qty" style="flex:1">
                    <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">X</button>
                  </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline mt-2" onclick="addBillItem()">+ Add Item</button>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="Utils.hideModal('billModal')">Cancel</button>
            <button class="btn btn-primary" onclick="saveBill()">Create Bill</button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="alert alert-danger">Error: ${err.message}</div>`;
  }
}

function addBillItem() {
  const products = window._billProducts;
  const div = document.createElement('div');
  div.className = 'flex gap-2 mb-2 item-row';
  div.innerHTML = `
    <select class="product-select" style="flex:2">
      <option value="">Select Product</option>
      ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${Utils.escapeHtml(p.name)}</option>`).join('')}
    </select>
    <input type="number" placeholder="Qty" class="item-qty" style="flex:1">
    <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">X</button>
  `;
  document.getElementById('billItems').appendChild(div);
}

async function saveBill() {
  const form = document.getElementById('billForm');
  const items = [];
  document.querySelectorAll('.item-row').forEach(row => {
    const productId = row.querySelector('.product-select').value;
    const qty = row.querySelector('.item-qty').value;
    if (productId && qty) {
      const price = parseFloat(row.querySelector('.product-select').selectedOptions[0].dataset.price);
      items.push({ product_id: parseInt(productId), quantity: parseInt(qty), unit_price: price });
    }
  });
  
  if (items.length === 0) {
    alert('Please add at least one item');
    return;
  }
  
  const data = {
    dealer_id: parseInt(form.dealer_id.value),
    bill_date: form.bill_date.value,
    due_date: form.due_date.value,
    items
  };
  
  try {
    await API.bills.create(data);
    Utils.hideModal('billModal');
    loadBilling(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

async function updateBill(id, status) {
  try {
    await API.bills.update(id, { status });
    loadBilling(document.getElementById('pageContent'));
  } catch (err) {
    alert(err.message);
  }
}

function showBillModal() {
  document.getElementById('billForm').reset();
  document.querySelector('.item-row').querySelector('.product-select').selectedIndex = 0;
  document.querySelector('.item-row').querySelector('.item-qty').value = '';
  Utils.showModal('billModal');
}

window.loadBilling = loadBilling;
window.addBillItem = addBillItem;
window.saveBill = saveBill;
window.updateBill = updateBill;
window.showBillModal = showBillModal;