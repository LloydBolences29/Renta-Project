const { default: mongoose } = require('mongoose');
const User = require('../modelSchema/userSchema');
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
      email 
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// User signup
const userSignup = async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    const user = await User.signup(email, password, name, role);

    // Create a token for the new user
    const token = createToken(user._id);

    //cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: 'Lax',
      path: '/',
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
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


module.exports = {
  userLogin,
  userSignup,
  userLogout
};
