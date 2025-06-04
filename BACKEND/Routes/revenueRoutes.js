// routes/revenueRoutes.js
const express = require('express');

const router = express.Router();
const {   createMonthlyRevenue,
    getMonthlyRevenueById,
    updateMonthlyRevenue,
    deleteMonthlyRevenue,
    getMonthlyRevenues

} = require('../Controllers/revenueController');

// Create a new revenue record
router.post('/', createMonthlyRevenue);

// Get all revenue records
router.get('/', getMonthlyRevenues);

// Get a specific revenue record by ID
router.get('/:id', getMonthlyRevenueById);

// Update a revenue record by ID
router.put('/:id', updateMonthlyRevenue);

// Delete a revenue record by ID
router.delete('/:id', deleteMonthlyRevenue);

module.exports = router;
