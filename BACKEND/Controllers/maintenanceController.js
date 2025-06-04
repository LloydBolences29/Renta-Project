// controllers/maintenanceController.js

const mongoose = require('mongoose');
const Maintenance = require('../modelSchema/maintenanceRequestSchema');
const Tenant = require('../modelSchema/tenantSchema');

// GET all maintenance requests
const getAllMaintenance = async (req, res) => {
  try {
    const maintenanceRequests = await Maintenance.find()
      .populate('tenant', 'name email phone')   // no more property/roomNumber
      .sort({ createdAt: -1 });
    res.status(200).json(maintenanceRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET a single maintenance request by ID
const getMaintenanceById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No Maintenance Request found' });
  }

  try {
    const maintenance = await Maintenance.findById(id)
      .populate('tenant', 'name email phone');
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance request not found' });
    }
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// CREATE a new maintenance request
// controllers/maintenanceController.js
const createMaintenance = async (req, res) => {
  const { tenantId, description, priority } = req.body;

  try {
    // 1) Grab the tenant’s name + location info
    const tenant = await Tenant
      .findById(tenantId)
      .select('name property roomNumber');      // ← include these two

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // 2) Build your payload
    const maintenanceData = {
      tenant:      tenant._id,
      tenantName:  tenant.name,
      property:    tenant.property,             // ← add it
      roomNumber:  tenant.roomNumber,           // ← and it
      description,
      priority,
      status:      'pending',
    };

    if (req.file) {
      maintenanceData.picture = req.file.path;
    }

    // 3) Save & return
    const maintenance = new Maintenance(maintenanceData);
    await maintenance.save();
    return res.status(201).json(maintenance);

  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// UPDATE an existing maintenance request
const updateMaintenance = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No Maintenance Request match' });
  }

  try {
    const maintenance = await Maintenance.findByIdAndUpdate(
      id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance Request not found' });
    }
    res.status(200).json(maintenance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// DELETE a maintenance request
const deleteExistingMaintenance = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: 'No Maintenance Request match' });
  }

  try {
    const maintenance = await Maintenance.findByIdAndDelete(id);
    if (!maintenance) {
      return res.status(404).json({ error: 'Maintenance Request not found' });
    }
    res.status(200).json({ message: 'Maintenance Request deleted successfully', maintenance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteExistingMaintenance
};
