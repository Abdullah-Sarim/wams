const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId, saveDatabase } = require('../../database');

router.get('/track-inventory', (req, res) => {
    try {
        const inventory = getAll("SELECT * FROM inventory ORDER BY product_name ASC");
        res.json({ success: true, inventory });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/track-inventory/:id', (req, res) => {
    try {
        const item = getOne("SELECT * FROM inventory WHERE id = ?", [req.params.id]);
        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        res.json({ success: true, item });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/update-stock', (req, res) => {
    try {
        const { product_id, quantity, transaction_type, notes } = req.body;
        
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [product_id]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        let newStock = product.current_stock;
        if (transaction_type === 'purchase' || transaction_type === 'production' || transaction_type === 'return') {
            newStock += parseInt(quantity);
        } else if (transaction_type === 'sale' || transaction_type === 'adjustment_decrease') {
            newStock -= parseInt(quantity);
        }
        
        runQuery("UPDATE inventory SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [newStock, product_id]);
        
        runQuery("INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, notes) VALUES (?, ?, ?, ?, ?)",
            [product_id, transaction_type, quantity, 'manual_update', notes]);
        
        checkReorderLevel(product_id, newStock, product.reorder_level);
        
        res.json({ success: true, message: 'Stock updated successfully', new_stock: newStock });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/set-reorder-levels', (req, res) => {
    try {
        const { product_id, reorder_level, min_stock_level } = req.body;
        runQuery("UPDATE inventory SET reorder_level = ?, min_stock_level = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [reorder_level, min_stock_level, product_id]);
        res.json({ success: true, message: 'Reorder levels set successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/low-stock', (req, res) => {
    try {
        const lowStockItems = getAll("SELECT * FROM inventory WHERE current_stock <= reorder_level ORDER BY current_stock ASC");
        res.json({ success: true, items: lowStockItems });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

function checkReorderLevel(productId, currentStock, reorderLevel) {
    try {
        if (currentStock <= reorderLevel) {
            runQuery("INSERT INTO system_alerts (alert_type, product_id, message, severity) VALUES (?, ?, ?, ?)",
                ['low_stock', productId, `Stock level (${currentStock}) is below reorder level (${reorderLevel})`, 'warning']);
            
            const suppliers = getAll("SELECT * FROM suppliers LIMIT 3");
            const product = getOne("SELECT * FROM inventory WHERE id = ?", [productId]);
            
            if (suppliers.length > 0 && product) {
                suppliers.forEach(supplier => {
                    const estimatedPrice = product.unit_price * 1.1;
                    const totalPrice = estimatedPrice * (reorderLevel * 2 - currentStock);
                    
                    runQuery(`INSERT INTO supplier_quotations (supplier_id, product_id, quantity, unit_price, total_price, valid_until, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [supplier.id, productId, reorderLevel * 2, estimatedPrice, totalPrice, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 'pending']);
                });
                
                runQuery("INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)",
                    ['Auto-Quotation Generated', `Auto-quotations drafted for suppliers for product: ${product.product_name}`, 'warning']);
            }
        }
    } catch (err) {
        console.error('Error in checkReorderLevel:', err);
    }
}

router.get('/stock-transactions', (req, res) => {
    try {
        const transactions = getAll(`
            SELECT st.*, i.product_name 
            FROM stock_transactions st
            JOIN inventory i ON st.product_id = i.id
            ORDER BY st.created_at DESC
        `);
        res.json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
