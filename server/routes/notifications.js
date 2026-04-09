const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId } = require('../../database');

router.get('/notifications', (req, res) => {
    try {
        const userId = req.session.userId;
        let notifications;
        
        if (userId) {
            notifications = getAll("SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC", [userId]);
        } else {
            notifications = getAll("SELECT * FROM notifications WHERE user_id IS NULL ORDER BY created_at DESC");
        }
        
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/system-alerts', (req, res) => {
    try {
        const alerts = getAll(`
            SELECT sa.*, i.product_name
            FROM system_alerts sa
            LEFT JOIN inventory i ON sa.product_id = i.id
            ORDER BY sa.created_at DESC
        `);
        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/unread-count', (req, res) => {
    try {
        const userId = req.session.userId;
        let count;
        
        if (userId) {
            count = getOne("SELECT COUNT(*) as count FROM notifications WHERE (user_id IS NULL OR user_id = ?) AND is_read = 0", [userId]);
        } else {
            count = getOne("SELECT COUNT(*) as count FROM notifications WHERE user_id IS NULL AND is_read = 0");
        }
        
        res.json({ success: true, count: count?.count || 0 });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/notifications', (req, res) => {
    try {
        const { user_id, title, message, type } = req.body;
        runQuery("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [user_id || null, title, message, type || 'info']);
        res.json({ success: true, notificationId: getLastInsertId(), message: 'Notification sent successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/notifications/:id/read', (req, res) => {
    try {
        runQuery("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/notifications/read-all', (req, res) => {
    try {
        const userId = req.session.userId;
        if (userId) {
            runQuery("UPDATE notifications SET is_read = 1 WHERE user_id IS NULL OR user_id = ?", [userId]);
        } else {
            runQuery("UPDATE notifications SET is_read = 1 WHERE user_id IS NULL");
        }
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/notifications/:id', (req, res) => {
    try {
        runQuery("DELETE FROM notifications WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/system-alerts/:id/resolve', (req, res) => {
    try {
        runQuery("UPDATE system_alerts SET is_resolved = 1 WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'Alert resolved successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
