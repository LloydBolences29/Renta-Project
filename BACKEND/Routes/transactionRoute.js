const express = require('express');
const router = express.Router();
const { 
    markTenantAsPaid, 
    getTransactionsByTenant,
    markTenantAsAdvanced
} = require('../Controllers/transactionController')

// POST route to mark a tenant as paid
router.post('/tenants/:tenantId/mark-as-paid', markTenantAsPaid);
router.get('/transactions', getTransactionsByTenant);
router.post('/tenants/:tenantId/mark-as-advanced', markTenantAsAdvanced);

module.exports = router;
