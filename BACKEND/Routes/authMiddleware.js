const jwt = require('jsonwebtoken');
const User = require('../modelSchema/userSchema'); // Adjust path to your User model

const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from header

  if (!token) {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authenticate;
