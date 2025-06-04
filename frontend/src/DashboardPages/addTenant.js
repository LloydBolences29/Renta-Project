import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { TextField, MenuItem, Button, Select, InputLabel, FormControl } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateTenantForm = ({ onClose, onSuccess }) => {
  const { register, handleSubmit, reset } = useForm();

  // State for selected building and room choices
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [allRoomChoices, setAllRoomChoices] = useState([]);
  const [takenRooms, setTakenRooms] = useState([]);
  const [availableRoomChoices, setAvailableRoomChoices] = useState([]);

  // Generate room numbers (e.g., 101-110, 201-210) based on total rooms.
  const generateRoomNumbers = (totalRooms) => {
    return Array.from({ length: totalRooms }, (_, i) => {
      const floor = Math.floor(i / 10) + 1; 
      const room = (i % 10) + 1; 
      return `${floor}${room.toString().padStart(2, '0')}`; // Format: 101, 102, etc.
    });
  };

  // Fetch taken rooms for the selected building from the tenants API.
  const fetchTakenRooms = async (building) => {
    try {
      const response = await axios.get('/api/tenants');
      const tenants = response.data;
      const taken = tenants
        .filter((tenant) => tenant.property === building)
        .map((tenant) => tenant.roomNumber);
      setTakenRooms(taken);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  // When building changes, update room choices and fetch taken rooms.
  const handleBuildingChange = (e) => {
    const building = e.target.value;
    setSelectedBuilding(building);

    if (building === 'lalaine') {
      const fullRooms = generateRoomNumbers(28);
      setAllRoomChoices(fullRooms);
      fetchTakenRooms(building);
    } else if (building === 'jade') {
      const fullRooms = generateRoomNumbers(30);
      setAllRoomChoices(fullRooms);
      fetchTakenRooms(building);
    } else {
      setAllRoomChoices([]);
      setTakenRooms([]);
    }
  };

  // Whenever the full room list or taken rooms change, update available rooms.
  useEffect(() => {
    const available = allRoomChoices.filter((room) => !takenRooms.includes(room));
    setAvailableRoomChoices(available);
  }, [allRoomChoices, takenRooms]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const response = await axios.post('/api/tenants', data);
      toast('Tenant created successfully');
      reset();
      onSuccess(response.data);
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const errorMessage = error.response.data?.error;
        if (errorMessage && errorMessage.includes('duplicate key error')) {
          toast('A tenant with this email already exists. Please use a different email.');
        } else {
          toast('Error creating tenant. Please check the input data and try again.');
        }
      } else {
        console.error('Error creating tenant:', error);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-5 mb:p-4 tb:p-5 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-5 mb:text-xl tb:text-2xl">Create Tenant</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name Input */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            {...register('name', { required: true })}
            placeholder="Enter tenant's name"
          />
        </div>

        {/* Email Input */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            {...register('email', { required: true })}
            placeholder="Enter tenant's email"
          />
        </div>

        {/* Phone Input */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Phone"
            variant="outlined"
            fullWidth
            {...register('phone')}
            placeholder="Enter tenant's phone"
          />
        </div>

        {/* Building Select Dropdown */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <FormControl fullWidth variant="outlined">
            <InputLabel>Building</InputLabel>
            <Select
              label="Building"
              {...register('property', { required: true })}
              value={selectedBuilding}
              onChange={handleBuildingChange}
            >
              <MenuItem value="">
                <em>Select Building</em>
              </MenuItem>
              <MenuItem value="lalaine">Lalaine Building</MenuItem>
              <MenuItem value="jade">Jade Building</MenuItem>
            </Select>
          </FormControl>
        </div>

        {/* Room Number Select Dropdown */}
        {selectedBuilding && (
          <div className="mb-4 mb:mb-3 tb:mb-4">
            <FormControl fullWidth variant="outlined">
              <InputLabel>Room Number</InputLabel>
              <Select
                label="Room Number"
                {...register('roomNumber', { required: true })}
              >
                <MenuItem value="">
                  <em>Select Room Number</em>
                </MenuItem>
                {availableRoomChoices.length > 0 ? (
                  availableRoomChoices.map((room) => (
                    <MenuItem key={room} value={room}>
                      {room}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled value="">
                    No available rooms
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </div>
        )}

        {/* Lease Start Date */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Lease Start Date"
            type="date"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('leaseStartDate', { required: true })}
          />
        </div>

        {/* Lease End Date */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Lease End Date"
            type="date"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            {...register('leaseEndDate', { required: true })}
          />
        </div>

        {/* Rent Amount */}
        <div className="mb-4 mb:mb-3 tb:mb-4">
          <TextField
            label="Rent Amount"
            type="number"
            variant="outlined"
            fullWidth
            {...register('rentAmount', { required: true })}
            placeholder="Enter rent amount"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create Tenant
        </Button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default CreateTenantForm;
