// src/models/User.js (ESM)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: { values: ['patient', 'doctor', 'admin'], message: 'Role must be either patient, doctor, or admin' },
    required: true,
    default: 'patient'
  },
  profile: {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    age: { type: Number, min: [1, 'Age must be positive'], max: [120, 'Age must be valid'] },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer not to say'] },
    avatar: { type: String, default: 'https://ui-avatars.com/api/?name=User&background=2563eb&color=fff' },
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  lastLogin: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'profile.name': 1 });

userSchema.virtual('fullName').get(function () {
  return this.profile.name;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = Date.now();
  return this.save();
};

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 86400000; // 24 hours
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  return user;
};

// Avoid model recompile errors in dev/hot-reload:
const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User; // 👈 makes `import User from '../models/User.js'` work
