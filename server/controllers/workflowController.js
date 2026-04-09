const { runQuery, getOne, getAll, getLastInsertId, DEALER_ORDER_STATUS, RAW_MATERIAL_STATUS, PRODUCTION_STATUS, PRODUCT_TYPES, TRANSACTION_TYPES } = require('../../database');

function generateBillNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `BILL-${year}${month}-${random}`;
}

function calculateDeliveryDate(orderQuantity) {
    const date = new Date();
    date.setDate(date.getDate() + (orderQuantity > 100 ? 14 : 7));
    return date.toISOString().split('T')[0];
}

function createNotification(userId, title, message, type = 'info') {
    if (userId) {
        runQuery("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
            [userId, title, message, type]);
    } else {
        const users = getAll("SELECT id FROM users");
        users.forEach(user => {
            runQuery("INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
                [user.id, title, message, type]);
        });
    }
}

function createSystemAlert(alertType, productId, message, severity = 'warning') {
    runQuery("INSERT INTO system_alerts (alert_type, product_id, message, severity) VALUES (?, ?, ?, ?)",
        [alertType, productId, message, severity]);
}

function getProductionManagerId() {
    const pm = getOne("SELECT id FROM users WHERE role = 'Production Manager'");
    return pm ? pm.id : null;
}

