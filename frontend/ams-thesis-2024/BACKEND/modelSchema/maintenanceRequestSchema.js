// models/MaintenanceRequest.js
const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Properties',
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Maintenance staff
    }
}, { timestamps: true });


const Maintenance = mongoose.model('Maintenance', maintenanceRequestSchema);
module.exports = Maintenance;