const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth.middleware');
const { checkRole } = require('../middleware/roleCheck.middleware');
const { uploadSingle } = require('../middleware/upload.middleware');

const router = express.Router();

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private
 */
router.get('/:id', authenticate, userController.getUserById);

/**
 * @route   PUT /api/users/avatar
 * @desc    Update user avatar
 * @access  Private
 */
router.put('/avatar', authenticate, uploadSingle('avatar'), userController.updateAvatar);

/**
 * @route   DELETE /api/users/account
 * @desc    Delete/deactivate user account
 * @access  Private
 */
router.delete('/account', authenticate, userController.deleteAccount);

/**
 * @route   GET /api/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/', authenticate, checkRole('admin'), userController.getAllUsers);

module.exports = router;