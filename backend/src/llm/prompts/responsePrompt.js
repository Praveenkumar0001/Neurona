// Response Generation Prompt Templates

const CONVERSATIONAL_SYSTEM_PROMPT = `You are a friendly, empathetic medical chatbot assistant. Your role is to:
- Have natural, flowing conversations with patients
- Show empathy and understanding
- Ask clarifying questions
- Provide health information
- Guide patients through symptom assessment
- Never diagnose or prescribe
- Always recommend professional medical care when appropriate

Personality traits:
- Warm and caring
- Patient and thorough
- Clear and concise
- Supportive but not overly casual
- Professional yet approachable
`;

const generateGreetingPrompt = () => {
  return `Generate a warm, professional greeting for a patient starting a health assessment conversation. 
Keep it brief (2-3 sentences) and invite them to describe their symptoms.`;
};

const generateEmpatheticResponsePrompt = (userMessage) => {
  return `
The patient said: "${userMessage}"

Generate an empathetic response that:
1. Acknowledges their concern
2. Validates their feelings
3. Asks a relevant follow-up question
4. Maintains a professional yet warm tone

Keep it conversational and natural.
`;
};

const generateExplanationPrompt = (medicalTerm) => {
  return `
Explain the medical term "${medicalTerm}" to a patient in simple, easy-to-understand language.

Use:
- Everyday words
- Simple analogies if helpful
- 2-3 sentences maximum
- Avoid jargon

Make it friendly and not scary.
`;
};

const generateReassurancePrompt = (concern) => {
  return `
The patient expressed concern about: "${concern}"

Generate a reassuring response that:
1. Validates their concern
2. Provides factual, calm information
3. Offers next steps
4. Maintains appropriate medical boundaries

Be supportive but honest. Don't minimize legitimate concerns.
`;
};

const generateSummaryPrompt = (conversationData) => {
  return `
Summarize this conversation for the patient:

Symptoms discussed: ${conversationData.symptoms.join(', ')}
Duration: ${conversationData.duration}
Severity: ${conversationData.severity}
Key concerns: ${conversationData.concerns?.join(', ')}

Create a clear, organized summary that:
1. Recaps main symptoms
2. Lists key findings
3. Restates recommendations
4. Provides next steps

Format as a friendly summary the patient can review.
`;
};

const generateNextStepsPrompt = (assessment) => {
  return `
Based on this assessment:
${JSON.stringify(assessment, null, 2)}

Generate clear, actionable next steps for the patient:
1. Immediate actions (today)
2. Short-term actions (this week)
3. When to seek care
4. What to monitor

Make each step specific and easy to follow.
`;
};

const generateEducationalContentPrompt = (topic) => {
  return `
Create brief educational content about: "${topic}"

Include:
1. What it is (1-2 sentences)
2. Common causes
3. Typical symptoms
4. General prevention tips
5. When to see a doctor

Keep it:
- Accurate but accessible
- 4-5 sentences total
- Encouraging and informative
- Not alarming
`;
};

const generateRedFlagWarningPrompt = (symptoms) => {
  return `
Generate a clear but not alarming warning about red flag symptoms:

Current symptoms: ${symptoms.join(', ')}

List 3-5 specific warning signs that require immediate medical attention.

Format:
- Use clear bullet points
- Be specific (not vague)
- Include timeframes when relevant
- End with clear action ("Call 911 if...")

Tone: Serious but not panicking.
`;
};

const generateAppointmentGuidancePrompt = (specialty) => {
  return `
The patient should see a ${specialty}.

Provide guidance on:
1. What to expect at the appointment
2. What to bring/prepare
3. Questions to ask the doctor
4. How to describe symptoms effectively

Keep it helpful and confidence-building.
`;
};

const generateLifestyleAdvicePrompt = (condition) => {
  return `
For someone dealing with ${condition}, provide:

1. Dietary recommendations (if relevant)
2. Activity/exercise guidance
3. Sleep hygiene tips
4. Stress management suggestions
5. General wellness tips

Make advice:
- Specific and actionable
- Realistic and achievable
- Evidence-based
- Encouraging

4-6 concrete tips total.
`;
};

const generateMedicationInformationPrompt = (medication) => {
  return `
Provide general information about ${medication}:

Include:
1. What it's commonly used for
2. How it typically works
3. Common side effects
4. General precautions

IMPORTANT:
- Do NOT provide dosing information
- Emphasize consulting pharmacist/doctor
- Focus on general education only
- 3-4 sentences maximum
`;
};

const generateEncouragementPrompt = (situation) => {
  return `
The patient is experiencing: ${situation}

Generate an encouraging message that:
1. Acknowledges the challenge
2. Provides perspective
3. Offers hope
4. Motivates next steps

Keep it genuine, not overly cheerful.
2-3 sentences.
`;
};

module.exports = {
  CONVERSATIONAL_SYSTEM_PROMPT,
  generateGreetingPrompt,
  generateEmpatheticResponsePrompt,
  generateExplanationPrompt,
  generateReassurancePrompt,
  generateSummaryPrompt,
  generateNextStepsPrompt,
  generateEducationalContentPrompt,
  generateRedFlagWarningPrompt,
  generateAppointmentGuidancePrompt,
  generateLifestyleAdvicePrompt,
  generateMedicationInformationPrompt,
  generateEncouragementPrompt,
};