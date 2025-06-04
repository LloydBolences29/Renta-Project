// src/pages/AdminCalendarPage.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { Calendar } from 'react-date-range';
import { DateRange } from 'react-date-range';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PaidIcon from '@mui/icons-material/Paid';
import ConstructionIcon from '@mui/icons-material/Construction';
import PetsIcon from '@mui/icons-material/Pets';
import { Link, useLocation } from 'react-router-dom';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { Box, Grid } from '@mui/material';
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Typography,
} from '@mui/material';
import {  Button, ButtonGroup } from '@mui/material';
// Custom input for individual date (used in RangeSelector if needed)
const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="border border-gray-300 rounded px-3 py-2 text-lg flex items-center cursor-pointer"
  >
    <CalendarTodayIcon className="mr-2" />
    <span>{value.toUpperCase()}</span>
  </div>
));



// Utility functions to compute ranges
const getToday = () => new Date();
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d;
};
const getThisWeek = () => {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start, end];
};
const getLastWeek = () => {
  const today = new Date();
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const start = new Date(thisWeekStart);
  start.setDate(thisWeekStart.getDate() - 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return [start, end];
};
const getThisMonth = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return [start, end];
};

// Helper to check if a tenant's lease period overlaps the selected date range
const isLeaseActiveInRange = (tenant, rangeStart, rangeEnd) => {
  if (!tenant || !tenant.leaseStartDate || !tenant.leaseEndDate) return false;
  const leaseStart = new Date(tenant.leaseStartDate);
  const leaseEnd = new Date(tenant.leaseEndDate);
  // Overlap occurs if the lease starts on or before the range end
  // and ends on or after the range start.
  return leaseStart <= rangeEnd && leaseEnd >= rangeStart;
};

