import api from './api';

class LLMService {
  // Send chat message
  async sendChatMessage(message, conversationHistory = [], context = {}) {
    try {
      const response = await api.post('/llm/chat', {
        message,
        conversationHistory,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  // Stream chat message (for real-time responses)
  async streamChatMessage(message, conversationHistory, onChunk, onComplete, onError) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/llm/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullMessage = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete(fullMessage);
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              onComplete(fullMessage);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                fullMessage += parsed.chunk;
                onChunk(parsed.chunk, fullMessage);
              }
              if (parsed.error) {
                onError(parsed.error);
                return;
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error streaming chat:', error);
      onError(error.message);
    }
  }

  // Assess symptoms
  async assessSymptoms(symptoms, duration, severity, conversationHistory = []) {
    try {
      const response = await api.post('/llm/assess', {
        symptoms,
        duration,
        severity,
        conversationHistory,
      });
      return response.data;
    } catch (error) {
      console.error('Error assessing symptoms:', error);
      throw error;
    }
  }

  // Get follow-up questions
  async getFollowUpQuestions(symptoms, context = {}) {
    try {
      const response = await api.post('/llm/follow-up', {
        symptoms,
        context,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting follow-up questions:', error);
      throw error;
    }
  }

  // Get specialty recommendations
  async getSpecialtyRecommendations(assessment) {
    try {
      const response = await api.post('/llm/specialties', {
        assessment,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting specialty recommendations:', error);
      throw error;
    }
  }

  // Get greeting message
  async getGreeting() {
    try {
      const response = await api.get('/llm/greeting');
      return response.data;
    } catch (error) {
      console.error('Error getting greeting:', error);
      return {
        success: true,
        data: {
          message: "Hello! I'm here to help you understand your symptoms. How can I assist you today?",
        },
      };
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/llm/health');
      return response.data;
    } catch (error) {
      console.error('LLM health check failed:', error);
      return { success: false };
    }
  }
}

export default new LLMService();