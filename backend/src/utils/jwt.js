// src/utils/jwt.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// ✅ Load environment variables
dotenv.config();

/** Generate short-lived access token */
export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is missing from environment variables");
    throw new Error("Server misconfiguration: JWT_SECRET missing");
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

/** Verify and return decoded payload; throws if invalid/expired */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const e = new Error('Invalid or expired token');
    e.statusCode = 401;
    throw e;
  }
};

/** Decode token without verifying (for logging/debug only) */
export const decodeToken = (token) => jwt.decode(token);

/** Generate longer-lived refresh token */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
