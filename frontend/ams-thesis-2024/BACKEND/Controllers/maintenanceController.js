const { default: mongoose } = require('mongoose');
const Maintenance = require('../modelSchema/maintenanceRequestSchema')


// get all properties
const getAllMaintenance = async (req, res) => {
    try {
        const maintenance = await Maintenance.find().sort({room: -1}) 
        res.status(200).json(maintenance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get single properties
const getMaintenanceById = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No Maintenance Request match"})
    }

        const maintenance = await Maintenance.findById(id)
        if (!properties) {
            return res.status(404).json({ error: 'Maintenance Request not found' });
        }
        res.status(200).json(maintenance);

    }


// create new  properties
const createMaintenance = async (req, res) => {
    const { 
        tenant,
        property,
        description,
        priority,
        status,
        asignTo} = req.body;

    try {
        const maintenance= await Maintenance.create({ 
            tenant,
            property,
            description,
            priority,
            status,
            asignTo});
        res.status(201).json(maintenance);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// update properties
const updateMaintenance = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No Maintenance Request match"})
    }

    const maintenance = await Maintenance.findOneAndUpdate({_id: id}, {
        ...req.body
    })
    if (!maintenance) {
        return res.status(404).json({ error: 'Maintenance Request not found' });
    }
    res.status(200).json()
    }   

// delete properties
const deleteExistingMaintenance = async (req, res) =>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No Maintenance Request match"})
    }

    const maintenance = await Maintenance.findOneAndDelete({_id: id})
    
    if (!maintenance) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(maintenance)
}


module.exports ={
    getAllMaintenance,
    getMaintenanceById,
    deleteExistingMaintenance,
    createMaintenance,
    updateMaintenance
}



