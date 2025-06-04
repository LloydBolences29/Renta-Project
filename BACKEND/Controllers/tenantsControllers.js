const { default: mongoose } = require('mongoose');
const Tenant = require('../modelSchema/tenantSchema')

//Get All Tenants
const getAllTenant = async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({name: -1}) // onw to many wiht property
        res.status(200).json(tenants);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Get Single Tenants
const getTenantById = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No tenant match"})
    }

        const tenant = await Tenant.findById(id)
        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }
        res.status(200).json(tenant);

    }



//Create a new Tenant
const createNewTenant = async (req, res) =>{
    
    const { name, email, phone, property, roomNumber, leaseStartDate, leaseEndDate, rentAmount } = req.body;
    
    //adding tenant to DB
    try { 
        const tenant = await Tenant.create({ name,  email, phone, property, roomNumber, leaseStartDate, leaseEndDate, rentAmount });
        res.status(200).json(tenant);
    } catch (error) {
        res.status(400).json({ error: error.message });
    } 
}


//delete existing tenant
const deleteExistingTenant = async (req, res) =>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No tenant match"})
    }

    const tenant = await Tenant.findOneAndDelete({_id: id})
    
    if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(tenant)
}

//updating tenant 

const updateTenant = async (req, res) => {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "No tenant match" });
    }
  
    try {
      // Find and update tenant
      const tenant = await Tenant.findOneAndUpdate(
        { _id: id },
        { ...req.body },
        { new: true } // Return the updated document
      );
  
      // Check if tenant exists
      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
      }
  
      res.status(200).json(tenant);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  // GET tenant by email
const getTenantByEmail = async (req, res) => {
    try {
      const { email } = req.params;
      const tenant = await Tenant.findOne({ email });
  
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
  
      res.status(200).json(tenant);
    } catch (error) {
      console.error('Error fetching tenant:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {
    getTenantByEmail,
    createNewTenant,
    getAllTenant,
    getTenantById,
    updateTenant,
    deleteExistingTenant
}