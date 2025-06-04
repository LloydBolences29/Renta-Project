const express = require('express');
const router = express.Router();
const upload = require('../Controllers/upload'); 

const {
  createPet,
  getAllPets,       
  deletePetDetails,
  editPetDetails,
  updatePetStatus,    
} = require('../Controllers/petController');

// GET all pets
router.get('/', getAllPets);

// POST a new pet detail (with image upload)
router.post('/', upload.single('imageFile'), createPet);

// PUT: Update pet details
router.put('/:id', editPetDetails);

// DELETE: Delete a pet
router.delete('/:petId', deletePetDetails);


// PUT: Update pet status (approval/disapproval)
router.put('/:id/status', updatePetStatus);

module.exports = router;
