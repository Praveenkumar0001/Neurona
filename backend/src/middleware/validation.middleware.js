const { validationResult } = require('express-validator');

// Handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors = [];
    
    errors.array().map(err => {
      extractedErrors.push({ 
        field: err.path || err.param, 
        message: err.msg 
      });
    });
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  }
  
  next();
};

// Common validation helper
exports.isValidObjectId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value);
};