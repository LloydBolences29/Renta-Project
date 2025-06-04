import React, { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '../Hook/useAuthHook'; 
import PaymentIcon from '@mui/icons-material/Payment';

const PaymentProofUpload = () => {
  const { user } = useAuthContext();
  const isAdmin = user && user.role === 'admin';

  // Dialog state for the payment proof form
  const [openDialog, setOpenDialog] = useState(false);
  // State for the status edit modal (for admin)
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  // State for viewing image modal
  const [viewImage, setViewImage] = useState(null);
  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState(null);




const [name, setName] = useState('');
const [buildingName, setBuildingName] = useState('');
const [roomNumber, setRoomNumber] = useState('');

  // Form state variables
  // Editable name field (for user's full name)

  // Editable email field (user can modify it manually)
  const [formEmail, setFormEmail] = useState('');

  const [transactionType, setTransactionType] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [transactions, setTransactions] = useState([]);
  const fileInputRef = useRef(null);

//get info
  useEffect(() => {
    if (!user?.email) return;
  
    fetch(`/api/tenants/email/${user.email}`)
      .then(res => {
        if (!res.ok) throw new Error('Tenant not found');
        return res.json();
      })
      .then(tenant => {
        setName(tenant.name);
        setBuildingName(tenant.property); 
        setRoomNumber(tenant.roomNumber);
      })
      .catch(err => console.error('Error fetching tenant info:', err));
  }, [user]);
  
  // Prefill the email field from auth context
  useEffect(() => {
    if (user && user.email) {
      setFormEmail(user.email);
    }
  }, [user]);

  // Fetch transactions from the backend on mount
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    fetch('/api/pay')
      .then((res) => res.json())
      .then((data) => setTransactions(data))
      .catch((err) => console.error('Error fetching transactions:', err));
  };

  // Filter transactions: non-admin users see only their own proofs (based on auth context email)
  const personalTransactions = isAdmin
    ? transactions
    : transactions.filter((tx) => tx.email === user?.email);

  // Helper function to format date only (without time)
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Show only year, month, and day
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  // Generate room numbers (e.g., 101, 102, etc.)
  const generateRoomNumbers = (totalRooms) => {
    return Array.from({ length: totalRooms }, (_, i) => {
      const floor = Math.floor(i / 10) + 1;
      const room = (i % 10) + 1;
      return `${floor}${room.toString().padStart(2, '0')}`;
    });
  };

  // Update room choices when building selection changes


  // Handle file selection via click or drag-and-drop
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

  // Handle form submission: send a POST request with FormData to the backend
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formEmail) {
      setMessage('Email is required. Please enter your email.');
      return;
    }
    
    if (
      !transactionType ||
      !paymentDate ||
      !selectedFile 
    ) {
      setMessage('Please fill in all required fields.');
      return;
    }

    setMessage('Uploading...');
    const formData = new FormData();
    formData.append('transactionType', transactionType);
    formData.append('paymentDate', paymentDate);
    formData.append('transactionId', transactionId);
    // Use the manually entered name and email
 
    formData.append('email', formEmail);


    // Field name "paymentProof" must match what the backend expects.
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
        setMessage('Upload successful!');
        // Assume backend returns the new payment proof object in data.paymentProof
        setTransactions((prev) => [data.paymentProof, ...prev]);
        // Reset form fields
        setTransactionType('');
        setPaymentDate('');
        setTransactionId('');
   



        setSelectedFile(null);
        setFileName('');
        setOpenDialog(false);
      })
      .catch((err) => {
        console.error('Error uploading payment proof:', err);
        setMessage('Error uploading payment proof.');
      });
  };

  // When admin clicks "Edit", open the status edit modal
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setNewStatus(transaction.status);
  };

  // Save updated status by sending a PUT request to the backend
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
        setTransactions((prev) =>
          prev.map((tx) =>
            tx._id === editingTransaction._id ? data.paymentProof : tx
          )
        );
        setEditingTransaction(null);
      })
      .catch((err) => {
        console.error('Error updating status:', err);
      });
  };

  // Open delete confirmation dialog for admin only
  const handleDeleteClick = (transaction) => {
    setDeleteDialog(transaction);
  };

  // Delete transaction for admin only
  const handleDelete = (transaction) => {
    fetch(`/api/pay/${transaction._id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete transaction');
        return res.json();
      })
      .then((data) => {
        setTransactions((prev) =>
          prev.filter((tx) => tx._id !== transaction._id)
        );
        setDeleteDialog(null);
      })
      .catch((err) => {
        console.error('Error deleting transaction:', err);
      });
  };

  return (
    <div className="w-full min-h-screen p-10 pt-20 bg-gray-100">
      {/* Button to open the payment proof dialog */}
      <div className='flex justify-between'>
        <h2 className="text-4xl font-bold mb-4 ml-6 font-playfair text-blue-800 text-center">
          <span className='text-7xl'>Tenant</span> payment
        </h2>
        <button
          onClick={() => setOpenDialog(true)}
          className="m-6 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PaymentIcon />
          Submit Receipt
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
                  readOnly
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
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

      {/* Full-Screen Transactions Table */}
      <div className="m-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h3 className="text-3xl font-bold mb-6 text-center">Submitted Transactions</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-blue-100">
                <tr>
                  {/* Reordered columns: Email, Transaction Type, Payment Date, Status, Proof, Building, Room, Reference, Action */}
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
                      colSpan={isAdmin ? '9' : '8'}
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
                        className={`text-sm rounded-xl uppercase font-bold ${
                          transaction.status === 'Pending'
                            ? ' text-blue-700'
                            : transaction.status === 'Disapproved'
                            ? ' text-red-600'
                            : transaction.status === 'Approved'
                            ? ' text-green-700'
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
                        {buildingName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {roomNumber}
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

      {/* Status Edit Modal for Admin */}
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

      {/* Image View Modal */}
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

      {/* Delete Confirmation Modal */}
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
    </div>
  );
};

// Helper function to format date only (without time)
const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // Options: show only year, month, and day
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
};

export default PaymentProofUpload;
