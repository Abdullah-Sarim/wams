const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/manufacturing-orders', (req, res) => {
    try {
        const orders = getAll(`
            SELECT mo.*, i.product_name, i.current_stock as available_stock
            FROM manufacturing_orders mo
            JOIN inventory i ON mo.product_id = i.id
            ORDER BY mo.created_at DESC
        `);
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/manufacturing-orders/:id', (req, res) => {
    try {
        const order = getOne("SELECT * FROM manufacturing_orders WHERE id = ?", [req.params.id]);
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/create-manufacturing-order', (req, res) => {
    try {
        const { product_id, quantity, start_date, end_date, notes } = req.body;
        runQuery("INSERT INTO manufacturing_orders (product_id, quantity, start_date, end_date, notes, status) VALUES (?, ?, ?, ?, ?, ?)",
            [product_id, quantity, start_date, end_date, notes, 'pending']);
        res.json({ success: true, orderId: getLastInsertId(), message: 'Manufacturing order created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/update-manufacturing-order/:id', (req, res) => {
    try {
        const { quantity, status, start_date, end_date, notes } = req.body;
        runQuery("UPDATE manufacturing_orders SET quantity = ?, status = ?, start_date = ?, end_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [quantity, status, start_date, end_date, notes, req.params.id]);
        res.json({ success: true, message: 'Manufacturing order updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/complete-manufacturing-order/:id', (req, res) => {
    try {
        const order = getOne("SELECT * FROM manufacturing_orders WHERE id = ?", [req.params.id]);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        runQuery("UPDATE manufacturing_orders SET status = 'completed', end_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [req.params.id]);
        
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [order.product_id]);
        const newStock = product.current_stock + order.quantity;
        runQuery("UPDATE inventory SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [newStock, order.product_id]);
        
        runQuery("INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [order.product_id, 'production', order.quantity, 'manufacturing_order', req.params.id, 'Manufacturing completion']);
        
        res.json({ success: true, message: 'Manufacturing order completed and stock updated', new_stock: newStock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/manufacturing-orders/:id', (req, res) => {
    try {
        runQuery("DELETE FROM manufacturing_orders WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Manufacturing order deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
