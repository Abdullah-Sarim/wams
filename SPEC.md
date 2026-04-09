# WAMS - Web Based Automated Manufacturing System

## 1. Project Overview

**Project Name:** Web Based Automated Manufacturing System (WAMS)  
**Project Type:** Full-stack Web Application  
**Core Functionality:** A manufacturing management software for companies that manufacture products based on orders and send stock to dealers. Handles billing, dealers, stock, suppliers, quotations, and production planning.  
**Target Users:** Manufacturing company staff (Admin, Manager, Staff), Dealers, Suppliers

---

## 2. Technology Stack

- **Backend:** Node.js with Express.js
- **Database:** SQLite with better-sqlite3
- **Frontend:** Plain HTML/CSS/JavaScript (Vanilla JS)
- **Authentication:** Session-based auth with bcrypt

---

## 3. UI/UX Specification

### Layout Structure
- **Sidebar Navigation:** Fixed left sidebar (240px width)
- **Main Content Area:** Fluid width, right of sidebar
- **Header:** Top bar with user info and logout (60px height)
- **Responsive:** Collapsible sidebar on mobile (<768px)

### Color Palette
- **Primary:** `#1a365d` (Dark Blue)
- **Secondary:** `#2d3748` (Dark Gray)
- **Accent:** `#38a169` (Green)
- **Warning:** `#dd6b20` (Orange)
- **Danger:** `#e53e3e` (Red)
- **Background:** `#f7fafc` (Light Gray)
- **Card Background:** `#ffffff` (White)
- **Text Primary:** `#1a202c`
- **Text Secondary:** `#718096`

### Typography
- **Font Family:** 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Headings:** 24px (h1), 20px (h2), 16px (h3)
- **Body:** 14px
- **Small:** 12px

### Spacing
- **Container Padding:** 24px
- **Card Padding:** 16px
- **Element Gap:** 12px
- **Section Gap:** 24px

### Visual Effects
- **Card Shadow:** `0 1px 3px rgba(0,0,0,0.12)`
- **Button Hover:** Darken 10%
- **Table Row Hover:** `#f7fafc`

### Components
- **Tables:** Striped rows, hover effect, pagination
- **Forms:** Labels, inputs, validation states
- **Buttons:** Primary (blue), Success (green), Danger (red), Outline
- **Cards:** White background, shadow, rounded corners (8px)
- **Modals:** Centered overlay with form content
- **Status Badges:** Colored pills for order status

---

## 4. Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | User ID |
| username | TEXT UNIQUE | Login username |
| password | TEXT | Bcrypt hashed |
| role | TEXT | admin, manager, staff |
| name | TEXT | Full name |
| created_at | DATETIME | Creation timestamp |

### Dealers Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Dealer ID |
| name | TEXT | Company name |
| contact_person | TEXT | Contact name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| address | TEXT | Full address |
| created_at | DATETIME | Creation timestamp |

### Suppliers Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Supplier ID |
| name | TEXT | Company name |
| contact_person | TEXT | Contact name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| address | TEXT | Full address |
| created_at | DATETIME | Creation timestamp |

### Parts/Products Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Product ID |
| name | TEXT | Product name |
| description | TEXT | Description |
| type | TEXT | raw_material, part, finished_product |
| unit | TEXT | Unit of measurement |
| min_stock | INTEGER | Minimum stock threshold |
| current_stock | INTEGER | Current quantity |
| price | REAL | Unit price |
| created_at | DATETIME | Creation timestamp |

### Dealer Requests Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Request ID |
| dealer_id | INTEGER FK | Dealer reference |
| product_id | INTEGER FK | Product reference |
| quantity | INTEGER | Requested quantity |
| status | TEXT | pending, approved, rejected, completed |
| requested_date | DATE | Request date |
| delivery_date | DATE | Expected delivery |
| notes | TEXT | Additional notes |
| created_at | DATETIME | Creation timestamp |

### Quotations Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Quotation ID |
| supplier_id | INTEGER FK | Supplier reference |
| product_id | INTEGER FK | Product reference |
| quantity | INTEGER | Quantity quoted |
| unit_price | REAL | Price per unit |
| total_price | REAL | Total price |
| valid_until | DATE | Validity date |
| status | TEXT | pending, accepted, rejected |
| created_at | DATETIME | Creation timestamp |

### Purchase Orders Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | PO ID |
| supplier_id | INTEGER FK | Supplier reference |
| quotation_id | INTEGER FK | Quotation reference |
| status | TEXT | pending, confirmed, received, cancelled |
| order_date | DATE | Order date |
| expected_date | DATE | Expected delivery |
| notes | TEXT | Additional notes |
| created_at | DATETIME | Creation timestamp |

### Billing Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Bill ID |
| dealer_id | INTEGER FK | Dealer reference |
| bill_number | TEXT UNIQUE | Invoice number |
| bill_date | DATE | Invoice date |
| total_amount | REAL | Total amount |
| status | TEXT | pending, paid, cancelled |
| due_date | DATE | Payment due date |
| created_at | DATETIME | Creation timestamp |

### Bill Items Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Item ID |
| bill_id | INTEGER FK | Bill reference |
| product_id | INTEGER FK | Product reference |
| quantity | INTEGER | Quantity sold |
| unit_price | REAL | Price per unit |
| total_price | REAL | Line total |

### Production Orders Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Production ID |
| product_id | INTEGER FK | Product to produce |
| quantity | INTEGER | Production quantity |
| status | TEXT | planned, in_progress, completed |
| start_date | DATE | Production start |
| end_date | DATE | Production end |
| notes | TEXT | Additional notes |
| created_at | DATETIME | Creation timestamp |

