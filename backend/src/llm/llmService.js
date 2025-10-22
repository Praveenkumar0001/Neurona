const llmClient = require('./utils/llmClient');
const {
  formatConversationHistory,
  extractMedicalEntities,
  sanitizeUserInput,
  formatAssessmentForPatient,
  isEmergencyCase,
  generateDisclaimer,
} = require('./utils/llmHelpers');
const {
  SYSTEM_PROMPT,
  generateInitialAssessmentPrompt,
  generateFollowUpPrompt,
  generateEmergencyCheckPrompt,
  generateSpecialtyRecommendationPrompt,
} = require('./prompts/assessmentPrompt');
const {
  CONVERSATIONAL_SYSTEM_PROMPT,
  generateGreetingPrompt,
  generateEmpatheticResponsePrompt,
} = require('./prompts/responsePrompt');
const logger = require('../utils/logger');

class LLMService {
  // Generate initial medical assessment
  async generateMedicalAssessment(symptoms, patientInfo, conversationHistory = []) {
    try {
      const sanitizedSymptoms = symptoms.map(s => sanitizeUserInput(s));
      
      // Check for emergency
      const emergency = isEmergencyCase(sanitizedSymptoms, patientInfo);
      if (emergency) {
        return {
          success: true,
          emergency: true,
          message: '🚨 EMERGENCY: Based on your symptoms, you should seek immediate medical attention. Call 911 or go to the nearest emergency room.',
          assessment: null,
        };
      }

      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...formatConversationHistory(conversationHistory),
        { 
          role: 'user', 
          content: generateInitialAssessmentPrompt(sanitizedSymptoms, patientInfo) 
        },
      ];

      const result = await llmClient.generateCompletion(messages, {
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      // Parse assessment
      let assessment;
      try {
        assessment = JSON.parse(result.content);
      } catch {
        assessment = {
          summary: result.content,
          possibleConditions: [],
          severity: 'moderate',
          urgency: 'normal',
        };
      }

      assessment.disclaimer = generateDisclaimer();

      logger.info('Medical assessment generated', {
        symptoms: sanitizedSymptoms.length,
        urgency: assessment.urgency,
      });

      return {
        success: true,
        assessment: formatAssessmentForPatient(assessment),
        tokens: result.usage,
      };
    } catch (error) {
      logger.error('Error generating medical assessment', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate conversational response
  async generateChatResponse(userMessage, conversationHistory = [], context = {}) {
    try {
      const sanitized = sanitizeUserInput(userMessage);
      const entities = extractMedicalEntities(sanitized);

      const messages = [
        { role: 'system', content: CONVERSATIONAL_SYSTEM_PROMPT },
        ...formatConversationHistory(conversationHistory),
        { role: 'user', content: sanitized },
      ];

      const result = await llmClient.generateCompletion(messages, {
        temperature: 0.8,
        maxTokens: 500,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      logger.info('Chat response generated', { entities: entities.symptoms.length });

      return {
        success: true,
        message: result.content,
        entities,
        tokens: result.usage,
      };
    } catch (error) {
      logger.error('Error generating chat response', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Stream chat response for real-time
  async streamChatResponse(userMessage, conversationHistory, onChunk) {
    try {
      const sanitized = sanitizeUserInput(userMessage);

      const messages = [
        { role: 'system', content: CONVERSATIONAL_SYSTEM_PROMPT },
        ...formatConversationHistory(conversationHistory),
        { role: 'user', content: sanitized },
      ];

      const result = await llmClient.streamCompletion(messages, onChunk, {
        temperature: 0.8,
        maxTokens: 500,
      });

      return result;
    } catch (error) {
      logger.error('Error streaming chat response', { error: error.message });
      throw error;
    }
  }

  // Get follow-up questions
  async generateFollowUpQuestions(symptoms, context) {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { 
          role: 'user', 
          content: `Based on these symptoms: ${symptoms.join(', ')}, generate 3 important follow-up questions to better assess the condition. Return as JSON array: {"questions": [...]}`
        },
      ];

      const result = await llmClient.generateCompletion(messages, {
        temperature: 0.7,
        maxTokens: 300,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        questions: parsed.questions || [],
      };
    } catch (error) {
      logger.error('Error generating follow-up questions', { error: error.message });
      return {
        success: false,
        error: error.message,
        questions: [],
      };
    }
  }

  // Get specialty recommendations
  async getSpecialtyRecommendations(assessment) {
    try {
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: generateSpecialtyRecommendationPrompt(assessment) },
      ];

      const result = await llmClient.generateCompletion(messages, {
        temperature: 0.6,
        maxTokens: 400,
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const parsed = JSON.parse(result.content);
      return {
        success: true,
        specialties: parsed.specialties || [],
      };
    } catch (error) {
      logger.error('Error getting specialty recommendations', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Generate greeting message
  async generateGreeting() {
    try {
      const messages = [
        { role: 'system', content: CONVERSATIONAL_SYSTEM_PROMPT },
        { role: 'user', content: generateGreetingPrompt() },
      ];

      const result = await llmClient.generateCompletion(messages, {
        temperature: 0.9,
        maxTokens: 150,
      });

      return {
        success: true,
        message: result.content,
      };
    } catch (error) {
      return {
        success: false,
        message: "Hello! I'm here to help you understand your symptoms. How can I assist you today?",
      };
    }
  }
}

module.exports = new LLMService();