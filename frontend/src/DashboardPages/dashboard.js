// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Grid, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ConstructionIcon from '@mui/icons-material/Construction';
import PetsIcon from '@mui/icons-material/Pets';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

function DashboardContent() {
  // Total number of units across all buildings
  const totalUnits = 58;
  
  // State for tenant/room data
  const [rooms, setRooms] = useState([]);
  
  // State for maintenance requests data
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState(null);
  
  // State for pet data
  const [pets, setPets] = useState([]);
  
  // ---------------- Revenue State 
  // Revenue snapshots from MongoDB
  const [revenueData, setRevenueData] = useState([]);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [errorRevenue, setErrorRevenue] = useState(null);
  // ---------------------------------------------------------------------

  // NEW: State to track which Rent Status category details are visible
  const [visibleRentCategory, setVisibleRentCategory] = useState(null);

  // Helper function to format monetary values
  const formatRevenue = (amount) => {
    if (amount < 1000) return amount.toString();
    const thousands = amount / 1000;
    return Number.isInteger(thousands)
      ? `${thousands}K`
      : `${thousands.toFixed(1)}K`;
  };

  // ----------------- Fetch Revenue Data from DB -----------------
  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const response = await axios.get('/api/revenue');
        setRevenueData(response.data);
      } catch (error) {
        setErrorRevenue(error.response?.data || 'Error fetching revenue');
      } finally {
        setLoadingRevenue(false);
      }
    };
    fetchRevenue();
    const interval = setInterval(fetchRevenue, 60000);
    return () => clearInterval(interval);

  }, []);
  // --------------------------------------------------------------

  // Fetch tenant data and compute room occupancy
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

  // Fetch maintenance requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/request');
        setMaintenanceRequests(response.data);
      } catch (err) {
        setErrorRequests(err.response?.data || 'Error fetching requests');
      } finally {
        setLoadingRequests(false);
      }
    };
    fetchRequests();
  }, []);

  // Fetch pet data
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await fetch('/api/pet');
        if (response.ok) {
          const data = await response.json();
          setPets(data);
        } else {
          console.error('Failed to fetch pets');
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };
    fetchPets();
  }, []);

  // Compute occupancy statistics
  const occupiedCount = rooms.filter(room => room.isRented).length;
  const vacantCount = totalUnits - occupiedCount;
  const occupiedUnits = occupiedCount;

  // Expiring Leases count (next 30 days)
  const expiringLeasesCount = rooms.filter(room => {
    if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
    const leaseEndDate = new Date(room.tenant.leaseEndDate);
    const today = new Date();
    const in5Days = new Date();
    in5Days.setDate(today.getDate() + 5);
    return leaseEndDate >= today && leaseEndDate <= in5Days;
  }).length;


  const todayDate = new Date();
  const currentYear = todayDate.getFullYear();
  // Adjust currentMonth so that January = 1, February = 2, etc.
  const currentMonth = todayDate.getMonth() + 1;

  // Get the revenue record for the current month and year
  const currentMonthRecord = revenueData.find(
    record => record.month === currentMonth && record.year === currentYear
  ) || {};

  // Get the record for the previous month (handle January separately)
  const lastMonthRecord = currentMonth === 1
    ? revenueData.find(record => record.month === 12 && record.year === currentYear - 1) || {}
    : revenueData.find(record => record.month === currentMonth - 1 && record.year === currentYear) || {};

  // Extract revenue values (defaulting to 0 if not available)
  const expectedRevenue = currentMonthRecord.expectedRevenue || 0;
  const collectedRevenue = currentMonthRecord.collectedRevenue || 0;
  const outstandingRevenue = currentMonthRecord.outstandingRevenue || 0;
  const lastMonthCollected = lastMonthRecord.collectedRevenue || 0;
  const revenueDifferencePercentage = lastMonthCollected
    ? (((collectedRevenue - lastMonthCollected) / lastMonthCollected) * 100).toFixed(2)
    : 0;
  // ----------------------------------------------------------------------------

  // Build data for Monthly Revenue Line Chart using persisted snapshots
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyRevenueData = monthNames.map((m, index) => {
    const record = revenueData.find(r => r.month === index + 1 && r.year === currentYear);
    return {
      month: m,
      revenue: record ? record.collectedRevenue : 0,
    };
  });

  // Revenue Stat Cards using persisted snapshot values
  const stats = [
    { label: "Expected Revenue", value: `₱${formatRevenue(expectedRevenue)}`, icon: <MonetizationOnIcon /> },
    { label: "Outstanding Rent", value: `₱${formatRevenue(outstandingRevenue)}`, icon: <MonetizationOnIcon /> },
    { label: "Collected Rent", value: `₱${formatRevenue(collectedRevenue)}`, icon: <MonetizationOnIcon /> },
  ];

 

  // Pet registrations count (approved)
  const approvedOrDisapprovedPets = pets.filter(pet => pet.status === "approved").length;

  // Due Today count based on leaseEndDate
  const dueTodayCount = rooms.filter(room => {
    if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
    const leaseEndDate = new Date(room.tenant.leaseEndDate);
    const today = new Date();
    return leaseEndDate.toDateString() === today.toDateString();
  }).length;

  // Overdue Leases count based on leaseEndDate
  const overdueLeasesCount = rooms.filter(room => {
    if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
    const leaseEndDate = new Date(room.tenant.leaseEndDate);
    const today = new Date();
    return leaseEndDate < today;
  }).length;

  // Maintenance Request Status Breakdown
  const pendingRequests = maintenanceRequests.filter(req => req.status === "pending").length;
  const inProgressRequests = maintenanceRequests.filter(req => req.status === "in-progress").length;
  const completedRequests = maintenanceRequests.filter(req => req.status === "completed").length;
  const maintenanceStatusStats = [
    { label: "Total Maintenance Requests", value: maintenanceRequests.length || 10, icon: <ConstructionIcon />, labelClass: "text-red-500" },
    { label: "Pending", value: pendingRequests, icon: <ConstructionIcon />, labelClass: "text-yellow-500" },
    { label: "In-progress", value: inProgressRequests, icon: <ConstructionIcon />, labelClass: "text-blue-500" },
    { label: "Completed", value: completedRequests, icon: <ConstructionIcon />, labelClass: "text-green-500" },
  ];

  // Create data for Maintenance Status Pie Chart
  const maintenanceStatusData = maintenanceStatusStats.map(stat => ({
    name: stat.label,
    value: stat.value,
  }));
  const maintenanceStatusColors = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE"];

  // Create data for Rent Status Pie Chart
  const rentStats = [
    { label: "Expiring Leases", value: expiringLeasesCount, icon: <EventAvailableIcon /> },
    { label: "Due Today", value: dueTodayCount, icon: <EventAvailableIcon /> },
    { label: "Overdue Leases", value: overdueLeasesCount, icon: <EventAvailableIcon /> },
  ];
  const rentStatusPieData = rentStats.map(stat => ({
    name: stat.label,
    value: stat.value,
  }));
  const rentStatusColors = ["#0088FE", "#00C49F", "#FFBB28"];

  // Data for the occupancy Pie Chart
  const unitData = [
    { name: "Occupied", value: occupiedCount },
    { name: "Vacant", value: vacantCount },
  ];
  const COLORS = ["#0088FE", "#FF8042"];

  // Helper function for Rent Status Details
  const getRentStatusRooms = (category) => {
    if (category === "Expiring Leases") {
      return rooms.filter(room => {
        if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
        const leaseEndDate = new Date(room.tenant.leaseEndDate);
        const today = new Date();
        const in5Days = new Date();
        in5Days.setDate(today.getDate() + 5);
        return leaseEndDate >= today && leaseEndDate <= in5Days;
      });
    } else if (category === "Due Today") {
      return rooms.filter(room => {
        if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
        const leaseEndDate = new Date(room.tenant.leaseEndDate);
        const today = new Date();
        return leaseEndDate.toDateString() === today.toDateString();
      });
    } else if (category === "Overdue Leases") {
      return rooms.filter(room => {
        if (!room.isRented || !room.tenant || !room.tenant.leaseEndDate) return false;
        const leaseEndDate = new Date(room.tenant.leaseEndDate);
        const today = new Date();
        return leaseEndDate < today;
      });
    }
    return [];
  };

  return (
    <Box sx={{ px: 8, py: 4, m: 0 }} className="bg-slate-50 w-full h-full rounded-xl mb:px-4 tb:px-6 lg:px-8">
      {/* Header */}
      <div className="pb-8 mb:pb-4 tb:pb-6">
        <h1 className="text-gray-950 font-black tracking-widest text-2xl mb:text-xl tb:text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-playfair text-center">
          <span className="text-blue-600 text-7xl mb:text-5xl tb:text-6xl">Vergara's</span>{" "}
          <span className="font-light text-3xl mb:text-xl tb:text-2xl">Apartment Management Complex</span>
        </h1>
      </div>

      {/* Revenue Stat Cards */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Revenue
        </div>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between mb:p-4 tb:p-5">
                <div className="flex justify-between items-center space-x-4 font-Inter">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                  <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                </div>
                {stat.label === "Expected Revenue" ? (
                  <>
                    <p className="text-6xl font-bold font-Inter text-blue-900 mt-4 p-8 pl-0 text-center">
                      ₱{formatRevenue(expectedRevenue)}
                    </p>
                    <Typography
                      variant="subtitle3"
                      align="center"
                      color={Number(revenueDifferencePercentage) >= 0 ? "green" : "red"}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                    >
                      {Number(revenueDifferencePercentage) >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                      {Number(revenueDifferencePercentage) >= 0
                        ? `+${revenueDifferencePercentage}%`
                        : `${revenueDifferencePercentage}%`} Vs Last Month
                    </Typography>
                  </>
                ) : (
                  <p className="text-6xl font-bold font-Inter text-blue-900 mt-4 p-8 pl-0 text-center">
                    {stat.value}
                  </p>
                )}
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Monthly Revenue Line Chart */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Monthly Revenue (Current Year)
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="revenue" stroke="#0088FE" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Rent Status Cards & Details */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Rent Status
        </div>
        <Grid container spacing={4}>
          {rentStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between mb:p-4 tb:p-5">
                <div className="flex justify-between items-center space-x-4 font-Inter">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                  <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                </div>
                <p className="text-7xl font-bold font-Inter text-blue-900 mt-4 p-8 text-center">
                  {stat.value}
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() =>
                    setVisibleRentCategory(
                      visibleRentCategory === stat.label ? null : stat.label
                    )
                  }
                  sx={{ mt: 2 }}
                >
                  {visibleRentCategory === stat.label ? "Hide Details" : "Show Details"}
                </Button>
              </div>
            </Grid>
          ))}
        </Grid>
        {visibleRentCategory && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
              {visibleRentCategory} Details
            </Typography>
            <TableContainer component={Paper} sx={{ maxWidth: '100%', mx: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Building</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Room</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rent Amount</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Rent End</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getRentStatusRooms(visibleRentCategory).map((room, index) => (
                    <TableRow key={index}>
                      <TableCell>{room.tenant.name}</TableCell>
                      <TableCell>{room.property}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell>₱{room.tenant.rentAmount}</TableCell>
                      <TableCell>
                        {room.tenant.leaseEndDate
                          ? new Date(room.tenant.leaseEndDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Unit Statistics */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Unit Statistics
        </div>
        <Grid container spacing={4}>
          {[
            { label: "Total Units", value: totalUnits, icon: <HomeWorkIcon /> },
            { label: "Occupied Units", value: occupiedUnits, icon: <HomeWorkIcon /> },
            { label: "Vacant Units", value: vacantCount, icon: <HomeWorkIcon /> }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between mb:p-4 tb:p-5">
                <div className="flex justify-between items-center space-x-4 font-Inter">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                  <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                </div>
                <p className="text-7xl font-bold font-Inter text-blue-900 mt-4 p-8 text-center">
                  {stat.value}
                </p>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Unit & Rent Status Breakdown Pie Charts */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" color="primary" sx={{ textAlign: 'center', mb: 2 }}>
              Unit Status Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={unitData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {unitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#ED2000", "#3DB12E"][index % 2]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 4, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" color="primary" sx={{ textAlign: 'center', mb: 2 }}>
              Rent Status Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={rentStatusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {rentStatusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#80CDFF", "#FF9811", "#ED2000"][index % 3]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 4, border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </Grid>
        </Grid>
      </Box>

      {/* Maintenance Request Status Cards */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Maintenance Request Status 
        </div>
        <Grid container spacing={4}>
          {maintenanceStatusStats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between mb:p-4 tb:p-5">
                <div className="flex justify-between items-center space-x-4 font-Inter">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                  <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                </div>
                <p className="text-7xl font-bold font-Inter text-blue-900 mt-4 p-8 text-center">
                  {stat.value}
                </p>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Maintenance Status Breakdown Bar Chart */}
      <Box sx={{ mt: 6, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, textAlign: 'center' }}>
        <Typography variant="h5" color="primary" sx={{ mb: 3 }}>
          Maintenance Status Breakdown
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maintenanceStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
            <YAxis tick={{ fill: '#666', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#f5f5f5', borderRadius: 4, border: 'none', fontSize: 12 }} />
            <Bar dataKey="value" barSize={50}>
              {maintenanceStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#000000", "#FFA500", "#0000FF", "#008000"][index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Pet Registrations */}
      <Box sx={{ mt: 6 }}>
        <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 bg-slate-50 pb-8 mb:pb-4 tb:pb-6 font-Inter text-center">
          Pet Registrations
        </div>
        <Grid container spacing={4}>
          {[
            { label: "Total Pets Registered", value: pets.length, icon: <PetsIcon /> },
            { label: "Approved Pets", value: approvedOrDisapprovedPets, icon: <PetsIcon /> },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={6} key={index}>
              <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between mb:p-4 tb:p-5">
                <div className="flex justify-between items-center space-x-4 font-Inter">
                  <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                  <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                </div>
                <p className="text-7xl font-bold font-Inter text-blue-900 mt-4 p-8 text-center">
                  {stat.value}
                </p>
              </div>
            </Grid>
          ))}
        </Grid>
      </Box>

    </Box>
  );
}

export default DashboardContent;
