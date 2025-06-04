require('dotenv').config();
const { default: mongoose } = require('mongoose');
const User = require('../modelSchema/userSchema');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Create token function
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '3d' });
};

// User login
const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate user credentials
    const user = await User.login(email, password);

    // Generate a JWT for the user
    const token = createToken(user._id);

    // Set the JWT as an HttpOnly cookie
    res.cookie('jwt', token, {
      httpOnly: true,                         
      secure: process.env.NODE_ENV === 'production',  
      sameSite: 'Lax',                        
      path: '/',                              
      maxAge: 3 * 24 * 60 * 60 * 1000,        // 3 days in milliseconds
    });

    // Send success response without token
    res.status(200).json({ 
      message: 'User logged in successfully', 
      email: user.email, 
      role: user.role,
  
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// User signup
// const userSignup = async (req, res) => {
//   const { email, password, name, role } = req.body;

//   try {
//     const user = await User.signup(email, password, name, role);

//     // Create a token for the new user
//     const token = createToken(user._id);

//     //cookie
//     res.cookie('jwt', token, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
//       sameSite: 'Lax',
//       path: '/',
//       maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
//   });
//       // Redirect the user to the /home area after signup
//         // Redirect the user to the /home area after signup
        
//     res.status(201).json({ message: 'User registered successfully', user: user._id });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const userSignup = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Proceed with signup
    const user = await User.signup(email, password, name, role);

    const token = createToken(user._id);

    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: 'User registered successfully', user: user._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



//user logout
const userLogout = async (req, res) => {
    res.clearCookie('jwt'); // Clear the authentication cookie
    res.status(200).json({ message: 'Successfully logged out' });
}


const userForgotPassword = async (req, res) =>{
  
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
      return res.status(404).json({ error: 'User not found' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  user.resetToken = token;
  user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
  await user.save();

  // Set up nodemailer
  const transporter = nodemailer.createTransport({
      service: 'Gmail', // or another SMTP server
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
      },
  });

  const resetLink = `http://localhost:3000/reset-password?token=${token}`;
  await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
  });

  res.json({ message: 'Password reset email sent' });
}

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
      // Find user by reset token and check if it's still valid
      const user = await User.findOne({
          resetToken: token,
          resetTokenExpiration: { $gt: Date.now() },
      });

      if (!user) {
          return res.status(400).json({ error: 'Invalid or expired token' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      
      // Clear the reset token fields
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      
      // Save user with updated password
      await user.save();

      res.json({ message: 'Password reset successful' });
  } catch (error) {
      res.status(500).json({ error: 'An error occurred during password reset' });
  }
};


// Fetch user info
const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("No token found");

    const response = await fetch('/api/user/get-user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    setUserRole(userData.role);
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
};




module.exports = {
  userLogin,
  userSignup,
  userLogout,
  userForgotPassword,
  resetPassword,
  getCurrentUser

};
