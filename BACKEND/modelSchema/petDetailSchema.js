const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  petName: { type: String, required: true },
  petType: { type: String, required: true },
  breed: { type: String, required: true },
  weight: { type: Number, required: true },
  vaccinationStatus: { 
    type: String, 
    enum: ['Up-to-date', 'Overdue', 'Not vaccinated'], 
    required: true 
  },
  notes: { type: String },
  imageFile: { type: String, required: true },
  email: { type: String, required: true },
  // New field for approval process:
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'disapproved'], 
    default: 'pending' 
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Pet = mongoose.model('Pet', petSchema);
module.exports = Pet;
