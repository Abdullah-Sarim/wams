const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  let requests;
  if (req.session.userType === 'dealer') {
    const dealerId = req.session.dealerId;
    requests = getAll(`
      SELECT dr.*, d.name as dealer_name, p.name as product_name 
      FROM dealer_requests dr
      JOIN dealers d ON dr.dealer_id = d.id
      JOIN products p ON dr.product_id = p.id
      WHERE dr.dealer_id = ?
      ORDER BY dr.created_at DESC
    `, [dealerId]);
  } else {
    requests = getAll(`
      SELECT dr.*, d.name as dealer_name, p.name as product_name 
      FROM dealer_requests dr
      JOIN dealers d ON dr.dealer_id = d.id
      JOIN products p ON dr.product_id = p.id
      ORDER BY dr.created_at DESC
    `);
  }
  res.json(requests);
});

router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const request = getOne(`
    SELECT dr.*, d.name as dealer_name, p.name as product_name 
    FROM dealer_requests dr
    JOIN dealers d ON dr.dealer_id = d.id
    JOIN products p ON dr.product_id = p.id
    WHERE dr.id = ?
  `, [req.params.id]);
  if (!request) {
    return res.status(404).json({ error: 'Request not found' });
  }
  res.json(request);
});

router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { dealer_id, product_id, quantity, requested_date, delivery_date, notes } = req.body;
  runQuery(`INSERT INTO dealer_requests (dealer_id, product_id, quantity, requested_date, delivery_date, notes) VALUES (?, ?, ?, ?, ?, ?)`, 
    [dealer_id, product_id, quantity, requested_date, delivery_date, notes]);
  res.json({ id: getLastInsertId(), success: true });
});

router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.userType === 'dealer') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { status, notes } = req.body;
  runQuery('UPDATE dealer_requests SET status = ?, notes = ? WHERE id = ?', [status, notes, req.params.id]);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.session.userType === 'dealer') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  runQuery('DELETE FROM dealer_requests WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
