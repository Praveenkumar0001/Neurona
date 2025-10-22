// LLM Routes
const express = require('express');
const router = express.Router();
const llmController = require('../llm/llmController');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validation.middleware');
const { body, param } = require('express-validator');

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/llm/start
 * @desc    Start a new symptom assessment conversation
 * @access  Private
 */
router.post('/start', llmController.startConversation);

/**
 * @route   POST /api/llm/message
 * @desc    Send a message and get AI response
 * @access  Private
 */
router.post(
  '/message',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('message').notEmpty().withMessage('Message is required').trim()
  ],
  validateRequest,
  llmController.sendMessage
);

/**
 * @route   POST /api/llm/summary
 * @desc    Generate symptom summary
 * @access  Private
 */
router.post(
  '/summary',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required')
  ],
  validateRequest,
  llmController.generateSummary
);

/**
 * @route   GET /api/llm/conversation/:sessionId
 * @desc    Get conversation history
 * @access  Private
 */
router.get(
  '/conversation/:sessionId',
  [
    param('sessionId').isMongoId().withMessage('Invalid session ID')
  ],
  validateRequest,
  llmController.getConversation
);

/**
 * @route   GET /api/llm/test
 * @desc    Test LLM connection
 * @access  Private (Admin only in production)
 */
router.get('/test', llmController.testConnection);

module.exports = router;