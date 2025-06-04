const { default: mongoose } = require('mongoose');
const Tenant = require('../modelSchema/tenantSchema')

//Get All Tenants
const getAllTenant = async (req, res) => {
    try {
        const tenants = await Tenant.find().sort({name: -1}) // Example: populating property
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
    
    const { name, email, phone, property, leaseStartDate, leaseEndDate, rentAmount } = req.body;
    
    //adding tenant to DB
    try { 
        const tenant = await Tenant.create({ name,  email, phone, property, leaseStartDate, leaseEndDate, rentAmount });
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

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No tenant match"})
    }

    const tenant = await Tenant.findOneAndUpdate({_id: id}, {
        ...req.body
    })
    if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(tenant)
    }      

module.exports = {
    createNewTenant,
    getAllTenant,
    getTenantById,
    updateTenant,
    deleteExistingTenant
}