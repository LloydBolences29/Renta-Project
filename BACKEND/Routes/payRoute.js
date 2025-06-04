const express = require('express');
const router = express.Router();
const upload = require('../Controllers/upload');

const {
  createPaymentProof,
  getAllPaymentProofs,
  editPaymentProof,
  deletePaymentProof,
  updatePaymentProofStatus,
} = require('../Controllers/payController');

// GET all payment proofs
router.get('/', getAllPaymentProofs);

// POST a new payment proof (with file upload)
// The field name 'paymentProof' should match what your frontend sends
router.post('/', upload.single('paymentProof'), createPaymentProof);

// PUT: Update payment proof details
router.put('/:id', editPaymentProof);

// DELETE: Delete a payment proof
router.delete('/:id', deletePaymentProof);

// PUT: Update payment proof status (approval/disapproval)
router.put('/:id/status', updatePaymentProofStatus);

module.exports = router;
