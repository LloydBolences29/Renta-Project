const express = require('express')
const Tenant = require('../modelSchema/tenantSchema')
const router = express.Router()
const {
    createNewTenant,
    getAllTenant,
    getTenantById,
    updateTenant,
    deleteExistingTenant,
    getTenantByEmail 
} = require('../Controllers/tenantsControllers')


// get all tenant
router.get('/', getAllTenant)

// get a single tenant
router.get('/:id', getTenantById )

//  create a new tenant
router.post('/', createNewTenant)

//  update  tenant
router.put('/:id', updateTenant)

//  create a new tenant
router.delete('/:id', deleteExistingTenant )

router.get('/email/:email', getTenantByEmail);

module.exports = router