import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { Box, Grid } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaidIcon from '@mui/icons-material/Paid';
import PetsIcon from '@mui/icons-material/Pets';
import { Calendar } from 'react-date-range';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// RangeSelector component (all font classes changed to font-quicksand)
const RangeSelector = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('Today');
  const [showRangeCalendar, setShowRangeCalendar] = useState(false);
  const [range, setRange] = useState({
    startDate: startDate,
    endDate: endDate,
    key: 'selection',
  });
  const containerRef = useRef(null);

  const options = [
    'Today',
    'Last Day',
    'This Week',
    'Last Week',
    'This Month',
    'Date Range',
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
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
    const today = new Date();
    switch (option) {
      case 'Today':
        newStart = today;
        newEnd = today;
        break;
      case 'Last Day':
        newStart = new Date(today.setDate(today.getDate() - 1));
        newEnd = new Date(today);
        break;
      case 'This Week': {
        const start = new Date();
        start.setDate(today.getDate() - today.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        newStart = start;
        newEnd = end;
        break;
      }
      case 'Last Week': {
        const start = new Date();
        start.setDate(today.getDate() - today.getDay() - 7);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        newStart = start;
        newEnd = end;
        break;
      }
      case 'This Month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        newStart = start;
        newEnd = end;
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
    <div className="relative font-quicksand" ref={containerRef}>
      <div
        className="border border-gray-300 rounded px-3 py-2 mb:text-sm text-lg flex items-center cursor-pointer font-quicksand"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CalendarTodayIcon className="mr-2" />
        <span>{formatDisplay().toUpperCase()}</span>
        <ExpandMoreIcon className="text-black" />
      </div>
      {isOpen && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 font-quicksand">
          {options.map((option) => (
            <div
              key={option}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelectOption(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      {showRangeCalendar && (
        <div className="absolute mt-2 bg-white border border-gray-300 rounded shadow-lg z-10 p-2 font-quicksand">
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

function MaintenanceReports() {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [errorRequests, setErrorRequests] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/request');
        setMaintenanceRequests(response.data);
        const initialFiltered = response.data.filter((req) => {
          if (req.createdAt) {
            const reqDate = new Date(req.createdAt);
            return reqDate >= startDate && reqDate <= endDate;
          }
          return false;
        });
        setFilteredRequests(initialFiltered);
      } catch (err) {
        setErrorRequests(err.response?.data || 'Error fetching requests');
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [startDate, endDate]);

  const handleRangeChange = (newStart, newEnd) => {
    if (newStart) setStartDate(newStart);
    if (newEnd) setEndDate(newEnd);
  };

  const onExport = () => {
    const csvRows = [
      ['Metric', 'Value'],
      ['Total Maintenance Requests', filteredRequests.length],
      ['Pending', filteredRequests.filter(req => req.status === "pending").length],
      ['In-progress', filteredRequests.filter(req => req.status === "in-progress").length],
      ['Completed', filteredRequests.filter(req => req.status === "completed").length],
    ];
    const csvContent = csvRows.map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'maintenance_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options).toUpperCase();
  };

  // Maintenance stats
  const pendingRequests = filteredRequests.filter(req => req.status === "pending").length;
  const inProgressRequests = filteredRequests.filter(req => req.status === "in-progress").length;
  const completedRequests = filteredRequests.filter(req => req.status === "completed").length;
  const maintenanceStatusStats = filteredRequests.length > 0 ? [
    { label: "Total Maintenance Requests", value: filteredRequests.length, icon: <ConstructionIcon />, labelClass: "text-red-500" },
    { label: "Pending", value: pendingRequests, icon: <ConstructionIcon />, labelClass: "text-yellow-500" },
    { label: "In-progress", value: inProgressRequests, icon: <ConstructionIcon />, labelClass: "text-blue-500" },
    { label: "Completed", value: completedRequests, icon: <ConstructionIcon />, labelClass: "text-green-500" },
  ] : [];

  return (
    <div className="bg-gray-100 min-h-screen w-full p-12 font-quicksand">
      <div className="max-w-7xl mx-auto bg-blue-50 p-12 rounded shadow-lg">
        <h1 className="text-8xl font-bold mb-8 text-center text-blue-900 tracking-wide font-quicksand mb:text-5xl tb:text-6xl mb:px-20">
          Maintenance <span className="text-4xl font-quicksand">Reports</span>
        </h1>

        {/* Navigation Buttons */}
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

        {/* Three Bordered Elements for Date Selection */}
        <div className="gap-1 mb-10 font-quicksand">
          <div className="flex justify-center">
            {/* Start Date Calendar */}
            <div className="relative flex flex-col font-bold tracking-widest rounded-lg">
              <div
                className="border border-gray-200 rounded py-2 mb:px-2 mb:py-1 mb:text-sm px-6 bg-blue-300 text-lg text-blue-950 flex items-center cursor-pointer font-quicksand"
                onClick={() => setShowStartCalendar(!showStartCalendar)}
              >
                <CalendarTodayIcon className="mr-2 text-blue-950 mb:text-xs" />
                <span>{formatDate(startDate)}</span>
              </div>
              {showStartCalendar && (
                <div className="absolute z-10 bg-white rounded shadow-lg mt-2 text-blue-950 font-quicksand">
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
                className="border border-gray-200 rounded py-2 mb:px-2 mb:py-1 mb:text-sm px-6 text-lg flex text-blue-950 items-center cursor-pointer bg-blue-300 font-quicksand"
                onClick={() => setShowEndCalendar(!showEndCalendar)}
              >
                <CalendarTodayIcon className="mr-2" />
                <span>{formatDate(endDate)}</span>
              </div>
              {showEndCalendar && (
                <div className="absolute z-10 bg-white p-2 rounded shadow-lg mt-2 font-quicksand">
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
            <div className="flex mt-2 font-bold bg-blue-200 px-5 pt-3 mb:px-2 mb:py-2 mb:text-xs rounded-s-lg tracking-widest text-center font-quicksand">
              <h2 className="font-quicksand">
                SELECT DATE DURATION
              </h2>
            </div>
            <div className="flex flex-col font-bold pt-2 gap-1 tracking-widest font-quicksand">
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

        {/* Conditional Message if no data */}
        {maintenanceRequests.length > 0 && filteredRequests.length === 0 && (
          <div className="text-center text-red-500 mt-6 font-quicksand">
            No maintenance requests found for the selected date range.
          </div>
        )}

        {/* Maintenance Stats */}
        {loadingRequests ? (
          <div className="text-center text-xl text-blue-900 font-quicksand">
            Loading maintenance requests...
          </div>
        ) : errorRequests ? (
          <div className="text-center text-xl text-red-500 font-quicksand">
            {errorRequests}
          </div>
        ) : filteredRequests.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <div className="text-blue-900 font-medium tracking-widest text-2xl pt-8 leading-9 pb-8 font-quicksand text-center">
              Filtered Maintenance Request and their Status
            </div>
            <Grid container spacing={4}>
              {maintenanceStatusStats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <div className="bg-white shadow-lg rounded-lg p-6 pb-8 pt-4 h-full flex flex-col justify-between font-quicksand">
                    <div className="flex justify-between items-center space-x-4 font-quicksand">
                      <h2 className={`text-lg font-semibold ${stat.labelClass} font-quicksand`}>
                        {stat.label}
                      </h2>
                      <div className="bg-blue-100 p-2 rounded-full font-quicksand">
                        {stat.icon}
                      </div>
                    </div>
                    <p className="text-7xl font-bold  text-blue-900 mt-4 p-8 pl-0 text-center font-quicksand tb:text-5xl">
                      {stat.value}
                    </p>
                  </div>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

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

export default MaintenanceReports;
