// src/routes/user.routes.js  (ESM)
import express from 'express';

// namespace imports = safe for both CJS and ESM modules
import * as userController from '../controllers/userController.js';
import * as auth from '../middleware/auth.middleware.js';
import * as role from '../middleware/roleCheck.middleware.js';
import * as upload from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', auth.authenticate, userController.getUserById);

/**
 * @route   PUT /api/users/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.put('/avatar', auth.authenticate, upload.uploadSingle('avatar'), userController.updateAvatar);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete/deactivate user account
 * @access  Private
 */
router.delete('/account', auth.authenticate, userController.deleteAccount);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', auth.authenticate, role.checkRole('admin'), userController.getAllUsers);

export default router; 
