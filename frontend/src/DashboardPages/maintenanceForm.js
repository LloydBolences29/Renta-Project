import React, { useState, useEffect } from 'react';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box } from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '../Hook/useAuthHook';
import { ToastContainer, toast } from 'react-toastify';
import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_e99wa6g';
const TEMPLATE_ID = 'template_5zd0ds4';
const TEMPLATE_ID2 = 'template_0flk8ok'
const PUBLIC_KEY = '0fWtIeW7Pi_ZP4CPt';


const MaintenanceRequestDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

  const [buildingName, setBuildingName] = useState('')
  const [roomNumber, setRoomNumber]   = useState('')

  useEffect(() => {
    if (!user?.email) return;
  
    axios.get(`/api/tenants/email/${encodeURIComponent(user.email)}`)
      .then(res => {
        const { property, roomNumber } = res.data;
        // set them in both local state and formData
        setBuildingName(property);
        setRoomNumber(roomNumber);
        setFormData(fd => ({ ...fd, property, roomNumber }));
      })
      .catch(console.error);
  }, [user?.email]);


  // For demo purposes - in production, this should come from auth context
 // const [isAdmin] = useState(true);
  
  const [formData, setFormData] = useState({
    requestTitle: '',
    priority: 'medium',
    property: '',       // ← add these
    roomNumber: '',
    description: '',
    tenantName: user?.email || '', 
    contact: '',
    preferredDate: '',
    status: 'pending'
  });

  // State for dynamic room choices
  const [roomChoices, setRoomChoices] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  // Generate room numbers based on selected property/building
  useEffect(() => {
    let totalRooms;
    const building = formData.property;

    if (building === 'lalaine') {
      totalRooms = 28;
    } else if (building === 'jade') {
      totalRooms = 30;
    } else {
      totalRooms = 0;
    }

    const generatedRooms = Array.from({ length: totalRooms }, (_, i) => {
      const floorNumber = Math.floor(i / 10) + 1;
      const roomPosition = (i % 10) + 1;
      const roomNumber = `${floorNumber}${String(roomPosition).padStart(2, '0')}`;
      console.log(`Generated Room Number: ${roomNumber}`);
      return roomNumber;
    });

    console.log('Building selected:', building, 'Total Rooms:', totalRooms);
    setRoomChoices(generatedRooms);

    // Optionally reset the roomNumber if it's not in the new list.
    setFormData((prev) => ({
      ...prev,
      roomNumber: generatedRooms.includes(prev.roomNumber) ? prev.roomNumber : ''
    }));
  }, [formData.property]);

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
    setIsSubmitting(true);
  
    // 🛠️ Build a “payload” that merges in those two bits from state:
    const payload = {
      ...formData,
      property:  buildingName,
      roomNumber: roomNumber,
    };
  
    try {
      if (isEditMode) {
        // 1) update on your backend (now sending payload)
        await axios.put(
          `http://localhost:4000/api/request/${selectedRequest._id}`,
          payload
        );
  
        // 2) then send an “updated” email
        const updateParams = {
          user_name:    payload.tenantName,
          request_title: payload.requestTitle,
          property:     payload.property,      // ← you can include these in the email if you want
          room_number:  payload.roomNumber,
          priority:     payload.priority,
          service:      payload.preferredDate,
          status:       payload.status,
          message:      payload.description,
          to_email:     payload.tenantName 
        };
  
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID2,
          updateParams,
          PUBLIC_KEY
        );
        toast.success(`Update email sent to ${payload.tenantName}`);
  
      } else {
        // create: send payload instead of bare formData
        const response = await axios.post(
          'http://localhost:4000/api/request',
          payload
        );
  
        const createParams = {
          user_name:    payload.tenantName,
          request_title: payload.requestTitle,
          property:     payload.property,
          room_number:  payload.roomNumber,
          priority:     payload.priority,
          service:      payload.preferredDate,
          status:       payload.status,
          message:      payload.description,
          to_email:     payload.tenantName 
        };
  
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          createParams,
          PUBLIC_KEY
        );
        toast.success(`Confirmation email sent to ${payload.tenantName}`);
      }
  
      await fetchRequests();
      resetForm();
      setIsOpen(false);
  
    } catch (err) {
      console.error('Error submitting the form:', err.response?.data || err.message);
      toast.error('Failed to submit request or send email.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
// whenever the dialog opens or user changes, re-sync:
useEffect(() => {
  setFormData(f => ({ ...f, tenantName: user?.email || '' }));
}, [user?.email]);

  

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


  // const handleEdit = async () => {
  //   try {
  //     const response = await fetch(`/api/maintenance/${selectedRequest._id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(formData),
  //     });
  
  //     if (!response.ok) {
  //       throw new Error('Failed to update request');
  //     }
  
  //     const data = await response.json();
  
  //     // Prepare email notification
  //     const message = `
  //       Your maintenance request "${data.request.requestTitle}" has been updated.
        
  //       Status: ${data.request.status}
  //       Priority: ${data.request.priority}
  //       Property: ${data.request.property}
  //       Room Number: ${data.request.roomNumber}
  //     `;
  
  //     const templateParams = {
  //       user_name: data.request.tenantName,
  //       to_email: data.request.email,
  //       request_title: data.request.requestTitle,
  //       message,
  //     };
  
  //     await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
  //     toast.success(`Email sent to ${data.request.email}`);
  
  //     toast.success('Request updated');
  //     setIsOpen(false);
  //     fetchRequests(); // reload updated requests
  //   } catch (error) {
  //     console.error(error);
  //     toast.error(error.message);
  //   }
  // };
  

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
      requestTitle: 'Repair Request', 
      priority: 'medium',
      description: '',
      tenantName: user?.email || '', 
      contact: '',
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
      <div className=" bg-blue-100 pt-20 pl-20 mb:pl-4 tb:pl-8 ">
        <button
          onClick={() => {
            resetForm();
            setIsOpen(true);
            setIsEditMode(false); // ensure it's in create mode
            setSelectedRequest(null);
          }}
          className="font-quicksand mt-2 flex items-center gap-2 px-4 py-2 bg-blue-200 text-black tracking-widest rounded-md hover:bg-slate-400 transition-colors font-semibold border border-slate-950"
        > 
          <CalendarTodayIcon className="h-4 w-4" />
          Request Maintenance
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
                    <h2 className="text-4xl mb:text-2xl font-black text-gray-900 font-quicksand">
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
                    </div>

                    {user?.role === 'admin' && (
                      <div>
                        {/* Priority Level - admin only */}
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

                      </div>
                    )}

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
                          Requestor Email
                        </label>
                        <input
                          type="text"
                          name="tenantName"
                          value={formData.tenantName}
                          onChange={handleChange}
                          readOnly
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                     
                    </div>

                  {/* Service Date - only visible for admin users */}
                  {user?.role === 'admin' && (
                      <div>
                        <label className="block text-sm font-black text-blue-950 mb-1">
                          Service Date
                        </label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleChange}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}
                  
                      
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
                      disabled={isSubmitting}
                      className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${isSubmitting
                          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      {isSubmitting
                        ? isEditMode
                          ? 'Updating…'
                          : 'Submitting…'
                        : isEditMode
                        ? 'Update Request'
                        : 'Submit Request'}
                    </button>
                    </div>

                    {/* Add Status field for admin */}
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

                    {/* Submit and Cancel buttons for admin only */}
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
      <div className="p-8 bg-blue-100 min-h-screen">
        <h2 className="text-4xl font-bold mb-8 text-center font-quicksand text-blue-950 mb:text-3xl tb:text-4xl">
          <span className="text-7xl font-playfair tracking-widest mb:text-5xl tb:text-6xl">Maintenance</span> Requests
        </h2>
        {requests.length > 0 ? (
          <ul className="grid mb:grid-cols-1 tb:grid-cols-2 lg:grid-cols-3 gap-8">
            {requests.map((request) => (
              <li
                key={request._id}
                className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-1000 ease-in-out transform hover:scale-105 relative mb:p-4 tb:p-5"
              >
                {/* Admin Actions */}
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
                    <span className="tracking-widest uppercase text-gray-700 bg-green-100 font-semibold">{request.property}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Room Number: </span> 
                    <span className="font-black bg-green-100">{request.roomNumber}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Requestor Email: </span> 
                    <span className="font-bold tracking-widest bg-green-100">{request.tenantName}</span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Service Date: </span> 
                    <span className="font-bold tracking-widest bg-green-100">
                      {request.preferredDate ? new Date(request.preferredDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-blue-950 uppercase font-quicksand">Requested On: </span> 
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


// ito yung display card