const { default: mongoose } = require('mongoose');
const Properties = require('../modelSchema/propertiesSchema')


// get all properties
const getAllProperties = async (req, res) => {
    try {
        const properties = await Properties.find().sort({room: -1}) 
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// get single properties
const getPropertiesById = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No property match"})
    }

        const properties = await Properties.findById(id)
        if (!properties) {
            return res.status(404).json({ error: 'property not found' });
        }
        res.status(200).json(properties);

    }


// create new  properties
const createProperty = async (req, res) => {
    const { roomNumber, buildingName, numberOfUnits, pricePerUnit, description, tenant} = req.body;

    try {
        const properties = await Properties.create({ roomNumber, buildingName, numberOfUnits, pricePerUnit, description, tenant});
        res.status(201).json(properties);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

// update properties
const updateProperties = async (req, res) => {
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No Property match"})
    }

    const properties = await Properties.findOneAndUpdate({_id: id}, {
        ...req.body
    })
    if (!properties) {
        return res.status(404).json({ error: 'Property not found' });
    }
    res.status(200).json()
    }   

// delete properties
const deleteExistingProperties = async (req, res) =>{
    const { id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No Property match"})
    }

    const properties = await Properties.findOneAndDelete({_id: id})
    
    if (!properties) {
        return res.status(404).json({ error: 'Tenant not found' });
    }
    res.status(200).json(properties)
}


module.exports ={
    getAllProperties,
    getPropertiesById,
    deleteExistingProperties,
    createProperty,
    updateProperties
}



