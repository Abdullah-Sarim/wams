const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all dealers
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const dealers = getAll('SELECT * FROM dealers ORDER BY created_at DESC');
  res.json(dealers);
});

// Get single dealer
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const dealer = getOne('SELECT * FROM dealers WHERE id = ?', [req.params.id]);
  if (!dealer) {
    return res.status(404).json({ error: 'Dealer not found' });
  }
  res.json(dealer);
});

// Create dealer (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, contact_person, email, phone, address } = req.body;
  runQuery(`INSERT INTO dealers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, [name, contact_person, email, phone, address]);
  res.json({ id: getLastInsertId(), success: true });
});

// Update dealer (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { name, contact_person, email, phone, address } = req.body;
  runQuery(`UPDATE dealers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ? WHERE id = ?`, [name, contact_person, email, phone, address, req.params.id]);
  res.json({ success: true });
});

// Delete dealer (admin only)
router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM dealers WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;