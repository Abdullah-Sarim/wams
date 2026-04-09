# WAMS - Web-Based Automated Manufacturing System

A comprehensive manufacturing management system built with React.js, Node.js/Express, and SQLite.

## Features

### Core Modules (Based on SRS)
1. **System Authorization** - Login, Signup, Logout, Change Password
2. **User Management** - Manage User Roles, User Profile
3. **Dealer Management** - Create/Update/Delete Dealer Profiles, Dealer Orders
4. **Stock Management** - Track Inventory, Update Stock, Set Reorder Levels
5. **Supplier Management** - Supplier Details, Supplier Quotations
6. **Manufacturing** - Manufacturing Orders, Completion & Stock Update
7. **Billing & Payment** - Bill Generation, Payment Tracking
8. **Search & Filtering** - Search/Filter Records
9. **Notifications** - System Alerts
10. **Reporting** - Sales Report, Stock Report, Supplier Report
11. **System Maintenance** - Data Backup & Recovery

### Intelligent Decision Logic
- Automatically triggers system alerts when stock falls below reorder level
- Automatically drafts supplier quotations for low-stock items

## Tech Stack

- **Frontend**: React.js (Functional Components, React Router)
- **Backend**: Node.js with Express.js
- **Database**: SQLite (sql.js)
- **Authentication**: Session-based with bcrypt password hashing

## Project Structure

```
WAMS/
├── database.js              # SQLite database setup & seeding
├── server.js                # Express server with all routes
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── index.html               # Entry HTML
├── src/
│   ├── App.jsx              # Main React app with routing
│   ├── index.jsx             # React entry point
│   ├── index.css             # Global styles
│   └── components/
│       ├── Layout.jsx        # Main layout with sidebar
│       ├── Dashboard.jsx     # Dashboard home page
│       ├── Auth/             # Authentication components
│       ├── UserManagement/   # User management components
│       ├── DealerManagement/ # Dealer management components
│       ├── StockManagement/  # Stock management components
│       ├── SupplierManagement/
│       ├── Manufacturing/
│       ├── BillingPayment/
│       ├── Notifications/
│       ├── Reporting/
│       └── SystemMaintenance/
├── server/
│   ├── routes/              # API route handlers
│   └── middleware/           # Auth middleware
└── dist/                    # Production build
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Frontend**
   ```bash
   npm run build
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open browser: http://localhost:3000
   - Default Login: `admin` / `admin123`

## Default Users

| Username | Password | Role |
|----------|----------|------|
| admin    | admin123 | Administrator |
| manager  | manager123 | Manager |
| staff    | staff123 | User |
| auth     | auth123 | Management Authority |

## API Endpoints

### System Authorization
- `POST /api/system-authorization/login`
- `POST /api/system-authorization/signup`
- `POST /api/system-authorization/logout`
- `POST /api/system-authorization/change-password`
- `GET /api/system-authorization/current-user`

### User Management
- `GET /api/user-management/users`
- `GET /api/user-management/profile`
- `PUT /api/user-management/profile`

### Dealer Management
- `GET /api/dealer-management/dealers`
- `POST /api/dealer-management/create-dealer-profile`
- `PUT /api/dealer-management/update-dealer-profile/:id`
- `DELETE /api/dealer-management/delete-dealer-profile/:id`
- `GET /api/dealer-management/dealers-orders`

### Stock Management
- `GET /api/stock-management/track-inventory`
- `POST /api/stock-management/update-stock`
- `POST /api/stock-management/set-reorder-levels`

### Supplier Management
- `GET /api/supplier-management/suppliers`
- `GET /api/supplier-management/supplier-quotations`

### Manufacturing
- `GET /api/manufacturing/manufacturing-orders`
- `POST /api/manufacturing/create-manufacturing-order`
- `PUT /api/manufacturing/complete-manufacturing-order/:id`

### Billing & Payment
- `GET /api/billing-payment/bills`
- `POST /api/billing-payment/generate-bill`
- `POST /api/billing-payment/payments`

### Reporting
- `GET /api/reporting/sales-report`
- `GET /api/reporting/stock-report`
- `GET /api/reporting/supplier-report`

### System Maintenance
- `GET /api/system-maintenance/backup`
- `GET /api/system-maintenance/backups`
- `POST /api/system-maintenance/restore`

## Environment Variables

No external environment variables required - all configuration is handled internally.

## License

This project is for educational/academic purposes.

## Author

Built for WAMS (Web-Based Automated Manufacturing System) academic project.