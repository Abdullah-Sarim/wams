const express = require('express');
const { getOne, getAll } = require('../../database');

const router = express.Router();

// Sales report
router.get('/sales', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { start_date, end_date } = req.query;
  let query = `
    SELECT b.*, d.name as dealer_name 
    FROM bills b
    JOIN dealers d ON b.dealer_id = d.id
  `;
  const params = [];
  
  if (start_date && end_date) {
    query += ' WHERE b.bill_date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  query += ' ORDER BY b.bill_date DESC';
  const sales = getAll(query, params);
  res.json(sales);
});

// Stock report
router.get('/stock', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const products = getAll('SELECT * FROM products ORDER BY current_stock ASC');
  res.json(products);
});

// Dealers report
router.get('/dealers', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const dealers = getAll(`
    SELECT d.*, 
      (SELECT COUNT(*) FROM dealer_requests WHERE dealer_id = d.id) as total_requests,
      (SELECT SUM(total_amount) FROM bills WHERE dealer_id = d.id AND status = 'paid') as total_purchases
    FROM dealers d
  `);
  res.json(dealers);
});

module.exports = router;