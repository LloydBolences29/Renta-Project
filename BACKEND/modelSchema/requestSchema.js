// models/MaintenanceRequest.js
const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    requestTitle: {
        type: String,
        enum: ["Repair Request", "Routine Checkup", "Damage Report", "Replacement Needed", "Other"]
    },
    tenantName: {
        type: String, 
        required: true
    },
    property: { type: String, required: true },
    roomNumber: { type: String, required: true },


    description: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    preferredDate: {
        type: Date,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set 
    },
    updatedAt: {
        type: Date,
        default: Date.now // Automatically update 
    },
});


const Request = mongoose.model('Request', RequestSchema);
module.exports = Request;