const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');

router.post('/place-order', (req, res) => {
    try {
        const { dealerId, productId, quantity, orderDate, deliveryDate, notes } = req.body;
        const result = workflowController.placeDealerOrder(dealerId, productId, quantity, orderDate, deliveryDate, notes);
        
        if (result.lowStockAlert) {
            const rawMaterialResult = workflowController.checkInventoryAndRequestRawMaterials(
                result.productId,
                result.currentStock,
                result.reorderLevel
            );
            result.rawMaterialRequest = rawMaterialResult;
        }
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/update-order-status/:id', (req, res) => {
    try {
        const { status } = req.body;
        const result = workflowController.updateDealerOrderStatus(req.params.id, status);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/check-inventory/:productId', (req, res) => {
    try {
        const product = require('../database').getOne("SELECT * FROM inventory WHERE id = ?", [req.params.productId]);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        const result = workflowController.checkInventoryAndRequestRawMaterials(
            product.id,
            product.current_stock,
            product.reorder_level
        );
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/supplier-quotation', (req, res) => {
    try {
        const { supplierId, rawMaterialRequestId, unitPrice, validUntil, expectedDeliveryDate } = req.body;
        const result = workflowController.submitSupplierQuotation(
            supplierId, rawMaterialRequestId, unitPrice, validUntil, expectedDeliveryDate
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/approve-supplier-order/:id', (req, res) => {
    try {
        const result = workflowController.approveSupplierOrder(req.params.id);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/receive-raw-materials/:id', (req, res) => {
    try {
        const { actualDeliveryDate } = req.body;
        const result = workflowController.receiveRawMaterials(req.params.id, actualDeliveryDate);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/start-production', (req, res) => {
    try {
        const { productId, quantity, startDate, expectedEndDate } = req.body;
        const result = workflowController.startProduction(productId, quantity, startDate, expectedEndDate);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/update-production-status/:id', (req, res) => {
    try {
        const { status } = req.body;
        const result = workflowController.updateProductionStatus(req.params.id, status);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.get('/workflow-status/:orderId', (req, res) => {
    try {
        const result = workflowController.getWorkflowStatus(req.params.orderId);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
