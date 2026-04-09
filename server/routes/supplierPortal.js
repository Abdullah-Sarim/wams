const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/supplier/quotations', (req, res) => {
    try {
        const supplierId = req.session.userId;
        if (!supplierId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const quotations = getAll(`
            SELECT sq.*, i.product_name
            FROM supplier_quotations sq
            JOIN inventory i ON sq.product_id = i.id
            WHERE sq.supplier_id = ?
            ORDER BY sq.created_at DESC
        `, [supplierId]);
        
        res.json({ success: true, quotations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/supplier/quotations/:id/respond', (req, res) => {
    try {
        const supplierId = req.session.userId;
        const { status, delivery_date, notes } = req.body;
        
        const quotation = getOne("SELECT * FROM supplier_quotations WHERE id = ? AND supplier_id = ?", [req.params.id, supplierId]);
        if (!quotation) {
            return res.status(404).json({ success: false, message: 'Quotation not found' });
        }
        
        runQuery("UPDATE supplier_quotations SET status = ?, valid_until = ?, notes = ? WHERE id = ?",
            [status, delivery_date, notes, req.params.id]);
        
        runQuery("INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)",
            ['Quotation Updated', `Supplier responded to quotation #${req.params.id}`, 'quotation']);
        
        res.json({ success: true, message: 'Quotation updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/supplier/notifications', (req, res) => {
    try {
        const supplierId = req.session.userId;
        if (!supplierId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const notifications = getAll(`
            SELECT * FROM notifications 
            WHERE (user_id = ? OR user_id IS NULL)
            ORDER BY created_at DESC
        `, [supplierId]);
        
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/supplier/profile', (req, res) => {
    try {
        const supplierId = req.session.userId;
        if (!supplierId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const supplier = getOne("SELECT id, name, contact_person, email, phone, address FROM suppliers WHERE id = ?", [supplierId]);
        res.json({ success: true, supplier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;