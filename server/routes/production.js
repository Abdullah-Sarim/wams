const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all production orders
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const production = getAll(`
    SELECT po.*, p.name as product_name 
    FROM production_orders po
    JOIN products p ON po.product_id = p.id
    ORDER BY po.created_at DESC
  `);
  res.json(production);
});

// Get single production order
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const production = getOne(`
    SELECT po.*, p.name as product_name 
    FROM production_orders po
    JOIN products p ON po.product_id = p.id
    WHERE po.id = ?
  `, [req.params.id]);
  if (!production) {
    return res.status(404).json({ error: 'Production order not found' });
  }
  res.json(production);
});

// Create production order (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { product_id, quantity, start_date, end_date, notes } = req.body;
  runQuery(`INSERT INTO production_orders (product_id, quantity, start_date, end_date, notes) VALUES (?, ?, ?, ?, ?)`, 
    [product_id, quantity, start_date, end_date, notes]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update production order (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { status, end_date, notes } = req.body;
  
  if (status === 'completed') {
    const production = getOne('SELECT * FROM production_orders WHERE id = ?', [req.params.id]);
    if (production) {
      const product = getOne('SELECT current_stock FROM products WHERE id = ?', [production.product_id]);
      const newStock = product.current_stock + production.quantity;
      
      runQuery('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, production.product_id]);
      runQuery(`INSERT INTO stock_transactions (product_id, type, quantity, reference_type, reference_id, notes) VALUES (?, 'in', ?, 'production', ?, ?)`, 
        [production.product_id, production.quantity, req.params.id, 'Production completed']);
    }
  }
  
  runQuery('UPDATE production_orders SET status = ?, end_date = ?, notes = ? WHERE id = ?', [status, end_date, notes, req.params.id]);
  res.json({ success: true });
});

// Delete production order (admin only)
router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM production_orders WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;