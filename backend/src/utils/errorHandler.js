// src/utils/errorHandler.js (ESM, robust + concise)
const isProd = process.env.NODE_ENV === 'production';

/** Base HTTP Error */
export class AppError extends Error {
  constructor(message = 'Error', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.status = String(statusCode).startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message
    };
  }

  static from(err, fallbackStatus = 500) {
    if (err instanceof AppError) return err;
    const e = new AppError(err?.message || 'Internal Server Error', err?.statusCode || fallbackStatus);
    e.isOperational = false;
    // copy useful fields
    if (err?.errors) e.errors = err.errors;
    if (err?.code) e.code = err.code;
    if (err?.name) e.name = err.name;
    return e;
  }
}

/** Typed HTTP Errors */
export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') { super(message, 404); }
}
export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = undefined) { super(message, 400); if (errors) this.errors = errors; }
}
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') { super(message, 401); }
}
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') { super(message, 403); }
}
export class ConflictError extends AppError {
  constructor(message = 'Conflict') { super(message, 409); }
}
export class ValidationError extends BadRequestError {
  constructor(message = 'Validation failed', errors = []) { super(message, 400); this.errors = errors; }
}

/** Async wrapper to avoid try/catch in controllers */
export const catchAsync = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/** Normalize common library errors (Mongoose, JWT, etc.) to AppError */
function normalizeLibError(err) {
  // Mongoose validation error
  if (err?.name === 'ValidationError' && err?.errors) {
    const details = Object.values(err.errors).map(e => ({ field: e.path, message: e.message }));
    return new ValidationError('Validation failed', details);
  }
  // Mongoose cast error (invalid ObjectId)
  if (err?.name === 'CastError') {
    return new BadRequestError(`Invalid ${err.path}: ${err.value}`);
  }
  // Mongoose duplicate key
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    const msg = fields.length ? `Duplicate value for ${fields.join(', ')}` : 'Duplicate key';
    return new ConflictError(msg);
  }
  // JWT errors
  if (err?.name === 'JsonWebTokenError') return new UnauthorizedError('Invalid token');
  if (err?.name === 'TokenExpiredError') return new UnauthorizedError('Token expired');
  return null;
}

/** Express error middleware */
export function errorMiddleware(err, req, res, _next) {
  // Prefer explicit operational errors
  let appErr = err instanceof AppError ? err : normalizeLibError(err) || AppError.from(err);

  const payload = {
    success: false,
    status: appErr.status,
    message: appErr.message
  };

  // Attach field errors if present
  if (appErr.errors) payload.errors = appErr.errors;

  // In non-production, include helpful debug info
  if (!isProd) {
    payload.name = appErr.name;
    payload.stack = appErr.stack;
    if (err?.code && !appErr.code) payload.code = err.code;
  }

  res.status(appErr.statusCode || 500).json(payload);
}

/** Optional: small helper to assert conditions */
export function assert(condition, message = 'Bad request', status = 400) {
  if (!condition) throw new AppError(message, status);
}
