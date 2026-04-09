const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/dealer/orders', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const orders = getAll(`
            SELECT do.*, i.product_name, i.unit_price
            FROM dealers_orders do
            JOIN inventory i ON do.product_id = i.id
            WHERE do.dealer_id = ?
            ORDER BY do.created_at DESC
        `, [dealerId]);
        
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer/orders/:id', (req, res) => {
    try {
        const dealerId = req.session.userId;
        const order = getOne(`
            SELECT do.*, i.product_name, i.unit_price
            FROM dealers_orders do
            JOIN inventory i ON do.product_id = i.id
            WHERE do.id = ? AND do.dealer_id = ?
        `, [req.params.id, dealerId]);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/dealer/place-order', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const { product_id, quantity, delivery_date, notes } = req.body;
        
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [product_id]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        if (product.current_stock < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient stock' });
        }
        
        runQuery(`INSERT INTO dealers_orders (dealer_id, product_id, quantity, order_date, delivery_date, notes, status) 
            VALUES (?, ?, ?, CURRENT_DATE, ?, ?, 'pending')`, 
            [dealerId, product_id, quantity, delivery_date, notes]);
        
        const orderId = getLastInsertId();
        
        runQuery("INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)", 
            ['New Dealer Order', `Dealer has placed a new order (ID: ${orderId})`, 'order']);
        
        res.json({ success: true, orderId, message: 'Order placed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer/notifications', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const notifications = getAll(`
            SELECT * FROM notifications 
            WHERE user_id = ?
            ORDER BY created_at DESC
        `, [dealerId]);
        
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer/profile', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const dealer = getOne("SELECT id, name, contact_person, email, phone, address, created_at FROM dealers WHERE id = ?", [dealerId]);
        
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Dealer not found' });
        }
        
        res.json({ success: true, dealer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer/bills', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const bills = getAll(`
            SELECT b.*, 
                   (SELECT SUM(total_price) FROM bill_items WHERE bill_id = b.id) as total_items
            FROM bills b
            WHERE b.dealer_id = ?
            ORDER BY b.created_at DESC
        `, [dealerId]);
        
        res.json({ success: true, bills });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer/bills/:id', (req, res) => {
    try {
        const dealerId = req.session.userId;
        if (!dealerId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const bill = getOne("SELECT * FROM bills WHERE id = ? AND dealer_id = ?", [req.params.id, dealerId]);
        
        if (!bill) {
            return res.status(404).json({ success: false, message: 'Bill not found' });
        }
        
        const items = getAll("SELECT bi.*, i.product_name FROM bill_items bi JOIN inventory i ON bi.product_id = i.id WHERE bi.bill_id = ?", [bill.id]);
        
        res.json({ success: true, bill, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;