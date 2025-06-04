import React, { useEffect,useRef, useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import PaymentIcon from '@mui/icons-material/Payment';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CreateTenantForm from './addTenant';
import { useAuthContext } from '../Hook/useAuthHook';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';
import CommentIcon from '@mui/icons-material/Comment';



export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [editingTenantId, setEditingTenantId] = useState(null);
  const [editedTenantData, setEditedTenantData] = useState({});
  const [building, setBuilding] = useState('');
  const [roomChoices, setRoomChoices] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [openCurrentStatementDialog, setOpenCurrentStatementDialog] = useState(false);
  const [openAllStatementsDialog, setOpenAllStatementsDialog] = useState(false);
  const [transactions, setTransactions] = useState([]); // New state for transactions
  const [openPayDialog, setOpenPayDialog] = useState(false);
  const [viewProof, setViewProof] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuthContext();


const [openRemarkDialog, setOpenRemarkDialog] = useState(false);
const [remarkTenant,    setRemarkTenant]    = useState(null);
const [remarkText,      setRemarkText]      = useState('');
const [isEditingRemark, setIsEditingRemark] = useState(false);

const handleOpenRemarkDialog = (tenant) => {
  setRemarkTenant(tenant);
  setRemarkText(tenant.remark || '');
  setOpenRemarkDialog(true);
};
const handleCloseRemarkDialog = () => {
  setOpenRemarkDialog(false);
  setRemarkTenant(null);
  setRemarkText('');
};
const handleSaveRemark = async () => {
  try {
    const res = await axios.put(`/api/tenants/${remarkTenant._id}`, {
      ...remarkTenant,
      remark: remarkText
    });
    // update local state
    setTenants(t =>
      t.map(x => x._id === remarkTenant._id ? res.data : x)
    );
    toast.success('Remark saved!');
  } catch (err) {
    console.error(err);
    toast.error('Could not save remark');
  } finally {
    handleCloseRemarkDialog();
  }
};



  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 10;

  // Initialize EmailJS 
emailjs.init("DP2pHl_AB-rj4JjWj");



  // Function to fetch tenants data (used on mount and for refetching)
  const fetchTenants = async () => {
    try {
      const response = await fetch('/api/tenants');
      const data = await response.json();
      setTenants(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching tenants:', error);
    }
  };

  // Fetch tenants data on component mount
  useEffect(() => {
    fetchTenants();
  }, []);

  // Filter tenants based on search input
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.property?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination values
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = filteredTenants.slice(indexOfFirstTenant, indexOfLastTenant);
  const totalPages = Math.ceil(filteredTenants.length / tenantsPerPage);

  // Navigation handlers
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Room choice logic
  useEffect(() => {
    let totalRooms;
    if (building === 'lalaine') {
      totalRooms = 28;
    } else if (building === 'jade') {
      totalRooms = 30;
    } else {
      totalRooms = 0;
    }
    const roomChoices = Array.from({ length: totalRooms }, (_, i) => {
      const floorNumber = Math.floor(i / 10) + 1;
      const roomPosition = (i % 10) + 1;
      const roomNumber = `${floorNumber}${String(roomPosition).padStart(2, '0')}`;
      console.log(`Generated Room Number: ${roomNumber}`);
      return roomNumber;
    });
    console.log('Building selected:', building, 'Total Rooms:', totalRooms);
    setRoomChoices(roomChoices);
  }, [building]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    setOpenDeleteDialog(false);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleOpenDeleteDialog = (tenantId) => {
    setSelectedTenantId(tenantId);
    setOpenDeleteDialog(true);
    setOpenAddDialog(false);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedTenantId(null);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/tenants/${selectedTenantId}`);
      setTenants((prevTenants) =>
        prevTenants.filter((tenant) => tenant._id !== selectedTenantId)
      );
      setDeleteSuccess(true);
      toast.success('Tenant deleted successfully!');
    } catch (error) {
      console.error('Error deleting tenant:', error);
      toast.error('Error deleting tenant. Please try again.');
    }
    handleCloseDeleteDialog();
  };

  const handleEditClick = (tenant) => {
    setEditingTenantId(tenant._id);
    setEditedTenantData(tenant);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`/api/tenants/${editingTenantId}`, editedTenantData);
      if (response.status === 200) {
        setTenants((prevTenants) =>
          prevTenants.map((tenant) =>
            tenant._id === editingTenantId ? response.data : tenant
          )
        );
        setEditingTenantId(null);
        setEditedTenantData({});
        toast.success('Tenant updated successfully!');
      } else {
        toast.error('Failed to update tenant. Please try again.');
      }
    } catch (error) {
      console.error('Error updating tenant:', error);
      toast.error('An error occurred while updating the tenant.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTenantData((prevData) => ({ ...prevData, [name]: value }));
    if (name === 'property') {
      setBuilding(value);
    }
  };

  // Functions for handling the "This Month's Statement" dialog
  const handleCloseCurrentStatementDialog = () => {
    setOpenCurrentStatementDialog(false);
  };

  const handleOpenCurrentStatementDialog = (tenant) => {
    setSelectedTenant(tenant);
    setOpenCurrentStatementDialog(true);
  };

  // Functions for handling the "All Statements" dialog
  const handleOpenAllStatementsDialog = async (tenant) => {
    setSelectedTenant(tenant);
    try {
      const res = await axios.get(`/api/transactions?tenantId=${tenant._id}`);
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Error fetching transactions');
    }
    setOpenAllStatementsDialog(true);
  };

  const handleCloseAllStatementsDialog = () => {
    setOpenAllStatementsDialog(false);
  };

  // Calculate due rent based on tenant info
  const calculateDueRent = (tenant) => {
    const today = new Date();
    const dueDate = new Date(tenant.leaseEndDate);
    if (today > dueDate && tenant.paymentStatus === "Pending") {
      return tenant.rentAmount * 2;
    }
    return tenant.rentAmount;
  };

// Helper function to send the pending payment email.
const sendPendingPaymentEmail = (tenant) => {
  if (tenant.paymentStatus === "Pending") {
    // Use tenant.leaseEndDate as the due date.
    const dueDate = new Date(tenant.leaseEndDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDueDate = dueDate.toLocaleDateString('en-US', options);

    const templateParams = {
      tenant_name: tenant.name,
      tenant_email: tenant.email, 
      message: `
Dear ${tenant.name},

This is a friendly reminder that your payment is currently pending.

Please complete your payment by ${formattedDueDate} to avoid any potential late fees or service disruptions.

Thank you for your prompt attention.

Best regards,
Vergara's Apartment Complex
      `,
    };

    // Show a toast notification indicating the email is being sent.
    toast.info("Sending pending payment email...");

    emailjs.send("service_cz6b2f3", "template_cscea4e", templateParams)
      .then((response) => {
        console.log("Email sent successfully:", response.status, response.text);
        toast.success("Pending payment email sent successfully!");
      })
      .catch((error) => {
        console.error("Failed to send pending payment email:", error);
        toast.error("Failed to send email. Please try again.");
      });
  } else {
    toast.warning("You can only send email notification to tenants that have a status of Pending.");
  }
};

// This component renders the SendIcon button that sends the pending payment email.
// const PaymentEmailButton = ({ tenant }) => {
//   const handleEmailNotifClick = () => {
//     if (tenant) {
//       sendPendingPaymentEmail(tenant);
//     } else {
//       toast.error("No tenant selected.");
//     }
//   };

//   return (
//     <SendIcon
//       className="text-blue-500 hover:text-blue-700 cursor-pointer bg-blue-100 text-3xl rounded-xl mr-4"
//       onClick={handleEmailNotifClick}
//     />
//   );
// };


  
  

// Helper function to send the payment confirmation email
const sendPaymentConfirmationEmail = (tenant) => {
  if (tenant.paymentStatus === "Paid") {
    // Use the leaseEndDate from the tenant as the next due date.
    const dueDate = new Date(tenant.leaseEndDate);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDueDate = dueDate.toLocaleDateString('en-US', options);

    const templateParams = {
      tenant_name: tenant.name,
      tenant_email: tenant.email, // Make sure your EmailJS template uses this appropriately
      message: `
Dear ${tenant.name},

We are pleased to confirm that your recent payment has been processed successfully.

Please note that your next payment will be due on ${formattedDueDate}. We appreciate your prompt payment and look forward to serving you in the upcoming lease period.

Thank you and best regards,
Vergara's Apartment Complex
      `,
    };

    emailjs.send("service_cz6b2f3", "template_cscea4e", templateParams)
      .then((response) => {
        console.log("Email sent successfully:", response.status, response.text);
      })
      .catch((error) => {
        console.error("Failed to send email:", error);
      });
  }
};

// Function to handle marking a tenant as paid
const handleMarkAsPaid = async () => {
  if (!selectedTenant) return;
  
  // Avoid processing if the status is not "Pending"
  if (selectedTenant.paymentStatus !== "Pending") {
    toast.warning("Payment has already been processed for this month's due. Please use advanced payment if necessary.");
    return;
  }
  
  try {
    const response = await axios.post(`/api/tenants/${selectedTenant._id}/mark-as-paid`);
    console.log('Tenant marked as paid:', response.data);
    
    // Assuming the API returns an updated tenant object.
    const updatedTenant = response.data.tenant;
    setSelectedTenant(updatedTenant);
    
    // Refetch tenants data to update your list.
    fetchTenants();
    
    toast.success("Payment processed successfully!");
    
    // If the payment status is now "Paid", trigger the email notification.
    if (updatedTenant.paymentStatus === "Paid") {
      sendPaymentConfirmationEmail(updatedTenant);
    }
  } catch (error) {
    console.error('Error marking tenant as paid:', error);
    if (error.response && error.response.data && error.response.data.error) {
      toast.error(error.response.data.error);
    } else {
      toast.error("Error processing payment. Please try again.");
    }
  }
};

  

  // const handleMarkAsPaid = async () => {
  //   if (!selectedTenant) return;
    
  //   // If the tenant has already paid, don't proceed with the normal payment flow.
  //   if (selectedTenant.paymentStatus !== "Pending") {
  //     toast.warning("Payment has already been processed for this Months due. Please use advanced payment :)");
  //     return;
  //   }
    
  //   try {
  //     const response = await axios.post(`/api/tenants/${selectedTenant._id}/mark-as-paid`);
  //     console.log('Tenant marked as paid:', response.data);
  //     setSelectedTenant(response.data.tenant);
  //     // Refetch tenants data to update the list
  //     fetchTenants();
  //     toast.success("Payment processed successfully!");
  //   } catch (error) {
  //     console.error('Error marking tenant as paid:', error);
  //     // If the error response contains a message, show it.
  //     if (error.response && error.response.data && error.response.data.error) {
  //       toast.error(error.response.data.error);
  //     } else {
  //       toast.error("Error processing payment. Please try again.");
  //     }
  //   }
  // };

  const handleMarkAsAdvanced = async () => {
    if (!selectedTenant) return;
    try {
      const response = await axios.post(`/api/tenants/${selectedTenant._id}/mark-as-advanced`);
      console.log('Tenant marked as advanced:', response.data);
      setSelectedTenant(response.data.tenant);
      // Refetch tenants data to update the list
      fetchTenants();
      toast.success("Advanced payment processed successfully!");
    } catch (error) {
      console.error('Error marking tenant as advanced:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error processing advanced payment. Please try again.");
      }
    }
  };


  // Fetch transactions for the specific tenant by email paydb.
  const OpenPayDialog = async (tenant) => {
    // Store the selected tenant for later use
    setSelectedTenant(tenant);
    try {
      // Using the params object builds the URL as: /api/pay?email=tenant.email
      const res = await axios.get('/api/pay', { params: { email: tenant.email } });
      setTransactions(res.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Error fetching payments');
    }
    setOpenPayDialog(true);
  };
  
  
  

  // Helper to format the payment date.
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };



  
  
  

  return (
    <Box sx={{ px: 2, py: 4, m: 2 }} className="bg-slate-50 w-full h-full rounded-xl mb:px-4 tb:px-6 lg:px-8">
      {user ? (
        user.role === 'admin' ? (
          <div className="p-4 mb:p-2 tb:p-3 font-quicksand ">
            <h2 className="text-5xl mb:text-3xl tb:text-4xl font-bold mb-4 font-playfair text-blue-800">
              <span className="text-7xl mb:text-5xl tb:text-6xl">Tenant</span> List
            </h2>

            <div className="mt-10 mb:mt-4 tb:mt-6 flex justify-between mb:mb-4 tb:mb-6">
              <Button
                onClick={handleOpenAddDialog}
                variant="outlined"
                color="black"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#4CC9FE',
                  '&:hover': {
                    backgroundColor: '#7AB2D3',
                  },
                  padding: '10px 20px',
                  fontSize: '12px',
                  marginTop: '20px',
                  marginLeft: '30px',
                  marginBottom: '0px',
                  borderRadius: '15px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  fontFamily: 'quickplay',
                  color: 'black',
                  textTransform: 'none',
                }}
              >
                Add Tenant
              </Button>

              <TextField
                type="search"
                label="Search"
                variant="outlined"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 mb:w-full max-w-md text-black font-quicksand"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon className="bg-slate-100 p-0 rounded-sm" style={{ color: 'black' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            <div className="flex flex-col mt-10">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-200 text-blue-800">
                      {[
                        'Name',
                        'Email',
                        'Phone',
                        'Building Name',
                        'Room Number',
                        'Lease Start',
                        'Lease End',
                        'Rent Amount',
                        'Payment Status',
                        'Remarks',
                        'Statement',
                        'Action',
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 mb:px-3 mb:py-2 tb:px-4 tb:py-3 text-left font-extrabold tracking-widest border border-blue-900"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTenants.length > 0 ? (
                      currentTenants.map((tenant) => (
                        <tr key={tenant._id} className="border-t">
                          <td className="px-4 py-6 mb:px-2 mb:py-3 tb:px-3 tb:py-4 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="name"
                                value={editedTenantData.name || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              tenant.name
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="email"
                                value={editedTenantData.email || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              tenant.email
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="phone"
                                value={editedTenantData.phone || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              tenant.phone
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <select
                                name="property"
                                value={editedTenantData.property || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                              >
                                <option value="">Select Building</option>
                                <option value="lalaine">Lalaine</option>
                                <option value="jade">Jade</option>
                              </select>
                            ) : (
                              tenant.property
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <select
                                name="roomNumber"
                                value={editedTenantData.roomNumber || ''}
                                onChange={handleChange}
                                className="w-full p-2 border rounded"
                              >
                                <option value="">Select Room</option>
                                {roomChoices.map((room) => (
                                  <option key={room} value={room}>
                                    {room}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              tenant.roomNumber
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="leaseStartDate"
                                type="date"
                                value={editedTenantData.leaseStartDate?.substring(0, 10) || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              new Date(tenant.leaseStartDate)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                .replace(',', '')
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="leaseEndDate"
                                type="date"
                                value={editedTenantData.leaseEndDate?.substring(0, 10) || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              new Date(tenant.leaseEndDate)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                .replace(',', '')
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                          
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="rentAmount"
                                value={editedTenantData.rentAmount ?? ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : tenant.rentAmount != null ? (
                              `₱${Number(tenant.rentAmount).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}`
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-bold text-sm tracking-wide border border-blue-900">
                            <span
                              className={`
                                ${tenant.paymentStatus === "Pending" ? "bg-orange-400 text-red-950 py-1 px-2 rounded-xl uppercase font-playfair font-black" : 
                                  tenant.paymentStatus === "Paid" ? "bg-blue-400 text-green-950 py-1 px-2 rounded-xl uppercase font-playfair font-black" : 
                                  tenant.paymentStatus === "Advanced" ? "bg-green-400 text-green-950 py-1 px-2 rounded-xl uppercase font-playfair font-black" : 
                                  ""}
                                py-1 px-2 rounded-md uppercase font-semibold inline-block
                              `}
                            >
                              {tenant.paymentStatus}
                            </span>
                          </td>
                          <td className="px-12 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-xl text-sm tracking-wide border border-blue-900">
                            <CommentIcon
                              onClick={() => {
                                setRemarkTenant(tenant);
                                setRemarkText(tenant.remark || '');
                                setIsEditingRemark(!tenant.remark);
                                setOpenRemarkDialog(true);
                              }}
                              titleAccess={tenant.remark ? 'View remark' : 'Add remark'}
                              className={`cursor-pointer text-xl ${
                                tenant.remark
                                  ? 'text-green-600 hover:text-green-800'   // color when there _is_ a remark
                                  : 'text-blue-600 hover:text-gray-800'      // color when there _isn’t_
                              }`}
                            />
                          </td>


                          <td className="px-0 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-xl text-sm tracking-wide border border-blue-900">
                            <EventNoteIcon
                              className="text-blue-500 cursor-pointer text-2xl mx-3 hover:text-blue-700 transition"
                              onClick={() => handleOpenCurrentStatementDialog(tenant)}
                              titleAccess="This Month's Statement"
                            />
                            <DescriptionIcon
                              className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                              onClick={() => handleOpenAllStatementsDialog(tenant)}
                              titleAccess="All Statements"
                            />
                            <PaymentIcon
                              className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                              onClick={() => OpenPayDialog(tenant)}
                              titleAccess="View Tenant Payments"
                            />
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-xl text-sm tracking-wide border border-blue-900">
                            <div className="flex">
                              {editingTenantId === tenant._id ? (
                                <>
                                  <Button onClick={handleSave} color="primary" variant="outlined" size="small" className="mr-0">
                                    Save
                                  </Button>
                                  <Button onClick={() => setEditingTenantId(null)} color="secondary" variant="outlined" size="small">
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  {/* <PaymentEmailButton tenant={tenant} /> */}
                                  <EditIcon
                                    className="text-blue-500 hover:text-blue-700 cursor-pointer bg-blue-100 text-3xl rounded-xl"
                                    onClick={() => handleEditClick(tenant)}
                                  />
                                  <DeleteIcon
                                    className="text-red-500 hover:text-red-700 cursor-pointer ml-4 bg-red-200 rounded-xl"
                                    onClick={() => handleOpenDeleteDialog(tenant._id)}
                                  />
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="text-center py-4">No tenants found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 mb:px-2 tb:px-3">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing {filteredTenants.length > 0 ? indexOfFirstTenant + 1 : 0} to {Math.min(indexOfLastTenant, filteredTenants.length)} of {filteredTenants.length} tenants
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    variant="outlined"
                    size="small"
                    startIcon={<ChevronLeftIcon />}
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    variant="outlined"
                    size="small"
                    endIcon={<ChevronRightIcon />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
            <Dialog
              open={openDeleteDialog}
              onClose={handleCloseDeleteDialog}
              maxWidth="xs"
              fullWidth
              sx={{
                '& .MuiDialog-paper': {
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                },
                '& .MuiDialogTitle-root': {
                  backgroundColor: '',
                  color: '#55555',
                  fontFamily: 'quickplay',
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '2rem',
                  padding: '12px 16px',
                  letterSpacing: '2px',
                },
                '& .MuiDialogContent-root': {
                  padding: '20px 24px',
                  textAlign: 'center',
                },
                '& .MuiDialogActions-root': {
                  padding: '16px 24px',
                  backgroundColor: '#F9FAFB',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                },
                '& .MuiButton-root': {
                  fontWeight: 500,
                  padding: '8px 16px',
                  borderRadius: '8px',
                  transition: 'background-color 0.3s ease',
                },
                '& .MuiButton-outlined': {
                  color: '#333',
                  borderColor: '#B0BEC5',
                  '&:hover': {
                    borderColor: '#90A4AE',
                  },
                },
                '& .MuiButton-containedError': {
                  backgroundColor: '#FF6B6B',
                  '&:hover': {
                    backgroundColor: '#E55959',
                  },
                },
              }}
            >
              <DialogTitle>Delete Tenant</DialogTitle>
              <DialogContent>
                <DialogContentText sx={{ color: '#333', fontSize: '1rem' }}>
                  Are you sure you want to delete this tenant? This action cannot be undone.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDeleteDialog} variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleDelete} variant="contained" color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>


            {/* THIS IS FOR ALL THE HISTORY */}
              <Dialog
              open={openAllStatementsDialog}
              onClose={handleCloseAllStatementsDialog}
              maxWidth="sm"
              fullWidth
            >
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg">
                <DialogTitle className="text-white text-center text-2xl font-bolder font-quicksand">
                  <span className='font-quicksand text-2xl font-extrabold'>Transactions History </span>
                  
                </DialogTitle>
              </div>
              {/* Content */}
              <DialogContent className="bg-white ">
              <span className='font-quicksand text-center pb-2 block font-bold'>{selectedTenant ? selectedTenant.name : ''}</span>

            {selectedTenant ? (
              transactions.length > 0 ? (
                <div className="">
                  {/* Alternatively, you can sort once and store it in a variable */}
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-4 py-2 text-blue-900">Transaction Date</th>
                        <th className="px-4 py-2 text-blue-900">Rent Amount</th>
                        <th className="px-4 py-2 text-blue-900">Status</th>
                        <th className="px-4 py-2 text-blue-900">New Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .slice()
                        .sort((a, b) => new Date(a.newLeaseEndDate) - new Date(b.newLeaseEndDate))
                        .map((transaction) => (
                          <tr key={transaction._id} className="border-t bg-blue-50 text-center ">
                            <td className="px-4 py-2 font-bold tracking-widest text-xs">
                              {new Date(transaction.transactionDate)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                .replace(',', '')}
                            </td>
                            <td className="px-4 py-2 font-bold tracking-widest text-xs">₱{transaction.amount !== undefined 
                                  ? `₱${transaction.amount.toFixed(2)}` 
                                  : 'N/A'}
                                </td>
                            <td className="px-4 py-2 font-bold tracking-widest text-xs">{transaction.paymentStatus}</td>
                            <td className="px-4 py-2 font-bold tracking-widest text-xs ">
                              {new Date(transaction.newLeaseEndDate)
                                .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                .replace(',', '')}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No transactions found.</p>
              )
            ) : (
              <p className="text-center text-gray-500 py-6">No tenant selected.</p>
            )}

              </DialogContent>
              {/* Actions */}
              <DialogActions sx={{ p: 2, backgroundColor: 'white', justifyContent: 'center', display: 'flex' }}>
            <Button
              onClick={handleCloseAllStatementsDialog}
              variant="contained"
              color="primary"
              className='font-quicksand'
              sx={{ borderRadius: '9999px', px: 4, py: 1 }}
            >
              Close
            </Button>
          </DialogActions>

            </Dialog>

            {/* THIS IS FOR THE MONTHLY PAY */}
            <Dialog
              open={openCurrentStatementDialog}
              onClose={handleCloseCurrentStatementDialog}
              maxWidth="sm"
              fullWidth
            >
              {/* Gradient header */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg">
                <DialogTitle className="text-white text-center text-2xl font-bolder font-quicksand">
                  <span className="font-quicksand text-2xl font-extrabold">
                    This Month's Statement
                  </span>
                </DialogTitle>
              </div>
              {/* Content */}
              <DialogContent className="bg-white">
              <span className="font-quicksand text-center pb-2 block font-bold">
                {selectedTenant ? selectedTenant.name : ''}
              </span>
              {selectedTenant ? (
                <div className="py-4">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-blue-100 text-center">
                        <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">
                          Due Date
                        </th>
                        <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">
                          Rent Amount
                        </th>
                        <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">
                          Payment Status
                        </th>
                        <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">
                          Notice
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t bg-blue-50 text-center">
                        <td className="px-4 py-2 font-bold tracking-widest text-xs text-black">
                          {new Date(selectedTenant.leaseEndDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-4 py-2 font-bold tracking-widest text-xs text-black">
                          ₱{calculateDueRent(selectedTenant) !== undefined 
                          ? `₱${calculateDueRent(selectedTenant).toFixed(2)}` 
                          : 'N/A'}

                        </td>
                        <td className="px-4 py-2 font-bold tracking-widest text-xs ">
                          {selectedTenant.paymentStatus}
                        </td>
                        <td className="px-4 py-2 font-bold tracking-widest text-xs text-black">
                          {new Date(selectedTenant.leaseEndDate) < new Date() &&
                          selectedTenant.paymentStatus === "Pending"
                            ? "Your total rent includes last month's outstanding rent plus this month's rent."
                            : "-"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-6">No statement available.</p>
              )}
            </DialogContent>


              {/* Actions */}
              <DialogActions sx={{ p: 2, backgroundColor: 'white', justifyContent: 'center', display: 'flex' }}>
                <Button
                  onClick={handleMarkAsPaid}
                  variant="contained"
                  color="secondary"
                  className="rounded-full px-6 py-2"
                >
                  Mark as Paid
                </Button>
                <Button
                  onClick={handleMarkAsAdvanced}
                  variant="contained"
                  color="warning"
                  className="rounded-full px-6 py-2"
                >
                  Mark as Advanced
                </Button>
                <Button
                  onClick={handleCloseCurrentStatementDialog}
                  variant="contained"
                  color="primary"
                  className="rounded-full px-6 py-2"
                >
                  Close
                </Button>
              </DialogActions>
            </Dialog>

            {openPayDialog && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={() => setOpenPayDialog(false)}
    ></div>
    {/* Dialog Content */}
    <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-3xl w-full">
      <div className="flex justify-between items-center  text-center">
      <h2 className="text-2xl font-bold font-quicksand ">
            Payments Transactions
          </h2>


        <button
          onClick={() => setOpenPayDialog(false)}
          className="text-gray-600 hover:text-gray-950 text-5xl"
        >
          &times;
        </button>
      </div>
      <div>
        <h3 className='text-blue-900 text-sm font-bold tracking-widest font-quicksand text-center py-4'>
             
           {selectedTenant?.email}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-blue-100">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Transaction Type
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Payment Date
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Reference
              </th>
              <th className="px-4 py-2 text-left text-sm font-semibold">
                Proof
              </th>
            </tr>
          </thead>
          <tbody>
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{tx.transactionType}</td>
                  <td className="px-4 py-2 text-sm">{formatDateTime(tx.paymentDate)}</td>
                  <td className="px-4 py-2 text-sm">{tx.status}</td>
                  <td className="px-4 py-2 text-sm">{tx.transactionId || 'N/A'}</td>
                  <td className="px-4 py-2 text-sm">
                    {tx.fileName ? (
                      <button
                        onClick={() => setViewProof(tx.fileName)}
                        className="text-blue-500 underline"
                      >
                        View Proof
                      </button>
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-sm">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}

{viewProof && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    {/* Overlay */}
    <div
      className="absolute inset-0 bg-black opacity-50"
      onClick={() => setViewProof(null)}
    ></div>
    {/* Proof Modal Content */}
    <div className="bg-white rounded-lg shadow-lg z-50 p-4 max-w-3xl w-full relative">
      <button
        onClick={() => setViewProof(null)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
      >
        &times;
      </button>
      <img
        src={viewProof}
        alt="Payment Proof"
        className="max-w-full max-h-[80vh] object-contain mx-auto"
      />
    </div>
  </div>
)}
<Dialog
  open={openRemarkDialog}
  onClose={() => {
    setOpenRemarkDialog(false);
    setIsEditingRemark(false);
  }}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    {remarkTenant
      ? `${remarkTenant.remark ? 'Remark for' : 'Add remark for'} ${remarkTenant.name}`
      : 'Remark'}
  </DialogTitle>

  <DialogContent dividers>
    {remarkTenant && !isEditingRemark && remarkTenant.remark ? (
      // **VIEW MODE**: show saved text
      <DialogContentText style={{ whiteSpace: 'pre-wrap' }}>
        {remarkText}
      </DialogContentText>
    ) : (
      // **EDIT / CREATE MODE**: multiline text field
      <TextField
        autoFocus
        margin="dense"
        label="Remark"
        type="text"
        fullWidth
        multiline
        rows={4}
        value={remarkText}
        onChange={(e) => setRemarkText(e.target.value)}
      />
    )}
  </DialogContent>

  <DialogActions>
    {/* Always allow closing */}
    <Button
      onClick={() => {
        setOpenRemarkDialog(false);
        setIsEditingRemark(false);
      }}
    >
      {(!remarkTenant?.remark || isEditingRemark) ? 'Cancel' : 'Close'}
    </Button>

    {remarkTenant && remarkTenant.remark && !isEditingRemark && (
      <>
        {/* VIEW MODE: edit or delete */}
        <Button onClick={() => setIsEditingRemark(true)}>
          Edit
        </Button>
        <Button
          color="error"
          onClick={async () => {
            try {
              const res = await axios.put(
                `/api/tenants/${remarkTenant._id}`,
                { ...remarkTenant, remark: '' }
              );
              setTenants(ts =>
                ts.map(t =>
                  t._id === res.data._id ? res.data : t
                )
              );
              toast.success('Remark deleted');
            } catch {
              toast.error('Could not delete remark');
            } finally {
              setOpenRemarkDialog(false);
              setIsEditingRemark(false);
            }
          }}
        >
          Delete
        </Button>
      </>
    )}

    {( !remarkTenant?.remark || isEditingRemark ) && (
      // SAVE button in CREATE or EDIT mode
      <Button
        variant="contained"
        onClick={async () => {
          try {
            const res = await axios.put(
              `/api/tenants/${remarkTenant._id}`,
              { ...remarkTenant, remark: remarkText }
            );
            setTenants(ts =>
              ts.map(t =>
                t._id === res.data._id ? res.data : t
              )
            );
            toast.success('Remark saved');
          } catch {
            toast.error('Could not save remark');
          } finally {
            setOpenRemarkDialog(false);
            setIsEditingRemark(false);
          }
        }}
      >
        Save
      </Button>
    )}
  </DialogActions>
</Dialog>




            <Dialog
              open={openAddDialog}
              onClose={handleCloseAddDialog}
              maxWidth="sm"
              fullWidth
              sx={{
                '& .MuiDialogTitle-root': {
                  backgroundColor: '#4CC9FE',
                  color: '#FFFFFF',
                  fontFamily: 'quickplay',
                },
                '& .MuiDialogContent-root': {
                  backgroundColor: '#E0F7FA',
                  color: '#000000',
                },
                '& .MuiDialog-paper': {
                  width: '550px',
                  maxWidth: '100%',
                },
              }}
            >
              <DialogContent>
                <CreateTenantForm
                  onClose={handleCloseAddDialog}
                  onSuccess={(newTenant) => {
                    setTenants((prevTenants) => [...prevTenants, newTenant]);
                    handleCloseAddDialog();
                  }}
                />
              </DialogContent>
            </Dialog>
            <ToastContainer />
          </div>
        ) : (
          <p className="text-center">Unknown role. Please contact support.</p>
        )) : (
          <p className="text-center">Please log in to view your dashboard.</p>
        )}
    </Box>
  );
}

