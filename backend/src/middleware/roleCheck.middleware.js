const User = require('../models/User');

// Check if user has required role
exports.checkRole = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.userId) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required' 
        });
      }
      
      // Get user with role
      const user = await User.findById(req.userId).select('role');
      
      if (!user) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found' 
        });
      }
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ 
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${user.role}` 
        });
      }
      
      // Attach role to request
      req.userRole = user.role;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error checking user role' 
      });
    }
  };
};

// Specific role checkers
exports.isPatient = exports.checkRole('patient');
exports.isDoctor = exports.checkRole('doctor');
exports.isAdmin = exports.checkRole('admin');
exports.isDoctorOrAdmin = exports.checkRole('doctor', 'admin');
exports.isPatientOrDoctor = exports.checkRole('patient', 'doctor');