import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Checkbox, FormControlLabel, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import logo from '../pages/apartment.png';
import { Box } from '@mui/material';
import { useSignup } from "../Hook/useSignup";

const SignupPage = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState(false);
  const [role, setRole] = useState('tenant');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { error, isLoading, signup } = useSignup();
  const [termError, setTermError] = useState('');

  const handleRoleChange = (event) => {
    setRole(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // 1. Make sure they've agreed to T&C
    if (!term) {
      setTermError("You must agree to the Terms and Conditions to proceed.");
      return;
    }
    setTermError("");
  
    // 2. Try signing up (this returns true on success, false on error)
    const success = await signup(name, email, password, role);
  
    // 3. On success, always go to /home

    if (success) {
      navigate("/home", { replace: true });
    }
    // If it failed (e.g. “Email already in use”), your `error` message will show below
  };

  const handleTermAndCondition = (event) => {
    setTerm(event.target.checked);
  };

  return (
    <div className="bg-slate-50">
      <div className="grid grid-cols-2 p-24">
        <div className="bg-white p-3 shadow-2xl">
          <Box
            sx={{
              minHeight: '80vh',
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(/svg/bg.jpg)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '15px'
            }}
          >
            <div className="pt-5">
              <Link to="/" className="text-white font-quicksand font-thin text-xs tracking-widest border border-solid border-white-500 p-2 ml-3 pr-5 pl-5 rounded-3xl hover:bg-slate-200 hover:text-slate-950 transition-all">
                Back to Homepage
              </Link>
            </div>
            <div className="font-quicksand font-bold text-white text-4xl tracking-widest pt-32 pr-10 pl-20 text-start">
              <h1 className="text-green-300 font-playfair text-5xl mb-5">Sign up now</h1>
              <h1>MANAGE YOUR <span className="text-red-600">LEASE</span>.</h1>
              <h1>VIEW <span className="text-red-600">PAYMENTS</span>.</h1>
              <h1>STAY UPDATED WITH <span className="text-red-600">RENTAL INFORMATION</span>.</h1>
            </div>
          </Box>
        </div>
        <div className="pt-10 pr-24 pl-24 pb-10 shadow-xl bg-gradient-to-r from-slate-50 to-blue-100">
          <form className="h-full" onSubmit={handleSubmit}>
            <div className="flex justify-between">
              <h1 className="text-7xl font-playfair tracking-widest font-bold mb-8">Get Started</h1>
              <img src={logo} alt="Logo" className="h-14 w-14 rounded-full mb-10 drop-shadow-lg" />
            </div>
            <div className="flex gap-6">
              <div className="mb-6 w-80">
                <TextField
                  label="Name"
                  variant="outlined"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full max-w-md text-black font-quicksand !bg-slate-50"
                />
              </div>
              <div className="mb-6">
                <FormControl fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={role}
                    label="Role"
                    className="bg-white"
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="admin" disabled>Admin</MenuItem>
                    <MenuItem value="tenant">Tenant</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="mb-6">
              <TextField
                type="email"
                label="Email"
                variant="outlined"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full max-w-md text-black font-quicksand !bg-slate-50"
              />
            </div>
            <div className="mb-6">
              <TextField
                type="password"
                label="Password"
                variant="outlined"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full max-w-md text-black font-quicksand !bg-slate-50"
              />
            </div>
            <div className='flex justify-between'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={term}
                    onChange={handleTermAndCondition}
                    color="primary"
                  />
                }
                label={
                  <span className="font-thin text-sm tracking-wider font-quicksand">
                    I agree to{" "}
                    <span>
                      <Link to='/termAndCondition' className="text-sky-700 hover:!underline !transition-all">
                        Term and Condition
                      </Link>
                    </span>
                  </span>
                }
              />
            </div>
            {termError && (
              <div className="font-quicksand text-sm text-red-500 text-center border rounded-lg border-red-500 p-1 mb-1 mt-1 tracking-widest">
                {termError}
              </div>
            )}
            <Button
              disabled={isLoading}
              type="submit"
              variant="contained"
              color="primary"
              className="w-full max-w-md !pt-3 !pb-3 !font-quicksand !tracking-widest text-xl !mt-6 !mb-6 !transition-all"
            >
              Create Account
            </Button>
            {error && (
              <div className="font-quicksand text-sm text-red-500 text-center border rounded-lg border-red-500 p-1 mb-3 tracking-widest">
                {error}
              </div>
            )}
            <div className="text-center">
              <p className="font-quicksand tracking-widest text-xs">
                Already have an account?{" "}
                <span>
                  <Link to='/' className="tracking-widest text-xs text-sky-700 font-quicksand hover:!underline !transition-all">
                    Sign In
                  </Link>
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
