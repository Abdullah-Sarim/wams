const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/search', (req, res) => {
    try {
        const { query, type } = req.query;
        
        if (!query) {
            return res.status(400).json({ success: false, message: 'Search query is required' });
        }
        
        let results = {};
        
        if (!type || type === 'inventory') {
            const inventory = getAll(`SELECT * FROM inventory WHERE product_name LIKE ? OR product_code LIKE ? OR description LIKE ?`,
                [`%${query}%`, `%${query}%`, `%${query}%`]);
            results.inventory = inventory;
        }
        
        if (!type || type === 'dealers') {
            const dealers = getAll(`SELECT * FROM dealers WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ?`,
                [`%${query}%`, `%${query}%`, `%${query}%`]);
            results.dealers = dealers;
        }
        
        if (!type || type === 'suppliers') {
            const suppliers = getAll(`SELECT * FROM suppliers WHERE name LIKE ? OR contact_person LIKE ? OR email LIKE ?`,
                [`%${query}%`, `%${query}%`, `%${query}%`]);
            results.suppliers = suppliers;
        }
        
        if (!type || type === 'bills') {
            const bills = getAll(`SELECT b.*, d.name as dealer_name FROM bills b JOIN dealers d ON b.dealer_id = d.id WHERE b.bill_number LIKE ?`,
                [`%${query}%`]);
            results.bills = bills;
        }
        
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/filter', (req, res) => {
    try {
        const { table, filters, sortBy, sortOrder, limit, offset } = req.body;
        
        let sql = `SELECT * FROM ${table}`;
        const params = [];
        const conditions = [];
        
        if (filters && Object.keys(filters).length > 0) {
            Object.keys(filters).forEach(key => {
                conditions.push(`${key} = ?`);
                params.push(filters[key]);
            });
            sql += ` WHERE ${conditions.join(' AND ')}`;
        }
        
        if (sortBy) {
            sql += ` ORDER BY ${sortBy} ${sortOrder || 'ASC'}`;
        }
        
        if (limit) {
            sql += ` LIMIT ${parseInt(limit)}`;
        }
        
        if (offset) {
            sql += ` OFFSET ${parseInt(offset)}`;
        }
        
        const results = getAll(sql, params);
        res.json({ success: true, results });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
