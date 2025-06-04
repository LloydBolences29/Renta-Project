const mongoose = require('mongoose');

const visitorLogSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  page:     { type: String, required: true },
}, {
  timestamps: true   // adds createdAt & updatedAt
});



const Visit = mongoose.model('Visit', visitorLogSchema);
module.exports = Visit;
