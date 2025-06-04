const mongoose = require('mongoose');

const propertiesSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
    },
    buildingName: {
        type: String,
        required: true,
        trim: true
    },
    numberOfUnits: {
        type: Number,
        required: true,
        min: 1
    },
    pricePerUnit: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    tenant: [{
        type: Boolean,

    }]
}, { timestamps: true });





const Properties = mongoose.model('Properties', propertiesSchema);
module.exports = Properties;