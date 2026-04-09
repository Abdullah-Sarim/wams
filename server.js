const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase } = require('./database');
const { requireAuth, conditionalAuth } = require('./server/middleware/authMiddleware');
const { requireRole } = require('./server/middleware/requireRole');

const app = express();
const PORT = 3000;

app.use(session({
    secret: 'wams-secret-key-2024-production',
    resave: false,
    saveUninitialized: false,
    name: 'wams.sid',
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: 'lax',
        path: '/'
    }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'dist')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

const authRoutes = require('./server/routes/auth');
const userManagementRoutes = require('./server/routes/userManagement');
const dealerManagementRoutes = require('./server/routes/dealerManagement');
const dealerPortalRoutes = require('./server/routes/dealerPortal');
const stockManagementRoutes = require('./server/routes/stockManagement');
const supplierManagementRoutes = require('./server/routes/supplierManagement');
const supplierPortalRoutes = require('./server/routes/supplierPortal');
const manufacturingRoutes = require('./server/routes/manufacturing');
const billingPaymentRoutes = require('./server/routes/billingPayment');
const searchFilterRoutes = require('./server/routes/searchFilter');
const notificationsRoutes = require('./server/routes/notifications');
const reportingRoutes = require('./server/routes/reporting');
const systemMaintenanceRoutes = require('./server/routes/systemMaintenance');

app.use('/api/system-authorization', authRoutes);
app.use('/api/user-management', conditionalAuth, userManagementRoutes);
app.use('/api/dealer-management', conditionalAuth, dealerManagementRoutes);
app.use('/api/dealer-portal', conditionalAuth, dealerPortalRoutes);
app.use('/api/stock-management', conditionalAuth, stockManagementRoutes);
app.use('/api/supplier-management', conditionalAuth, supplierManagementRoutes);
app.use('/api/supplier-portal', conditionalAuth, supplierPortalRoutes);
app.use('/api/manufacturing', conditionalAuth, manufacturingRoutes);
app.use('/api/billing-payment', conditionalAuth, requireRole('Administrator', 'Manager', 'Management Authority'), billingPaymentRoutes);
app.use('/api/search-filter', conditionalAuth, searchFilterRoutes);
app.use('/api/notifications', conditionalAuth, notificationsRoutes);
app.use('/api/reporting', conditionalAuth, requireRole('Administrator', 'Manager', 'Management Authority'), reportingRoutes);
app.use('/api/system-maintenance', conditionalAuth, requireRole('Administrator'), systemMaintenanceRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ 
            authenticated: true, 
            userId: req.session.userId, 
            userType: req.session.userType, 
            userRole: req.session.userRole 
        });
    } else {
        res.json({ authenticated: false });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`WAMS Server running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});

module.exports = app;