const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
exports.generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.jwtSecret,
    { expiresIn: config.jwtExpire }
  );
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Decode token without verification (for debugging)
exports.decodeToken = (token) => {
  return jwt.decode(token);
};

// Generate refresh token (longer expiry)
exports.generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: '30d' }
  );
};