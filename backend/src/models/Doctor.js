// src/models/Doctor.js (ESM)
import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    specialty: {
      type: String,
      enum: {
        values: ['psychiatrist', 'therapist', 'counselor', 'psychologist'],
        message: 'Invalid specialty'
      },
      required: true
    },
    subSpecialty: {
      type: String,
      enum: ['anxiety', 'depression', 'addiction', 'trauma', 'family therapy', 'child psychology', 'other']
    },
    experience: {
      type: Number,
      required: [true, 'Experience is required'],
      min: [0, 'Experience cannot be negative']
    },
    fee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: [0, 'Fee must be positive']
    },
    qualification: {
      type: String,
      required: [true, 'Qualification is required']
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    profileImage: {
      type: String,
      default: 'https://ui-avatars.com/api/?name=Doctor&background=10b981&color=fff'
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    availability: {
      monday: { type: [String], default: [] },
      tuesday: { type: [String], default: [] },
      wednesday: { type: [String], default: [] },
      thursday: { type: [String], default: [] },
      friday: { type: [String], default: [] },
      saturday: { type: [String], default: [] },
      sunday: { type: [String], default: [] }
    },
    languages: {
      type: [String],
      default: ['English']
    },
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        year: { type: Number, required: true }
      }
    ],
    experienceDetails: [
      {
        position: String,
        organization: String,
        startYear: Number,
        endYear: Number,
        current: Boolean
      }
    ],
    totalBookings: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    documents: {
      degreeProof: String,
      registrationCertificate: String,
      identityProof: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
doctorSchema.index({ specialty: 1 });
doctorSchema.index({ rating: -1 });
doctorSchema.index({ fee: 1 });
doctorSchema.index({ isActive: 1, isVerified: 1 });
doctorSchema.index({ name: 'text', bio: 'text' });

// Virtuals
doctorSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

doctorSchema.virtual('averageRating').get(function () {
  return this.totalRatings > 0 ? (this.rating / this.totalRatings).toFixed(1) : 0;
});

// Helper to get next available slot
doctorSchema.methods.getNextAvailableSlot = function () {
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const slots = this.availability[dayName];
  if (slots && slots.length > 0) return { day: 'Today', time: slots[0] };

  // Check next 7 days
  for (let i = 1; i <= 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + i);
    const nextDayName = nextDay.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const nextSlots = this.availability[nextDayName];

    if (nextSlots && nextSlots.length > 0) {
      return {
        day: i === 1 ? 'Tomorrow' : nextDay.toLocaleDateString('en-US', { weekday: 'long' }),
        time: nextSlots[0]
      };
    }
  }

  return null;
};

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
