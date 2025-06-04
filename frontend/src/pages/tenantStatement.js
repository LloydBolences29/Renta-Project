import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';
import { useAuthContext } from '../Hook/useAuthHook';

export default function TenantStatements() {
  const { user } = useAuthContext(); // Assumes tenant info is stored in user
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Fetch only transactions for the logged-in tenant using their id
        const res = await axios.get(`/api/transactions?tenantId=${user._id}`);
        setTransactions(res.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    if (user && user._id) {
      fetchTransactions();
    }
  }, [user]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter transactions for the current month
  const monthlyTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.transactionDate);
    const today = new Date();
    return (
      txDate.getMonth() === today.getMonth() &&
      txDate.getFullYear() === today.getFullYear()
    );
  });

  // Choose which transactions to display
  const displayTransactions = activeTab === 0 ? monthlyTransactions : transactions;

  return (
    <Box sx={{ p: 3 }}>
      <h2>Welcome, {user && user.name} ({user && user.email})</h2>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Monthly Statement" />
        <Tab label="All Transactions" />
      </Tabs>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>New Due Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayTransactions.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell>{new Date(tx.transactionDate).toLocaleDateString()}</TableCell>
                <TableCell>{`₱${tx.amount.toFixed(2)}`}</TableCell>
                <TableCell>{tx.paymentStatus}</TableCell>
                <TableCell>{new Date(tx.newLeaseEndDate).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
