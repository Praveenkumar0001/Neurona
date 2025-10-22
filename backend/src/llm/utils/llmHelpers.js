const logger = require('../../utils/logger');

// Format conversation history for LLM
const formatConversationHistory = (messages) => {
  return messages.map(msg => ({
    role: msg.role || (msg.type === 'user' ? 'user' : 'assistant'),
    content: msg.content || msg.text,
  }));
};

// Extract medical entities from text
const extractMedicalEntities = (text) => {
  const entities = {
    symptoms: [],
    duration: null,
    severity: null,
    bodyParts: [],
  };

  // Common symptoms patterns
  const symptomPatterns = [
    /fever|headache|cough|pain|fatigue|nausea|vomiting|dizziness|shortness of breath/gi,
  ];

  // Duration patterns
  const durationPatterns = [
    /(\d+)\s*(day|week|month|hour)s?/gi,
    /since\s+(yesterday|today|last\s+\w+)/gi,
  ];

  // Extract symptoms
  symptomPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      entities.symptoms.push(...matches.map(s => s.toLowerCase()));
    }
  });

  // Extract duration
  const durationMatch = text.match(durationPatterns[0]);
  if (durationMatch) {
    entities.duration = durationMatch[0];
  }

  // Remove duplicates
  entities.symptoms = [...new Set(entities.symptoms)];

  return entities;
};

// Calculate severity score from description
const calculateSeverityFromText = (text) => {
  const severeKeywords = ['severe', 'intense', 'unbearable', 'extreme', 'critical'];
  const moderateKeywords = ['moderate', 'significant', 'considerable'];
  const mildKeywords = ['mild', 'slight', 'minor', 'little'];

  const lowerText = text.toLowerCase();

  if (severeKeywords.some(keyword => lowerText.includes(keyword))) {
    return 5;
  }
  if (moderateKeywords.some(keyword => lowerText.includes(keyword))) {
    return 3;
  }
  if (mildKeywords.some(keyword => lowerText.includes(keyword))) {
    return 2;
  }

  return 3; // Default moderate
};

// Parse LLM response for structured data
const parseLLMResponse = (response) => {
  try {
    // Try to extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: parse as text
    return {
      type: 'text',
      content: response,
    };
  } catch (error) {
    logger.error('Error parsing LLM response', { error: error.message });
    return {
      type: 'text',
      content: response,
    };
  }
};

// Generate follow-up questions
const generateFollowUpQuestions = (symptoms, context) => {
  const questions = [];

  if (!context.duration) {
    questions.push("How long have you been experiencing these symptoms?");
  }

  if (!context.severity) {
    questions.push("On a scale of 1-10, how would you rate the severity?");
  }

  if (symptoms.includes('pain') && !context.location) {
    questions.push("Where exactly is the pain located?");
  }

  if (!context.previousHistory) {
    questions.push("Have you experienced similar symptoms before?");
  }

  if (!context.medications) {
    questions.push("Are you currently taking any medications?");
  }

  return questions.slice(0, 3); // Return max 3 questions
};

// Validate medical assessment
const validateAssessment = (assessment) => {
  const required = ['symptoms', 'analysis', 'recommendations'];
  const missing = required.filter(field => !assessment[field]);

  if (missing.length > 0) {
    return {
      valid: false,
      missing,
    };
  }

  return {
    valid: true,
  };
};

// Sanitize user input
const sanitizeUserInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
    .substring(0, 2000); // Max 2000 chars
};

// Format assessment for patient
const formatAssessmentForPatient = (assessment) => {
  return {
    summary: assessment.summary || 'Assessment completed',
    possibleConditions: assessment.possibleConditions || [],
    severity: assessment.severity || 'moderate',
    urgency: assessment.urgency || 'normal',
    recommendations: assessment.recommendations || [],
    nextSteps: assessment.nextSteps || [],
    disclaimer: 'This is an AI-powered assessment and should not replace professional medical advice.',
  };
};

// Check if emergency
const isEmergencyCase = (symptoms, context) => {
  const emergencyKeywords = [
    'chest pain',
    'difficulty breathing',
    'severe bleeding',
    'unconscious',
    'seizure',
    'stroke symptoms',
    'heart attack',
    'severe head injury',
  ];

  const symptomsText = symptoms.join(' ').toLowerCase();
  const hasEmergency = emergencyKeywords.some(keyword => 
    symptomsText.includes(keyword)
  );

  if (hasEmergency) {
    logger.warn('Emergency case detected', { symptoms });
    return true;
  }

  if (context.severity >= 9) {
    return true;
  }

  return false;
};

// Generate medical disclaimer
const generateDisclaimer = () => {
  return `
⚕️ Medical Disclaimer:
This assessment is provided by an AI system and is for informational purposes only. 
It should not be considered as professional medical advice, diagnosis, or treatment. 
Always seek the advice of qualified healthcare providers with any questions regarding a medical condition.
In case of emergency, call 911 or visit the nearest emergency room immediately.
  `.trim();
};

module.exports = {
  formatConversationHistory,
  extractMedicalEntities,
  calculateSeverityFromText,
  parseLLMResponse,
  generateFollowUpQuestions,
  validateAssessment,
  sanitizeUserInput,
  formatAssessmentForPatient,
  isEmergencyCase,
  generateDisclaimer,
};