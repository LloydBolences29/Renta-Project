import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../Hook/useAuthHook';

const ProfilePage = () => {
  const { user } = useAuthContext();

  // State to track whether a profile exists.
  const [profileExists, setProfileExists] = useState(false);
  const [tenantId, setTenantId] = useState(null);

  // Initialize form data; prepopulate email from auth context if available.
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    property: 'lalaine',
    roomNumber: ''
  });
  const [error, setError] = useState('');
  // 'success' indicates that the profile has been successfully saved or fetched.
  const [success, setSuccess] = useState(false);

  // Update the email field when the user object changes.
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // On mount, check if a profile exists for this user.
  useEffect(() => {
    if (user?.email) {
      const url = `/api/tenants?email=${encodeURIComponent(user.email)}`;
      axios.get(url)
        .then((res) => {
          // Filter the response to select the profile with the correct email.
          if (res.data && res.data.length > 0) {
            const profile = res.data.find(
              (p) => p.email.toLowerCase() === user.email.toLowerCase()
            );
            if (profile) {
              setFormData({
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                property: profile.property,
                roomNumber: profile.roomNumber
              });
              setProfileExists(true);
              setTenantId(profile._id);
              setSuccess(true);
            } else {
              setProfileExists(false);
            }
          } else {
            setProfileExists(false);
          }
        })
        .catch((err) => {
          console.error("Error fetching tenant profile:", err);
        });
    }
  }, [user]);

  // Room-related states and logic.
  const [selectedBuilding, setSelectedBuilding] = useState('lalaine');
  const [allRoomChoices, setAllRoomChoices] = useState([]);
  const [takenRooms, setTakenRooms] = useState([]);
  const [availableRoomChoices, setAvailableRoomChoices] = useState([]);

  useEffect(() => {
    const available = allRoomChoices.filter((room) => !takenRooms.includes(room));
    setAvailableRoomChoices(available);
  }, [allRoomChoices, takenRooms]);

  useEffect(() => {
    if (selectedBuilding === 'lalaine') {
      const fullRooms = generateRoomNumbers(28);
      setAllRoomChoices(fullRooms);
      fetchTakenRooms(selectedBuilding);
    } else if (selectedBuilding === 'jade') {
      const fullRooms = generateRoomNumbers(30);
      setAllRoomChoices(fullRooms);
      fetchTakenRooms(selectedBuilding);
    }
  }, [selectedBuilding]);

  const handleBuildingChange = (e) => {
    const building = e.target.value;
    setSelectedBuilding(building);
    setFormData((prev) => ({ ...prev, property: building, roomNumber: '' }));
  };

  const generateRoomNumbers = (totalRooms) => {
    return Array.from({ length: totalRooms }, (_, i) => {
      const floor = Math.floor(i / 10) + 1;
      const room = (i % 10) + 1;
      return `${floor}${room.toString().padStart(2, '0')}`;
    });
  };

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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setProfileExists(true);
        setSuccess(true);
        fetchTakenRooms(selectedBuilding);
      } else {
        setError('Error saving profile');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  // If a profile exists, display the profile details.
  if (profileExists) {
    return (
      <div className="min-h-screen w-full bg-gray-100 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-quicksand">
        <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl">
          <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
            Your Profile Details
          </h2>
          <div className="space-y-4 mb-8">
            <p className="text-lg"><strong>Fullname:</strong> {formData.name}</p>
            <p className="text-lg"><strong>Phone Number:</strong> {formData.phone}</p>
            <p className="text-lg"><strong>Email:</strong> {formData.email}</p>
            <p className="text-lg"><strong>Property:</strong> {formData.property}</p>
            <p className="text-lg"><strong>Room Number:</strong> {formData.roomNumber}</p>
          </div>
          <p className="text-center text-sm text-gray-700">
            Your profile is already on tenant list. Please contact the admin for modifications.
          </p>
        </div>
      </div>
    );
  }

  // Otherwise, display the profile creation form.
  return (
    <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-quicksand">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-2xl">
        <h2 className="mb-8 text-center text-3xl font-extrabold text-gray-900">
          Create Your Profile
        </h2>
        {error && <p className="mb-4 text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Fullname</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
              className="block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="block w-full rounded-md border border-gray-300 shadow-sm bg-gray-100 p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Property</label>
            <select
              name="property"
              value={formData.property}
              onChange={handleBuildingChange}
              required
              className="block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="lalaine">Lalaine</option>
              <option value="jade">Jade</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Room Number</label>
            <select
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              className="block w-full rounded-md border border-gray-300 shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select a room</option>
              {availableRoomChoices.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
