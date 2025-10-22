// LLM Service - Business logic for LLM operations
const LLMClient = require('./utils/llmClient');
const {
  SYSTEM_PROMPT,
  INITIAL_QUESTION,
  ASSESSMENT_PROMPT_TEMPLATE,
  SUMMARY_PROMPT_TEMPLATE,
  SEVERITY_ASSESSMENT_PROMPT
} = require('./prompts/assessmentPrompt');

class LLMService {
  constructor() {
    this.llmClient = new LLMClient();
  }

  /**
   * Get initial greeting and first question
   */
  async getInitialQuestion() {
    return {
      message: INITIAL_QUESTION,
      questionType: 'initial',
      options: null
    };
  }

  /**
   * Process user response and generate next question
   */
  async processResponse(userMessage, conversationHistory = [], symptoms = {}) {
    try {
      // Build the conversation context
      const messages = this.llmClient.createConversation(
        SYSTEM_PROMPT,
        [
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ]
      );

      // Get AI response
      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 500
      });

      return {
        message: response.content,
        questionType: 'follow-up',
        usage: response.usage
      };
    } catch (error) {
      console.error('Error processing response:', error);
      throw error;
    }
  }

  /**
   * Generate follow-up question based on context
   */
  async generateFollowUpQuestion(symptoms, conversationHistory) {
    try {
      const prompt = ASSESSMENT_PROMPT_TEMPLATE(symptoms, conversationHistory);
      const messages = this.llmClient.createPrompt(SYSTEM_PROMPT, prompt);

      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.7,
        maxTokens: 200
      });

      return {
        message: response.content.trim(),
        questionType: 'follow-up'
      };
    } catch (error) {
      console.error('Error generating follow-up question:', error);
      throw error;
    }
  }

  /**
   * Generate symptom summary for doctor
   */
  async generateSymptomSummary(conversationHistory) {
    try {
      const prompt = SUMMARY_PROMPT_TEMPLATE(conversationHistory);
      const messages = this.llmClient.createPrompt(
        'You are a medical documentation assistant. Create clear, professional symptom summaries.',
        prompt
      );

      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.5,
        maxTokens: 1000
      });

      return {
        summary: response.content,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }

  /**
   * Assess symptom severity and urgency
   */
  async assessSeverity(symptoms) {
    try {
      const prompt = SEVERITY_ASSESSMENT_PROMPT(symptoms);
      const messages = this.llmClient.createPrompt(
        'You are a medical triage assistant. Assess symptom urgency accurately.',
        prompt
      );

      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.3,
        maxTokens: 100
      });

      // Parse response format "LEVEL: reason"
      const [level, ...reasonParts] = response.content.split(':');
      const reason = reasonParts.join(':').trim();

      return {
        urgencyLevel: level.trim(),
        reason: reason,
        assessedAt: new Date()
      };
    } catch (error) {
      console.error('Error assessing severity:', error);
      throw error;
    }
  }

  /**
   * Extract structured data from conversation
   */
  async extractSymptomData(conversationHistory) {
    try {
      const prompt = `Extract structured symptom information from this conversation:

${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Return a JSON object with:
{
  "chiefComplaint": "main symptom",
  "duration": "how long",
  "severity": "1-10 scale",
  "location": "body part if applicable",
  "characteristics": ["list", "of", "descriptors"],
  "associatedSymptoms": ["other", "symptoms"],
  "redFlags": ["urgent", "concerns"]
}`;

      const messages = this.llmClient.createPrompt(
        'Extract structured medical data from conversations. Respond ONLY with valid JSON.',
        prompt
      );

      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.3,
        maxTokens: 500
      });

      // Parse JSON response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to extract structured data');
    } catch (error) {
      console.error('Error extracting symptom data:', error);
      throw error;
    }
  }

  /**
   * Suggest relevant specialties based on symptoms
   */
  async suggestSpecialties(symptoms, conversationHistory) {
    try {
      const prompt = `Based on these symptoms and conversation, suggest the most relevant medical specialties:

Symptoms: ${JSON.stringify(symptoms)}
Recent conversation: ${conversationHistory.slice(-3).map(m => m.content).join('. ')}

Respond with a JSON array of up to 3 specialties in order of relevance:
[
  {
    "specialty": "specialty name",
    "relevance": "why this specialty is relevant",
    "priority": 1-3
  }
]`;

      const messages = this.llmClient.createPrompt(
        'You are a medical specialty recommendation system. Respond ONLY with valid JSON.',
        prompt
      );

      const response = await this.llmClient.sendMessage(messages, {
        temperature: 0.4,
        maxTokens: 400
      });

      // Parse JSON response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Error suggesting specialties:', error);
      return [];
    }
  }
}

module.exports = LLMService;