// controllers/revenueController.js
const Revenue = require('../modelSchema/revenueSchema');

// Create a new monthly revenue record
const createMonthlyRevenue = async (req, res) => {
  try {
    const { month, year, expectedRevenue, collectedRevenue, outstandingRevenue } = req.body;

    const newRevenue = new Revenue({
      month,
      year,
      expectedRevenue,
      collectedRevenue,
      outstandingRevenue
    });

    const savedRevenue = await newRevenue.save();
    res.status(201).json(savedRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve all monthly revenue records
const getMonthlyRevenues = async (req, res) => {
  try {
    const revenues = await Revenue.find();
    res.status(200).json(revenues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Retrieve a single monthly revenue record by ID
const getMonthlyRevenueById = async (req, res) => {
  try {
    const revenue = await Revenue.findById(req.params.id);
    if (!revenue) {
      return res.status(404).json({ error: 'Revenue record not found' });
    }
    res.status(200).json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a monthly revenue record by ID
const updateMonthlyRevenue = async (req, res) => {
  try {
    const updatedRevenue = await Revenue.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedRevenue) {
      return res.status(404).json({ error: 'Revenue record not found' });
    }
    res.status(200).json(updatedRevenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a monthly revenue record by ID
const deleteMonthlyRevenue = async (req, res) => {
  try {
    const deletedRevenue = await Revenue.findByIdAndDelete(req.params.id);
    if (!deletedRevenue) {
      return res.status(404).json({ error: 'Revenue record not found' });
    }
    res.status(200).json({ message: 'Revenue record deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
    createMonthlyRevenue,
    getMonthlyRevenues,
    getMonthlyRevenueById,
    updateMonthlyRevenue,
    deleteMonthlyRevenue
}