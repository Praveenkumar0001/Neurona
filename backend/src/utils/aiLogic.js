/**
 * AI Logic for Mental Health Symptom Analysis
 * Rule-based recommendation system for Phase 1
 */

function analyzeSymptoms(responses) {
  let score = 0;
  let suggestedActions = [];
  let detailedAnalysis = {};
  
  // Mood scoring (0-5 points)
  const moodScores = {
    'happy': 0,
    'neutral': 1,
    'sad': 2,
    'anxious': 3,
    'depressed': 4,
    'hopeless': 5
  };
  const moodScore = moodScores[responses.mood?.toLowerCase()] || 0;
  score += moodScore;
  detailedAnalysis.mood = {
    value: responses.mood,
    score: moodScore,
    severity: moodScore >= 4 ? 'high' : moodScore >= 2 ? 'moderate' : 'low'
  };
  
  // Energy scoring (inverted: low energy = high score) (0-4 points)
  const energyScore = 5 - (responses.energy || 3);
  score += energyScore;
  detailedAnalysis.energy = {
    value: responses.energy,
    score: energyScore,
    severity: energyScore >= 3 ? 'high' : energyScore >= 2 ? 'moderate' : 'low'
  };
  
  // Sleep scoring (0-3 points)
  const sleepScores = {
    'good': 0,
    'fair': 1,
    'poor': 2,
    'insomnia': 3
  };
  const sleepScore = sleepScores[responses.sleep?.toLowerCase()] || 0;
  score += sleepScore;
  detailedAnalysis.sleep = {
    value: responses.sleep,
    score: sleepScore,
    severity: sleepScore >= 2 ? 'high' : sleepScore >= 1 ? 'moderate' : 'low'
  };
  
  // Anxiety scoring (0-5 points, direct mapping)
  const anxietyScore = responses.anxiety || 0;
  score += anxietyScore;
  detailedAnalysis.anxiety = {
    value: responses.anxiety,
    score: anxietyScore,
    severity: anxietyScore >= 4 ? 'high' : anxietyScore >= 2 ? 'moderate' : 'low'
  };
  
  // Appetite scoring (0-3 points)
  const appetiteScores = {
    'normal': 0,
    'increased': 1,
    'decreased': 2,
    'no appetite': 3
  };
  const appetiteScore = appetiteScores[responses.appetite?.toLowerCase()] || 0;
  score += appetiteScore;
  detailedAnalysis.appetite = {
    value: responses.appetite,
    score: appetiteScore,
    severity: appetiteScore >= 2 ? 'high' : appetiteScore >= 1 ? 'moderate' : 'low'
  };
  
  // Concentration scoring (0-3 points)
  const concentrationScores = {
    'not at all': 0,
    'sometimes': 1,
    'often': 2,
    'always': 3
  };
  const concentrationScore = concentrationScores[responses.concentration?.toLowerCase()] || 0;
  score += concentrationScore;
  detailedAnalysis.concentration = {
    value: responses.concentration,
    score: concentrationScore,
    severity: concentrationScore >= 2 ? 'high' : concentrationScore >= 1 ? 'moderate' : 'low'
  };
  
  // Social withdrawal scoring (0-3 points)
  const socialScores = {
    'no': 0,
    'sometimes': 1,
    'often': 2,
    'yes': 3
  };
  const socialScore = socialScores[responses.socialWithdrawal?.toLowerCase()] || 0;
  score += socialScore;
  detailedAnalysis.socialWithdrawal = {
    value: responses.socialWithdrawal,
    score: socialScore,
    severity: socialScore >= 2 ? 'high' : socialScore >= 1 ? 'moderate' : 'low'
  };
  
  // Physical symptoms scoring (0-2 points)
  let physicalScore = 0;
  if (responses.physicalSymptoms && Array.isArray(responses.physicalSymptoms)) {
    const symptomCount = responses.physicalSymptoms.filter(s => s !== 'none').length;
    physicalScore = Math.min(symptomCount * 0.5, 2);
  }
  score += physicalScore;
  detailedAnalysis.physicalSymptoms = {
    value: responses.physicalSymptoms,
    score: physicalScore,
    severity: physicalScore >= 1.5 ? 'high' : physicalScore >= 0.5 ? 'moderate' : 'low'
  };
  
  // Duration factor (0-2 points)
  const durationScores = {
    'less than 2 weeks': 0,
    '2-4 weeks': 0.5,
    '1-3 months': 1,
    '3-6 months': 1.5,
    'more than 6 months': 2
  };
  const durationScore = durationScores[responses.duration?.toLowerCase()] || 0;
  score += durationScore;
  detailedAnalysis.duration = {
    value: responses.duration,
    score: durationScore,
    severity: durationScore >= 1.5 ? 'high' : durationScore >= 0.5 ? 'moderate' : 'low'
  };
  
  // Previous treatment consideration
  if (responses.previousTreatment) {
    score += 1;
  }
  
  // Determine severity and recommendation based on total score
  let severity, recommendation;
  
  if (score >= 20) {
    // Severe (20-30 points)
    severity = 'severe';
    recommendation = 'psychiatrist';
    suggestedActions = [
      'Immediate professional help is strongly recommended',
      'Consider medication evaluation with a psychiatrist',
      'Regular monitoring and follow-up sessions needed',
      'Involve family support system',
      'Consider emergency helpline if experiencing crisis: 9152987821 (iCALL)'
    ];
  } else if (score >= 15) {
    // Moderate-Severe (15-19 points)
    severity = 'moderate';
    recommendation = 'psychiatrist';
    suggestedActions = [
      'Professional consultation with a psychiatrist is recommended',
      'Consider combination of therapy and medication',
      'Regular therapy sessions to develop coping strategies',
      'Maintain a mood and symptom journal',
      'Ensure adequate sleep and healthy lifestyle'
    ];
  } else if (score >= 10) {
    // Moderate (10-14 points)
    severity = 'moderate';
    recommendation = 'therapist';
    suggestedActions = [
      'Therapy sessions with a qualified therapist recommended',
      'Learn and practice stress management techniques',
      'Cognitive Behavioral Therapy (CBT) may be beneficial',
      'Regular exercise and healthy diet',
      'Consider mindfulness and meditation practices'
    ];
  } else if (score >= 6) {
    // Mild-Moderate (6-9 points)
    severity = 'mild';
    recommendation = 'therapist';
    suggestedActions = [
      'Consider talking to a therapist for support',
      'Practice self-care and stress reduction techniques',
      'Maintain regular sleep schedule',
      'Stay physically active',
      'Connect with supportive friends and family'
    ];
  } else {
    // Mild (0-5 points)
    severity = 'mild';
    recommendation = 'therapist';
    suggestedActions = [
      'Continue maintaining good mental health practices',
      'Consider preventive therapy sessions',
      'Practice mindfulness and relaxation techniques',
      'Maintain healthy lifestyle habits',
      'Monitor your mental health regularly'
    ];
  }
  
  // Generate comprehensive summary
  const summary = generateDetailedSummary(responses, severity, score, detailedAnalysis);
  
  return {
    overallScore: Math.round(score * 10) / 10, // Round to 1 decimal
    recommendation,
    severity,
    summary,
    suggestedActions,
    detailedAnalysis
  };
}

