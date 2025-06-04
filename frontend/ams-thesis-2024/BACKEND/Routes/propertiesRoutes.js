const express = require('express')
const Properties = require('../modelSchema/propertiesSchema')
const router = express.Router()
const {
    getAllProperties,
    getPropertiesById,
    deleteExistingProperties,
    createProperty,
    updateProperties
} = require('../Controllers/propertiesController')


// get all tenant
router.get('/', getAllProperties)

// get a single tenant
router.get('/:id', getPropertiesById )

//  create a new tenant
router.post('/', createProperty)

//  update  tenant
router.patch('/:id', updateProperties)

//  create a new tenant
router.delete('/:id', deleteExistingProperties )

module.exports = router