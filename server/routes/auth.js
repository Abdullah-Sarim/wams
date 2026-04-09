const express = require('express');
const bcrypt = require('bcryptjs');
const { runQuery, getOne, getAll, getLastInsertId, USER_ROLES } = require('../../database');
const { generateToken } = require('../middleware/requireRole');

const router = express.Router();

router.post('/login', (req, res) => {
    try {
        const { username, password, userType } = req.body;
        
        if (userType === 'dealer') {
            const dealer = getOne("SELECT * FROM dealers WHERE email = ?", [username]);
            if (dealer && bcrypt.compareSync(password, dealer.password)) {
                req.session.userId = dealer.id;
                req.session.userType = 'dealer';
                req.session.userRole = 'Dealer';
                const token = generateToken({ id: dealer.id, username: dealer.name, role: 'Dealer' });
                return res.json({ success: true, user: { id: dealer.id, name: dealer.name, role: 'Dealer' }, userType: 'dealer', token });
            }
        } else if (userType === 'supplier') {
            const supplier = getOne("SELECT * FROM suppliers WHERE email = ?", [username]);
            if (supplier && bcrypt.compareSync(password, supplier.password)) {
                req.session.userId = supplier.id;
                req.session.userType = 'supplier';
                req.session.userRole = 'Supplier';
                const token = generateToken({ id: supplier.id, username: supplier.name, role: 'Supplier' });
                return res.json({ success: true, user: { id: supplier.id, name: supplier.name, role: 'Supplier' }, userType: 'supplier', token });
            }
        } else {
            const user = getOne("SELECT * FROM users WHERE username = ?", [username]);
            if (user && bcrypt.compareSync(password, user.password)) {
                req.session.userId = user.id;
                req.session.userType = 'staff';
                req.session.userRole = user.role;
                const token = generateToken(user);
                return res.json({ success: true, user: { id: user.id, name: user.name, role: user.role }, userType: 'staff', token });
            }
        }
        
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/signup', (req, res) => {
    try {
        const { username, password, name, role, email, phone } = req.body;
        
        const exists = getOne("SELECT id FROM users WHERE username = ? OR email = ?", [username, email]);
        if (exists) {
            return res.status(400).json({ success: false, message: 'Username or email already exists' });
        }
        
        const hashedPassword = bcrypt.hashSync(password, 10);
        runQuery("INSERT INTO users (username, password, role, name, email, phone) VALUES (?, ?, ?, ?, ?, ?)", 
            [username, hashedPassword, role || USER_ROLES.USER, name, email, phone]);
        
        res.json({ success: true, message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

router.post('/change-password', (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.session.userId;
        const userType = req.session.userType;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        let user;
        if (userType === 'dealer') {
            user = getOne("SELECT password FROM dealers WHERE id = ?", [userId]);
        } else {
            user = getOne("SELECT password FROM users WHERE id = ?", [userId]);
        }
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
        if (userType === 'dealer') {
            runQuery("UPDATE dealers SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hashedNewPassword, userId]);
        } else {
            runQuery("UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [hashedNewPassword, userId]);
        }
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/session', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true, userId: req.session.userId, userType: req.session.userType, userRole: req.session.userRole });
    } else {
        res.json({ authenticated: false });
    }
});

router.get('/current-user', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (req.session.userType === 'dealer') {
        const dealer = getOne("SELECT id, name, email, phone, contact_person FROM dealers WHERE id = ?", [req.session.userId]);
        res.json({ user: { id: dealer.id, name: dealer.name, type: 'dealer', role: 'Dealer' } });
    } else {
        const user = getOne("SELECT id, name, username, role, email FROM users WHERE id = ?", [req.session.userId]);
        res.json({ user: { id: user.id, name: user.name, username: user.username, role: user.role, type: 'staff' } });
    }
});

module.exports = router;
