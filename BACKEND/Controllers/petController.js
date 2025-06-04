const mongoose = require('mongoose');
const Pet = require('../modelSchema/petDetailSchema');

// POST /api/pets/register
const createPet = async (req, res) => {
  try {
    const { petName, petType, breed, weight, vaccinationStatus, notes, email } = req.body;
    
    // Ensure an image file is provided
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }
    
    // Use the file path from the uploaded file
    const imageFile = req.file.path;

    // Create a new pet instance with a default status of "pending"
    const newPet = new Pet({
      petName,
      petType,
      breed,
      weight,
      vaccinationStatus,
      notes,
      email,
      imageFile,
      status: 'pending' // New pets start with a "pending" status
    });

    await newPet.save();
    return res.status(201).json({ message: 'Pet created successfully', pet: newPet });
  } catch (error) {
    console.error('Error creating pet:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/pets/:email
// (Using email here as an example since your schema does not include tenantId)
// const getPetDetails = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const pets = await Pet.find({ email });
//     return res.status(200).json(pets);
//   } catch (error) {
//     console.error('Error fetching pet details:', error);
//     return res.status(500).json({ message: 'Failed to fetch pets', error });
//   }
// };

// PUT /api/pets/:petId
const editPetDetails = async (req, res) => {
  try {
    // Use the same parameter name as defined in the router (":id")
    const { id } = req.params;
    const updateData = { ...req.body };

    // If a new image is uploaded, update the imageFile field
    if (req.file) {
      updateData.imageFile = req.file.path;
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedPet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    return res.status(200).json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    return res.status(500).json({ message: 'Error updating pet', error });
  }
};

// DELETE /api/pet/:petId

const deletePetDetails = async (req, res) => {
  const { petId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(petId)) {
    return res.status(400).json({ error: 'Invalid pet ID' });
  }

  try {
    const pet = await Pet.findByIdAndDelete(petId);

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    return res.status(200).json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return res.status(500).json({ error: 'Error deleting pet' });
  }
};



const getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find({});
    return res.status(200).json(pets);
  } catch (error) {
    console.error('Error fetching all pets:', error);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }
};

// const updatePetStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     if (!['pending', 'approved', 'disapproved'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status value' });
//     }
//     const updatedPet = await Pet.findByIdAndUpdate(id, { status }, { new: true });
//     if (!updatedPet) {
//       return res.status(404).json({ error: 'Pet not found' });
//     }
//     return res.status(200).json({ message: 'Pet status updated successfully', pet: updatedPet });
//   } catch (error) {
//     console.error('Error updating pet status:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };


const updatePetStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'approved', 'disapproved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedPet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    return res.status(200).json({
      message: 'Pet status updated successfully',
      pet: updatedPet,
      email: updatedPet.email,         // ✅ return email
      petName: updatedPet.petName      // ✅ return pet name
    });
  } catch (error) {
    console.error('Error updating pet status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};




module.exports = {
  createPet,
  getAllPets,
  editPetDetails,
  deletePetDetails,
  updatePetStatus
};
