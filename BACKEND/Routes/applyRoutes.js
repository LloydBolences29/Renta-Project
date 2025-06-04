const express = require('express');
const router = express.Router();


const {
    createApplication,
    getApplications,
    getApplicationById,
    updateApplicationStatus,
    deleteApplication
    
} = require('../Controllers/applyController')

// Route to create a new application
router.post('/', createApplication);

// Route to get all applications
router.get('/', getApplications);

// Route to get a single application by ID
router.get('/:id', getApplicationById);

// Route to update an application's status
router.put('/:id', updateApplicationStatus);

//delete
router.delete('/:id', deleteApplication);

module.exports = router;
