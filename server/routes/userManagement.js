const express = require('express');
const router = express.Router();
const { getOne, getAll, runQuery, getLastInsertId, USER_ROLES } = require('../../database');

router.get('/users', (req, res) => {
    try {
        const users = getAll("SELECT id, username, name, role, email, phone, created_at FROM users ORDER BY created_at DESC");
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/users/:id', (req, res) => {
    try {
        const user = getOne("SELECT id, username, name, role, email, phone, created_at FROM users WHERE id = ?", [req.params.id]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/users', (req, res) => {
    try {
        const { username, password, name, role, email, phone } = req.body;
        const bcrypt = require('bcryptjs');
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        runQuery("INSERT INTO users (username, password, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)", 
            [username, hashedPassword, role || USER_ROLES.USER, name, email, phone]);
        
        res.json({ success: true, userId: getLastInsertId(), message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/users/:id', (req, res) => {
    try {
        const { name, role, email, phone } = req.body;
        runQuery("UPDATE users SET name = ?, role = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
            [name, role, email, phone, req.params.id]);
        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.delete('/users/:id', (req, res) => {
    try {
        runQuery("DELETE FROM users WHERE id = ?", [req.params.id]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/roles', (req, res) => {
    res.json({ success: true, roles: Object.values(USER_ROLES) });
});

router.get('/profile', (req, res) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const user = getOne("SELECT id, username, name, role, email, phone, created_at FROM users WHERE id = ?", [userId]);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/profile', (req, res) => {
    try {
        const userId = req.session.userId;
        const { name, email, phone } = req.body;
        
        runQuery("UPDATE users SET name = ?, email = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", 
            [name, email, phone, userId]);
        
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
