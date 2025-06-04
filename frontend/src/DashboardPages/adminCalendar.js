// src/pages/AdminCalendarPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Typography } from '@mui/material';

const localizer = momentLocalizer(moment);

// Custom event component to style event labels differently based on type
const CustomEvent = ({ event }) => {
  if (event.type === 'maintenance') {
    return (
      <div className="bg-blue-100 text-blue-800 p-1 rounded shadow-sm">
        <span className="text-xs font-bold">{event.title}</span>
      </div>
    );
  }
  // Default style for tenant due events
  return (
    <div className="bg-red-100 text-red-800 p-1 rounded shadow-sm">
      <span className="text-xs font-bold">{event.title}</span>
    </div>
  );
};

function AdminCalendarPage() {
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [events, setEvents] = useState([]);

  // Fetch tenant data and store as rooms
  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await axios.get('/api/tenants');
        const tenants = response.data;
        // Map each tenant to a room object
        const roomsData = tenants.map(tenant => ({
          isRented: true,
          tenant,
        }));
        setRooms(roomsData);
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      }
    };

    fetchTenantData();
  }, []);

  // Fetch maintenance requests data from API
  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      try {
        const response = await axios.get('/api/request');
        setMaintenanceRequests(response.data);
      } catch (error) {
        console.error('Error fetching maintenance requests:', error);
      }
    };

    fetchMaintenanceRequests();
  }, []);

  // Generate events for tenant due dates and maintenance preferred dates
  useEffect(() => {
    // Tenant Due Date Events
    const dueDateEvents = rooms
      .filter(room => room.isRented && room.tenant && room.tenant.leaseEndDate)
      .map(room => ({
        title: `Due: ${room.tenant.name} (${room.tenant.roomNumber}) - ${room.tenant.property}`,
        start: new Date(room.tenant.leaseEndDate),
        end: new Date(room.tenant.leaseEndDate),
        type: 'tenant',
      }));

    // Maintenance Request Events – show tenant name, building, and room number if available
    const maintenanceEvents = maintenanceRequests
      .filter(req => req.preferredDate)
      .map(req => ({
        title: req.tenantName && req.roomNumber && req.property
          ? `Maintenance: ${req.tenantName} (${req.roomNumber}) - ${req.property}`
          : req.description || 'Maintenance Request',
        start: new Date(req.preferredDate),
        end: new Date(req.preferredDate),
        type: 'maintenance',
      }));

    setEvents([...dueDateEvents, ...maintenanceEvents]);
  }, [rooms, maintenanceRequests]);

  return (
    <div className="h-screen w-full flex flex-col bg-white p-10">
      <header className="p-4 text-black text-center">
        <h1 className="text-4xl font-bold font-quicksand">Admin Calendar</h1>
      </header>
      <main className="flex-1 overflow-hidden font-quicksand font-bold">
        <div className="h-full">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            popup
            style={{ height: '100%' }}
            components={{ event: CustomEvent }}
          />
        </div>
      </main>
    </div>
  );
}

export default AdminCalendarPage;
