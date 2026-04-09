const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/production/dashboard-stats', (req, res) => {
    try {
        const pending = getOne("SELECT COUNT(*) as count FROM manufacturing_orders WHERE status = 'pending'");
        const inProgress = getOne("SELECT COUNT(*) as count FROM manufacturing_orders WHERE status = 'in_progress'");
        const completed = getOne("SELECT COUNT(*) as count FROM manufacturing_orders WHERE status = 'completed'");
        const lowStockRaw = getOne(`
            SELECT COUNT(*) as count FROM inventory 
            WHERE product_type = 'raw_material' AND current_stock <= reorder_level
        `);
        
        res.json({
            success: true,
            stats: {
                pending: pending?.count || 0,
                inProgress: inProgress?.count || 0,
                completed: completed?.count || 0,
                lowStockRawMaterials: lowStockRaw?.count || 0
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/production/orders', (req, res) => {
    try {
        const orders = getAll(`
            SELECT mo.*, i.product_name, i.product_type
            FROM manufacturing_orders mo
            JOIN inventory i ON mo.product_id = i.id
            ORDER BY mo.created_at DESC
        `);
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/production/finished-products', (req, res) => {
    try {
        const products = getAll(`
            SELECT * FROM inventory 
            WHERE product_type = 'finished_product'
            ORDER BY product_name
        `);
        res.json({ success: true, products });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/production/raw-materials', (req, res) => {
    try {
        const materials = getAll(`
            SELECT * FROM inventory 
            WHERE product_type = 'raw_material'
            ORDER BY product_name
        `);
        res.json({ success: true, materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/production/create', (req, res) => {
    try {
        const { productId, quantity, expectedDelivery } = req.body;
        runQuery(
            "INSERT INTO manufacturing_orders (product_id, quantity, expected_delivery_date, status) VALUES (?, ?, ?, ?)",
            [productId, quantity, expectedDelivery, 'pending']
        );
        res.json({ success: true, orderId: getLastInsertId(), message: 'Production order created' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/production/start/:id', (req, res) => {
    try {
        runQuery(
            "UPDATE manufacturing_orders SET status = 'in_progress', start_date = CURRENT_TIMESTAMP WHERE id = ?",
            [req.params.id]
        );
        res.json({ success: true, message: 'Production started' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/production/complete/:id', (req, res) => {
    try {
        const order = getOne("SELECT * FROM manufacturing_orders WHERE id = ?", [req.params.id]);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        runQuery(
            "UPDATE manufacturing_orders SET status = 'completed', end_date = CURRENT_TIMESTAMP WHERE id = ?",
            [req.params.id]
        );
        
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [order.product_id]);
        const newStock = product.current_stock + order.quantity;
        runQuery(
            "UPDATE inventory SET current_stock = ? WHERE id = ?",
            [newStock, order.product_id]
        );
        
        runQuery(
            "INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [order.product_id, 'production', order.quantity, 'manufacturing_order', req.params.id, 'Production completed']
        );
        
        res.json({ success: true, newStock, message: 'Production completed' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