// RangeSelector component for pre-defined options
const RangeSelector = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Today');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);
  // For react-date-range's selection
  const [range, setRange] = useState({
    startDate: startDate,
    endDate: endDate,
    key: 'selection'
  });
  const containerRef = useRef(null);

  const options = [
    'Today',
    'Last Day',
    'This Week',
    'Last Week',
    'This Month',
    'Date Range'
  ];

  // Close dropdown if click occurs outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    if (option === 'Date Range') {
      setShowRangeCalendar(true);
      return;
    }
    let newStart = startDate;
    let newEnd = endDate;
    const today = getToday();

    switch (option) {
      case 'Today':
        newStart = today;
        newEnd = today;
        break;
      case 'Last Day':
        newStart = getYesterday();
        newEnd = getYesterday();
        break;
      case 'This Week': {
        const [s, e] = getThisWeek();
        newStart = s;
        newEnd = e;
        break;
      }
      case 'Last Week': {
        const [s, e] = getLastWeek();
        newStart = s;
        newEnd = e;
        break;
      }
      case 'This Month': {
        const [s, e] = getThisMonth();
        newStart = s;
        newEnd = e;
        break;
      }
      case 'Single Day':
        newStart = today;
        newEnd = today;
        break;
      default:
        break;
    }
    onChange(newStart, newEnd);
  };

  const formatDisplay = () => {
    if (selectedOption === 'Date Range') {
      return startDate && endDate
        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        : 'DATE RANGE';
    }
    if (selectedOption === 'Single Day') {
      return startDate ? startDate.toLocaleDateString() : '';
    }
    return selectedOption;
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className="border border-gray-300 rounded px-3 py-2 text-lg mb:text-xs flex items-center cursor-pointer font-quicksand"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarTodayIcon className="mr-2" />
        <span>{formatDisplay().toUpperCase()}</span>
        <ExpandMoreIcon className="text-black" />
      </div>
      {isOpen && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg z-10">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-quicksand"
              onClick={() => handleSelectOption(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {showRangeCalendar && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-2">
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setRange(item.selection)}
            moveRangeOnFirstSelection={false}
            ranges={[range]}
            color="#0ea5e9"
          />
          <button
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-quicksand"
            onClick={() => {
              onChange(range.startDate, range.endDate);
              setShowRangeCalendar(false);
              setSelectedOption('Date Range');
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

function Reports() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const location = useLocation();

  // 2) Inside your Reports() function, add:
const [visits, setVisits] = useState([]);
const [filterMode, setFilterMode] = useState('all');

// 2) Helper (no TS annotation)
const isToday = (dateString) => {
  const d = new Date(dateString);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth()    === today.getMonth() &&
    d.getDate()     === today.getDate()
  );
};

// derive the list we actually show
const displayedVisits = visits.filter(v =>
  filterMode === 'all'
    ? true
    : isToday(v.createdAt)
);


useEffect(() => {
  const fetchVisits = async () => {
    try {
      const res = await axios.get('/api/visitor-log');
      console.log('got visits:', res.data);  // ← add this!
      setVisits(res.data);
    } catch (err) {
      console.error('Error fetching visits:', err);
    }
  };
  fetchVisits();
}, []);
  // Fetch tenant data and build rooms array (for occupancy statistics)
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
        // Filter rooms where the tenant's lease overlaps the selected range
        const initialFiltered = roomsData.filter((room) =>
          room.tenant && isLeaseActiveInRange(room.tenant, startDate, endDate)
        );
        setFilteredRooms(initialFiltered);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, [startDate, endDate]);

  // (Optional) Trigger manual filtering if needed
  const handleFilterData = () => {
    const newFiltered = rooms.filter((room) =>
      room.tenant && isLeaseActiveInRange(room.tenant, startDate, endDate)
    );
    setFilteredRooms(newFiltered);
  };

  // Revenue calculations using tenant data from filteredRooms
  // (If your revenue data should come from another source, adjust accordingly.)
  const revenueValue = filteredRooms.reduce((sum, room) => {
    if (room.isRented && room.tenant && room.tenant.rentAmount) {
      return sum + Number(room.tenant.rentAmount);
    }
    return sum;
  }, 0);

  const outstandingRent = filteredRooms.reduce((sum, room) => {
    if (
      room.isRented &&
      room.tenant &&
      room.tenant.paymentStatus === "Pending" &&
      room.tenant.rentAmount
    ) {
      return sum + Number(room.tenant.rentAmount);
    }
    return sum;
  }, 0);

  const collectedRent = revenueValue - outstandingRent;

  // Unit statistics based on the filtered rooms
  const totalUnits = 58; // 28 + 30 per your configuration
  const occupiedUnits = filteredRooms.length;
  const vacantUnits = totalUnits - occupiedUnits;

  // Define stats for the metrics cards
  const stats = filteredRooms.length > 0
    ? [
        { label: 'Revenue', value: `₱${revenueValue}`, icon: <CalendarTodayIcon /> },
        { label: 'Collected Rent', value: `₱${collectedRent}`, icon: <CalendarTodayIcon /> },
        { label: 'Outstanding Rent', value: `₱${outstandingRent}`, icon: <CalendarTodayIcon /> },
        { label: 'Total Units', value: totalUnits, icon: <CalendarTodayIcon /> },
        { label: 'Occupied Units', value: occupiedUnits, icon: <CalendarTodayIcon /> },
        { label: 'Vacant Units', value: vacantUnits, icon: <CalendarTodayIcon /> },
      ]
    : [];

  const handleRangeChange = (newStart, newEnd) => {
    if (newStart) setStartDate(newStart);
    if (newEnd) setEndDate(newEnd);
  };

  const onExport = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Revenue', revenueValue],
      ['Outstanding Rent', outstandingRent],
      ['Collected Rent', collectedRent],
      ['Occupied Units', occupiedUnits],
      ['Vacant Units', vacantUnits],
      ['Total Units', totalUnits],
    ];
    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'apartment_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to format date display
  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).toUpperCase();
  };

  return (
    <div className="bg-gray-100 min-h-screen w-full p-12 font-quicksand">
      {/* Main container */}
      <div className="max-w-7xl mx-auto bg-blue-50 p-12 rounded shadow-lg">
        <h1 className="text-8xl font-bold mb-8 text-center text-blue-900 tracking-wide font-quicksand mb:text-5xl tb:text-6xl">
          Apartment <span className="text-4xl font-bolder">Reports</span>
        </h1>

        {/* Report Buttons */}
        <div className="flex flex-wrap gap-1 mb-10 justify-center">
          <Link
            to="/reports"
            className={`${
              location.pathname === '/reports'
                ? 'bg-blue-400 text-blue-950'
                : 'hover:bg-blue-400'
            } bg-blue-300 text-blue-900 px-4 py-3 text-md font-bold tracking-widest rounded-full flex items-center justify-center font-quicksand`}
          >
            Revenue Reports <PaidIcon className="ml-2 text-2xl" />
          </Link>
          <Link
            to="/maintenanceReports"
            className={`${
              location.pathname === '/maintenanceReports'
                ? 'bg-blue-400 text-blue-950'
                : 'hover:bg-blue-400'
            } bg-blue-300 text-blue-900 px-4 py-3 text-md font-bold tracking-widest rounded-full flex items-center justify-center font-quicksand`}
          >
            Maintenance Reports <ConstructionIcon className="ml-2 text-2xl" />
          </Link>
          <Link
            to="/petReports"
            className={`${
              location.pathname === '/petReports'
                ? 'bg-blue-400 text-blue-950'
                : 'hover:bg-blue-400'
            } bg-blue-300 text-blue-900 px-4 py-3 text-md font-bold tracking-widest rounded-full flex items-center justify-center font-quicksand`}
          >
            Pet Reports <PetsIcon className="ml-2 text-2xl" />
          </Link>
        </div>

        {/* Date Selection Elements */}
        <div className="gap-1 mb-10">
          <div className="flex justify-center">
            {/* Start Date Calendar */}
            <div className="relative flex flex-col font-bold tracking-widest rounded-lg">
              <div
                className="border border-gray-200 rounded py-2 mb:px-2 mb:py-1 mb:text-sm px-6 bg-blue-300 text-lg text-blue-950 flex items-center cursor-pointer"
                onClick={() => setShowStartCalendar(!showStartCalendar)}
              >
                <CalendarTodayIcon className="mr-2 text-blue-950 mb:text-xs" />
                <span>{formatDate(startDate)}</span>
              </div>
              {showStartCalendar && (
                <div className="absolute z-10 bg-white rounded shadow-lg mt-2 text-blue-950">
                  <Calendar
                    date={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      setShowStartCalendar(false);
                    }}
                    color="#0ea5e9"
                  />
                </div>
              )}
            </div>
            {/* End Date Calendar */}
            <div className="relative flex flex-col font-bold tracking-widest rounded-lg">
              <div
                className="border border-gray-200 rounded py-2 mb:px-2 mb:py-1 mb:text-sm px-6 text-lg flex text-blue-950 items-center cursor-pointer bg-blue-300"
                onClick={() => setShowEndCalendar(!showEndCalendar)}
              >
                <CalendarTodayIcon className="mr-2" />
                <span>{formatDate(endDate)}</span>
              </div>
              {showEndCalendar && (
                <div className="absolute z-10 bg-white p-2 rounded shadow-lg mt-2">
                  <Calendar
                    date={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                      setShowEndCalendar(false);
                    }}
                    color="#0ea5e9"
                  />
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center">
            {/* Custom Range Selector */}
            <div className="flex mt-2 font-bold bg-blue-200 px-5 pt-3 mb:px-2 mb:py-2 mb:text-xs rounded-s-lg tracking-widest text-center">
              <h2 className="font-quicksand">SELECT DATE DURATION</h2>
            </div>
            <div className="flex flex-col font-bold pt-2 gap-1 tracking-widest">
              <div className="bg-blue-300">
                <RangeSelector
                  startDate={startDate}
                  endDate={endDate}
                  onChange={handleRangeChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Message if no filtered data */}
        {rooms.length > 0 && filteredRooms.length === 0 && (
          <div className="text-center text-red-500 mt-6">
            No data found for the selected date range.
          </div>
        )}

        {/* Metrics Cards */}
        {rooms.length > 0 && filteredRooms.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 pb-8 text-center font-quicksand">
              Filtered Revenue & Unit Reports
            </div>
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between">
                    <div className="flex justify-between items-center space-x-4 font-quicksand">
                      <h2 className="text-lg font-semibold text-gray-700">{stat.label}</h2>
                      <div className="bg-blue-100 p-2 rounded-full">{stat.icon}</div>
                    </div>
                    <p className="text-6xl font-bold text-blue-900 mt-4 p-8 pl-0 text-center font-quicksand tb:text-5xl">
                      {stat.value}
                    </p>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

<Box
  sx={{
    mt: 4,
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }}
>
  <Typography
    variant="h6"
    sx={{ color: 'primary.dark', fontWeight: 600 }}
  >
    Visitor Logs
  </Typography>

  <ButtonGroup size="small" variant="outlined">
    <Button
      onClick={() => setFilterMode('all')}
      variant={filterMode === 'all' ? 'contained' : 'outlined'}
    >
      All ({visits.length})
    </Button>
    <Button
      onClick={() => setFilterMode('today')}
      variant={filterMode === 'today' ? 'contained' : 'outlined'}
    >
      Today ({visits.filter(v => isToday(v.createdAt)).length})
    </Button>
  </ButtonGroup>
</Box>

<Paper
  elevation={4}
  sx={{ borderRadius: 2, overflow: 'hidden', mt: 2 }}
>
  <TableContainer sx={{ maxHeight: 360 }}>
    <Table stickyHeader size="small" aria-label="visitor logs">
      {/* table title */}
      <caption
        style={{
          captionSide: 'top',
          textAlign: 'center',
          padding: '12px',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#0D47A1'              // primary.dark
        }}
      >
        Visitor Logs
      </caption>

      

      <TableHead>
        <TableRow sx={{ backgroundColor: 'primary.main' }}>
          {['Name', 'Email', 'Page Visited', 'When'].map((heading) => (
            <TableCell
              key={heading}
              align="center"
              sx={{
                color: 'black',
                fontWeight: 700,
                textTransform: 'uppercase',
                fontSize: '0.85rem',
                borderBottom: 'none'
              }}
            >
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>

      <TableBody>
        {visits.map((v) => (
          <TableRow
            key={v._id}
            hover
            sx={{
              '&:nth-of-type(odd)': { backgroundColor: 'grey.100' },
              '&:last-child td, &:last-child th': { borderBottom: 'none' }
            }}
          >
            <TableCell align="center" sx={{ py: 1 }}>
              {v.name}
            </TableCell>
            <TableCell align="center" sx={{ py: 1 }}>
              {v.email}
            </TableCell>
            <TableCell align="center" sx={{ py: 1 }}>
              {v.page}
            </TableCell>
            <TableCell align="center" sx={{ py: 1 }}>
              {new Date(v.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>


        {/* Export Button */}
        <div className="flex justify-center my-10 mt-16">
          <button
            onClick={onExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg font-quicksand"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}

export default Reports;
