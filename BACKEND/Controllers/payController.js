const mongoose = require('mongoose');
const Pay = require('../modelSchema/paySchema');

// POST /api/payment-proofs/register
// POST /api/payment-proofs/register
const createPaymentProof = async (req, res) => {
  try {
    // Only pull the fields you still need
    const { email, transactionType, paymentDate, transactionId } = req.body;

    // Ensure a file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Proof file is required' });
    }

    // Use the file path from the uploaded file
    const fileName = req.file.path;

    // Create a new payment proof with only the remaining fields
    const newPaymentProof = new Pay({
      email,
      transactionType,
      paymentDate,
      transactionId,
      fileName,
      status: 'pending' // New proofs start with "pending"
    });

    await newPaymentProof.save();
    return res.status(201).json({
      message: 'Payment proof created successfully',
      paymentProof: newPaymentProof
    });
  } catch (error) {
    console.error('Error creating payment proof:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/payment-proofs
const getAllPaymentProofs = async (req, res) => {
  try {
    // Check if an email filter is provided in the query string
    const query = {};
    if (req.query.email) {
      query.email = req.query.email;
    }
    // Find payment proofs based on the query; if no email is provided, this returns all proofs
    const proofs = await Pay.find(query);
    return res.status(200).json(proofs);
  } catch (error) {
    console.error('Error fetching payment proofs:', error);
    return res.status(500).json({ error: 'Failed to fetch payment proofs' });
  }
};


// PUT /api/payment-proofs/:id
const editPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If a new file is uploaded, update the fileName field
    if (req.file) {
      updateData.fileName = req.file.path;
    }

    const updatedProof = await Pay.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedProof) {
      return res.status(404).json({ message: 'Payment proof not found' });
    }

    return res.status(200).json(updatedProof);
  } catch (error) {
    console.error('Error updating payment proof:', error);
    return res.status(500).json({ message: 'Error updating payment proof', error });
  }
};

// DELETE /api/payment-proofs/:id
const deletePaymentProof = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid payment proof ID' });
  }

  try {
    const deletedProof = await Pay.findByIdAndDelete(id);

    if (!deletedProof) {
      return res.status(404).json({ error: 'Payment proof not found' });
    }

    return res.status(200).json({ message: 'Payment proof deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment proof:', error);
    return res.status(500).json({ error: 'Error deleting payment proof' });
  }
};

// PUT /api/payment-proofs/:id/status
const updatePaymentProofStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate allowed status values
    if (!['Pending', 'Approved', 'Disapproved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedProof = await Pay.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedProof) {
      return res.status(404).json({ error: 'Payment proof not found' });
    }

    return res.status(200).json({ message: 'Payment proof status updated successfully', paymentProof: updatedProof });
  } catch (error) {
    console.error('Error updating payment proof status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createPaymentProof,
  getAllPaymentProofs,
  editPaymentProof,
  deletePaymentProof,
  updatePaymentProofStatus
};
