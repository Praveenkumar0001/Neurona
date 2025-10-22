// Medical Assessment Prompt Templates

const SYSTEM_PROMPT = `You are a professional medical AI assistant helping patients understand their symptoms and guide them to appropriate care. You are knowledgeable, empathetic, and prioritize patient safety.

IMPORTANT GUIDELINES:
1. Never diagnose - only provide possible conditions and recommendations
2. Always recommend seeing a doctor for proper diagnosis
3. Identify emergency situations and urge immediate medical attention
4. Be empathetic and reassuring
5. Ask clarifying questions when needed
6. Use simple, understandable language
7. Provide actionable next steps

RESPONSE FORMAT:
Provide structured responses with:
- Summary of symptoms
- Possible conditions (with probabilities if relevant)
- Severity level (mild/moderate/severe)
- Urgency (normal/high/emergency)
- Self-care recommendations
- When to see a doctor
- Red flags to watch for
`;

const generateInitialAssessmentPrompt = (symptoms, patientInfo) => {
  return `
Patient Information:
- Age: ${patientInfo.age || 'Not provided'}
- Gender: ${patientInfo.gender || 'Not provided'}
- Medical History: ${patientInfo.medicalHistory?.join(', ') || 'None reported'}
- Allergies: ${patientInfo.allergies?.join(', ') || 'None reported'}

Reported Symptoms:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Duration: ${patientInfo.duration || 'Not specified'}
Severity (1-10): ${patientInfo.severity || 'Not specified'}

Please provide a comprehensive assessment including:
1. Analysis of the symptoms
2. Possible conditions (do NOT diagnose, only suggest possibilities)
3. Severity assessment
4. Urgency level
5. Self-care recommendations
6. When to seek medical attention
7. Any follow-up questions needed

Format your response as JSON with these fields:
{
  "summary": "Brief summary",
  "possibleConditions": ["condition1", "condition2"],
  "severity": "mild/moderate/severe",
  "urgency": "normal/high/emergency",
  "analysis": "Detailed analysis",
  "selfCare": ["recommendation1", "recommendation2"],
  "seekCareIf": ["red flag1", "red flag2"],
  "followUpQuestions": ["question1", "question2"],
  "recommendedSpecialties": ["specialty1", "specialty2"]
}
`;
};

const generateFollowUpPrompt = (conversationHistory, newSymptom) => {
  return `
Based on our previous conversation and the new information provided:

New Information: ${newSymptom}

Previous Context: ${JSON.stringify(conversationHistory, null, 2)}

Please:
1. Acknowledge the new information
2. Update your assessment if needed
3. Ask any additional clarifying questions
4. Provide updated recommendations

Keep your response conversational and empathetic.
`;
};

const generateEmergencyCheckPrompt = (symptoms) => {
  return `
Analyze these symptoms for emergency indicators:
${symptoms.join(', ')}

Determine if this requires immediate emergency care (911/ER).

Respond with JSON:
{
  "isEmergency": true/false,
  "reason": "explanation",
  "action": "specific action to take",
  "urgencyLevel": "normal/high/emergency"
}
`;
};

const generateSpecialtyRecommendationPrompt = (assessment) => {
  return `
Based on this medical assessment:
${JSON.stringify(assessment, null, 2)}

Recommend the top 3 medical specialties the patient should consider seeing, ranked by relevance.

Respond with JSON:
{
  "specialties": [
    {
      "name": "Specialty name",
      "relevance": "high/medium/low",
      "reason": "Why this specialty"
    }
  ]
}
`;
};

const generateSymptomClarificationPrompt = (symptom) => {
  return `
The patient mentioned: "${symptom}"

Generate 3-5 clarifying questions to better understand this symptom. Questions should cover:
- Location/area affected
- Severity/intensity
- Duration and frequency
- Aggravating/relieving factors
- Associated symptoms

Respond with JSON:
{
  "questions": ["question1", "question2", ...]
}
`;
};

const generateDifferentialDiagnosisPrompt = (symptoms, patientInfo) => {
  return `
Generate a differential diagnosis list (NOT a diagnosis) based on:

Symptoms: ${symptoms.join(', ')}
Patient Info: Age ${patientInfo.age}, Gender ${patientInfo.gender}
Medical History: ${patientInfo.medicalHistory?.join(', ') || 'None'}

Provide 3-5 possible conditions ranked by likelihood, with:
- Condition name
- Likelihood (%)
- Key symptoms that match
- Key symptoms that don't match

IMPORTANT: Emphasize this is NOT a diagnosis and professional evaluation is needed.

Respond with JSON:
{
  "disclaimer": "This is not a diagnosis...",
  "possibleConditions": [
    {
      "condition": "Name",
      "likelihood": 0-100,
      "matchingSymptoms": [],
      "notMatchingSymptoms": [],
      "notes": "Additional context"
    }
  ]
}
`;
};

const generateTreatmentAdvicePrompt = (condition, severity) => {
  return `
For a patient with possible ${condition} at ${severity} severity:

Provide:
1. Home care recommendations
2. Over-the-counter remedies (if appropriate)
3. Lifestyle modifications
4. Warning signs
5. Timeline for improvement
6. When to follow up with doctor

IMPORTANT: Do not prescribe medications. Only suggest OTC options if appropriate.

Keep advice practical, safe, and conservative.
`;
};

const generateMentalHealthAssessmentPrompt = (symptoms) => {
  return `
The patient is experiencing: ${symptoms.join(', ')}

These may indicate mental health concerns. Provide:
1. Gentle acknowledgment
2. Mental health screening questions
3. Resources and support options
4. Professional help recommendations
5. Crisis resources if needed

Be extremely sensitive, supportive, and non-judgmental.
Include crisis hotline numbers if symptoms suggest crisis.
`;
};

module.exports = {
  SYSTEM_PROMPT,
  generateInitialAssessmentPrompt,
  generateFollowUpPrompt,
  generateEmergencyCheckPrompt,
  generateSpecialtyRecommendationPrompt,
  generateSymptomClarificationPrompt,
  generateDifferentialDiagnosisPrompt,
  generateTreatmentAdvicePrompt,
  generateMentalHealthAssessmentPrompt,
};