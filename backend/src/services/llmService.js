// Frontend LLM Service
import api from './api';

class LLMService {
  /**
   * Start a new symptom assessment conversation
   */
  async startConversation() {
    try {
      const response = await api.post('/llm/start');
      return response.data;
    } catch (error) {
      console.error('Start conversation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Send a message and get AI response
   */
  async sendMessage(sessionId, message) {
    try {
      const response = await api.post('/llm/message', {
        sessionId,
        message
      });
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate symptom summary
   */
  async generateSummary(sessionId) {
    try {
      const response = await api.post('/llm/summary', {
        sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Generate summary error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(sessionId) {
    try {
      const response = await api.get(`/llm/conversation/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Test LLM connection
   */
  async testConnection() {
    try {
      const response = await api.get('/llm/test');
      return response.data;
    } catch (error) {
      console.error('Test connection error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(
        error.response.data?.message || 'An error occurred with the AI service'
      );
    } else if (error.request) {
      // Request made but no response
      return new Error('Unable to connect to AI service. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new LLMService();