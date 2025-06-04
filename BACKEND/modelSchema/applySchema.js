const mongoose = require('mongoose');

const applySchema = new mongoose.Schema({
  building: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update the updatedAt field on save
applySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});



const Apply = mongoose.model('Apply', applySchema);
module.exports = Apply;