import React, { useState, useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '../Hook/useAuthHook';

const MaintenanceRequestDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuthContext();

  const [buildingName, setBuildingName] = useState('')
  const [roomNumber, setRoomNumber]   = useState('')

  useEffect(() => {
    if (!user?.email) return

    axios
      .get(`/api/tenants/email/${encodeURIComponent(user.email)}`)
      .then(res => {
        const t = res.data
        setBuildingName(t.property)
        setRoomNumber(t.roomNumber)
      })
      .catch(err => console.error('Tenant lookup failed:', err))
  }, [user?.email])

  // For demo purposes - in production, this should come from auth context
  const [isAdmin] = useState(true);
  
  const [formData, setFormData] = useState({
    requestTitle: '',
    property: 'lalaine',
    priority: 'medium',
    description: '',
    tenantName: '',
    contact: '',
    roomNumber: '',
    preferredDate: '',
    status: 'pending'
  });

  // New state for room choices
  const [rooms, setRooms] = useState([]);

  // Fetch tenant data and generate room choices
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await axios.get('/api/tenants');
        const tenants = response.data;
        
        const allBuildings = [
          { property: 'Lalaine', totalRooms: 28 },
          { property: 'Jade', totalRooms: 30 },
        ];
        
        const roomsData = allBuildings.flatMap((building) =>
          Array.from({ length: building.totalRooms }, (_, i) => {
            const floorNumber = Math.floor(i / 10) + 1;
            const roomPosition = (i % 10) + 1;
            const roomNumber = `${floorNumber}${String(roomPosition).padStart(2, '0')}`;
            const tenant = tenants.find(
              (tenant) =>
                tenant.roomNumber === roomNumber &&
                tenant.property.toLowerCase() === building.property.toLowerCase()
            );
            
            return {
              roomNumber,
              isRented: !!tenant,
              property: building.property,
              tenant: tenant || null,
            };
          })
        );

        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/request');
      setRequests(response.data);
    } catch (err) {
      setError(err.response?.data || 'Error fetching requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:4000/api/request/${selectedRequest._id}`, formData);
      } else {
        await axios.post('http://localhost:4000/api/request', formData);
      }
      await fetchRequests();
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting the form:', error.response?.data || error.message);
    }
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditDialogOpen(true);
    setFormData({
      requestTitle: request.requestTitle,
      property: request.property,
      priority: request.priority,
      description: request.description,
      tenantName: request.tenantName,
      contact: request.contact,
      roomNumber: request.roomNumber,
      preferredDate: request.preferredDate,
      status: request.status
    });
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/request/${id}`);
      await fetchRequests();
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      requestTitle: 'repair',
      property: 'lalaine',
      priority: 'medium',
      description: '',
      tenantName: '',
      contact: '',
      roomNumber: '',
      preferredDate: '',
      status: 'pending'
    });
    setIsEditMode(false);
    setSelectedRequest(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4">Error: {error}</div>;

  return (
    <Box sx={{ width: "100%" }} className="mb:px-4 tb:px-6">
      <div className="pt-20 pl-20 mb:pl-4 tb:pl-8 bg-gradient-to-r from-gray-50 to-gray-200">
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
            setIsEditMode(false);
            setSelectedRequest(null);
          }}
          className="font-quicksand mt-2 flex items-center gap-2 px-4 py-2 bg-slate-200 text-black tracking-widest rounded-md hover:bg-slate-400 transition-colors font-semibold border border-slate-950"
        > 
          <CalendarTodayIcon className="h-4 w-4" />
          Create Maintenance Request
        </button>
      </div>

      {/* Main Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-2xl mb:max-w-full tb:max-w-[90%] bg-white rounded-lg shadow-lg">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <CalendarTodayIcon className="h-6 w-6 text-blue-600" />
                    <h2 className="text-4xl font-black text-gray-900 font-quicksand">
                      {isEditMode ? 'Edit Maintenance Request' : 'New Maintenance Request'}
                    </h2>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <CloseIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="p-6 font-quicksand tracking-wider">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-blue-950 mb-1">
                        Request Title
                      </label>
                      <select
                        name="requestTitle"
                        value={formData.requestTitle}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-quicksand"
                      >
                        <option value="Repair Request">Repair Request</option>
                        <option value="Routine Checkup">Routine Checkup</option>
                        <option value="Damage Report">Damage Report</option>
                        <option value="Replacement Needed">Replacement Needed</option>
                        <option value="Other">Other</option>
                      </select>

                      <label className="block text-sm font-black text-blue-950 mb-1 mt-4">
                        Property Building
                      </label>
                      <select
                        name="property"
                        value={formData.property}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="lalaine">Lalaine</option>
                        <option value="jade">Jade</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-blue-950 mb-1">
                        Priority Level
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-blue-950 mb-1">
                        Description of Issue
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-blue-950 mb-1">
                          Requestor Name
                        </label>
                        <input
                          type="text"
                          name="tenantName"
                          value={formData.tenantName}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-black text-blue-950 mb-1">
                          Room Number
                        </label>
                        <select
                          name="roomNumber"
                          value={formData.roomNumber}
                          onChange={handleChange}
                          required
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select a room number</option>
                          {rooms
                            .filter(
                              (room) =>
                                room.property.toLowerCase() ===
                                formData.property.toLowerCase()
                            )
                            .map((room) => (
                              <option key={room.roomNumber} value={room.roomNumber}>
                                {room.roomNumber}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-blue-950 mb-1">
                        Preferred Service Date
                      </label>
                      <input
                        type="date"
                        name="preferredDate"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                      
                    {/* Dialog Footer */}
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Submit Request
                      </button>
                    </div>

                    {user?.role === 'admin' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    )}

                    {user?.role === 'admin' && (
                      <div className="flex justify-end space-x-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setIsOpen(false)}
                          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          {isEditMode ? 'Update Request' : 'Submit Request'}
                        </button>
                      </div>
                    )}

                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsDeleteDialogOpen(false)} />
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-lg p-6 max-w-sm w-full mb:max-w-full tb:max-w-[90%]">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Maintenance Request</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Are you sure you want to delete this maintenance request? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(selectedRequest._id)}
                    className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-200 min-h-screen">
        <h2 className="text-4xl font-bold mb-8 text-center font-quicksand text-blue-950 mb:text-3xl tb:text-4xl">
          <span className="text-7xl font-playfair tracking-widest mb:text-5xl tb:text-6xl">Maintenance</span> Requests
        </h2>
        {requests.length > 0 ? (
          <ul className="grid grid-cols-1 mb:grid-cols-1 tb:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request) => (
              <li
                key={request._id}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-1000 ease-in-out transform hover:scale-105 relative mb:p-4 tb:p-5"
              >
                {user?.role === 'admin' && (
                  <div className="absolute top-4 right-4 flex gap-3">
                    <button
                      onClick={() => handleEdit(request)}
                      className="p-2 bg-blue-50 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <EditIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="p-2 bg-red-50 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <DeleteIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}

                <h3 className="text-2xl font-semibold text-blue-950 mb-6 mr-4 font-playfair tracking-widest mb:text-xl tb:text-2xl">
                  {request.requestTitle}
                </h3>
                <div className="space-y-3 text-gray-600 mb:space-y-2 tb:space-y-3">
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Status:</span>{" "}
                    <span
                      className={`
                        ${request.status === "completed" ? "text-green-950 bg-green-300 py-1 px-2 rounded-xl font-black" :
                          request.status === "in-progress" ? "text-blue-950 bg-blue-300 py-1 px-2 rounded-xl font-black" :
                          "text-yellow-950 bg-yellow-300 py-1 px-2 rounded-xl font-black"}
                        font-playfair uppercase
                      `}
                    >
                      {request.status}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold uppercase font-quicksand text-blue-950">Priority: </span>{" "}
                    <span
                      className={`
                        ${request.priority === "urgent" ? "bg-red-400 text-red-950 py-1 px-2 rounded-xl uppercase font-playfair font-black" :
                          request.priority === "high" ? "text-orange-950 bg-orange-400 py-1 px-2 rounded-xl uppercase font-playfair font-black" :
                          request.priority === "medium" ? "text-yellow-950 bg-yellow-400 py-1 px-2 rounded-xl uppercase font-playfair font-black" :
                          "text-green-950 bg-green-400 py-1 px-2 rounded-xl uppercase font-playfair font-black"}
                      `}
                    >
                      {request.priority}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Description: </span> 
                    <span className="bg-green-100">{request.description}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Property: </span> 
                    <span className="tracking-widest uppercase text-gray-700 bg-green-100 font-semibold">{property}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Room Number: </span> 
                    <span className="font-black bg-green-100">{roomNumber}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Requested By: </span> 
                    <span className="font-bold tracking-widest bg-green-100">{request.tenantName}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Preferred Service Date: </span> 
                    <span className="font-bold tracking-widest bg-green-100">
                      {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Created On: </span> 
                    <span className="font-bold tracking-widest bg-green-100">
                      {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 mt-20 text-lg font-light">
            No maintenance requests found.
          </div>
        )}
      </div>
    </Box>
  );
};

export default MaintenanceRequestDialog;
