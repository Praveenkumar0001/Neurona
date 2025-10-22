const axios = require('axios');

class LLMClient {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai'; // 'openai', 'anthropic', 'groq'
    this.apiKey = process.env.LLM_API_KEY;
    this.model = process.env.LLM_MODEL || 'gpt-3.5-turbo';
    
    if (!this.apiKey) {
      throw new Error('LLM_API_KEY is not set in environment variables');
    }

    // Set up API endpoints based on provider
    this.endpoints = {
      openai: 'https://api.openai.com/v1/chat/completions',
      anthropic: 'https://api.anthropic.com/v1/messages',
      groq: 'https://api.groq.com/openai/v1/chat/completions'
    };
  }

  async sendMessage(messages, options = {}) {
    try {
      const {
        temperature = 0.7,
        maxTokens = 1000,
        stream = false
      } = options;

      switch (this.provider) {
        case 'openai':
        case 'groq':
          return await this.sendOpenAIRequest(messages, { temperature, maxTokens, stream });
        
        case 'anthropic':
          return await this.sendAnthropicRequest(messages, { temperature, maxTokens });
        
        default:
          throw new Error(`Unsupported LLM provider: ${this.provider}`);
      }
    } catch (error) {
      console.error('LLM Client Error:', error.message);
      throw new Error(`Failed to get response from LLM: ${error.message}`);
    }
  }

  async sendOpenAIRequest(messages, options) {
    const response = await axios.post(
      this.endpoints[this.provider],
      {
        model: this.model,
        messages: messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: options.stream
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage,
      model: response.data.model
    };
  }

  async sendAnthropicRequest(messages, options) {
    // Convert OpenAI format to Anthropic format
    const anthropicMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    const response = await axios.post(
      this.endpoints.anthropic,
      {
        model: this.model,
        messages: anthropicMessages,
        max_tokens: options.maxTokens,
        temperature: options.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return {
      content: response.data.content[0].text,
      usage: response.data.usage,
      model: response.data.model
    };
  }

  // Helper method to create a simple prompt
  createPrompt(systemMessage, userMessage) {
    return [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ];
  }

  // Helper method to add conversation history
  createConversation(systemMessage, conversationHistory) {
    return [
      { role: 'system', content: systemMessage },
      ...conversationHistory
    ];
  }
}

module.exports = LLMClient;