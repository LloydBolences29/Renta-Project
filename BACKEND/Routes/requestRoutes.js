const express = require('express')
const Request= require('../modelSchema/requestSchema')
const router = express.Router()
const multer = require('multer');
const {getAllMaintenance,
    getMaintenanceById,
    deleteExistingMaintenance,
    createMaintenance,
    updateMaintenance} = require('../Controllers/requestController')

    const upload = multer({ dest: 'uploads/' });

    // get all tenant
    router.get('/', getAllMaintenance)
    
    // get a single tenant
    router.get('/:id', getMaintenanceById )
    
    //  create a new tenant
    //router.post('/', upload.single('picture'), createMaintenance);
    router.post('/', createMaintenance);

    
    //  update  tenant
    router.put('/:id', updateMaintenance)
    
    //  create a new tenant
    router.delete('/:id', deleteExistingMaintenance )
    
    module.exports = router
