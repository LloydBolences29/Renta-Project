import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  IconButton,
  Avatar,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  PeopleAlt as PeopleAltIcon,
  Home as HomeIcon,
  BarChart as BarChartIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Construction as ConstructionIcon,
  Pets as PetsIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Person2Icon from '@mui/icons-material/Person2';
import ArticleIcon from '@mui/icons-material/Article';
import PaymentIcon from '@mui/icons-material/Payment';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../Hook/useAuthHook';
import { useLogout } from '../Hook/useLogout';

const drawerWidthOpen = 240;
const drawerWidthClosed = 70;

const DashboardLayout = ({ children }) => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile detection (up to 767px)
  const isMobile = useMediaQuery('(max-width:767px)');
  // Tablet detection (768px to 1023px)
  const isTablet = useMediaQuery('(min-width:768px) and (max-width:1023px)');
  // Combine mobile and tablet conditions
  const isMobileOrTablet = isMobile || isTablet;

  // Start drawer closed on mobile/tablet so the hamburger is used to open it.
  const [drawerOpen, setDrawerOpen] = useState(isMobileOrTablet ? false : true);
  const [profileImage, setProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  // Set active nav to '/dashboard' for admin and '/home' for tenants
  const [activeNav, setActiveNav] = useState(user?.role === 'admin' ? '/dashboard' : '/home');

  const handleNavClick = (path) => {
    setActiveNav(path);
    navigate(path);
    if (isMobileOrTablet) setDrawerOpen(false);
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    const storedImage = localStorage.getItem(`avatar-${user?.email}`);
    if (storedImage) setProfileImage(storedImage);
  }, [user]);

  // On initial mount, if the tenant lands on "/" then redirect to "/home"
  useEffect(() => {
    if (user && user.role === 'tenant' && location.pathname === '/dashboard') {
      navigate('/home', { replace: true });
      setActiveNav('/home');
    }
  }, [user, location.pathname, navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result;
        setProfileImage(base64Image);
        localStorage.setItem(`avatar-${user.email}`, base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = () => fileInputRef.current.click();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Hamburger menu for mobile/tablet: visible only when drawer is closed */}
      {isMobileOrTablet && !drawerOpen && (
        <IconButton
          onClick={toggleDrawer}
          sx={{
            position: 'fixed',
            top: 10,
            left: 10,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
        >
          <MenuIcon sx={{ color: '#243642', fontSize: 32 }} />
        </IconButton>
      )}

      {/* Sidebar / Drawer */}
      <Drawer
        variant={isMobileOrTablet ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={toggleDrawer}
        sx={{
          width: drawerOpen ? drawerWidthOpen : drawerWidthClosed,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidthOpen : drawerWidthClosed,
            transition: 'width 0.3s ease',
            backgroundColor: '#F9F9F9',
            borderRight: '1px solid rgba(0,0,0,0.12)',
            boxShadow: 3,
          },
        }}
      >
        <List>
          {/* Drawer Header */}
          <ListItem
            button
            sx={{
              justifyContent: 'space-between',
              mb: 3,
              px: 2,
            }}
          >
            {drawerOpen && (
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'quicksand',
                  fontWeight: 'bold',
                  color: '#243642',
                }}
              >
                MENU
              </Typography>
            )}
            <IconButton onClick={toggleDrawer}>
              {drawerOpen ? (
                <ChevronLeftIcon sx={{ color: '#243642', fontSize: 32 }} />
              ) : (
                <MenuIcon sx={{ color: '#243642', fontSize: 32 }} />
              )}
            </IconButton>
          </ListItem>

          {/* Profile Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              px: 2,
            }}
          >
            <IconButton onClick={openFilePicker}>
              <Avatar
                sx={{
                  bgcolor: '#243642',
                  width: drawerOpen ? 64 : 35,
                  height: drawerOpen ? 64 : 35,
                  transition: 'all 0.3s',
                }}
                src={profileImage}
              >
                {!profileImage && (user?.email?.charAt(0).toUpperCase() || '?')}
              </Avatar>
            </IconButton>
            {drawerOpen && (
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  textAlign: 'center',
                  fontFamily: 'quicksand',
                  fontWeight: 600,
                  color: '#243642',
                  wordBreak: 'break-word',
                }}
              >
                {user?.email || 'Unknown User'}
              </Typography>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </Box>

          {/* Navigation Items */}
          {user?.role === 'tenant' && (
            <ListItem
              button
              onClick={() => handleNavClick('/home')}
              sx={{
                borderLeft: activeNav === '/home' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/home' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  HOME
                </Typography>
              )}
            </ListItem>
          )}

          {user?.role === 'admin' && (
            <ListItem
              button
              onClick={() => handleNavClick('/dashboard')}
              sx={{
                borderLeft: activeNav === '/dashboard' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/dashboard' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  DASHBOARD
                </Typography>
              )}
            </ListItem>
          )}

          {user?.role === 'admin' && (
            <ListItem
              button
              onClick={() => handleNavClick('/tenants')}
              sx={{
                borderLeft: activeNav === '/tenants' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/tenants' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <PeopleAltIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  TENANTS
                </Typography>
              )}
            </ListItem>
          )}

          {user?.role === 'tenant' && (
            <ListItem
              button
              onClick={() => handleNavClick('/pay')}
              sx={{
                borderLeft: activeNav === '/pay' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/pay' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <PaymentIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  PAY RENT
                </Typography>
              )}
            </ListItem>
          )}

          {user?.role === 'tenant' && (
            <ListItem
              button
              onClick={() => handleNavClick('/statement')}
              sx={{
                borderLeft: activeNav === '/statement' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/statement' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <ArticleIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  STATEMENT
                </Typography>
              )}
            </ListItem>
          )}

          <ListItem
            button
            onClick={() => handleNavClick('/units')}
            sx={{
              borderLeft: activeNav === '/units' ? '4px solid #243642' : 'none',
              backgroundColor: activeNav === '/units' ? 'rgba(33,150,243,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
              py: 1,
              px: 2,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <HomeIcon sx={{ color: '#243642', fontSize: 28 }} />
            </ListItemIcon>
            {drawerOpen && (
              <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                UNITS
              </Typography>
            )}
          </ListItem>

          <ListItem
            button
            onClick={() => handleNavClick('/maintenance')}
            sx={{
              borderLeft: activeNav === '/maintenance' ? '4px solid #243642' : 'none',
              backgroundColor: activeNav === '/maintenance' ? 'rgba(33,150,243,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
              py: 1,
              px: 2,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <ConstructionIcon sx={{ color: '#243642', fontSize: 28 }} />
            </ListItemIcon>
            {drawerOpen && (
              <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                MAINTENANCE
              </Typography>
            )}
          </ListItem>

          <ListItem
            button
            onClick={() => handleNavClick('/pets')}
            sx={{
              borderLeft: activeNav === '/pets' ? '4px solid #243642' : 'none',
              backgroundColor: activeNav === '/pets' ? 'rgba(33,150,243,0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
              py: 1,
              px: 2,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <PetsIcon sx={{ color: '#243642', fontSize: 28 }} />
            </ListItemIcon>
            {drawerOpen && (
              <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                PET REGISTRATION
              </Typography>
            )}
          </ListItem>

          {user?.role === 'admin' && (
            <ListItem
              button
              onClick={() => handleNavClick('/reports')}
              sx={{
                borderLeft: activeNav === '/reports' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/reports' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 3,
              }}
            >
              <ListItemIcon>
                <BarChartIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  REPORTS
                </Typography>
              )}
            </ListItem>
          )}

          {/* OTHER Section */}
          {drawerOpen && (
            <Typography
              variant="caption"
              sx={{
                ml: 2,
                mb: 1,
                fontFamily: 'quicksand',
                fontWeight: 600,
                color: '#666',
                textTransform: 'uppercase',
              }}
            >
              Other
            </Typography>
          )}

          {user?.role === 'admin' && (
            <ListItem
              button
              onClick={() => handleNavClick('/admin')}
              sx={{
                borderLeft: activeNav === '/admin' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/admin' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <AdminPanelSettingsIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  ADMIN
                </Typography>
              )}
            </ListItem>
          )}
                    {user?.role === 'tenant'  && (
            <ListItem
              button
              onClick={() => handleNavClick('/profile')}
              sx={{
                borderLeft: activeNav === '/profile' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/profile' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <Person2Icon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  PROFILE
                </Typography>
              )}
            </ListItem>
          )}

          {user?.role === 'admin' && (
            <ListItem
              button
              onClick={() => handleNavClick('/adminCalendar')}
              sx={{
                borderLeft: activeNav === '/adminCalendar' ? '4px solid #243642' : 'none',
                backgroundColor: activeNav === '/adminCalendar' ? 'rgba(33,150,243,0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
                py: 1,
                px: 2,
                mb: 1,
              }}
            >
              <ListItemIcon>
                <CalendarMonthIcon sx={{ color: '#243642', fontSize: 28 }} />
              </ListItemIcon>
              {drawerOpen && (
                <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                  ADMIN CALENDAR
                </Typography>
              )}
            </ListItem>
          )}

          <ListItem
            button
            onClick={handleLogout}
            sx={{
              py: 1,
              px: 2,
              '&:hover': { backgroundColor: 'rgba(33,150,243,0.15)' },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: '#243642', fontSize: 28 }} />
            </ListItemIcon>
            {drawerOpen && (
              <Typography variant="subtitle1" sx={{ fontFamily: 'quicksand', fontWeight: 600 }}>
                LOGOUT
              </Typography>
            )}
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
