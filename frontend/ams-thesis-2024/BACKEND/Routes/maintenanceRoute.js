const express = require('express')
const Maintenance = require('../modelSchema/maintenanceRequestSchema')
const router = express.Router()
const {
    getAllMaintenance,
    getMaintenanceById,
    deleteExistingMaintenance,
    createMaintenance,
    updateMaintenance
} = require('../Controllers/maintenanceController')


// get all tenant
router.get('/', getAllMaintenance)

// get a single tenant
router.get('/:id', getMaintenanceById )

//  create a new tenant
router.post('/', createMaintenance)

//  update  tenant
router.patch('/:id', updateMaintenance)

//  create a new tenant
router.delete('/:id', deleteExistingMaintenance )

module.exports = router