const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getDb, saveDatabase } = require('../../database');

router.get('/backup', (req, res) => {
    try {
        const db = getDb();
        if (!db) {
            return res.status(500).json({ success: false, message: 'Database not initialized' });
        }
        
        const data = db.export();
        const buffer = Buffer.from(data);
        
        const backupDir = path.join(__dirname, '../../data/backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(backupDir, `wams-backup-${timestamp}.db`);
        
        fs.writeFileSync(backupPath, buffer);
        
        res.json({ success: true, message: 'Backup created successfully', backupPath });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/restore', (req, res) => {
    try {
        const { backupPath } = req.body;
        
        if (!backupPath || !fs.existsSync(backupPath)) {
            return res.status(400).json({ success: false, message: 'Invalid backup file path' });
        }
        
        const backupData = fs.readFileSync(backupPath);
        const SQL = require('sql.js');
        
        SQL.Database(backupData);
        
        const dbPath = path.join(__dirname, '../../data/wams.db');
        fs.writeFileSync(dbPath, backupData);
        
        res.json({ success: true, message: 'Database restored successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/backups', (req, res) => {
    try {
        const backupDir = path.join(__dirname, '../../data/backups');
        
        if (!fs.existsSync(backupDir)) {
            return res.json({ success: true, backups: [] });
        }
        
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.db'))
            .map(f => {
                const filePath = path.join(backupDir, f);
                const stats = fs.statSync(filePath);
                return {
                    name: f,
                    path: filePath,
                    size: stats.size,
                    created: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);
        
        res.json({ success: true, backups: files });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/backups/:filename', (req, res) => {
    try {
        const backupPath = path.join(__dirname, '../../data/backups', req.params.filename);
        
        if (!fs.existsSync(backupPath)) {
            return res.status(404).json({ success: false, message: 'Backup file not found' });
        }
        
        fs.unlinkSync(backupPath);
        
        res.json({ success: true, message: 'Backup deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/database-info', (req, res) => {
    try {
        const db = getDb();
        
        const tables = [
            'users', 'dealers', 'dealers_orders', 'suppliers', 'inventory',
            'stock_transactions', 'supplier_quotations', 'manufacturing_orders',
            'bills', 'bill_items', 'payments', 'notifications', 'system_alerts'
        ];
        
        const tableCounts = {};
        tables.forEach(table => {
            try {
                const result = db.exec(`SELECT COUNT(*) as count FROM ${table}`);
                tableCounts[table] = result.length > 0 ? result[0].values[0][0] : 0;
            } catch (e) {
                tableCounts[table] = 0;
            }
        });
        
        res.json({ success: true, tableCounts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
