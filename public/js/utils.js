const Utils = {
  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB');
  },
  
  formatCurrency(amount) {
    if (!amount) return '₹0';
    return '₹' + parseFloat(amount).toFixed(2);
  },
  
  formatNumber(num) {
    if (!num) return '0';
    return parseInt(num).toLocaleString();
  },
  
  getStatusBadge(status) {
    const badges = {
      pending: '<span class="badge badge-pending">Pending</span>',
      approved: '<span class="badge badge-approved">Approved</span>',
      rejected: '<span class="badge badge-rejected">Rejected</span>',
      completed: '<span class="badge badge-completed">Completed</span>',
      paid: '<span class="badge badge-paid">Paid</span>',
      planned: '<span class="badge badge-planned">Planned</span>',
      in_progress: '<span class="badge badge-in_progress">In Progress</span>',
      confirmed: '<span class="badge badge-approved">Confirmed</span>',
      received: '<span class="badge badge-completed">Received</span>',
      cancelled: '<span class="badge badge-rejected">Cancelled</span>',
      accepted: '<span class="badge badge-approved">Accepted</span>'
    };
    return badges[status] || `<span class="badge">${status}</span>`;
  },
  
  showModal(id) {
    document.getElementById(id).classList.add('show');
  },
  
  hideModal(id) {
    document.getElementById(id).classList.remove('show');
  },
  
  showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.querySelector('.content').insertBefore(alert, document.querySelector('.content').firstChild);
    setTimeout(() => alert.remove(), 3000);
  },
  
  getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  },
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },
  
  today() {
    return new Date().toISOString().split('T')[0];
  }
};

window.Utils = Utils;