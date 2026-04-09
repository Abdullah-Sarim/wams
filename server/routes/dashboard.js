const express = require('express');
const { getOne } = require('../../database');

const router = express.Router();

router.get('/stats', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const totalProducts = getOne('SELECT COUNT(*) as count FROM products')?.count || 0;
  const lowStock = getOne("SELECT COUNT(*) as count FROM products WHERE current_stock <= min_stock")?.count || 0;
  const pendingOrders = getOne("SELECT COUNT(*) as count FROM dealer_requests WHERE status = 'pending'")?.count || 0;
  const totalDealers = getOne('SELECT COUNT(*) as count FROM dealers')?.count || 0;
  const totalSuppliers = getOne('SELECT COUNT(*) as count FROM suppliers')?.count || 0;
  const pendingBills = getOne("SELECT COUNT(*) as count FROM bills WHERE status = 'pending'")?.count || 0;
  
  res.json({
    totalProducts,
    lowStock,
    pendingOrders,
    totalDealers,
    totalSuppliers,
    pendingBills
  });
});

module.exports = router;