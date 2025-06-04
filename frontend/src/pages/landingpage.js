import React, { useState, useEffect } from 'react';
import logo from '../pages/apartment.png';
import {
  TextField,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Box,
  DialogActions
} from '@mui/material';
import SentimentVerySatisfiedTwoToneIcon from '@mui/icons-material/SentimentVerySatisfiedTwoTone';
import LoginIcon from '@mui/icons-material/Login';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HouseIcon from '@mui/icons-material/House';
import { useLogin } from '../Hook/useLogin';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';

// MessengerButton component
const MessengerButton = () => (
  <a
    href="https://m.me/645535708633228"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-4 right-4 flex items-center space-x-2 bg-blue-800 hover:bg-blue-600 text-white px-6 py-4 rounded-full shadow-lg transition-transform duration-300 transform hover:scale-105"
  >
    <MessageIcon className="w-10 h-10" />
  </a>
);

const LandingPage = () => {
  const { login, error, isLoading, savedEmail } = useLogin();
  const [email, setEmail] = useState(savedEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // visitor info state
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [nextPath, setNextPath] = useState(null);
  const [showVisitorDialog, setShowVisitorDialog] = useState(false);

  React.useEffect(() => {
    if (savedEmail) setEmail(savedEmail);
  }, [savedEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', email);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
    await login(email, password, rememberMe);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleRememberMeChange = (event) => {
    setRememberMe(event.target.checked);
  };

  const handleForgotPassword = () => {
    navigate('/reset-password');
  };

  const handleSignUp = () => {
    navigate('/signup');
  };

  // when visitor clicks virtual tour or available rooms
  const handleVisitClick = (path) => {
    setNextPath(path);
    setShowVisitorDialog(true);
  };

  // after visitor submits name/email
  const handleVisitorSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/visitor-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: visitorName,
          email: visitorEmail,
          page: nextPath
        })
      });
    } catch (err) {
      console.error('couldn’t record visitor', err);
    }
    setShowVisitorDialog(false);
    navigate(nextPath);
  };

  return (
    <>
      <div className="grid grid-cols-2 mb:grid-cols-1 tb:grid-cols-1">
        <div className="min-h-screen bg-slate-100 flex flex-col mb:-mb-28 tb:-mb-48">
          <h1 className="bg-slate-100 font-quicksand text-5xl pt-28 pl-36 text-start mb:text-3xl mb:pl-24 tb:text-4xl tb:pl-48">THE</h1>
          <h1 className="bg-slate-100 font-playfair text-6xl text-center font-black mb:text-4xl tb:text-6xl">PERFECT</h1>
          <h1 className="bg-slate-100 font-quicksand text-5xl text-end pr-24 mb:text-3xl mb:pr-24 tb:text-4xl tb:pr-44">HOME</h1>
          <h1 className="text-gray-950 font-black tracking-widest text-4xl pt-10 leading-9 bg-slate-100 pb-16 font-playfair text-center mb:text-3xl tb:4xl tb:px-20">
            <span className="text-blue-600 text-7xl mb:text-4xl tb:text-5xl">Vergara's</span>{' '}
            <span className="font-light">Apartment Management Complex</span>
          </h1>
          <div className="flex space-x-4 justify-center mb:px-2 ">
            <Button
              onClick={() => handleVisitClick('/virtualTour')}
              className="!inline-flex items-center !font-semibold !rounded-full !bg-gradient-to-r from-blue-500 to-blue-400 !hover:from-blue-600 !hover:to-blue-500 !text-blue-950 text-lg !transition-all duration-300 px-6 py-3 shadow-lg transform hover:scale-105 !focus:outline-none !focus:ring-2 focus:ring-blue-300 !font-quicksand mb:text-xs !p-3 "
            >
              <HouseIcon className="mr-3 text-blue-950" />
              Virtual Apartment Tour
            </Button>
            <Button
              onClick={() => handleVisitClick('/available-unit')}
              className="!inline-flex items-center !font-semibold !rounded-full !bg-gradient-to-r from-blue-500 to-blue-400 !hover:from-blue-600 !hover:to-blue-500 !text-blue-950 text-lg !transition-all duration-300 px-6 py-3 shadow-lg transform hover:scale-105 !focus:outline-none !focus:ring-2 focus:ring-blue-300 !font-quicksand mb:text-xs !p-3"
            >
              <ApartmentIcon className="mr-3 text-blue-950" />
              Available Rooms
            </Button>
          </div>
        </div>

        <div className="bg-slate-100 h-screen pt-10 pr-28 pl-28 pb-10 mb:pt-0 mb:pr-4 mb:pl-4 tb:pr-28 tb:pl-28 tb:-mt-60">
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-12 rounded-xl drop-shadow-lg mb:p-6">
              <div>
                <img src={logo} alt="Logo" className="h-14 w-14 rounded-full mb-10 drop-shadow-lg" />
              </div>
              <div>
                <h2 className="text-4xl font-bold tracking-wide pb-3 text-center font-playfair mb:text-xl">
                  Hello, Welcome Back! <SentimentVerySatisfiedTwoToneIcon className="text-yellow-500 !text-5xl" />
                </h2>
              </div>
              <div>
                <p className="text-sm tracking-wider font-thin pb-10 text-center font-quicksand mb:text-xs">
                  Log in to manage your lease, view payments, and stay updated with rental information.
                </p>
              </div>
              <div className="mb-10">
                <TextField
                  type="email"
                  label="Email"
                  variant="outlined"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full max-w-md text-black font-quicksand"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LoginIcon className="bg-slate-100 p-0.5 rounded-sm" style={{ color: 'black' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div>
                <TextField
                  label="Password"
                  variant="outlined"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full max-w-md text-black"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon className="bg-slate-100 p-0.5 rounded-sm" style={{ color: 'black' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="flex justify-between">
                <div className="flex items-center my-4 mb:my-2">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={handleRememberMeChange}
                        color="primary"
                      />
                    }
                    label={<span className="font-thin text-sm tracking-wider font-quicksand mb:text-xs">Remember Me</span>}
                  />
                </div>
                <div className="mb-4 mt-6">
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleForgotPassword}
                    className="!text-xs !text-blue-700 hover:!underline font-quicksand mb:text-xs"
                  >
                  </Button>
                </div>
              </div>
              <Button 
                type="submit"
                variant="contained" 
                color="primary" 
                className="w-full max-w-md !pt-3 !pb-3 !mb-3"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              {error && (
                <div className="font-quicksand text-sm text-red-500 text-center border rounded-lg border-red-500 p-1 mb-3 tracking-widest">
                  {error}
                </div>
              )}
              <div className="mt-6 flex justify-center font-quicksand">
                <p className="text-sm text-gray-600">
                  Don’t have an account?{' '}
                  <Button
                    disabled={isLoading}
                    variant="text"
                    onClick={handleSignUp}
                    sx={{
                      color: '#3B82F6',
                      fontFamily: 'quicksand',
                      textTransform: 'none',
                      padding: 0,
                      '&:hover': {
                        textDecoration: 'underline',
                        color: '#2563EB',
                      },
                    }}
                  >
                    Sign up
                  </Button>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Visitor info dialog */}
      <Dialog
  open={showVisitorDialog}
  onClose={() => setShowVisitorDialog(false)}
  maxWidth="xs"
  fullWidth
  PaperProps={{
    sx: {
      borderRadius: 2,
      p: 1,
      boxShadow: 4,
    }
  }}
