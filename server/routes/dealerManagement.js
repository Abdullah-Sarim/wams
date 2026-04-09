const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/dealers', (req, res) => {
    try {
        const dealers = getAll("SELECT * FROM dealers ORDER BY created_at DESC");
        res.json({ success: true, dealers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealers/:id', (req, res) => {
    try {
        const dealer = getOne("SELECT * FROM dealers WHERE id = ?", [req.params.id]);
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Dealer not found' });
        }
        res.json({ success: true, dealer });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/create-dealer-profile', (req, res) => {
    try {
        const { name, contact_person, email, phone, address, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password || 'dealer123', 10);
        
        runQuery("INSERT INTO dealers (name, contact_person, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)",
            [name, contact_person, email, phone, address, hashedPassword]);
        
        res.json({ success: true, dealerId: getLastInsertId(), message: 'Dealer profile created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/update-dealer-profile/:id', (req, res) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;
        runQuery("UPDATE dealers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [name, contact_person, email, phone, address, req.params.id]);
        res.json({ success: true, message: 'Dealer profile updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/delete-dealer-profile/:id', (req, res) => {
    try {
        runQuery("DELETE FROM dealers WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Dealer profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealers-orders', (req, res) => {
    try {
        const orders = getAll(`
            SELECT do.id, do.dealer_id, do.product_id, do.quantity, do.status, do.order_date, do.delivery_date, do.notes,
                   d.name as dealer_name, i.product_name
            FROM dealers_orders do
            JOIN dealers d ON do.dealer_id = d.id
            JOIN inventory i ON do.product_id = i.id
            ORDER BY do.created_at DESC
        `);
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/create-dealer-order', (req, res) => {
    try {
        const { dealer_id, product_id, quantity, order_date, delivery_date, notes } = req.body;
        runQuery("INSERT INTO dealers_orders (dealer_id, product_id, quantity, order_date, delivery_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [dealer_id, product_id, quantity, order_date, delivery_date, notes]);
        res.json({ success: true, orderId: getLastInsertId(), message: 'Dealer order created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/update-dealer-order/:id', (req, res) => {
    try {
        const { quantity, status, delivery_date, notes } = req.body;
        const order = getOne("SELECT * FROM dealers_orders WHERE id = ?", [req.params.id]);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        runQuery("UPDATE dealers_orders SET quantity = ?, status = ?, delivery_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [quantity, status, delivery_date, notes, req.params.id]);
        
        if (status === 'approved') {
            const product = getOne("SELECT * FROM inventory WHERE id = ?", [order.product_id]);
            const newStock = product.current_stock - order.quantity;
            runQuery("UPDATE inventory SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newStock, order.product_id]);
            
            runQuery("INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?)",
                [order.product_id, 'sale', order.quantity, 'dealer_order', req.params.id, 'Dealer order approved']);
            
            runQuery("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [order.dealer_id, 'Order Approved', `Your order #${req.params.id} has been approved`, 'order_status']);
        } else if (status === 'rejected') {
            runQuery("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [order.dealer_id, 'Order Rejected', `Your order #${req.params.id} has been rejected`, 'order_status']);
        }
        
        res.json({ success: true, message: 'Dealer order updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/delete-dealer-order/:id', (req, res) => {
    try {
        runQuery("DELETE FROM dealers_orders WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Dealer order deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
