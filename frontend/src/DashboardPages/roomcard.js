// src/components/RoomCard.jsx
import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  Card,
  Box,
  CardContent,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress
} from '@mui/material';
import { Lock, LockOpen,  } from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuthContext } from '../Hook/useAuthHook';

const RoomCard = ({ roomNumber, isRented, property, tenant }) => {
  // Dialog state
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [openApplicationDialog, setOpenApplicationDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Application form state
  const [applicationData, setApplicationData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
  });
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const { user } = useAuthContext();

  // Anonymizers
  const anonymizeName = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((w) =>
        w.length <= 2
          ? w
          : w[0] + '*'.repeat(w.length - 2) + w[w.length - 1]
      )
      .join(' ');
  };
  const anonymizeEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!local || !domain) return email;
    const visible = 2;
    return (
      local.slice(0, visible) +
      '*'.repeat(local.length - visible) +
      '@' +
      domain
    );
  };
  const anonymizePhone = (phone) => {
    if (!phone) return '';
    if (phone.length <= 4) return phone;
    return phone.slice(0, 3) + '*'.repeat(phone.length - 4) + phone.slice(-1);
  };

  // Handlers
  const handleOpenTenantDialog = () => setOpenTenantDialog(true);
  const handleCloseTenantDialog = () => setOpenTenantDialog(false);
  const handleOpenRoomDialog = () => setOpenRoomDialog(true);
  const handleCloseRoomDialog = () => setOpenRoomDialog(false);
  const handleOpenApplicationDialog = () => setOpenApplicationDialog(true);
  const handleCloseApplicationDialog = () => setOpenApplicationDialog(false);

  const handleSubmitApplication = async () => {
       // start spinner
       setIsSubmitting(true);
    
        // 1️⃣ require CAPTCHA
        if (!recaptchaToken) {
         setIsSubmitting(false);
          return alert('Please complete the CAPTCHA before submitting.');
        }
    
        try {
          await axios.post('/api/apply', {
            building: property,
            roomNumber,
            fullName: applicationData.fullName,
            email: applicationData.email,
            contactNumber: applicationData.contactNumber,
            recaptchaToken,
          });
    
          // reset form & captcha
          setApplicationData({ fullName: '', email: '', contactNumber: '' });
          setRecaptchaToken(null);
          handleCloseApplicationDialog();
          setOpenSuccessDialog(true);
        } catch (error) {
          console.error('Error submitting application:', error);
          alert('Error submitting application. Please try again later.');
        } finally {
         // stop spinner
          setIsSubmitting(false);
        }
      };

  const formattedLeaseStart = tenant?.leaseStartDate
    ? format(new Date(tenant.leaseStartDate), 'yyyy-MM-dd')
    : 'N/A';
  const formattedLeaseEnd = tenant?.leaseEndDate
    ? format(new Date(tenant.leaseEndDate), 'yyyy-MM-dd')
    : 'N/A';

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          maxWidth: 350,
          backgroundColor: 'FFF1DB',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s',
          '&:hover': { transform: 'scale(1.02)' },
          marginBottom: 2,
        }}
        className="mb:max-w-full tb:max-w-[90%]"
      >
        <CardContent
          sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color:
                property === 'Lalaine'
                  ? '#4C4B16'
                  : property === 'Jade'
                  ? '#091057'
                  : 'default',
              textAlign: 'center',
              marginBottom: 1,
              fontFamily: 'quickplay',
              letterSpacing: '2px',
            }}
            className="mb:text-lg tb:text-xl"
          >
            {property} Building
          </Typography>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 500,
              color:
                property === 'Lalaine'
                  ? '#4C4B16'
                  : property === 'Jade'
                  ? '#091057'
                  : 'default',
              textAlign: 'center',
              marginBottom: 1,
              fontFamily: 'quickplay',
              letterSpacing: '2px',
              fontSize: '1.2rem',
            }}
            className="mb:text-base tb:text-lg"
          >
            Room {roomNumber}
          </Typography>

          <IconButton
            sx={{
              backgroundColor: isRented ? 'error.light' : 'success.light',
              color: '#fff',
              width: '60px',
              height: '60px',
              '&:hover': {
                backgroundColor: isRented ? 'error.main' : 'success.main',
              },
            }}
          >
            {isRented ? (
              <Lock sx={{ fontSize: 40 }} />
            ) : (
              <LockOpen sx={{ fontSize: 40 }} />
            )}
          </IconButton>
          <Typography
            sx={{
              mt: 1,
              mb: 2,
              color: isRented ? '#C62E2E' : '#337357',
              textTransform: 'uppercase',
              fontSize: '1rem',
              letterSpacing: '2px',
              fontWeight: 600,
              backgroundColor: isRented ? '#FF8F8F' : '#B6FFA1',
              pt: '5px',
              pb: '5px',
              pr: '5px',
              pl: '5px',
              borderRadius: '15px',
            }}
            className="mb:text-sm tb:text-base"
          >
            {isRented ? 'Rented' : 'Available'}
          </Typography>

          <Box
            className="flex mb:flex-col tb:flex-row mb:items-center tb:items-center mb:gap-2 tb:gap-4"
            sx={{ width: '100%', justifyContent: 'center' }}
          >
            {isRented ? (
              <Button
                variant="outlined"
                sx={{
                  mt: 1,
                  mr: 1,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '.8rem',
                  letterSpacing: '1px',
                }}
                onClick={handleOpenTenantDialog}
                className="mb:w-full tb:w-auto"
              >
                Tenant Info
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={{
                  mt: 1,
                  mr: 1,
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '.8rem',
                  letterSpacing: '1px',
                }}
                onClick={handleOpenApplicationDialog}
                className="mb:w-full tb:w-auto"
              >
                Apply now
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{
                mt: 1,
                mr: 1,
                backgroundColor: '#3b82f6',
                color: 'white',
                fontWeight: 500,
                fontSize: '.8rem',
                letterSpacing: '1px',
              }}
              onClick={handleOpenRoomDialog}
              className="mb:w-full tb:w-auto"
            >
              Rental Terms
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Application Dialog */}
      <Dialog
    open={openApplicationDialog}
    onClose={handleCloseApplicationDialog}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: '16px',
        p: 3,
        backgroundColor: '#fff',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      },
    }}
  >
    <DialogTitle
      sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', mb: 2 }}
      className="mb:text-lg tb:text-xl"
    >
      Apply for Room {roomNumber} in {property} Building
    </DialogTitle>

    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        autoFocus
        label="Full Name"
        type="text"
        fullWidth
        variant="outlined"
        value={applicationData.fullName}
        onChange={(e) =>
          setApplicationData({ ...applicationData, fullName: e.target.value })
        }
      />
      <TextField
        label="Email Address"
        type="email"
        fullWidth
        variant="outlined"
        value={applicationData.email}
        onChange={(e) =>
          setApplicationData({ ...applicationData, email: e.target.value })
        }
      />
      <TextField
        label="Contact Number"
        type="tel"
        fullWidth
        variant="outlined"
        value={applicationData.contactNumber}
        onChange={(e) =>
          setApplicationData({ ...applicationData, contactNumber: e.target.value })
        }
      />

      {/* reCAPTCHA Widget */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <ReCAPTCHA
          sitekey="6LfKWCcrAAAAAD0QjbVGb6ArOAcVtTdmYsBNZCMx"
          onChange={token => setRecaptchaToken(token)}
        />
      </Box>
    </DialogContent>

    <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
      <Button
        variant="contained"
        onClick={handleSubmitApplication}
        disabled={isSubmitting}
        sx={{
          backgroundColor: '#3b82f6',
          color: 'white',
          px: 4,
          py: 1.5,
          borderRadius: '8px',
          fontWeight: 600,
        }}
        className="mb:text-sm tb:text-base"
      >
        {isSubmitting
          ? <CircularProgress size={20} color="inherit" />
          : 'Apply this Room'}
      </Button>
    </DialogActions>
  </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={() => setOpenSuccessDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            p: 3,
            backgroundColor: '#fff',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center', mb: 2 }}
          className="mb:text-lg tb:text-xl"
        >
          Application Submitted!
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
            We will contact you once the application is approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => setOpenSuccessDialog(false)}
            sx={{
              backgroundColor: '#3b82f6',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: '8px',
              fontWeight: 600,
            }}
            className="mb:text-sm tb:text-base"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Info Dialog */}
      <Dialog
        open={openTenantDialog}
        onClose={handleCloseTenantDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 3,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            backgroundColor: '#FEF9F2',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '3rem',
            fontWeight: '600',
            textAlign: 'center',
            color: '#0C1844',
            fontFamily: 'Playfair Display',
            mb: 1,
            letterSpacing: '1px',
          }}
          className="mb:text-2xl tb:text-3xl"
        >
          Tenant Information
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {isRented && tenant ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                p: 2,
                borderRadius: '12px',
                backgroundColor: '#B9E5E8',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Name:</strong>{' '}
                {user?.role === 'tenant'
                  ? anonymizeName(tenant.name)
                  : tenant.name}
              </DialogContentText>
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Email:</strong>{' '}
                {user?.role === 'tenant'
                  ? anonymizeEmail(tenant.email)
                  : tenant.email}
              </DialogContentText>
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Phone:</strong>{' '}
                {user?.role === 'tenant'
                  ? anonymizePhone(tenant.phone)
                  : tenant.phone}
              </DialogContentText>
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Lease Start:</strong> {formattedLeaseStart}
              </DialogContentText>
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Lease End:</strong> {formattedLeaseEnd}
              </DialogContentText>
              <DialogContentText
                sx={{
                  fontSize: '1.1rem',
                  color: '#0C1844',
                  fontWeight: '500',
                  letterSpacing: '2px',
                }}
              >
                <strong>Rent Amount:</strong> ₱{tenant.rentAmount}
              </DialogContentText>
            </Box>
          ) : (
            <DialogContentText
              sx={{
                fontSize: '1.2rem',
                fontWeight: '500',
                color: '#777',
                textAlign: 'center',
              }}
            >
              No tenant information available.
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseTenantDialog}
            sx={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              px: 3,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
            className="mb:text-sm tb:text-base"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Room Info Dialog */}
      <Dialog
        open={openRoomDialog}
        onClose={handleCloseRoomDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 3,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
            backgroundColor: '#FEF9F2',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '2rem',
            fontWeight: '600',
            textAlign: 'center',
            color: '#0C1844',
            fontFamily: 'Playfair Display',
            letterSpacing: '1px',
            mb: 1,
          }}
          className="mb:text-xl tb:text-2xl"
        >
          Terms and Conditions
        </DialogTitle>
        <DialogContent
          sx={{ maxHeight: '400px', overflowY: 'auto', py: 2 }}
          className="mb:py-2 tb:py-3"
        >
          <Typography
            variant="body1"
            sx={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#333', mb: 2 }}
          >
            1. <strong>Lease Agreement:</strong> The tenant agrees to occupy the leased premises…
            {/* …rest of your terms */}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseRoomDialog}
            sx={{
              backgroundColor: '#3b82f6',
              color: '#fff',
              textTransform: 'none',
              fontWeight: '600',
              fontSize: '1rem',
              px: 3,
              py: 1,
              borderRadius: '10px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
            }}
            className="mb:text-sm tb:text-base"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoomCard;