>
  <DialogTitle sx={{ typography: 'h6', textAlign: 'center', pb: 0 }}>
    Almost there!
  </DialogTitle>

  <DialogContent sx={{ pt: 1, px: 3 }}>
    <DialogContentText 
      sx={{ 
        textAlign: 'center', 
        mb: 2, 
        color: 'text.secondary', 
        typography: 'body2' 
      }}
    >
      Just tell us who you are to continue.
    </DialogContentText>

    <Box component="form" id="visitor-form" onSubmit={handleVisitorSubmit} sx={{ display: 'grid', gap: 1.5 }}>
      <TextField
        label="Name"
        variant="outlined"
        size="small"
        fullWidth
        required
        value={visitorName}
        onChange={e => setVisitorName(e.target.value)}
      />
      <TextField
        label="Email"
        variant="outlined"
        size="small"
        type="email"
        fullWidth
        required
        value={visitorEmail}
        onChange={e => setVisitorEmail(e.target.value)}
      />
    </Box>
  </DialogContent>

  <DialogActions sx={{ justifyContent: 'center', pb: 2, px: 2 }}>
    <Button
      onClick={() => setShowVisitorDialog(false)}
      size="small"
      sx={{ textTransform: 'none' }}
    >
      Cancel
    </Button>
    <Button
      type="submit"
      form="visitor-form"
      variant="contained"
      size="small"
      sx={{ textTransform: 'none' }}
    >
      Continue
    </Button>
  </DialogActions>
</Dialog>

      {/* Messenger Chat Button */}
      <MessengerButton />
    </>
  );
};

export default LandingPage;
