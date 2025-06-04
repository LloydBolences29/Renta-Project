
const express = require('express')

const { 
    createVisitorLog, getVisitorLogs 
} = require('../Controllers/visitModelController')


const router = express.Router();

router.post('/', createVisitorLog);
router.get('/', getVisitorLogs);

module.exports = router;
