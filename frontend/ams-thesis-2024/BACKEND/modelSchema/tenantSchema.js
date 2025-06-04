const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true 
    },
    email: { 
        type: String,
        required: true,
        unique: true 
    },
    phone: { 
        type: String
    },
    property: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Properties', 
        required: true 
    },
    leaseStartDate: {
        type: Date,
        required: true 
    },
    leaseEndDate: {
        type: Date, 
        required: true 
    },
    rentAmount: {
        type: Number, 
        required: true }
});

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;
