import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PetsIcon from '@mui/icons-material/Pets';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAuthContext } from '../Hook/useAuthHook';
import emailjs from 'emailjs-com';


const PetManagementPage = () => {
  // -----------------------
  // State Declarations
  // -----------------------
  const [pets, setPets] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [petToDelete, setPetToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPetId, setCurrentPetId] = useState(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [petData, setPetData] = useState({
    petName: '',
    petType: '',
    breed: '',
    weight: '',
    vaccinationStatus: 'Up-to-date',
    notes: '',
    email: '',
  });
  const petTypes = ['Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Fish', 'Other'];
  const SERVICE_ID = 'service_cz6b2f3';
  const TEMPLATE_ID = 'template_2jhtpmx';
  const PUBLIC_KEY = 'DP2pHl_AB-rj4JjWj';
  // Use your auth hook to retrieve the user and their role
  const { user } = useAuthContext();

// once user loads (or you open the dialog), populate email
useEffect(() => {
  if (user && isFormDialogOpen && !isEditing) {
    setPetData(pd => ({ ...pd, email: user.email }));
  }
}, [user, isFormDialogOpen, isEditing]);


  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
  };



  // -----------------------
  // Fetch Pets Data
  // -----------------------
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const response = await fetch('/api/pet');
      if (response.ok) {
        const data = await response.json();
        setPets(data);
      } else {
        toast.error('Failed to fetch pets');
      }
    } catch (error) {
      toast.error('Error fetching pets');
    }
  };

  // -----------------------
  // Form Handlers
  // -----------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setPetData({
      petName: '',
      petType: '',
      breed: '',
      weight: '',
      vaccinationStatus: 'Up-to-date',
      notes: '',
      email: user?.email || '',
    });
    setImageFile(null);
    setImagePreview(null);
    setIsEditing(false);
    setCurrentPetId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare form data; backend sets status to "pending" for new pets
    const formData = new FormData();
    Object.keys(petData).forEach((key) => {
      formData.append(key, petData[key]);
    });
    if (imageFile) {
      formData.append('imageFile', imageFile);
    }

    try {
      let url, method;
      if (isEditing) {
        url = `/api/pet/${currentPetId}`;
        method = 'PUT';
      } else {
        url = `/api/pet/`;
        method = 'POST';
      }
      const response = await fetch(url, {
        method,
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            (isEditing ? 'Failed to update pet' : 'Failed to register pet')
        );
      }
      toast.success(isEditing ? 'Pet updated successfully!' : 'Pet registered successfully!');
      resetForm();
      setIsFormDialogOpen(false);
      // Show success dialog after registration
      if (!isEditing) {
        setIsSuccessDialogOpen(true);
      }
      fetchPets();
    } catch (error) {
      toast.error(error.message);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (pet) => {
    setPetData({
      petName: pet.petName,
      petType: pet.petType,
      breed: pet.breed,
      weight: pet.weight,
      vaccinationStatus: pet.vaccinationStatus,
      notes: pet.notes || '',
      email: pet.email,
    });
    setImagePreview(pet.imageFile || null);
    setIsEditing(true);
    setCurrentPetId(pet._id);
    setIsFormDialogOpen(true);
  };

  // -----------------------
  // Delete Handler
  // -----------------------
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/pet/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (response.ok) {
        // Remove the deleted pet from the list
        setPets((prevPets) => prevPets.filter((pet) => pet._id !== id));
        toast.success('Pet deleted successfully');
      } else {
        throw new Error(data.error || 'Failed to delete pet');
      }
    } catch (error) {
      toast.error(`Error deleting pet: ${error.message}`);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // -----------------------
  // Approval Handler (Admin Only)
  // -----------------------
  // const handleApproval = async (petId, newStatus) => {
  //   try {
  //     const response = await fetch(`/api/pet/${petId}/status`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ status: newStatus }),
  //     });
  //     if (response.ok) {
  //       toast.success(`Pet ${newStatus}`);
  //       fetchPets();
  //     } else {
  //       throw new Error('Failed to update pet status');
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  const handleApproval = async (petId, newStatus) => {
    try {
      const response = await fetch(`/api/pet/${petId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update pet status');
      }
  
      const data = await response.json();
  
      const message =
        newStatus === 'approved'
          ? 'You can now enjoy our pet-friendly community!'
          : 'Please contact admin for further details.';
  
      const templateParams = {
        user_name: data.email.split('@')[0], // Use email username as fallback name
        pet_name: data.petName,
        status: newStatus,
        message,
        to_email: data.email,
      };
  
      await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
      toast.success(`Email sent to ${data.email}`);
      toast.success(`Pet ${newStatus}`);
      fetchPets();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };
  
  const DeleteConfirmationDialog = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${
        isDeleteDialogOpen ? "" : "hidden"
      }`}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="mb-6">
          Are you sure you want to delete this pet? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsDeleteDialogOpen(false)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(petToDelete)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // -----------------------
  // Success Dialog (After Registration)
  // -----------------------
  const SuccessDialog = () => (
    <Dialog
    open={isSuccessDialogOpen}
    onClose={() => setIsSuccessDialogOpen(false)}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      className: "bg-white rounded-2xl shadow-xl p-6"
    }}
  >
    <DialogTitle className="flex flex-col items-center">
      <CheckCircleIcon className="text-green-500 text-8xl mb-4" />
      <h2 className="text-2xl font-bold text-gray-800">Registration Successful!</h2>
    </DialogTitle>
    <DialogContent>
      <DialogContentText className="text-gray-600 text-center">
      Your pet has been registered and is pending approval.
        It will appear in the approved list once reviewed (up to 24 hours). 
        Thank you for your patience.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', mt: 4 }} >
      <Button
        onClick={() => setIsSuccessDialogOpen(false)}
        variant="contained"
        color="primary"
        className="px-6  rounded-full"
      >
        OK
      </Button>
    </DialogActions>
  </Dialog>

  );

  // -----------------------
  // Filtering Pets by Status
  // -----------------------
  const approvedPets = pets.filter((pet) => pet.status === 'approved');
  const unapprovedPets = pets.filter((pet) => pet.status !== 'approved');

  // -----------------------
  // Render UI
  // -----------------------
  return (
    <div className="w-full px-28 py-20 bg-blue-100 mx-auto p-6">
      <ToastContainer position="top-right" />
      {user ? (
        <>
          {/* Shared Design Header */}
          <div className="flex justify-between items-center mb-6 mb:py-10 mb:px-10 tb:px-10 tb:py-10 gap-10 font-quicksand">
            <h1 className="text-5xl font-bold text-gray-800 flex items-center mb:text-4xl tb:text-4xl font-quicksand">
              <PetsIcon className="mr-2" />
              Pet Management
            </h1>
            <Button
              variant="contained"
              color="primary"
              endIcon={<PetsIcon />}
              onClick={() => {
                resetForm();
                setIsFormDialogOpen(true);
              }}
              className="font-quicksand"
            >
              Register Pet
            </Button>
          </div>

          <div>
            <h3 className="text-md font-quicksand mb-10 text-center tracking-widest">
              This is the list of Approved Pets
            </h3>
          </div>

          {/* Approved Pet Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb:gap-4 tb:gap-5 mb:px-4 tb:px-8 font-quicksand">
            {approvedPets.map((pet) => (
              <div
                key={pet._id}
                className="bg-blue-50 font-quicksand rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1 mb:mx-2 tb:mx-4"
              >
                <div className="relative h-52 mb-4 overflow-hidden rounded-t-2xl mb:h-80">
                  <img
                    src={pet.imageFile || '/api/placeholder/400/300'}
                    alt={pet.petName}
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform hover:scale-105 rounded-full"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-quicksand mb:text-lg font-bold text-gray-900">
                    {pet.petName}
                  </h3>
                  <p className="text-gray-700 mb:text-sm font-quicksand">
                    {pet.breed} • {pet.petType}
                  </p>
                  <p className="text-gray-600 text-sm font-quicksand">
                    Vaccination: {pet.vaccinationStatus}
                  </p>
                  {/* Admin-only Edit and Delete Icons */}
                  {user.role === 'admin' && (
                    <div className="flex justify-end space-x-3 mt-4 font-quicksand">
                      {/* <IconButton
                        onClick={() => handleEdit(pet)}
                        className="p-2 hover:bg-blue-100 transition-colors rounded-full"
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton> */}
                      <IconButton
                        onClick={() => {
                          setPetToDelete(pet._id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="p-2 hover:bg-red-100 transition-colors rounded-full"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {/* Admin-only Delete Confirmation Dialog */}
            {user.role === 'admin' && <DeleteConfirmationDialog />}
            {approvedPets.length === 0 && (
              <div className="col-span-full text-center py-12">
                <PetsIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  No approved pets
                </h3>
                <p className="mt-2 text-gray-500">
                  Once approved, your pet will show up here.
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddCircleIcon />}
                  className="mt-4 mx-auto"
                  onClick={() => {
                    resetForm();
                    setIsFormDialogOpen(true);
                  }}
                >
                  Add New Pet
                </Button>
              </div>
            )}
          </div>

          {/* Admin-only Table for Unapproved Pets */}
          {user.role === 'admin' && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-4">
                Pending / Disapproved Applications
              </h2>
              <TableContainer component={Paper}>
                <Table aria-label="unapproved pets table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Pet Name</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Breed</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                      <TableCell>Vaccination</TableCell>
                      <TableCell>Owner Email</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {unapprovedPets.map((pet) => (
                      <TableRow key={pet._id}>
                        <TableCell>{pet.petName}</TableCell>
                        <TableCell>{pet.petType}</TableCell>
                        <TableCell>{pet.breed}</TableCell>
                        <TableCell>{pet.weight}</TableCell>
                        <TableCell>{pet.vaccinationStatus}</TableCell>
                        <TableCell>{pet.email}</TableCell>
                        <TableCell>{pet.notes}</TableCell>
                        <TableCell>{pet.status}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            onClick={() => handleApproval(pet._id, 'approved')}
                            className="mr-1"
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleApproval(pet._id, 'disapproved')}
                          >
                            Disapprove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {/* Shared Form Dialog (Add/Edit Pet) */}
          <Dialog
            open={isFormDialogOpen}
            onClose={() => {
              setIsFormDialogOpen(false);
              resetForm();
            }}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle className="flex justify-between items-center">
              <div className="flex items-center">
                <PetsIcon className="mr-2" />
                {isEditing ? 'Edit Pet' : 'Register New Pet'}
              </div>
              <IconButton
                onClick={() => {
                  setIsFormDialogOpen(false);
                  resetForm();
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <form id="pet-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Pet Name"
                    name="petName"
                    value={petData.petName}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                  <FormControl fullWidth required variant="outlined">
                    <InputLabel>Pet Type</InputLabel>
                    <Select
                      label="Pet Type"
                      name="petType"
                      value={petData.petType}
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>Select type</em>
                      </MenuItem>
                      {petTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Breed"
                    name="breed"
                    value={petData.breed}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="Weight (kg)"
                    name="weight"
                    type="number"
                    value={petData.weight}
                    onChange={handleChange}
                    required
                    fullWidth
                    variant="outlined"
                  />
                </div>

                <div>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Vaccination Status</InputLabel>
                    <Select
                      label="Vaccination Status"
                      name="vaccinationStatus"
                      value={petData.vaccinationStatus}
                      onChange={handleChange}
                    >
                      <MenuItem value="Up-to-date">Up-to-date</MenuItem>
                      <MenuItem value="Overdue">Overdue</MenuItem>
                      <MenuItem value="Not vaccinated">Not vaccinated</MenuItem>
                    </Select>
                  </FormControl>
                </div>

                <TextField
                  label="Owner's Email"
                  name="email"
                  type="email"
                  value={petData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    readOnly: true,
                  }}
                />

                <TextField
                  label="Notes"
                  name="notes"
                  value={petData.notes}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={3}
                />

                {/* Pet Photo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Photo
                  </label>
                  {imagePreview ? (
                    <div className="relative w-full h-48">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <IconButton
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <CameraAltIcon className="h-12 w-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        Click to upload a photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </form>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={() => {
                  setIsFormDialogOpen(false);
                  resetForm();
                }}
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="pet-form"
                variant="contained"
                color="primary"
                disabled={isLoading}
              >
                {isLoading
                  ? isEditing
                    ? 'Updating...'
                    : 'Registering...'
                  : isEditing
                  ? 'Update Pet'
                  : 'Register Pet'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success Dialog */}
          {!isEditing && <SuccessDialog />}
        </>
      ) : (
        <p>Please log in to view your dashboard.</p>
      )}
    </div>
  );
};

export default PetManagementPage;
