const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Advanced'],
        default: 'Paid' // since we're marking as paid
    },
    newLeaseEndDate: {
        type: Date,
        required: true
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;


