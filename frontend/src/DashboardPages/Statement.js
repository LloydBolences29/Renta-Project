import React, { useEffect, useState } from 'react';
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

import {
  
  Tabs,
  Tab,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import CreateTenantForm from './addTenant';
import { useAuthContext } from '../Hook/useAuthHook';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import TenantStatements from './TenantStatements';

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
  const [transactions, setTransactions] = useState([]); // For dialog usage
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [currentPage, setCurrentPage] = useState(1);
  const tenantsPerPage = 10;
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fetch all transactions for the logged-in tenant
  useEffect(() => {
    if (user && user._id && user.role === 'tenant') {
      axios.get(`/api/transactions?tenantId=${user._id}`)
        .then(res => setTransactions(res.data))
        .catch(err => console.error('Error fetching transactions:', err));
    }
  }, [user]);

  // Filter transactions for the current month (Monthly Statement)
  const currentMonthTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.transactionDate);
    const now = new Date();
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });

  // Depending on the active tab, decide which transactions to display
  const displayTransactions = activeTab === 0 ? currentMonthTransactions : transactions;


  // Function to fetch tenants data
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

  useEffect(() => {
    fetchTenants();
  }, []);

  // Filter tenants based on search input
  const filteredTenants = tenants.filter(
    (tenant) =>
      tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      tenant.property?.toLowerCase().includes(search.toLowerCase())
  );

  // If the logged-in user is a tenant, filter by matching email.
  const displayedTenants =
    user && user.role === 'tenant'
      ? filteredTenants.filter(
          (tenant) =>
            tenant.email.toLowerCase() === user.email.toLowerCase()
        )
      : filteredTenants;

  // Calculate pagination values based on displayedTenants
  const indexOfLastTenant = currentPage * tenantsPerPage;
  const indexOfFirstTenant = indexOfLastTenant - tenantsPerPage;
  const currentTenants = displayedTenants.slice(indexOfFirstTenant, indexOfLastTenant);
  const totalPages = Math.ceil(displayedTenants.length / tenantsPerPage);

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

  const calculateDueRent = (tenant) => {
    const today = new Date();
    const dueDate = new Date(tenant.leaseEndDate);
    if (today > dueDate && tenant.paymentStatus === "Pending") {
      return tenant.rentAmount * 2;
    }
    return tenant.rentAmount;
  };

  const handleMarkAsPaid = async () => {
    if (!selectedTenant) return;
    
    if (selectedTenant.paymentStatus !== "Pending") {
      toast.warning("Payment has already been processed for this Months due. Please use advanced payment :)");
      return;
    }
    
    try {
      const response = await axios.post(`/api/tenants/${selectedTenant._id}/mark-as-paid`);
      console.log('Tenant marked as paid:', response.data);
      setSelectedTenant(response.data.tenant);
      fetchTenants();
      toast.success("Payment processed successfully!");
    } catch (error) {
      console.error('Error marking tenant as paid:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Error processing payment. Please try again.");
      }
    }
  };

  const handleMarkAsAdvanced = async () => {
    if (!selectedTenant) return;
    try {
      const response = await axios.post(`/api/tenants/${selectedTenant._id}/mark-as-advanced`);
      console.log('Tenant marked as advanced:', response.data);
      setSelectedTenant(response.data.tenant);
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

  return (
    <Box sx={{ px: 2, py: 4, m: 2 }} className="bg-slate-50 w-full h-full rounded-xl mb:px-4 tb:px-6 lg:px-8">
      {user ? (
        user.role === 'admin' ? (
          <div className="p-4 mb:p-2 tb:p-3 font-quicksand">
            <h2 className="text-5xl mb:text-3xl tb:text-4xl font-bold mb-4 font-playfair text-blue-800">
              <span className="text-7xl mb:text-5xl tb:text-6xl">Tenant</span> List
            </h2>
            <div className="mt-10 mb:mt-4 tb:mt-6 flex justify-between">
              <Button
                onClick={handleOpenAddDialog}
                variant="outlined"
                color="black"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#4CC9FE',
                  '&:hover': { backgroundColor: '#7AB2D3' },
                  padding: '10px 20px',
                  fontSize: '12px',
                  marginTop: '20px',
                  marginLeft: '30px',
                  borderRadius: '15px',
                  fontWeight: '600',
                  letterSpacing: '2px',
                  fontFamily: 'quickplay',
                  color: 'black',
                  textTransform: 'none'
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
                  )
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
                        'Statement',
                        'Action'
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
                          <td className="px-4 py-6 mb:px-2 mb:py-3 tb:px-3 tb:py-4 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                            {editingTenantId === tenant._id ? (
                              <TextField
                                name="rentAmount"
                                value={editedTenantData.rentAmount || ''}
                                onChange={handleChange}
                                variant="outlined"
                                size="small"
                              />
                            ) : (
                              tenant.rentAmount
                            )}
                          </td>
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                          <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-xl text-sm tracking-wide border border-blue-900">
                            <EventNoteIcon
                              className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                              onClick={() => handleOpenCurrentStatementDialog(tenant)}
                              titleAccess="This Month's Statement"
                            />
                            <DescriptionIcon
                              className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                              onClick={() => handleOpenAllStatementsDialog(tenant)}
                              titleAccess="All Statements"
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
              <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
                <div className="flex items-center">
                  <p className="text-sm text-gray-700">
                    Showing {displayedTenants.length > 0 ? indexOfFirstTenant + 1 : 0} to {Math.min(indexOfLastTenant, displayedTenants.length)} of {displayedTenants.length} tenants
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

            Additional dialogs for statements and payments are unchanged
            <Dialog
              open={openAllStatementsDialog}
              onClose={handleCloseAllStatementsDialog}
              maxWidth="sm"
              fullWidth
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg">
                <DialogTitle className="text-white text-center text-2xl font-bolder font-quicksand">
                  <span className='font-quicksand text-2xl font-extrabold'>Transactions History</span>
                </DialogTitle>
              </div>
              <DialogContent className="bg-white">
                <span className='font-quicksand text-center pb-2 block font-bold'>
                  {selectedTenant ? selectedTenant.name : ''}
                </span>
                {selectedTenant ? (
                  transactions.length > 0 ? (
                    <div className="">
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
                              <tr key={transaction._id} className="border-t bg-blue-50 text-center">
                                <td className="px-4 py-2 font-bold tracking-widest text-xs">
                                  {new Date(transaction.transactionDate)
                                    .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                    .replace(',', '')}
                                </td>
                                <td className="px-4 py-2 font-bold tracking-widest text-xs">
                                  ₱{transaction.amount.toFixed(2)}
                                </td>
                                <td className="px-4 py-2 font-bold tracking-widest text-xs">
                                  {transaction.paymentStatus}
                                </td>
                                <td className="px-4 py-2 font-bold tracking-widest text-xs">
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

            <Dialog
              open={openCurrentStatementDialog}
              onClose={handleCloseCurrentStatementDialog}
              maxWidth="sm"
              fullWidth
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-lg">
                <DialogTitle className="text-white text-center text-2xl font-bolder font-quicksand">
                  <span className="font-quicksand text-2xl font-extrabold">This Month's Statement</span>
                </DialogTitle>
              </div>
              <DialogContent className="bg-white">
                <span className="font-quicksand text-center pb-2 block font-bold">
                  {selectedTenant ? selectedTenant.name : ''}
                </span>
                {selectedTenant ? (
                  <div className="py-4">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-blue-100 text-center">
                          <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">Due Date</th>
                          <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">Rent Amount</th>
                          <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">Payment Status</th>
                          <th className="px-4 py-2 font-bold tracking-widest text-sm text-blue-900">Notice</th>
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
                            ₱{calculateDueRent(selectedTenant).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 font-bold tracking-widest text-xs">
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
              <DialogActions sx={{ p: 2, backgroundColor: 'white', justifyContent: 'center', display: 'flex' }}>
                <Button onClick={handleMarkAsPaid} variant="contained" color="secondary" className="rounded-full px-6 py-2">
                  Mark as Paid
                </Button>
                <Button onClick={handleMarkAsAdvanced} variant="contained" color="warning" className="rounded-full px-6 py-2">
                  Mark as Advanced
                </Button>
                <Button onClick={handleCloseCurrentStatementDialog} variant="contained" color="primary" className="rounded-full px-6 py-2">
                  Close
                </Button>
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
                  fontFamily: 'quickplay'
                },
                '& .MuiDialogContent-root': {
                  backgroundColor: '#E0F7FA',
                  color: '#000000'
                },
                '& .MuiDialog-paper': {
                  width: '550px',
                  maxWidth: '100%'
                }
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

            
          // For tenant users, show only the table with their data based on matching email.
          <div className="pb-8 mb:pb-4 tb:pb-6">




          <div className="mt-2">
          <h1 className="text-gray-950 font-black tracking-widest text-2xl mb:text-xl tb:text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-playfair text-center">
            <span className="text-blue-600 text-7xl mb:text-5xl tb:text-6xl">Personal</span>{" "}
            <span className="font-light text-3xl mb:text-xl tb:text-2xl"> Statement and Information</span>
          </h1>
        </div>
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
                    'Statement'
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
                {tenants
                  .filter(
                    (tenant) =>
                      tenant.email.toLowerCase() === user.email.toLowerCase()
                  )
                  .map((tenant) => (
                    <tr key={tenant._id} className="border-t">
                      <td className="px-4 py-6 mb:px-2 mb:py-3 tb:px-3 tb:py-4 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.name}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.email}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.phone}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.property}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.roomNumber}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {new Date(tenant.leaseStartDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }).replace(',', '')}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {new Date(tenant.leaseEndDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }).replace(',', '')}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
                        {tenant.rentAmount}
                      </td>
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-medium text-sm tracking-wide border border-blue-900">
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
                      <td className="px-4 py-2 mb:px-2 mb:py-2 tb:px-3 tb:py-3 font-xl text-sm tracking-wide border border-blue-900">
                        <EventNoteIcon
                          className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                          onClick={() => handleOpenCurrentStatementDialog(tenant)}
                          titleAccess="This Month's Statement"
                        />
                        <DescriptionIcon
                          className="text-blue-500 cursor-pointer text-2xl mx-2 hover:text-blue-700 transition"
                          onClick={() => handleOpenAllStatementsDialog(tenant)}
                          titleAccess="All Statements"
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          

        
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
                            <td className="px-4 py-2 font-bold tracking-widest text-xs">₱{transaction.amount.toFixed(2)}</td>
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
                            ₱{calculateDueRent(selectedTenant).toFixed(2)}
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
                  {/* <Button
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
                  </Button> */}
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

      <Box sx={{ p: 3, }}>
      <h2 className='font-quicksand font-semibold tracking-widest text-center mt-6 mb-6'>
        <span className='text-2xl'>Hello</span>, <span className='text-blue-700'>({user && user.email}) </span> take a look a your transactions.
      </h2>
      <Tabs
      value={activeTab}
      onChange={handleTabChange}
      centered
      sx={{ fontFamily: 'Quicksand, sans-serif' }}
    >
      <Tab label="Monthly Statement" sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif' }} />
      <Tab label="All Transactions" sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif' }} />
    </Tabs>


      <TableContainer component={Paper} sx={{ mt: 2, }}>
        <Table>
        <TableHead sx={{ backgroundColor: '#fafafa', borderBottom: '2px solid #e0e0e0',}}>
  <TableRow>
    {activeTab === 0 ? (
      <>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Due Date
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Rent Amount
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Payment Status
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Notice
        </TableCell>
      </>
    ) : (
      <>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Date
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Amount
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          Status
        </TableCell>
        <TableCell
          align="center"
          sx={{ fontWeight: 'bold', fontFamily: 'Quicksand, sans-serif', py: 1.5 }}
        >
          New Due Date
        </TableCell>
      </>
    )}
  </TableRow>
</TableHead>

          <TableBody>
            {activeTab === 0 ? (
              // Monthly Statement: single row using selectedTenant data
              selectedTenant && (
                <tr className="border-t bg-blue-50 text-center">
                  <td className="px-4 py-2 font-bold tracking-widest text-xs text-black">
                    {new Date(selectedTenant.leaseEndDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-2 font-bold tracking-widest text-xs text-black">
                    ₱{calculateDueRent(selectedTenant).toFixed(2)}
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
              )
            ) : (
              // All Transactions: loop over transactions
              transactions.length > 0 ? (
                transactions
                  .slice()
                  .sort((a, b) => new Date(a.newLeaseEndDate) - new Date(b.newLeaseEndDate))
                  .map((transaction) => (
                    <tr key={transaction._id} className="border-t bg-blue-50 text-center">
                      <td className="px-4 py-2 font-bold tracking-widest text-xs">
                        {new Date(transaction.transactionDate)
                          .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          .replace(',', '')}
                      </td>
                      <td className="px-4 py-2 font-bold tracking-widest text-xs">
                        ₱{transaction.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 font-bold tracking-widest text-xs">
                        {transaction.paymentStatus}
                      </td>
                      <td className="px-4 py-2 font-bold tracking-widest text-xs">
                        {new Date(transaction.newLeaseEndDate)
                          .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          .replace(',', '')}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <TableCell colSpan={4} align="center">
                    No transactions found.
                  </TableCell>
                </tr>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
              
  


  </div>



        


        )
      ) : (
        <p className="text-center">Please log in to view your dashboard.</p>
      )}
    </Box>
  );
}
