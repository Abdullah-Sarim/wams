function requireAuth(req, res, next) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
    }
    next();
}

function requireRole(...roles) {
    return (req, res, next) => {
        if (req.session && req.session.userRole && roles.includes(req.session.userRole)) {
            return next();
        }
        if (!req.session || !req.session.userRole) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (!roles.includes(req.session.userRole)) {
            return res.status(403).json({ success: false, message: 'Forbidden. Insufficient permissions.' });
        }
        next();
    };
}

function conditionalAuth(req, res, next) {
    const publicPaths = [
        '/login',
        '/signup',
        '/logout',
        '/session',
        '/current-user',
        '/change-password',
        '/check-session',
        '/create-dealer-profile',
        '/suppliers',
        '/system-authorization/login',
        '/system-authorization/signup'
    ];
    
    const isPublicPath = publicPaths.some(path => req.path.includes(path));
    
    if (isPublicPath) {
        return next();
    }
    
    return requireAuth(req, res, next);
}

module.exports = { requireAuth, requireRole, conditionalAuth };