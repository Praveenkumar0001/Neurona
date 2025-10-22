// src/middleware/validation.middleware.js  (ESM)
import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const extracted = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: extracted
    });
  }

  next();
};

export const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(value);
