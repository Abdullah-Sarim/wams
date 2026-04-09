const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all purchase orders
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const orders = getAll(`
    SELECT po.*, s.name as supplier_name 
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    ORDER BY po.created_at DESC
  `);
  res.json(orders);
});

// Get single purchase order
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const order = getOne(`
    SELECT po.*, s.name as supplier_name 
    FROM purchase_orders po
    JOIN suppliers s ON po.supplier_id = s.id
    WHERE po.id = ?
  `, [req.params.id]);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create purchase order (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { supplier_id, quotation_id, order_date, expected_date, notes } = req.body;
  runQuery(`INSERT INTO purchase_orders (supplier_id, quotation_id, order_date, expected_date, notes) VALUES (?, ?, ?, ?, ?)`, 
    [supplier_id, quotation_id, order_date, expected_date, notes]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update purchase order (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { status, expected_date, notes } = req.body;
  runQuery('UPDATE purchase_orders SET status = ?, expected_date = ?, notes = ? WHERE id = ?', 
    [status, expected_date, notes, req.params.id]);
  res.json({ success: true });
});

// Receive purchase order (admin/manager only)
router.post('/:id/receive', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const order = getOne('SELECT * FROM purchase_orders WHERE id = ?', [req.params.id]);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  if (order.quotation_id) {
    const quotation = getOne('SELECT * FROM quotations WHERE id = ?', [order.quotation_id]);
    if (quotation) {
      const product = getOne('SELECT current_stock FROM products WHERE id = ?', [quotation.product_id]);
      const newStock = product.current_stock + quotation.quantity;
      
      runQuery('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, quotation.product_id]);
      runQuery(`INSERT INTO stock_transactions (product_id, type, quantity, reference_type, reference_id, notes) VALUES (?, 'in', ?, 'purchase_order', ?, ?)`, 
        [quotation.product_id, quotation.quantity, req.params.id, 'Received from supplier']);
    }
  }
  
  runQuery("UPDATE purchase_orders SET status = 'received' WHERE id = ?", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;