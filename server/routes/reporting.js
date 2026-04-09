const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/sales-report', (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let sql = `
            SELECT b.id, b.bill_number, b.bill_date, b.total_amount, b.status, d.name as dealer_name
            FROM bills b
            JOIN dealers d ON b.dealer_id = d.id
            WHERE 1=1
        `;
        const params = [];
        
        if (startDate) {
            sql += " AND b.bill_date >= ?";
            params.push(startDate);
        }
        if (endDate) {
            sql += " AND b.bill_date <= ?";
            params.push(endDate);
        }
        
        sql += " ORDER BY b.bill_date DESC";
        
        const bills = getAll(sql, params);
        const totalSales = bills.reduce((sum, bill) => sum + bill.total_amount, 0);
        const paidAmount = bills.filter(b => b.status === 'paid').reduce((sum, bill) => sum + bill.total_amount, 0);
        const pendingAmount = totalSales - paidAmount;
        
        res.json({ success: true, bills, totalSales, paidAmount, pendingAmount, count: bills.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/stock-report', (req, res) => {
    try {
        const inventory = getAll(`
            SELECT i.*, 
                CASE 
                    WHEN i.current_stock <= i.reorder_level THEN 'Low Stock'
                    WHEN i.current_stock <= i.min_stock_level THEN 'Critical'
                    ELSE 'Normal'
                END as stock_status
            FROM inventory i
            ORDER BY i.current_stock ASC
        `);
        
        const totalValue = inventory.reduce((sum, item) => sum + (item.current_stock * item.unit_price), 0);
        const lowStockCount = inventory.filter(i => i.current_stock <= i.reorder_level).length;
        const outOfStockCount = inventory.filter(i => i.current_stock === 0).length;
        
        res.json({ success: true, inventory, totalValue, lowStockCount, outOfStockCount, count: inventory.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/supplier-report', (req, res) => {
    try {
        const suppliers = getAll(`
            SELECT s.*, 
                (SELECT COUNT(*) FROM supplier_quotations WHERE supplier_id = s.id) as quotation_count,
                (SELECT SUM(total_price) FROM supplier_quotations WHERE supplier_id = s.id AND status = 'approved') as total_approved
            FROM suppliers s
            ORDER BY s.name ASC
        `);
        
        res.json({ success: true, suppliers, count: suppliers.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/dealer-report', (req, res) => {
    try {
        const dealers = getAll(`
            SELECT d.*,
                (SELECT COUNT(*) FROM dealers_orders WHERE dealer_id = d.id) as order_count,
                (SELECT SUM(total_amount) FROM bills WHERE dealer_id = d.id) as total_billed
            FROM dealers d
            ORDER BY d.name ASC
        `);
        
        res.json({ success: true, dealers, count: dealers.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/production-report', (req, res) => {
    try {
        const { startDate, endDate, status } = req.query;
        
        let sql = `
            SELECT mo.*, i.product_name
            FROM manufacturing_orders mo
            JOIN inventory i ON mo.product_id = i.id
            WHERE 1=1
        `;
        const params = [];
        
        if (startDate) {
            sql += " AND mo.start_date >= ?";
            params.push(startDate);
        }
        if (endDate) {
            sql += " AND mo.end_date <= ?";
            params.push(endDate);
        }
        if (status) {
            sql += " AND mo.status = ?";
            params.push(status);
        }
        
        sql += " ORDER BY mo.created_at DESC";
        
        const orders = getAll(sql, params);
        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const totalProduced = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.quantity, 0);
        
        res.json({ success: true, orders, completedOrders, totalProduced, count: orders.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