const workflowController = {
    placeDealerOrder: (dealerId, productId, quantity, orderDate, deliveryDate, notes) => {
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [productId]);
        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        if (product.current_stock < quantity) {
            return { success: false, message: 'Insufficient stock available' };
        }

        runQuery(`INSERT INTO dealers_orders (dealer_id, product_id, quantity, status, order_date, delivery_date, notes) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [dealerId, productId, quantity, DEALER_ORDER_STATUS.PENDING, orderDate, deliveryDate, notes]);
        
        const orderId = getLastInsertId();

        runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, 'reserved', quantity, 'dealer_order', orderId, 'Stock reserved for dealer order']);
        
        if (product.current_stock - quantity < product.reorder_level) {
            return {
                success: true,
                orderId,
                billId,
                lowStockAlert: true,
                productId: product.id,
                productName: product.product_name,
                currentStock: product.current_stock - quantity,
                reorderLevel: product.reorder_level
            };
        }
        
        return { success: true, orderId, billId };
    },

    checkInventoryAndRequestRawMaterials: (productId, currentStock, reorderLevel) => {
        if (currentStock < reorderLevel) {
            const product = getOne("SELECT * FROM inventory WHERE id = ?", [productId]);
            
            runQuery(`INSERT INTO raw_material_requests (finished_product_id, required_quantity, status, expected_delivery_date) 
                      VALUES (?, ?, ?, ?)`,
                [productId, reorderLevel * 2, RAW_MATERIAL_STATUS.QUOTATION_REQUESTED, calculateDeliveryDate(reorderLevel * 2)]);
            
            const requestId = getLastInsertId();
            
            createSystemAlert('low_stock', productId, 
                `Low stock alert: ${product.product_name} (${currentStock} remaining, reorder at ${reorderLevel})`, 
                'warning');
            
            const suppliers = getAll("SELECT * FROM suppliers");
            suppliers.forEach(supplier => {
                createNotification(supplier.id, 'Quotation Request', 
                    `Raw materials required for: ${product.product_name}. Request ID: ${requestId}`, 
                    'quotation_request');
            });
            
            const pmId = getProductionManagerId();
            if (pmId) {
                createNotification(pmId, 'Inventory Alert', 
                    `Low stock on ${product.product_name}. Raw material request ${requestId} sent to suppliers.`, 
                    'inventory_alert');
            }
            
            return { success: true, requestId, message: 'Raw material request sent to suppliers' };
        }
        
        return { success: false, message: 'Stock level is adequate' };
    },

    updateDealerOrderStatus: (orderId, newStatus) => {
        const order = getOne("SELECT * FROM dealers_orders WHERE id = ?", [orderId]);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        const product = getOne("SELECT * FROM inventory WHERE id = ?", [order.product_id]);
        const oldStatus = order.status;

        if (newStatus === DEALER_ORDER_STATUS.APPROVED && oldStatus === DEALER_ORDER_STATUS.PENDING) {
            runQuery("UPDATE inventory SET reserved_stock = COALESCE(reserved_stock, 0) + ? WHERE id = ?",
                [order.quantity, order.product_id]);
            
            runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                [order.product_id, 'reserved', order.quantity, 'dealer_order', orderId, 'Stock reserved for approved order']);

            createNotification(order.dealer_id, 'Order Approved', 
                `Your order #${orderId} for ${product.product_name} (Qty: ${order.quantity}) has been approved. Stock reserved.`, 
                'order_status');

            runQuery("UPDATE dealers_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newStatus, orderId]);

            return { success: true, message: 'Order approved, stock reserved', billGenerated: false };
        }

        if (newStatus === DEALER_ORDER_STATUS.COMPLETED && oldStatus === DEALER_ORDER_STATUS.APPROVED) {
            const totalAmount = product.unit_price * order.quantity;
            const billNumber = generateBillNumber();
            
            runQuery(`INSERT INTO bills (dealer_id, bill_number, bill_date, total_amount, status, due_date) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                [order.dealer_id, billNumber, new Date().toISOString().split('T')[0], totalAmount, 'pending_payment', calculateDeliveryDate(order.quantity)]);
            
            const billId = getLastInsertId();
            
            runQuery(`INSERT INTO bill_items (bill_id, product_id, quantity, unit_price, total_price) 
                      VALUES (?, ?, ?, ?, ?)`,
                [billId, order.product_id, order.quantity, product.unit_price, totalAmount]);

            runQuery("UPDATE inventory SET current_stock = current_stock - ?, reserved_stock = reserved_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [order.quantity, order.quantity, order.product_id]);

            runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                [order.product_id, TRANSACTION_TYPES.SALE, order.quantity, 'dealer_order', orderId, 'Stock sold - order completed']);

            createNotification(order.dealer_id, 'Bill Generated - Payment Required', 
                `Your order #${orderId} is complete. Bill ${billNumber} generated for Rs. ${totalAmount}. Please make payment.`, 
                'payment_required');

            runQuery("UPDATE dealers_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newStatus, orderId]);

            return { success: true, message: 'Order completed, bill generated', billId, billNumber, totalAmount };
        }

        if (newStatus === DEALER_ORDER_STATUS.CANCELLED) {
            if (oldStatus === DEALER_ORDER_STATUS.APPROVED) {
                runQuery("UPDATE inventory SET reserved_stock = COALESCE(reserved_stock, 0) - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                    [order.quantity, order.product_id]);
            }
            
            runQuery("UPDATE dealers_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newStatus, orderId]);

            createNotification(order.dealer_id, 'Order Cancelled', 
                `Your order #${orderId} has been cancelled.`, 
                'order_status');

            return { success: true, message: 'Order cancelled' };
        }

        runQuery("UPDATE dealers_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newStatus, orderId]);

        return { success: true, message: `Order status updated to ${newStatus}` };
    },

    submitSupplierQuotation: (supplierId, rawMaterialRequestId, unitPrice, validUntil, expectedDeliveryDate) => {
        const request = getOne("SELECT * FROM raw_material_requests WHERE id = ?", [rawMaterialRequestId]);
        if (!request) {
            return { success: false, message: 'Raw material request not found' };
        }
        
        const totalPrice = request.required_quantity * unitPrice;
        
        runQuery(`INSERT INTO raw_material_orders (raw_material_request_id, supplier_id, quantity, unit_price, total_price, status, expected_delivery_date) 
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [rawMaterialRequestId, supplierId, request.required_quantity, unitPrice, totalPrice, RAW_MATERIAL_STATUS.QUOTATION_RECEIVED, expectedDeliveryDate]);
        
        const orderId = getLastInsertId();
        
        createNotification(supplierId, 'Quotation Submitted', 
            `Your quotation for request #${rawMaterialRequestId} has been received. Order ID: ${orderId}`, 
            'quotation_response');
        
        return { success: true, orderId };
    },

    approveSupplierOrder: (rawMaterialOrderId) => {
        const order = getOne("SELECT * FROM raw_material_orders WHERE id = ?", [rawMaterialOrderId]);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }
        
        runQuery("UPDATE raw_material_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [RAW_MATERIAL_STATUS.ORDERED, rawMaterialOrderId]);
        
        const request = getOne("SELECT * FROM raw_material_requests WHERE id = ?", [order.raw_material_request_id]);
        if (request) {
            runQuery("UPDATE raw_material_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [RAW_MATERIAL_STATUS.ORDERED, request.id]);
        }
        
        const supplier = getOne("SELECT * FROM suppliers WHERE id = ?", [order.supplier_id]);
        createNotification(order.supplierId, 'Order Approved', 
            `Your quotation has been approved. Order #${rawMaterialOrderId}. Expected delivery: ${order.expected_delivery_date}`, 
            'order_approved');
        
        return { success: true, message: 'Supplier order approved' };
    },

    receiveRawMaterials: (rawMaterialOrderId, actualDeliveryDate) => {
        const order = getOne("SELECT * FROM raw_material_orders WHERE id = ?", [rawMaterialOrderId]);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }
        
        runQuery("UPDATE raw_material_orders SET status = ?, actual_delivery_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [RAW_MATERIAL_STATUS.RECEIVED, actualDeliveryDate, rawMaterialOrderId]);
        
        const request = getOne("SELECT * FROM raw_material_requests WHERE id = ?", [order.raw_material_request_id]);
        if (request) {
            runQuery("UPDATE raw_material_requests SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [RAW_MATERIAL_STATUS.RECEIVED, request.id]);
        }
        
        runQuery(`INSERT INTO inventory (product_name, product_code, description, category, product_type, unit, min_stock_level, current_stock, reorder_level, unit_price) 
                  SELECT product_name, product_code || '-RM', description, category, 'raw_material', unit, 10, ?, 10, unit_price 
                  FROM inventory WHERE id = ?`,
            [order.quantity, request.finished_product_id]);
        
        const newProductId = getLastInsertId();
        
        runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            [newProductId, TRANSACTION_TYPES.PURCHASE, order.quantity, 'raw_material_order', rawMaterialOrderId, 'Raw materials received']);
        
        const pmId = getProductionManagerId();
        if (pmId) {
            createNotification(pmId, 'Start Production', 
                `Raw materials received for order #${rawMaterialOrderId}. Please start production.`, 
                'production_start');
        }
        
        return { success: true, newProductId, message: 'Raw materials received. Production can begin.' };
    },

    startProduction: (productId, quantity, startDate, expectedEndDate) => {
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [productId]);
        if (!product) {
            return { success: false, message: 'Product not found' };
        }
        
        runQuery(`INSERT INTO manufacturing_orders (product_id, quantity, status, start_date, expected_delivery_date) 
                  VALUES (?, ?, ?, ?, ?)`,
            [productId, quantity, PRODUCTION_STATUS.STARTED, startDate, expectedEndDate]);
        
        const manufacturingId = getLastInsertId();
        
        runQuery("UPDATE inventory SET current_stock = current_stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [quantity, productId]);
        
        runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            [productId, TRANSACTION_TYPES.PRODUCTION, quantity, 'manufacturing_order', manufacturingId, 'Production started']);
        
        const dealers = getAll("SELECT * FROM dealers");
        dealers.forEach(dealer => {
            createNotification(dealer.id, 'Production Started', 
                `Production started for ${product.product_name}. Expected completion: ${expectedEndDate}`, 
                'production_update');
        });
        
        return { success: true, manufacturingId };
    },

    updateProductionStatus: (manufacturingId, newStatus) => {
        const manufacturing = getOne("SELECT * FROM manufacturing_orders WHERE id = ?", [manufacturingId]);
        if (!manufacturing) {
            return { success: false, message: 'Manufacturing order not found' };
        }
        
        const endDate = newStatus === PRODUCTION_STATUS.FINISHED ? new Date().toISOString().split('T')[0] : null;
        
        runQuery("UPDATE manufacturing_orders SET status = ?, end_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [newStatus, endDate, manufacturingId]);
        
        if (newStatus === PRODUCTION_STATUS.FINISHED) {
            const product = getOne("SELECT * FROM inventory WHERE id = ?", [manufacturing.product_id]);
            const newStock = product.current_stock + manufacturing.quantity;
            
            runQuery("UPDATE inventory SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [newStock, manufacturing.product_id]);
            
            runQuery(`INSERT INTO stock_transactions (product_id, transaction_type, quantity, reference_type, reference_id, notes) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                [manufacturing.product_id, TRANSACTION_TYPES.PRODUCTION, manufacturing.quantity, 'manufacturing_order', manufacturingId, 'Production finished']);
            
            runQuery("UPDATE dealers_orders SET status = ? WHERE product_id = ? AND status = ?",
                [DEALER_ORDER_STATUS.COMPLETED, manufacturing.product_id, DEALER_ORDER_STATUS.IN_PRODUCTION]);
            
            const dealers = getAll("SELECT d.* FROM dealers d JOIN dealers_orders o ON d.id = o.dealer_id WHERE o.product_id = ? AND o.status = ?",
                [manufacturing.product_id, DEALER_ORDER_STATUS.COMPLETED]);
            dealers.forEach(dealer => {
                createNotification(dealer.id, 'Order Completed', 
                    `Your order for ${product.product_name} is now complete and ready for delivery.`, 
                    'order_completed');
            });
            
            return { success: true, message: 'Production finished. Inventory updated.' };
        }
        
        if (newStatus === PRODUCTION_STATUS.STARTED) {
            runQuery("UPDATE dealers_orders SET status = ? WHERE product_id = ? AND status = ?",
                [DEALER_ORDER_STATUS.IN_PRODUCTION, manufacturing.product_id, DEALER_ORDER_STATUS.AUTO_APPROVED]);
        }
        
        return { success: true, message: `Production status updated to ${newStatus}` };
    },

    getWorkflowStatus: (dealerOrderId) => {
        const order = getOne("SELECT * FROM dealers_orders WHERE id = ?", [dealerOrderId]);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }
        
        const product = getOne("SELECT * FROM inventory WHERE id = ?", [order.product_id]);
        
        const rawMaterialRequest = getOne("SELECT * FROM raw_material_requests WHERE finished_product_id = ? ORDER BY created_at DESC LIMIT 1", 
            [order.product_id]);
        
        let rawMaterialOrder = null;
        if (rawMaterialRequest) {
            rawMaterialOrder = getOne("SELECT * FROM raw_material_orders WHERE raw_material_request_id = ?", 
                [rawMaterialRequest.id]);
        }
        
        const manufacturingOrder = getOne("SELECT * FROM manufacturing_orders WHERE product_id = ? ORDER BY created_at DESC LIMIT 1", 
            [order.product_id]);
        
        return {
            success: true,
            dealerOrder: order,
            product,
            rawMaterialRequest,
            rawMaterialOrder,
            manufacturingOrder
        };
    }
};

module.exports = workflowController;
