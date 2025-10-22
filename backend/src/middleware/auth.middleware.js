import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';

const getTokenFromHeaders = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive user.' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) return next();

    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id;
      }
    } catch {
      console.log('Optional auth - invalid token');
    }

    next();
  } catch {
    next();
  }
};
