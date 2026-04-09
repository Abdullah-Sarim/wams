const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let db;

const USER_ROLES = {
    ADMINISTRATOR: 'Administrator',
    USER: 'User',
    MANAGER: 'Manager',
    DEALER: 'Dealer',
    SUPPLIER: 'Supplier',
    MANAGEMENT_AUTHORITY: 'Management Authority',
    PRODUCTION_MANAGER: 'Production Manager'
};

const ORDER_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    RAW_MATERIALS_ORDERED: 'raw_materials_ordered',
    RAW_MATERIALS_RECEIVED: 'raw_materials_received',
    IN_PRODUCTION: 'in_production',
    PRODUCTION_FINISHED: 'production_finished'
};

const DEALER_ORDER_STATUS = {
    PENDING: 'pending',
    AUTO_APPROVED: 'auto_approved',
    BILL_GENERATED: 'bill_generated',
    IN_PRODUCTION: 'in_production',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const RAW_MATERIAL_STATUS = {
    PENDING: 'pending',
    QUOTATION_REQUESTED: 'quotation_requested',
    QUOTATION_RECEIVED: 'quotation_received',
    ORDERED: 'ordered',
    RECEIVED: 'received',
    REJECTED: 'rejected'
};

const PRODUCTION_STATUS = {
    PENDING: 'pending',
    STARTED: 'started',
    IN_PRODUCTION: 'in_production',
    FINISHED: 'finished',
    CANCELLED: 'cancelled'
};

const PRODUCT_TYPES = {
    FINISHED_PRODUCT: 'finished_product',
    RAW_MATERIAL: 'raw_material',
    PART: 'part'
};

const TRANSACTION_TYPES = {
    PURCHASE: 'purchase',
    SALE: 'sale',
    PRODUCTION: 'production',
    ADJUSTMENT: 'adjustment',
    RETURN: 'return'
};

async function initializeDatabase() {
    const SQL = await initSqlJs();
    const dbPath = path.join(__dirname, 'data', 'wams.db');
    let data;
    if (fs.existsSync(dbPath)) {
        data = fs.readFileSync(dbPath);
    }
    db = new SQL.Database(data);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'User',
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS dealers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS dealers_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dealer_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            order_date DATE,
            delivery_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dealer_id) REFERENCES dealers(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS suppliers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact_person TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            address TEXT,
            password TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            product_code TEXT UNIQUE,
            description TEXT,
            category TEXT,
            product_type TEXT DEFAULT 'finished_product',
            unit TEXT DEFAULT 'pcs',
            min_stock_level INTEGER DEFAULT 10,
            current_stock INTEGER DEFAULT 0,
            reserved_stock INTEGER DEFAULT 0,
            reorder_level INTEGER DEFAULT 10,
            unit_price REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS stock_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            transaction_type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            reference_type TEXT,
            reference_id INTEGER,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS raw_material_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            finished_product_id INTEGER NOT NULL,
            required_quantity INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            expected_delivery_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (finished_product_id) REFERENCES inventory(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS raw_material_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_material_request_id INTEGER NOT NULL,
            supplier_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            expected_delivery_date DATE,
            actual_delivery_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (raw_material_request_id) REFERENCES raw_material_requests(id),
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS supplier_quotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            supplier_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            valid_until DATE,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS manufacturing_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            start_date DATE,
            end_date DATE,
            expected_delivery_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dealer_id INTEGER NOT NULL,
            bill_number TEXT UNIQUE NOT NULL,
            bill_date DATE,
            total_amount REAL DEFAULT 0,
            status TEXT DEFAULT 'pending',
            due_date DATE,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dealer_id) REFERENCES dealers(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bill_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            FOREIGN KEY (bill_id) REFERENCES bills(id),
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bill_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_date DATE,
            payment_method TEXT,
            reference_number TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (bill_id) REFERENCES bills(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS system_alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            alert_type TEXT NOT NULL,
            product_id INTEGER,
            message TEXT NOT NULL,
            severity TEXT DEFAULT 'warning',
            is_resolved BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES inventory(id)
        );
    `);

    seedDatabase();
    saveDatabase();
    console.log('Database initialized successfully with WAMS schema');
    return db;
}

function seedDatabase() {
    const adminExists = db.exec("SELECT id FROM users WHERE username = 'admin'");
    if (adminExists.length === 0 || adminExists[0].values.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['admin', hashedPassword, USER_ROLES.ADMINISTRATOR, 'System Administrator', 'admin@wams.com']);
        db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['manager', bcrypt.hashSync('manager123', 10), USER_ROLES.MANAGER, 'Manager User', 'manager@wams.com']);
        db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['staff', bcrypt.hashSync('staff123', 10), USER_ROLES.USER, 'Staff User', 'staff@wams.com']);
        db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['auth', bcrypt.hashSync('auth123', 10), USER_ROLES.MANAGEMENT_AUTHORITY, 'Management Authority', 'auth@wams.com']);
        db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['prodmanager', bcrypt.hashSync('pm123', 10), USER_ROLES.PRODUCTION_MANAGER, 'Production Manager', 'pm@wams.com']);
        
        console.log('Default users seeded');
    } else {
        const pmExists = db.exec("SELECT id FROM users WHERE username = 'prodmanager'");
        if (pmExists.length === 0 || pmExists[0].values.length === 0) {
            db.run(`INSERT INTO users (username, password, role, name, email) VALUES (?, ?, ?, ?, ?)`, ['prodmanager', bcrypt.hashSync('pm123', 10), USER_ROLES.PRODUCTION_MANAGER, 'Production Manager', 'pm@wams.com']);
            console.log('Production Manager user seeded');
        }
    }

    const dealersExist = db.exec("SELECT COUNT(*) as count FROM dealers");
    if (dealersExist[0].values[0][0] === 0) {
        db.run(`INSERT INTO dealers (name, contact_person, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)`, ['ABC Electronics', 'Ravi Kumar', 'ravi@abcelectronics.com', '9876543210', '123 Market Road, Mumbai', bcrypt.hashSync('dealer123', 10)]);
        db.run(`INSERT INTO dealers (name, contact_person, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)`, ['XYZ Trading Co', 'Priya Sharma', 'priya@xyztrading.com', '9876543211', '456 Commerce St, Delhi', bcrypt.hashSync('dealer123', 10)]);
        db.run(`INSERT INTO dealers (name, contact_person, email, phone, address, password) VALUES (?, ?, ?, ?, ?, ?)`, ['Global Supplies', 'Amit Patel', 'amit@globalsupplies.com', '9876543212', '789 Industrial Area, Bangalore', bcrypt.hashSync('dealer123', 10)]);
        console.log('Default dealers seeded');
    }

    const suppliersExist = db.exec("SELECT COUNT(*) as count FROM suppliers");
    if (suppliersExist[0].values[0][0] === 0) {
        db.run(`INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, ['Premier Materials Ltd', 'Suresh Reddy', 'suresh@premiermaterials.com', '9123456780', '100 Industrial Park, Chennai']);
        db.run(`INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, ['FastTrack Components', 'Vijay Singh', 'vijay@fasttrack.com', '9123456781', '200 Tech Hub, Hyderabad']);
        db.run(`INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)`, ['Quality Parts Inc', 'Anita Desai', 'anita@qualityparts.com', '9123456782', '300 Manufacturing Zone, Pune']);
        console.log('Default suppliers seeded');
    }

    const inventoryExist = db.exec("SELECT COUNT(*) as count FROM inventory");
    if (inventoryExist[0].values[0][0] === 0) {
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Mobile Phone X1', 'MOB-X1', 'Latest smartphone with 6GB RAM', 'Electronics', 'pcs', 20, 150, 20, 15000]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Laptop Pro 15', 'LAP-PRO15', '15-inch professional laptop', 'Electronics', 'pcs', 10, 45, 10, 75000]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Wireless Mouse', 'MUS-WL', 'Bluetooth wireless mouse', 'Accessories', 'pcs', 50, 200, 50, 899]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['LED Monitor 24', 'MON-LED24', '24-inch Full HD LED monitor', 'Electronics', 'pcs', 15, 60, 15, 12000]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['USB Cable Type-C', 'CAB-USBC', 'Type-C charging cable', 'Parts', 'pcs', 100, 500, 100, 150]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Battery Cell', 'BAT-CELL', 'Lithium battery cell', 'Parts', 'pcs', 200, 800, 200, 250]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['Screen Panel 6', 'SCR-PNL6', 'LCD screen panel 6 inch', 'Parts', 'pcs', 30, 25, 30, 3500]);
        db.run(`INSERT INTO inventory (product_name, product_code, description, category, unit, min_stock_level, current_stock, reorder_level, unit_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, ['PCB Board', 'PCB-BRD', 'Printed circuit board', 'Parts', 'pcs', 50, 120, 50, 800]);
        console.log('Default inventory seeded');
    }
}

function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbPath = path.join(__dirname, 'data', 'wams.db');
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
}

function getDb() {
    return db;
}

function runQuery(sql, params = []) {
    if (!db) return;
    db.run(sql, params);
    saveDatabase();
}

function getOne(sql, params = []) {
    if (!db) return null;
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
    }
    stmt.free();
    return null;
}

function getAll(sql, params = []) {
    if (!db) return [];
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

function getLastInsertId() {
    if (!db) return null;
    const result = db.exec("SELECT last_insert_rowid() as id");
    if (result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
    }
    return null;
}

module.exports = {
    initializeDatabase,
    getDb,
    runQuery,
    getOne,
    getAll,
    getLastInsertId,
    saveDatabase,
    USER_ROLES,
    ORDER_STATUS,
    DEALER_ORDER_STATUS,
    RAW_MATERIAL_STATUS,
    PRODUCTION_STATUS,
    PRODUCT_TYPES,
    TRANSACTION_TYPES
};
