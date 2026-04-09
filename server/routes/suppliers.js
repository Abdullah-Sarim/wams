const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all suppliers
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const suppliers = getAll('SELECT * FROM suppliers ORDER BY created_at DESC');
  res.json(suppliers);
});

// Get single supplier
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const supplier = getOne('SELECT * FROM suppliers WHERE id = ?', [req.params.id]);
  if (!supplier) {
    return res.status(404).json({ error: 'Supplier not found' });
  }
  res.json(supplier);
});

// Create supplier (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, contact_person, email, phone, address } = req.body;
  runQuery(`INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, [name, contact_person, email, phone, address]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update supplier (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, contact_person, email, phone, address } = req.body;
  runQuery(`UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?`, [name, contact_person, email, phone, address, req.params.id]);
  res.json({ success: true });
});

// Delete supplier (admin only)
router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM suppliers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;