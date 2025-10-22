// Assessment Prompt Templates

const SYSTEM_PROMPT = `You are a medical AI assistant for Neurona, a healthcare platform. Your role is to:
1. Ask relevant questions about symptoms in a conversational manner
2. Gather information about symptom severity, duration, and related factors
3. Provide empathetic responses while maintaining professionalism
4. NEVER provide diagnoses or treatment recommendations
5. Always recommend consulting with a healthcare professional

Important guidelines:
- Ask one question at a time
- Be empathetic and understanding
- Use clear, simple language
- Focus on gathering detailed symptom information
- Note any red flags that require immediate medical attention`;

const INITIAL_QUESTION = `Hello! I'm here to help understand your symptoms better. 

To start, could you please describe what's been bothering you? Please share:
- What symptoms you're experiencing
- When they started
- How severe they are (mild, moderate, severe)`;

const FOLLOW_UP_QUESTIONS = {
  duration: "How long have you been experiencing these symptoms?",
  severity: "On a scale of 1-10, how would you rate the severity? (1 being mild, 10 being severe)",
  frequency: "How often do these symptoms occur? (Constant, intermittent, only at certain times)",
  triggers: "Have you noticed anything that makes the symptoms better or worse?",
  history: "Have you experienced similar symptoms before?",
  medication: "Are you currently taking any medications?",
  allergies: "Do you have any known allergies?",
  lifestyle: "Have there been any recent changes in your lifestyle, diet, or stress levels?"
};

const ASSESSMENT_PROMPT_TEMPLATE = (symptoms, conversationHistory) => {
  return `Based on the following patient information, generate the next appropriate question to gather more details:

Patient Symptoms: ${JSON.stringify(symptoms)}

Conversation History:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate a single, clear follow-up question that:
1. Helps gather more specific information about the symptoms
2. Is relevant to what the patient has already shared
3. Uses empathetic and professional language
4. Avoids medical jargon

Respond with ONLY the question, no additional text.`;
};

const SUMMARY_PROMPT_TEMPLATE = (conversationHistory) => {
  return `Based on the following conversation with a patient, create a comprehensive symptom summary:

Conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Create a structured summary including:
1. Chief Complaint
2. Symptom Details (what, when, severity, duration, frequency)
3. Aggravating/Relieving Factors
4. Associated Symptoms
5. Medical History (if mentioned)
6. Current Medications (if mentioned)
7. Red Flags or Urgent Concerns

Format the response as a clear, professional medical summary suitable for a doctor to review.`;
};

const SEVERITY_ASSESSMENT_PROMPT = (symptoms) => {
  return `Based on the following symptoms, assess the urgency level:

Symptoms: ${JSON.stringify(symptoms)}

Classify as one of:
- EMERGENCY: Life-threatening, needs immediate attention
- URGENT: Serious, should see doctor within 24 hours
- MODERATE: Should schedule appointment within a few days
- LOW: Can wait for routine appointment

Respond with ONLY the classification level and a brief one-sentence reason.
Format: "LEVEL: reason"`;
};

module.exports = {
  SYSTEM_PROMPT,
  INITIAL_QUESTION,
  FOLLOW_UP_QUESTIONS,
  ASSESSMENT_PROMPT_TEMPLATE,
  SUMMARY_PROMPT_TEMPLATE,
  SEVERITY_ASSESSMENT_PROMPT
};