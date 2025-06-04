import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../Hook/useAuthHook';
import PaymentIcon from '@mui/icons-material/Payment';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import emailjs from 'emailjs-com';

const PaymentProofUpload = () => {
  const { user } = useAuthContext();
  const isAdmin = user && user.role === 'admin';

  // Dialog state for the payment proof form
  const [openDialog, setOpenDialog] = useState(false);
  // State for the status edit modal (for admin on payment proofs)
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  // State for viewing image modal
  const [viewImage, setViewImage] = useState(null);
  // State for delete confirmation dialog (payment proofs)
  const [deleteDialog, setDeleteDialog] = useState(null);

  // Form state variables for payment proof
  const [name, setName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [roomChoices, setRoomChoices] = useState([]);
  const [transactionType, setTransactionType] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const fileInputRef = useRef(null);

  // State for Room Applications
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [newAppStatus, setNewAppStatus] = useState('');
  const [deleteAppDialog, setDeleteAppDialog] = useState(null);

  // Prefill email field from auth context
  useEffect(() => {
    if (user && user.email) {
      setFormEmail(user.email);
    }
  }, [user]);

  // Fetch payment transactions on mount
  useEffect(() => {
    fetch('/api/pay')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Error fetching transactions:', err));
  }, []);

  // Fetch room applications on mount
  useEffect(() => {
    emailjs.init('cBIKEtZRngFRjeWOq')
    fetch('/api/apply')
      .then((res) => res.json())
      .then((data) => setApplications(data))
      .catch((err) => console.error('Error fetching applications:', err));
  }, []);

  // Filter transactions: non-admin users see only their own proofs
  const personalTransactions = isAdmin
    ? transactions
    : transactions.filter((tx) => tx.email === user?.email);

  // Filter room applications similarly
  const personalApplications = isAdmin
    ? applications
    : applications.filter((app) => app.email === user?.email);

  // Helper function to format date (year, month, day)
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // --- Payment Proof Handlers ---

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleBuildingChange = (e) => {
    const selected = e.target.value;
    setBuildingName(selected);
    setRoomNumber('');
    if (selected === 'Lalaine') {
      setRoomChoices(Array.from({ length: 28 }, (_, i) => {
        const floor = Math.floor(i / 10) + 1;
        const room = (i % 10) + 1;
        return `${floor}${room.toString().padStart(2, '0')}`;
      }));
    } else if (selected === 'Jade') {
      setRoomChoices(Array.from({ length: 30 }, (_, i) => {
        const floor = Math.floor(i / 10) + 1;
        const room = (i % 10) + 1;
        return `${floor}${room.toString().padStart(2, '0')}`;
      }));
    } else {
      setRoomChoices([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formEmail) {
      setMessage('Email is required. Please enter your email.');
      return;
    }

    if (
      !transactionType ||
      !paymentDate ||
      !selectedFile ||
      !name ||
      !buildingName ||
      !roomNumber
    ) {
      setMessage('Please fill in all required fields.');
      return;
    }

    // Notify that upload has started
    toast.info('Uploading...');

    const formData = new FormData();
    formData.append('transactionType', transactionType);
    formData.append('paymentDate', paymentDate);
    formData.append('transactionId', transactionId);
    formData.append('name', name);
    formData.append('email', formEmail);
    formData.append('buildingName', buildingName);
    formData.append('roomNumber', roomNumber);
    formData.append('paymentProof', selectedFile);

    fetch('/api/pay', {
      method: 'POST',
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
      })
      .then((data) => {
        toast.success('Upload successful!');
        setTransactions((prev) => [data.paymentProof, ...prev]);
        // Reset form fields
        setTransactionType('');
        setPaymentDate('');
        setTransactionId('');
        setName('');
        setBuildingName('');
        setRoomNumber('');
        setRoomChoices([]);
        setSelectedFile(null);
        setFileName('');
        setOpenDialog(false);
      })
      .catch((err) => {
        console.error('Error uploading payment proof:', err);
        toast.error('Error uploading payment proof.');
      });
  };

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setNewStatus(transaction.status);
  };

  const handleSaveStatus = () => {
    fetch(`/api/pay/${editingTransaction._id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Status update failed');
        return res.json();
      })
      .then((data) => {
        toast.success('Status updated successfully!');
        setTransactions((prev) =>
          prev.map((tx) =>
            tx._id === editingTransaction._id ? data.paymentProof : tx
          )
        );
        setEditingTransaction(null);
      })
      .catch((err) => {
        console.error('Error updating status:', err);
        toast.error('Error updating status.');
      });
  };

  const handleDeleteClick = (transaction) => {
    setDeleteDialog(transaction);
  };

  const handleDelete = (transaction) => {
    fetch(`/api/pay/${transaction._id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete transaction');
        return res.json();
      })
      .then(() => {
        toast.success('Transaction deleted successfully!');
        setTransactions((prev) =>
          prev.filter((tx) => tx._id !== transaction._id)
        );
        setDeleteDialog(null);
      })
      .catch((err) => {
        console.error('Error deleting transaction:', err);
        toast.error('Error deleting transaction.');
      });
  };

  // --- Room Application Handlers ---

  const handleEditAppClick = (app) => {
    setEditingApplication(app);
    setNewAppStatus(app.status);
  };

  const handleSaveAppStatus = async () => {
    try {
      const response = await fetch(`/api/apply/${editingApplication._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newAppStatus }),
      });
      if (!response.ok) throw new Error('Status update failed');
      const updatedApp = await response.json();

      // update local state
      setApplications((prev) =>
        prev.map((app) =>
          app._id === editingApplication._id
            ? { ...app, status: newAppStatus }
            : app
        )
      );
      toast.success('Application status updated!');

      // send email based on status
      if (newAppStatus === 'Approved') {
        const templateParams = {
          applicant_name: editingApplication.fullName,
          applicant_email: editingApplication.email,
          building: editingApplication.building,
          room: editingApplication.roomNumber,
          message: `Hi ${editingApplication.fullName},\n\n` +
                   `Congratulations! Your room application for Building ${editingApplication.building}, Room ${editingApplication.roomNumber} has been approved. Welcome aboard!`,
        };
        emailjs
          .send(
            'service_moe2i0p',          // EmailJS service ID
            'template_9zqf80z',  // EmailJS template ID for approvals
            templateParams
          )
          .then((res) => console.log('Approval email sent:', res.status, res.text))
          .catch((err) => console.error('Error sending approval email:', err));
      } else if (newAppStatus === 'Disapproved') {
        const templateParams = {
          applicant_name: editingApplication.fullName,
          applicant_email: editingApplication.email,
          building: editingApplication.building,
          room: editingApplication.roomNumber,
          message: `Hi ${editingApplication.fullName},\n\n` +
                   `We’re sorry to inform you that your room application for Building ${editingApplication.building}, Room ${editingApplication.roomNumber} was not approved. Please contact our support team if you have questions.`,
        };
        emailjs
          .send(
            'service_moe2i0p',             // EmailJS service ID
            'template_u8va881', // EmailJS template ID for disapprovals
            templateParams
          )
          .then((res) => console.log('Disapproval email sent:', res.status, res.text))
          .catch((err) => console.error('Error sending disapproval email:', err));
      }

      setEditingApplication(null);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error updating application status.');
    }
  };
  


  const handleDeleteApp = async (app) => {
    try {
      const response = await fetch(`/api/apply/${app._id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete application');
      const data = await response.json();
      setApplications((prev) => prev.filter((a) => a._id !== app._id));
      toast.success('Application deleted successfully!');
      setDeleteAppDialog(null);
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Error deleting application.');
    }
  };

  return (
    <div className="w-full min-h-screen p-10 pt-20 bg-gray-100">
      {/* Payment Proof Section */}
      <div className="flex justify-between">
        <h2 className="text-5xl font-bold mb-4 ml-6 font-playfair text-blue-800 text-center">
          <span className="text-7xl">Payment</span> List
        </h2>
        <button
          onClick={() => setOpenDialog(true)}
          className="m-6 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PaymentIcon />
          Submit Payment Proof
        </button>
      </div>

      {/* Payment Proof Dialog */}
      {openDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setOpenDialog(false)}
          ></div>
          {/* Dialog Content */}
          <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-2xl w-full relative">
            <button
              onClick={() => setOpenDialog(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Upload Payment Proof</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="transactionType"
                  className="block text-sm font-medium text-gray-700"
                >
                  Transaction Type
                </label>
                <select
                  id="transactionType"
                  value={transactionType}
                  onChange={(e) => setTransactionType(e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select a transaction type
                  </option>
                  <option value="Reservation">Reservation</option>
                  <option value="Rent Payment">Rent Payment</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="paymentDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="transactionId"
                  className="block text-sm font-medium text-gray-700"
                >
                  Reference / Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction/reference number"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Editable Name Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Editable Email Field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="w-full md:w-1/4">
                  <label
                    htmlFor="buildingName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Building Name
                  </label>
                  <select
                    id="buildingName"
                    value={buildingName}
                    onChange={handleBuildingChange}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a building</option>
                    <option value="Lalaine">Lalaine</option>
                    <option value="Jade">Jade</option>
                  </select>
                </div>
                <div className="w-full md:w-1/4">
                  <label
                    htmlFor="roomNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Room Number
                  </label>
                  <select
                    id="roomNumber"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a room number</option>
                    {roomChoices.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Proof (JPG, PNG, PDF)
                </label>
                <div
                  className="border-2 border-dashed border-blue-500 rounded-md p-6 text-center text-blue-500 cursor-pointer hover:bg-blue-50"
                  onClick={() => fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  Click here or drag &amp; drop your file
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                    required
                  />
                </div>
                {fileName && (
                  <p className="mt-2 text-sm text-gray-700">
                    Selected file: {fileName}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Submit Payment Proof
              </button>
            </form>
            {message && (
              <p className="mt-4 text-center text-lg">{message}</p>
            )}
          </div>
        </div>
      )}

      {/* Payment Proof Table */}
      <div className="m-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-3xl font-bold mb-6 text-center">Submitted Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Transaction Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Proof
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Reference
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {personalTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 9 : 8}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No transactions submitted.
                    </td>
                  </tr>
                ) : (
                  personalTransactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.transactionType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(transaction.paymentDate)}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm rounded-xl uppercase font-bold ${
                          transaction.status === 'Pending'
                            ? 'text-blue-700'
                            : transaction.status === 'Disapproved'
                            ? 'text-red-600'
                            : transaction.status === 'Approved'
                            ? 'text-green-700'
                            : ''
                        }`}
                      >
                        {transaction.status}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setViewImage(transaction.fileName)}
                          className="text-blue-500 underline"
                        >
                          View Image
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.buildingName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.roomNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.transactionId || 'N/A'}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEditClick(transaction)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Proof Admin Modals */}
      {editingTransaction && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setEditingTransaction(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-bold mb-4">Edit Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Disapproved">Disapproved</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingTransaction(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setViewImage(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 p-4 max-w-3xl w-full relative">
            <button
              onClick={() => setViewImage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <img
              src={`/${viewImage}`}
              alt="Uploaded Payment Proof"
              className="max-w-full max-h-[80vh] object-contain mx-auto"
            />
          </div>
        </div>
      )}

      {deleteDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setDeleteDialog(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this transaction?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteDialog(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteDialog)}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Application Table */}
      <div className="m-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-3xl font-bold mb-6 text-center">Room Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Building
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                    Applied On
                  </th>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {personalApplications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isAdmin ? 7 : 6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No applications submitted.
                    </td>
                  </tr>
                ) : (
                  personalApplications.map((app) => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{app.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.fullName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.building}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.roomNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{app.contactNumber}</td>
                      <td
                        className={`px-6 py-4 text-sm uppercase font-bold ${
                          app.status === 'Pending'
                            ? 'text-blue-700'
                            : app.status === 'Approved'
                            ? 'text-green-700'
                            : 'text-red-600'
                        }`}
                      >
                        {app.status}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDateTime(app.createdAt)}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-sm flex gap-2">
                          <button
                            onClick={() => handleEditAppClick(app)}
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteAppDialog(app)}
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Room Application Edit Modal */}
      {editingApplication && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setEditingApplication(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-bold mb-4">Edit Application Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={newAppStatus}
                onChange={(e) => setNewAppStatus(e.target.value)}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Disapproved">Disapproved</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditingApplication(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAppStatus}
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Application Delete Confirmation Modal */}
      {deleteAppDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setDeleteAppDialog(null)}
          ></div>
          <div className="bg-white rounded-lg shadow-lg z-50 p-6 max-w-sm w-full relative">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-4">Are you sure you want to delete this application?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteAppDialog(null)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteApp(deleteAppDialog)}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default PaymentProofUpload;
