// Main Routes Index
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const doctorRoutes = require('./doctor.routes');
const symptomRoutes = require('./symptom.routes');
const reportRoutes = require('./report.routes');
const bookingRoutes = require('./booking.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');
const llmRoutes = require('./llm.routes');

// API health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Neurona API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/symptoms', symptomRoutes);
router.use('/reports', reportRoutes);
router.use('/bookings', bookingRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/llm', llmRoutes);  // LLM routes

// 404 handler for unmatched API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router;