function generateDetailedSummary(responses, severity, score, detailedAnalysis) {
  let summary = `Based on your comprehensive mental health assessment (overall score: ${score.toFixed(1)}/30), `;
  
  // Opening statement based on severity
  if (severity === 'severe') {
    summary += 'you appear to be experiencing significant mental health challenges that require immediate professional attention. ';
    summary += 'We strongly recommend consulting with a psychiatrist who can provide comprehensive evaluation and treatment, ';
    summary += 'which may include medication management along with therapeutic interventions. ';
  } else if (severity === 'moderate' && score >= 15) {
    summary += 'you are showing signs of moderate to significant mental health concerns. ';
    summary += 'A consultation with a psychiatrist would be beneficial to discuss your symptoms in detail ';
    summary += 'and explore appropriate treatment options, which may include therapy and/or medication. ';
  } else if (severity === 'moderate') {
    summary += 'you are experiencing some notable mental health challenges. ';
    summary += 'Working with a therapist can help you develop effective coping strategies ';
    summary += 'and address the underlying issues contributing to your symptoms. ';
  } else {
    summary += 'you are showing mild symptoms that could benefit from professional support. ';
    summary += 'Talking with a therapist can help you maintain good mental health ';
    summary += 'and prevent symptoms from worsening. ';
  }
  
  // Add specific concerns
  const highConcerns = [];
  Object.keys(detailedAnalysis).forEach(key => {
    if (detailedAnalysis[key].severity === 'high') {
      highConcerns.push(key);
    }
  });
  
  if (highConcerns.length > 0) {
    summary += '\n\nAreas of primary concern include: ';
    summary += highConcerns.map(concern => {
      switch(concern) {
        case 'mood': return 'significant mood disturbances';
        case 'energy': return 'very low energy levels';
        case 'sleep': return 'poor sleep quality';
        case 'anxiety': return 'high anxiety levels';
        case 'appetite': return 'appetite changes';
        case 'concentration': return 'difficulty concentrating';
        case 'socialWithdrawal': return 'social withdrawal';
        case 'physicalSymptoms': return 'multiple physical symptoms';
        default: return concern;
      }
    }).join(', ') + '. ';
  }
  
  // Duration consideration
  if (responses.duration === 'more than 6 months' || responses.duration === '3-6 months') {
    summary += '\n\nThe duration of your symptoms suggests that these challenges have been persistent, ';
    summary += 'making professional intervention even more important for your wellbeing. ';
  }
  
  // Previous treatment
  if (responses.previousTreatment) {
    summary += '\n\nSince you have received treatment before, a professional can help review ';
    summary += 'your treatment history and optimize your care plan. ';
  }
  
  // Encouraging note
  summary += '\n\nRemember, seeking help is a sign of strength. Mental health professionals are here to support you ';
  summary += 'on your journey to better mental wellbeing. Early intervention often leads to better outcomes.';
  
  return summary;
}

// Helper function to get severity color
function getSeverityColor(severity) {
  const colors = {
    'mild': '#10b981',
    'moderate': '#f59e0b',
    'severe': '#ef4444'
  };
  return colors[severity] || '#6b7280';
}

// Export functions
module.exports = {
  analyzeSymptoms,
  generateDetailedSummary,
  getSeverityColor
};