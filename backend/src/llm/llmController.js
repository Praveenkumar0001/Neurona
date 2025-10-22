const llmService = require('./llmService');
const { sendSuccess, sendValidationError } = require('../utils/errorHandler');
const { validateSymptomData } = require('../utils/validators');
const logger = require('../utils/logger');

// Chat with LLM
exports.chat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [], context = {} } = req.body;

    if (!message || message.trim().length === 0) {
      return sendValidationError(res, { message: 'Message is required' });
    }

    const result = await llmService.generateChatResponse(
      message,
      conversationHistory,
      context
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate response',
      });
    }

    logger.info('LLM chat response sent', { userId: req.user?.userId });

    sendSuccess(res, {
      reply: result.message,
      entities: result.entities,
      tokens: result.tokens,
    });
  } catch (error) {
    logger.error('Error in LLM chat', { error: error.message });
    next(error);
  }
};

// Stream chat response
exports.streamChat = async (req, res, next) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return sendValidationError(res, { message: 'Message is required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const onChunk = (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    };

    await llmService.streamChatResponse(message, conversationHistory, onChunk);

    res.write('data: [DONE]\n\n');
    res.end();

    logger.info('LLM stream completed', { userId: req.user?.userId });
  } catch (error) {
    logger.error('Error in LLM stream', { error: error.message });
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

// Assess symptoms
exports.assessSymptoms = async (req, res, next) => {
  try {
    const { symptoms, duration, severity, conversationHistory = [] } = req.body;

    // Validation
    const errors = validateSymptomData({ symptoms, duration, severity });
    if (errors) {
      return sendValidationError(res, errors);
    }

    const patientInfo = {
      age: req.user?.age,
      gender: req.user?.gender,
      medicalHistory: req.user?.medicalHistory || [],
      allergies: req.user?.allergies || [],
      duration,
      severity,
    };

    const result = await llmService.generateMedicalAssessment(
      symptoms,
      patientInfo,
      conversationHistory
    );

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate assessment',
      });
    }

    // If emergency
    if (result.emergency) {
      logger.warn('Emergency case detected', {
        userId: req.user?.userId,
        symptoms,
      });
      return res.status(200).json({
        success: true,
        emergency: true,
        message: result.message,
      });
    }

    logger.info('Medical assessment completed', {
      userId: req.user?.userId,
      urgency: result.assessment.urgency,
    });

    sendSuccess(res, {
      assessment: result.assessment,
      tokens: result.tokens,
    });
  } catch (error) {
    logger.error('Error in symptom assessment', { error: error.message });
    next(error);
  }
};

// Get follow-up questions
exports.getFollowUpQuestions = async (req, res, next) => {
  try {
    const { symptoms, context = {} } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return sendValidationError(res, { symptoms: 'Symptoms are required' });
    }

    const result = await llmService.generateFollowUpQuestions(symptoms, context);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate questions',
      });
    }

    logger.info('Follow-up questions generated', {
      userId: req.user?.userId,
      count: result.questions.length,
    });

    sendSuccess(res, { questions: result.questions });
  } catch (error) {
    logger.error('Error generating follow-up questions', { error: error.message });
    next(error);
  }
};

// Get specialty recommendations
exports.getSpecialtyRecommendations = async (req, res, next) => {
  try {
    const { assessment } = req.body;

    if (!assessment) {
      return sendValidationError(res, { assessment: 'Assessment is required' });
    }

    const result = await llmService.getSpecialtyRecommendations(assessment);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get recommendations',
      });
    }

    logger.info('Specialty recommendations generated', {
      userId: req.user?.userId,
      count: result.specialties.length,
    });

    sendSuccess(res, { specialties: result.specialties });
  } catch (error) {
    logger.error('Error getting specialty recommendations', { error: error.message });
    next(error);
  }
};

// Get greeting message
exports.getGreeting = async (req, res, next) => {
  try {
    const result = await llmService.generateGreeting();

    sendSuccess(res, { message: result.message });
  } catch (error) {
    logger.error('Error generating greeting', { error: error.message });
    sendSuccess(res, {
      message: "Hello! I'm here to help you understand your symptoms. How can I assist you today?",
    });
  }
};

// Health check for LLM service
exports.healthCheck = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'LLM service is operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'LLM service error',
    });
  }
};

module.exports = exports;