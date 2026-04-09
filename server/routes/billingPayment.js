const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/bills', (req, res) => {
    try {
        const bills = getAll(`
            SELECT b.*, d.name as dealer_name, d.email as dealer_email
            FROM bills b
            JOIN dealers d ON b.dealer_id = d.id
            ORDER BY b.created_at DESC
        `);
        res.json({ success: true, bills });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/bills/:id', (req, res) => {
    try {
        const bill = getOne("SELECT * FROM bills WHERE id = ?", [req.params.id]);
        const items = getAll("SELECT bi.*, i.product_name FROM bill_items bi JOIN inventory i ON bi.product_id = i.id WHERE bi.bill_id = ?", [req.params.id]);
        res.json({ success: true, bill, items });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/generate-bill', (req, res) => {
    try {
        const { dealer_id, bill_date, due_date, items, notes } = req.body;
        
        const billNumber = 'BILL-' + Date.now();
        let totalAmount = 0;
        
        items.forEach(item => {
            totalAmount += item.quantity * item.unit_price;
        });
        
        runQuery("INSERT INTO bills (dealer_id, bill_number, bill_date, total_amount, due_date, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [dealer_id, billNumber, bill_date, totalAmount, due_date, notes]);
        
        const billId = getLastInsertId();
        
        items.forEach(item => {
            const totalPrice = item.quantity * item.unit_price;
            runQuery("INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)",
                [billId, item.product_id, item.quantity, item.unit_price, totalPrice]);
        });
        
        res.json({ success: true, billId, billNumber, message: 'Bill generated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/bills/:id', (req, res) => {
    try {
        const { status, due_date, notes } = req.body;
        runQuery("UPDATE bills SET status = ?, due_date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [status, due_date, notes, req.params.id]);
        res.json({ success: true, message: 'Bill updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/payments', (req, res) => {
    try {
        const payments = getAll(`
            SELECT p.*, b.bill_number
            FROM payments p
            JOIN bills b ON p.bill_id = b.id
            ORDER BY p.payment_date DESC
        `);
        res.json({ success: true, payments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/payments', (req, res) => {
    try {
        const { bill_id, amount, payment_date, payment_method, reference_number, notes } = req.body;
        runQuery("INSERT INTO payments (bill_id, amount, payment_date, payment_method, reference_number, notes) VALUES (?, ?, ?, ?, ?, ?)",
            [bill_id, amount, payment_date, payment_method, reference_number, notes]);
        
        const bill = getOne("SELECT * FROM bills WHERE id = ?", [bill_id]);
        const paidAmount = getOne("SELECT SUM(amount) as total FROM payments WHERE bill_id = ?", [bill_id]);
        
        if (paidAmount.total >= bill.total_amount) {
            runQuery("UPDATE bills SET status = 'paid', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [bill_id]);
        }
        
        res.json({ success: true, paymentId: getLastInsertId(), message: 'Payment recorded successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/bill-summary/:billId', (req, res) => {
    try {
        const bill = getOne("SELECT * FROM bills WHERE id = ?", [req.params.billId]);
        const payments = getAll("SELECT SUM(amount) as total FROM payments WHERE bill_id = ?", [req.params.billId]);
        const paidAmount = payments[0]?.total || 0;
        const pendingAmount = bill.total_amount - paidAmount;
        
        res.json({ success: true, bill, paidAmount, pendingAmount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
