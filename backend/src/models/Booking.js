const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SymptomReport'
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  bookingTime: {
    type: String,
    required: [true, 'Booking time is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'pending'
  },
  meetingLink: String,
  meetingId: String,
  notes: String,
  patientNotes: String,
  doctorNotes: String,
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    diagnosis: String,
    advice: String,
    testsRecommended: [String]
  },
  followUpDate: Date,
  followUpRequired: {
    type: Boolean,
    default: false
  },
  cancellationReason: String,
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'admin']
  },
  cancellationDate: Date,
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cash']
  },
  amount: {
    type: Number,
    required: true
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ patientId: 1, bookingDate: -1 });
bookingSchema.index({ doctorId: 1, bookingDate: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });
bookingSchema.index({ bookingDate: 1, bookingTime: 1 });

// Check slot availability before booking
bookingSchema.pre('save', async function(next) {
  if (this.isNew && this.status === 'pending') {
    const existingBooking = await this.constructor.findOne({
      doctorId: this.doctorId,
      bookingDate: this.bookingDate,
      bookingTime: this.bookingTime,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    if (existingBooking) {
      const error = new Error('This slot is already booked');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

// Virtual for formatted booking date
bookingSchema.virtual('formattedDate').get(function() {
  return this.bookingDate.toLocaleDateString('en-US', { 
    weekday: 'long',
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
});

// Method to check if booking is upcoming
bookingSchema.methods.isUpcoming = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  return bookingDateTime > now && this.status === 'confirmed';
};

// Method to check if booking is past
bookingSchema.methods.isPast = function() {
  const now = new Date();
  const bookingDateTime = new Date(this.bookingDate);
  return bookingDateTime < now;
};

module.exports = mongoose.model('Booking', bookingSchema);