### Stock Transactions Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PK | Transaction ID |
| product_id | INTEGER FK | Product reference |
| type | TEXT | in, out, adjustment |
| quantity | INTEGER | Quantity change |
| reference_type | TEXT | PO, Production, Sale, Adjustment |
| reference_id | INTEGER | Reference ID |
| notes | TEXT | Notes |
| created_at | DATETIME | Creation timestamp |

---

## 5. Functionality Specification

### 5.1 Authentication
- Login page with username/password
- Session-based authentication
- Role-based access control (Admin, Manager, Staff)
- Logout functionality

### 5.2 Dashboard (Home)
- Summary cards: Total Products, Low Stock Items, Pending Orders, Total Dealers
- Recent activity feed
- Quick action buttons
- Stock alerts for low inventory

### 5.3 Dealers Management
- List all dealers with search/filter
- Add/Edit/Delete dealers
- View dealer details and order history
- Send notifications to dealers about stock

### 5.4 Suppliers Management
- List all suppliers
- Add/Edit/Delete suppliers
- View supplier quotations
- Compare quotations

### 5.5 Products/Parts Management
- List all products (raw materials, parts, finished goods)
- Add/Edit/Delete products
- Stock level tracking with min_stock alerts
- View stock transactions history
- Adjust stock manually

### 5.6 Dealer Requests
- Submit requests from dealers
- Approve/Reject requests
- Track request status
- Generate orders from approved requests

### 5.7 Quotations
- Request quotations from suppliers
- Compare multiple quotations
- Accept/Reject quotations
- Link accepted quotations to purchase orders

### 5.8 Purchase Orders
- Create orders from accepted quotations
- Track order status
- Receive stock when order arrives
- Update product stock automatically

### 5.9 Billing
- Generate invoices for dealer orders
- Track payment status
- View bill history
- Print/export bills

### 5.10 Production Management
- Plan production based on demand
- Track production status
- Update finished goods stock on completion

### 5.11 Reports
- Sales reports (monthly/weekly)
- Stock status report
- Low stock alerts
- Dealer order summary

### 5.12 Decision Support
- Auto-suggest stock reorder when below minimum
- Recommend suppliers based on price history
- Production planning suggestions based on dealer demand

---

## 6. Page Structure

### Pages to Implement:
1. **login.html** - Login page
2. **index.html** - Dashboard
3. **dealers.html** - Dealers management
4. **suppliers.html** - Suppliers management
5. **products.html** - Products/Parts management
6. **requests.html** - Dealer requests
7. **quotations.html** - Quotations management
8. **purchase-orders.html** - Purchase orders
9. **billing.html** - Billing/Invoices
10. **production.html** - Production management
11. **reports.html** - Reports and analytics
12. **settings.html** - System settings

---

## 7. API Endpoints

### Authentication
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/current-user

### Dealers
- GET /api/dealers
- GET /api/dealers/:id
- POST /api/dealers
- PUT /api/dealers/:id
- DELETE /api/dealers/:id

### Suppliers
- GET /api/suppliers
- GET /api/suppliers/:id
- POST /api/suppliers
- PUT /api/suppliers/:id
- DELETE /api/suppliers/:id

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id
- POST /api/products/:id/adjust-stock
- GET /api/products/low-stock

### Dealer Requests
- GET /api/requests
- GET /api/requests/:id
- POST /api/requests
- PUT /api/requests/:id (update status)
- DELETE /api/requests/:id

### Quotations
- GET /api/quotations
- GET /api/quotations/:id
- POST /api/quotations
- PUT /api/quotations/:id (accept/reject)
- DELETE /api/quotations/:id

### Purchase Orders
- GET /api/purchase-orders
- GET /api/purchase-orders/:id
- POST /api/purchase-orders
- PUT /api/purchase-orders/:id (update status)
- POST /api/purchase-orders/:id/receive

### Billing
- GET /api/bills
- GET /api/bills/:id
- POST /api/bills
- PUT /api/bills/:id (update status)
- GET /api/bills/:id/print

### Production
- GET /api/production
- GET /api/production/:id
- POST /api/production
- PUT /api/production/:id (update status)
- DELETE /api/production/:id

### Reports
- GET /api/reports/sales
- GET /api/reports/stock
- GET /api/reports/dealers

---

## 8. Acceptance Criteria

1. ✓ User can log in with valid credentials
2. ✓ Dashboard shows accurate summary statistics
3. ✓ Can CRUD dealers, suppliers, products
4. ✓ Can create and manage dealer requests
5. ✓ Can create and compare quotations
6. ✓ Can create purchase orders and receive stock
7. ✓ Can generate bills/invoices
8. ✓ Can plan and track production
9. ✓ Stock levels update automatically
10. ✓ Low stock alerts are displayed
11. ✓ All forms validate input
12. ✓ Role-based access works correctly
13. ✓ Data persists in SQLite database

---

## 9. File Structure

```
WAMS/
├── server.js              # Express server
├── database.js            # Database initialization
├── package.json           # Dependencies
├── public/
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   ├── js/
│   │   ├── app.js        # Main application logic
│   │   ├── api.js        # API helper functions
│   │   └── utils.js      # Utility functions
│   └── html/
│       ├── login.html
│       ├── index.html
│       ├── dealers.html
│       ├── suppliers.html
│       ├── products.html
│       ├── requests.html
│       ├── quotations.html
│       ├── purchase-orders.html
│       ├── billing.html
│       ├── production.html
│       ├── reports.html
│       └── settings.html
└── data/
    └── wams.db            # SQLite database
```