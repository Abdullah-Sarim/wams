const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/suppliers', (req, res) => {
    try {
        const suppliers = getAll("SELECT * FROM suppliers ORDER BY name ASC");
        res.json({ success: true, suppliers });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/suppliers/:id', (req, res) => {
    try {
        const supplier = getOne("SELECT * FROM suppliers WHERE id = ?", [req.params.id]);
        if (!supplier) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, supplier });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/suppliers', (req, res) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;
        runQuery("INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)",
            [name, contact_person, email, phone, address]);
        res.json({ success: true, supplierId: getLastInsertId(), message: 'Supplier created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/suppliers/:id', (req, res) => {
    try {
        const { name, contact_person, email, phone, address } = req.body;
        runQuery("UPDATE suppliers SET name = ?, contact_person = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [name, contact_person, email, phone, address, req.params.id]);
        res.json({ success: true, message: 'Supplier updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/suppliers/:id', (req, res) => {
    try {
        runQuery("DELETE FROM suppliers WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/supplier-quotations', (req, res) => {
    try {
        const quotations = getAll(`
            SELECT sq.*, s.name as supplier_name, i.product_name
            FROM supplier_quotations sq
            JOIN suppliers s ON sq.supplier_id = s.id
            JOIN inventory i ON sq.product_id = i.id
            ORDER BY sq.created_at DESC
        `);
        res.json({ success: true, quotations });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/supplier-quotations/:id', (req, res) => {
    try {
        const quotation = getOne("SELECT * FROM supplier_quotations WHERE id = ?", [req.params.id]);
        res.json({ success: true, quotation });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/supplier-quotations', (req, res) => {
    try {
        const { supplier_id, product_id, quantity, unit_price, valid_until, notes } = req.body;
        const total_price = quantity * unit_price;
        runQuery("INSERT INTO supplier_quotations (supplier_id, product_id, quantity, unit_price, total_price, valid_until, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [supplier_id, product_id, quantity, unit_price, total_price, valid_until, 'pending']);
        res.json({ success: true, quotationId: getLastInsertId(), message: 'Quotation created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/supplier-quotations/:id', (req, res) => {
    try {
        const { status, unit_price, quantity } = req.body;
        const total_price = quantity * unit_price;
        runQuery("UPDATE supplier_quotations SET status = ?, unit_price = ?, quantity = ?, total_price = ? WHERE id = ?",
            [status, unit_price, quantity, total_price, req.params.id]);
        res.json({ success: true, message: 'Quotation updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/supplier-quotations/:id', (req, res) => {
    try {
        runQuery("DELETE FROM supplier_quotations WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Quotation deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
