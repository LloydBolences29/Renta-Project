const mongoose = require('mongoose');

const PaymentProofSchema = new mongoose.Schema({
  email:       { type: String, required: true },
  transactionType: { type: String, required: true, enum: [/*…*/] },
  paymentDate: { type: Date,   required: true },
  transactionId: { type: String, default: '' },
  fileName:    { type: String, required: true },
  status:      { type: String, required: true, enum: ['pending','approved','disapproved'], default: 'pending' },
  createdAt:   { type: Date,   default: Date.now },
});

const Pay = mongoose.model('Pay', PaymentProofSchema);
module.exports = Pay;
