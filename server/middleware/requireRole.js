const jwt = require('jsonwebtoken');

const JWT_SECRET = 'wams-secret-key-2024-production';

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return null;
    }
}

function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (req.session && req.session.userRole && allowedRoles.includes(req.session.userRole)) {
            return next();
        }

        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({ success: false, message: 'Invalid or expired token' });
        }

        if (!allowedRoles.includes(decoded.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access Denied: Insufficient clearance for critical information.' 
            });
        }

        req.user = decoded;
        next();
    };
}

module.exports = { generateToken, verifyToken, requireRole, JWT_SECRET };