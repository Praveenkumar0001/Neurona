const express = require('express');
const router = express.Router();
const llmController = require('../llm/llmController');
const authMiddleware = require('../middleware/auth.middleware');
const { apiLimiter } = require('../middleware/rateLimit.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply rate limiting
router.use(apiLimiter);

// POST /api/llm/chat - Chat with LLM
router.post('/chat', llmController.chat);

// POST /api/llm/stream - Stream chat response
router.post('/stream', llmController.streamChat);

// POST /api/llm/assess - Assess symptoms
router.post('/assess', llmController.assessSymptoms);

// POST /api/llm/follow-up - Get follow-up questions
router.post('/follow-up', llmController.getFollowUpQuestions);

// POST /api/llm/specialties - Get specialty recommendations
router.post('/specialties', llmController.getSpecialtyRecommendations);

// GET /api/llm/greeting - Get greeting message
router.get('/greeting', llmController.getGreeting);

// GET /api/llm/health - Health check
router.get('/health', llmController.healthCheck);

module.exports = router;