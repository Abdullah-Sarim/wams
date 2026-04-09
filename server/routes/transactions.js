const express = require('express');
const { getOne, getAll } = require('../../database');

const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { product_id } = req.query;
  let query = `
    SELECT st.*, p.name as product_name 
    FROM stock_transactions st
    JOIN products p ON st.product_id = p.id
  `;
  
  if (product_id) {
    query += ' WHERE st.product_id = ?';
    const transactions = getAll(query, [product_id]);
    return res.json(transactions);
  }
  
  query += ' ORDER BY st.created_at DESC LIMIT 100';
  const transactions = getAll(query);
  res.json(transactions);
});

module.exports = router;