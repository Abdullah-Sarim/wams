const API = {
  async request(method, endpoint, data = null) {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`/api${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }
    
    return result;
  },
  
  get(endpoint) {
    return this.request('GET', endpoint);
  },
  
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  },
  
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },
  
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  },
  
  auth: {
    login(username, password) {
      return API.post('/auth/login', { username, password });
    },
    logout() {
      return API.post('/auth/logout');
    },
    currentUser() {
      return API.get('/auth/current-user');
    }
  },
  
  dashboard: {
    stats() {
      return API.get('/dashboard/stats');
    }
  },
  
  dealers: {
    list() { return API.get('/dealers'); },
    get(id) { return API.get(`/dealers/${id}`); },
    create(data) { return API.post('/dealers', data); },
    update(id, data) { return API.put(`/dealers/${id}`, data); },
    delete(id) { return API.delete(`/dealers/${id}`); }
  },
  
  suppliers: {
    list() { return API.get('/suppliers'); },
    get(id) { return API.get(`/suppliers/${id}`); },
    create(data) { return API.post('/suppliers', data); },
    update(id, data) { return API.put(`/suppliers/${id}`, data); },
    delete(id) { return API.delete(`/suppliers/${id}`); }
  },
  
  products: {
    list() { return API.get('/products'); },
    get(id) { return API.get(`/products/${id}`); },
    create(data) { return API.post('/products', data); },
    update(id, data) { return API.put(`/products/${id}`, data); },
    delete(id) { return API.delete(`/products/${id}`); },
    adjustStock(id, data) { return API.post(`/products/${id}/adjust-stock`, data); },
    lowStock() { return API.get('/products/low-stock/list'); }
  },
  
  requests: {
    list() { return API.get('/requests'); },
    get(id) { return API.get(`/requests/${id}`); },
    create(data) { return API.post('/requests', data); },
    update(id, data) { return API.put(`/requests/${id}`, data); },
    delete(id) { return API.delete(`/requests/${id}`); }
  },
  
  quotations: {
    list() { return API.get('/quotations'); },
    get(id) { return API.get(`/quotations/${id}`); },
    create(data) { return API.post('/quotations', data); },
    update(id, data) { return API.put(`/quotations/${id}`, data); },
    delete(id) { return API.delete(`/quotations/${id}`); }
  },
  
  purchaseOrders: {
    list() { return API.get('/purchase-orders'); },
    get(id) { return API.get(`/purchase-orders/${id}`); },
    create(data) { return API.post('/purchase-orders', data); },
    update(id, data) { return API.put(`/purchase-orders/${id}`, data); },
    receive(id) { return API.post(`/purchase-orders/${id}/receive`); }
  },
  
  bills: {
    list() { return API.get('/bills'); },
    get(id) { return API.get(`/bills/${id}`); },
    create(data) { return API.post('/bills', data); },
    update(id, data) { return API.put(`/bills/${id}`, data); }
  },
  
  production: {
    list() { return API.get('/production'); },
    get(id) { return API.get(`/production/${id}`); },
    create(data) { return API.post('/production', data); },
    update(id, data) { return API.put(`/production/${id}`, data); },
    delete(id) { return API.delete(`/production/${id}`); }
  },
  
  reports: {
    sales(start_date, end_date) { return API.get(`/reports/sales?start_date=${start_date}&end_date=${end_date}`); },
    stock() { return API.get('/reports/stock'); },
    dealers() { return API.get('/reports/dealers'); }
  },
  
  transactions: {
    list(product_id) {
      const query = product_id ? `?product_id=${product_id}` : '';
      return API.get(`/transactions${query}`);
    }
  }
};

window.API = API;