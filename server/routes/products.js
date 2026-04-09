const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const products = getAll('SELECT * FROM products ORDER BY created_at DESC');
  res.json(products);
});

// Get single product
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const product = getOne('SELECT * FROM products WHERE id = ?', [req.params.id]);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Get low stock products
router.get('/low-stock/list', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const products = getAll('SELECT * FROM products WHERE current_stock <= min_stock');
  res.json(products);
});

// Create product (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, description, type, unit, min_stock, current_stock, price } = req.body;
  runQuery(`INSERT INTO products (name, description, type, unit, min_stock, current_stock, price) VALUES (?, ?, ?, ?, ?, ?, ?)`, 
    [name, description, type, unit || 'pcs', min_stock || 10, current_stock || 0, price || 0]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update product (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, description, type, unit, min_stock, current_stock, price } = req.body;
  runQuery(`UPDATE products SET name = ?, description = ?, type = ?, unit = ?, min_stock = ?, current_stock = ?, price = ? WHERE id = ?`, 
    [name, description, type, unit, min_stock, current_stock, price, req.params.id]);
  res.json({ success: true });
});

// Delete product (admin only)
router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM products WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

// Adjust stock
router.post('/:id/adjust-stock', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { quantity, type, notes } = req.body;
  const product = getOne('SELECT current_stock FROM products WHERE id = ?', [req.params.id]);
  
  let newStock;
  if (type === 'in') {
    newStock = product.current_stock + quantity;
  } else if (type === 'out') {
    newStock = product.current_stock - quantity;
  } else {
    newStock = quantity;
  }
  
  runQuery('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, req.params.id]);
  runQuery(`INSERT INTO stock_transactions (product_id, type, quantity, reference_type, notes) VALUES (?, ?, ?, ?, ?)`, 
    [req.params.id, type, quantity, 'adjustment', notes]);
  
  res.json({ success: true, new_stock: newStock });
});

module.exports = router;