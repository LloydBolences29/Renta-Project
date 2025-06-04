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
        type: String,
        enum: ['lalaine', 'jade'],  // Directly use enum for property names
        required: true,
        default: 'lalaine'
      },
    roomNumber: { 
        type: String, // Store room number directly for each tenant
        required: true 
    },
    leaseStartDate: {
        type: Date,
        
    },
    leaseEndDate: {
        type: Date, 
        
    },
    rentAmount: {
        type: Number, 
        
    },
    remark: { 
        type: String, 
        default: '' },
        
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Advanced'],
        default: 'Pending' 
    }
});

const Tenant = mongoose.model('Tenant', tenantSchema);
module.exports = Tenant;
