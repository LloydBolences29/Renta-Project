
const mongoose = require('mongoose');

const monthlyRevenueSchema = new mongoose.Schema({
  month: { type: Number, required: true }, // 1 for Jan, 2 for Feb, etc.
  year: { type: Number, required: true },
  expectedRevenue: { type: Number, required: true },
  collectedRevenue: { type: Number, required: true },
  outstandingRevenue: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Revenue = mongoose.model('Revenue', monthlyRevenueSchema);
module.exports = Revenue;
