const axios = require('axios');
const logger = require('../../utils/logger');

class LLMClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY;
    this.apiUrl = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
    this.model = process.env.LLM_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.LLM_MAX_TOKENS) || 1000;
    this.temperature = parseFloat(process.env.LLM_TEMPERATURE) || 0.7;
  }

  async generateCompletion(messages, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: options.model || this.model,
          messages: messages,
          max_tokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || this.temperature,
          top_p: options.topP || 1,
          frequency_penalty: options.frequencyPenalty || 0,
          presence_penalty: options.presencePenalty || 0,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          timeout: 30000, // 30 seconds
        }
      );

      logger.info('LLM completion generated', {
        model: options.model || this.model,
        tokens: response.data.usage?.total_tokens,
      });

      return {
        success: true,
        content: response.data.choices[0].message.content,
        usage: response.data.usage,
        model: response.data.model,
      };
    } catch (error) {
      logger.error('LLM completion error', {
        error: error.message,
        response: error.response?.data,
      });

      return {
        success: false,
        error: error.message,
        details: error.response?.data,
      };
    }
  }

  async streamCompletion(messages, onChunk, options = {}) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: options.model || this.model,
          messages: messages,
          max_tokens: options.maxTokens || this.maxTokens,
          temperature: options.temperature || this.temperature,
          stream: true,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          responseType: 'stream',
        }
      );

      let fullContent = '';

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk(content);
              }
            } catch (e) {
              // Skip parsing errors
            }
          }
        }
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          logger.info('LLM stream completed');
          resolve({ success: true, content: fullContent });
        });
        
        response.data.on('error', (error) => {
          logger.error('LLM stream error', { error: error.message });
          reject(error);
        });
      });
    } catch (error) {
      logger.error('LLM stream error', { error: error.message });
      throw error;
    }
  }

  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/embeddings',
        {
          model: 'text-embedding-ada-002',
          input: text,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return {
        success: true,
        embedding: response.data.data[0].embedding,
        usage: response.data.usage,
      };
    } catch (error) {
      logger.error('LLM embedding error', { error: error.message });
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = new LLMClient();