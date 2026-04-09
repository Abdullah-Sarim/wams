const express = require('express');
const { runQuery, getOne, getAll, getLastInsertId } = require('../../database');

const router = express.Router();

// Get all bills
router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const bills = getAll(`
    SELECT b.*, d.name as dealer_name 
    FROM bills b
    JOIN dealers d ON b.dealer_id = d.id
    ORDER BY b.created_at DESC
  `);
  res.json(bills);
});

// Get single bill with items
router.get('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const bill = getOne(`
    SELECT b.*, d.name as dealer_name 
    FROM bills b
    JOIN dealers d ON b.dealer_id = d.id
    WHERE b.id = ?
  `, [req.params.id]);
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  
  const items = getAll(`
    SELECT bi.*, p.name as product_name 
    FROM bill_items bi
    JOIN products p ON bi.product_id = p.id
    WHERE bi.bill_id = ?
  `, [req.params.id]);
  
  res.json({ ...bill, items });
});

// Create bill (admin/manager only)
router.post('/', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { dealer_id, bill_date, due_date, items } = req.body;
  const billNumber = 'INV-' + Date.now();
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  
  runQuery(`INSERT INTO bills (dealer_id, bill_number, bill_date, total_amount, due_date) VALUES (?, ?, ?, ?, ?)`, 
    [dealer_id, billNumber, bill_date, totalAmount, due_date]);
  
  const billId = getLastInsertId();
  
  items.forEach(item => {
    runQuery(`INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`, 
      [billId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]);
    
    const product = getOne('SELECT current_stock FROM products WHERE id = ?', [item.product_id]);
    const newStock = product.current_stock - item.quantity;
    runQuery('UPDATE products SET current_stock = ? WHERE id = ?', [newStock, item.product_id]);
    
    runQuery(`INSERT INTO stock_transactions (product_id, type, quantity, reference_type, reference_id, notes) VALUES (?, 'out', ?, 'bill', ?, ?)`, 
      [item.product_id, item.quantity, billId, 'Sold to dealer']);
  });
  
  res.json({ id: billId, bill_number: billNumber, success: true });
});

// Update bill status (admin/manager only)
router.put('/:id', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (!['admin', 'manager'].includes(req.session.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const { status } = req.body;
  runQuery('UPDATE bills SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ success: true });
});

module.exports = router;