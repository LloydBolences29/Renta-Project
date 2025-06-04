import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from '@mui/material';
import ApartmentIcon from '@mui/icons-material/Apartment';
import axios from 'axios';
import RoomCard from '../DashboardPages/roomcard';
import { Link } from 'react-router-dom';

const AvailRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');   // 'all' | 'available' | 'rented'
  const [filterFloor, setFilterFloor]   = useState('');      // '' or '1','2',...
  const [searchTerm, setSearchTerm]     = useState('');      // text to match in roomNumber

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const response = await axios.get('/api/tenants');
        const tenants = response.data;

        const allRooms = [
          { property: 'Lalaine', totalRooms: 28 },
          { property: 'Jade', totalRooms: 30 }
        ];

        const roomsData = allRooms.flatMap(building =>
          Array.from({ length: building.totalRooms }, (_, i) => {
            const floorNumber  = Math.floor(i / 10) + 1;
            const roomPosition = (i % 10) + 1;
            const roomNumber   = `${floorNumber}${String(roomPosition).padStart(2, '0')}`;
            const tenant = tenants.find(
              t =>
                t.roomNumber === roomNumber &&
                t.property.toLowerCase() === building.property.toLowerCase()
            );

            console.log(
              `Building: ${building.property}, Room: ${roomNumber}, Is Rented: ${!!tenant}`
            );

            return {
              roomNumber,
              isRented: !!tenant,
              property: building.property,
              tenant: tenant || null
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

  const handleBuildingClick = building => {
    setSelectedBuilding(prev => prev === building ? null : building);
    setFilterStatus('all');
    setFilterFloor('');
    setSearchTerm('');
  };

  // compute rooms of the selected building
  const forBuilding = rooms.filter(r => r.property === selectedBuilding);

  // apply status filter
  const byStatus = forBuilding.filter(room => {
    if (filterStatus === 'all')       return true;
    if (filterStatus === 'available') return !room.isRented;
    return room.isRented;  // 'rented'
  });

  // apply floor filter (roomNumber starts with floor digit)
  const byFloor = filterFloor
    ? byStatus.filter(r => r.roomNumber.startsWith(filterFloor))
    : byStatus;

  // apply search filter
  const displayedRooms = searchTerm
    ? byFloor.filter(r => r.roomNumber.includes(searchTerm))
    : byFloor;

  return (
    <Box className="px-16 py-8 bg-blue-50 min-h-screen w-full">
      <div className="text-center mb-10 mt-16">
        <h2 className="text-5xl font-bold font-playfair text-blue-800 tracking-widest">
          <span className="text-8xl block">Available</span> Units
        </h2>
      </div>

      <Grid container spacing={4} justifyContent="center">
        {['Lalaine', 'Jade'].map(building => {
          const totalRooms = rooms.filter(r => r.property === building).length;
          const availableRooms = rooms.filter(r => r.property === building && !r.isRented).length;

          return (
            <Grid item xs={12} sm={6} md={4} key={building}>
              <Card
                variant="outlined"
                sx={{
                  cursor: 'pointer',
                  backgroundColor: '#D8EEF8',
                  borderRadius: 5,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.4s, box-shadow 0.4s',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)'
                  }
                }}
                onClick={() => handleBuildingClick(building)}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <IconButton sx={{ fontSize: '3rem', color: '#3b82f6', mb: 2 }}>
                    <ApartmentIcon fontSize="inherit" />
                  </IconButton>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontFamily: 'quickplay',
                      letterSpacing: '2px',
                      color: '#1e3a8a'
                    }}
                  >
                    {building} Building
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', mt: 1 }}>
                    Total Rooms: {totalRooms}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', mb: 2 }}>
                    Available Rooms: {availableRooms}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 3,
                      backgroundColor: '#3b82f6',
                      color: '#fff',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      borderRadius: 2,
                      px: 4,
                      '&:hover': { backgroundColor: '#2563eb' }
                    }}
                  >
                    {selectedBuilding === building ? 'Hide Rooms' : 'View Rooms'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {selectedBuilding && (
        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#1e3a8a',
              fontWeight: 'bold',
              mb: 3,
              textAlign: 'center',
              letterSpacing: '1.5px'
            }}
          >
            {selectedBuilding} Building - Room Details
          </Typography>

          {/* ────── Filter controls ────── */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              justifyContent: 'center',
              mb: 4
            }}
          >
            <FormControl variant="outlined" size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="rented">Rented</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small">
              <InputLabel>Floor</InputLabel>
              <Select
                value={filterFloor}
                onChange={e => setFilterFloor(e.target.value)}
                label="Floor"
              >
                <MenuItem value="">All</MenuItem>
                {[...new Set(forBuilding.map(r => r.roomNumber.charAt(0)))]
                  .sort()
                  .map(f => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Search Room"
              placeholder="e.g. 102"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </Box>
          {/* ──────────────────────────────── */}

          <Grid container spacing={3} justifyContent="center">
            {displayedRooms.map(room => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={`${room.property}-${room.roomNumber}`}
              >
                <RoomCard
                  roomNumber={room.roomNumber}
                  isRented={room.isRented}
                  property={room.property}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AvailRoom;
