const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all quotations
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const quotations = getAll(`
    SELECT q.*, s.name as supplier_name, p.name as product_name 
    FROM quotations q
    JOIN suppliers s ON q.supplier_id = s.id
    JOIN products p ON q.product_id = p.id
    ORDER BY q.created_at DESC
  `);
  res.json(quotations);
});

// Get single quotation
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const quotation = getOne(`
    SELECT q.*, s.name as supplier_name, p.name as product_name 
    FROM quotations q
    JOIN suppliers s ON q.supplier_id = s.id
    JOIN products p ON q.product_id = p.id
    WHERE q.id = ?
  `, [req.params.id]);
  if (!quotation) {
    return res.status(404).json({ error: 'Quotation not found' });
  }
  res.json(quotation);
});

// Create quotation (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { supplier_id, product_id, quantity, unit_price, valid_until } = req.body;
  const total_price = quantity * unit_price;
  runQuery(`INSERT INTO quotations (supplier_id, product_id, quantity, unit_price, total_price, valid_until) VALUES (?, ?, ?, ?, ?, ?)`, 
    [supplier_id, product_id, quantity, unit_price, total_price, valid_until]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update quotation status (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { status } = req.body;
  runQuery('UPDATE quotations SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});

// Delete quotation (admin only)
router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM quotations WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;