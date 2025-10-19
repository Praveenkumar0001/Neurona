const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const doctorRoutes = require('./doctor.routes');
const symptomRoutes = require('./symptom.routes');
const reportRoutes = require('./report.routes');
const bookingRoutes = require('./booking.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');

const configureRoutes = (app) => {
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/doctors', doctorRoutes);
  app.use('/api/symptoms', symptomRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/notifications', notificationRoutes);
};

module.exports = configureRoutes;