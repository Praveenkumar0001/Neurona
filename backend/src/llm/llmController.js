// LLM Controller - Handle HTTP requests
const LLMService = require('./llmService');
const SymptomReport = require('../models/SymptomReport');

class LLMController {
  constructor() {
    this.llmService = new LLMService();
  }

  /**
   * Start a new conversation
   * POST /api/llm/start
   */
  startConversation = async (req, res) => {
    try {
      const { userId } = req.user; // From auth middleware

      const initialQuestion = await this.llmService.getInitialQuestion();

      // Optionally create a new symptom report session
      const symptomReport = new SymptomReport({
        user: userId,
        conversationHistory: [],
        status: 'in-progress',
        startedAt: new Date()
      });

      await symptomReport.save();

      res.status(200).json({
        success: true,
        data: {
          sessionId: symptomReport._id,
          ...initialQuestion
        }
      });
    } catch (error) {
      console.error('Start conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start conversation',
        error: error.message
      });
    }
  };

  /**
   * Send a message and get response
   * POST /api/llm/message
   */
  sendMessage = async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      const { userId } = req.user;

      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'Session ID and message are required'
        });
      }

      // Find the symptom report
      const symptomReport = await SymptomReport.findOne({
        _id: sessionId,
        user: userId
      });

      if (!symptomReport) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Add user message to history
      symptomReport.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Get AI response
      const response = await this.llmService.processResponse(
        message,
        symptomReport.conversationHistory,
        symptomReport.symptoms
      );

      // Add AI response to history
      symptomReport.conversationHistory.push({
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      });

      // Update symptom report
      symptomReport.lastUpdated = new Date();
      await symptomReport.save();

      res.status(200).json({
        success: true,
        data: {
          message: response.message,
          sessionId: symptomReport._id,
          messageCount: symptomReport.conversationHistory.length
        }
      });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error.message
      });
    }
  };

  /**
   * Generate symptom summary
   * POST /api/llm/summary
   */
  generateSummary = async (req, res) => {
    try {
      const { sessionId } = req.body;
      const { userId } = req.user;

      const symptomReport = await SymptomReport.findOne({
        _id: sessionId,
        user: userId
      });

      if (!symptomReport) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      // Generate summary
      const summary = await this.llmService.generateSymptomSummary(
        symptomReport.conversationHistory
      );

      // Generate severity assessment
      const severityAssessment = await this.llmService.assessSeverity(
        symptomReport.symptoms
      );

      // Extract structured data
      const structuredData = await this.llmService.extractSymptomData(
        symptomReport.conversationHistory
      );

      // Suggest specialties
      const specialties = await this.llmService.suggestSpecialties(
        structuredData,
        symptomReport.conversationHistory
      );

      // Update symptom report
      symptomReport.aiSummary = summary.summary;
      symptomReport.urgencyLevel = severityAssessment.urgencyLevel;
      symptomReport.structuredData = structuredData;
      symptomReport.suggestedSpecialties = specialties;
      symptomReport.status = 'completed';
      symptomReport.completedAt = new Date();

      await symptomReport.save();

      res.status(200).json({
        success: true,
        data: {
          summary: summary.summary,
          urgency: severityAssessment,
          structuredData,
          specialties,
          sessionId: symptomReport._id
        }
      });
    } catch (error) {
      console.error('Generate summary error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate summary',
        error: error.message
      });
    }
  };

  /**
   * Get conversation history
   * GET /api/llm/conversation/:sessionId
   */
  getConversation = async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { userId } = req.user;

      const symptomReport = await SymptomReport.findOne({
        _id: sessionId,
        user: userId
      }).select('conversationHistory status startedAt completedAt');

      if (!symptomReport) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.status(200).json({
        success: true,
        data: symptomReport
      });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve conversation',
        error: error.message
      });
    }
  };

  /**
   * Test LLM connection
   * GET /api/llm/test
   */
  testConnection = async (req, res) => {
    try {
      const testMessage = 'Hello, this is a test message.';
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: testMessage }
      ];

      const response = await this.llmService.llmClient.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 50
      });

      res.status(200).json({
        success: true,
        message: 'LLM connection successful',
        data: {
          provider: this.llmService.llmClient.provider,
          model: this.llmService.llmClient.model,
          testResponse: response.content
        }
      });
    } catch (error) {
      console.error('LLM test error:', error);
      res.status(500).json({
        success: false,
        message: 'LLM connection failed',
        error: error.message
      });
    }
  };
}

module.exports = new LLMController();