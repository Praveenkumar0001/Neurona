// backend/src/models/Admin.js
/**
 * Admin Mongoose model
 * - stores admin user data
 * - hashes passwords before saving
 * - provides a comparePassword instance method
 *
 * Install dependencies:
 *   npm install mongoose bcryptjs
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema } = mongoose;
const SALT_ROUNDS = 10;

const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\.,;:\s@"]+\.)+[^<>()[\]\.,;:\s@"]{2,})$/i;

const AdminSchema = new Schema(
    {
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [emailRegex, 'Please fill a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters long'],
        },
        role: {
            type: String,
            enum: ['admin', 'superadmin'],
            default: 'admin',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        // add other admin-specific fields here if needed
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Remove sensitive fields when converting to JSON
AdminSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.__v;
    return obj;
};

// Hash password before saving (create or update)
AdminSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) return next();
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        this.password = await bcrypt.hash(this.password, salt);
        return next();
    } catch (err) {
        return next(err);
    }
});

// Instance method to compare provided password with stored hash
AdminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Optional static helper to create an admin (handles hashing via pre-save)
AdminSchema.statics.createAdmin = async function (adminData) {
    const admin = new this(adminData);
    return admin.save();
};

module.exports = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);
