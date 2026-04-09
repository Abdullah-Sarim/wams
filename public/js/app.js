let currentUser = null;
let currentPage = 'index';

async function init() {
  try {
    currentUser = await API.auth.currentUser();
    showApp();
    loadPage('index');
  } catch (err) {
    window.location.href = '/login.html';
  }
}

function showApp() {
  document.getElementById('app').style.display = 'block';
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('userRole').textContent = currentUser.role;
  document.getElementById('userAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
}

async function logout() {
  try {
    await API.auth.logout();
  } catch (e) {}
  window.location.href = '/login.html';
}

function navigateTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  loadPage(page);
}

function loadPage(page) {
  const title = document.getElementById('pageTitle');
  const content = document.getElementById('pageContent');
  
  const titles = {
    index: 'Dashboard',
    dealers: 'Dealers Management',
    suppliers: 'Suppliers Management',
    products: 'Products & Inventory',
    requests: 'Dealer Requests',
    quotations: 'Supplier Quotations',
    'purchase-orders': 'Purchase Orders',
    billing: 'Billing & Invoices',
    production: 'Production Management',
    reports: 'Reports & Analytics',
    settings: 'Settings'
  };
  
  title.textContent = titles[page] || 'Dashboard';
  content.innerHTML = '<div class="flex items-center justify-center p-4"><div class="loading-spinner spinner-lg"></div></div>';
  
  switch(page) {
    case 'index': loadDashboard(content); break;
    case 'dealers': loadDealers(content); break;
    case 'suppliers': loadSuppliers(content); break;
    case 'products': loadProducts(content); break;
    case 'requests': loadRequests(content); break;
    case 'quotations': loadQuotations(content); break;
    case 'purchase-orders': loadPurchaseOrders(content); break;
    case 'billing': loadBilling(content); break;
    case 'production': loadProduction(content); break;
    case 'reports': loadReports(content); break;
    case 'settings': loadSettings(content); break;
    default: loadDashboard(content);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', init);