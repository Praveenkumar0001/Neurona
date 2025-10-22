// src/middleware/roleCheck.middleware.js
import User from '../models/User.js';

/**
 * Middleware to check if user has a required role
 * @param {...string} allowedRoles - Allowed roles (e.g. 'doctor', 'admin')
 */
export const checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
      }

      const user = await User.findById(req.userId).select('role');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}`,
        });
      }

      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking user role',
      });
    }
  };
};

// Specific role checkers
export const isPatient = checkRole('patient');
export const isDoctor = checkRole('doctor');
export const isAdmin = checkRole('admin');
export const isDoctorOrAdmin = checkRole('doctor', 'admin');
export const isPatientOrDoctor = checkRole('patient', 'doctor');
