import React, { useState, useEffect, useRef } from 'react';
import { useLLM } from '../../hooks/useLLM';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import Button from '../common/Button';
import Badge from '../common/Badge';

const EnhancedChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [assessment, setAssessment] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const messagesEndRef = useRef(null);

  const {
    loading,
    streaming,
    error,
    sendMessage,
    streamMessage,
    assessSymptoms,
    getFollowUpQuestions,
    getGreeting,
  } = useLLM();

  // Load greeting on mount
  useEffect(() => {
    const loadGreeting = async () => {
      const greeting = await getGreeting();
      setMessages([
        {
          type: 'bot',
          text: greeting,
          timestamp: Date.now(),
        },
      ]);
    };
    loadGreeting();
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const handleSendMessage = async (text) => {
    // Add user message
    const userMessage = {
      type: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Stream the response
      await streamMessage(
        text,
        messages,
        (chunk, fullMessage) => {
          setStreamingMessage(fullMessage);
        },
        (fullMessage) => {
          // Add bot message
          const botMessage = {
            type: 'bot',
            text: fullMessage,
            timestamp: Date.now(),
          };
          setMessages(prev => [...prev, botMessage]);
          setStreamingMessage('');
        }
      );
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = {
        type: 'bot',
        text: "I'm sorry, I'm having trouble responding right now. Please try again.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleGetAssessment = async () => {
    // Extract symptoms from conversation
    const symptoms = extractSymptomsFromMessages(messages);

    if (symptoms.length === 0) {
      const errorMessage = {
        type: 'bot',
        text: "I need more information about your symptoms to provide an assessment. Could you describe what you're experiencing?",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    try {
      const result = await assessSymptoms(symptoms, 'not specified', 5, messages);

      if (result.emergency) {
        const emergencyMessage = {
          type: 'bot',
          text: result.message,
          timestamp: Date.now(),
          isEmergency: true,
        };
        setMessages(prev => [...prev, emergencyMessage]);
        return;
      }

      setAssessment(result.assessment);
      setShowAssessment(true);

      const assessmentMessage = {
        type: 'bot',
        text: `I've completed your assessment. Here's what I found: ${result.assessment.summary}`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assessmentMessage]);
    } catch (err) {
      console.error('Assessment error:', err);
    }
  };

  const extractSymptomsFromMessages = (msgs) => {
    // Simple extraction - can be enhanced
    const symptoms = [];
    const symptomKeywords = ['pain', 'fever', 'cough', 'headache', 'fatigue', 'nausea'];

    msgs.forEach(msg => {
      if (msg.type === 'user') {
        symptomKeywords.forEach(keyword => {
          if (msg.text.toLowerCase().includes(keyword)) {
            symptoms.push(keyword);
          }
        });
      }
    });

    return [...new Set(symptoms)]; // Remove duplicates
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Neurona AI Health Assistant</h1>
            <p className="text-blue-100 mt-1">Powered by Advanced Medical AI</p>
          </div>
          <div className="flex gap-2">
            {messages.length > 2 && (
              <Button variant="secondary" size="sm" onClick={handleGetAssessment}>
                Get Assessment
              </Button>
            )}
            <Badge variant="success">🟢 Online</Badge>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
              <p className="text-slate-600">I'm here to help with your health concerns</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <div key={idx}>
                <MessageBubble message={msg} />
                {msg.isEmergency && (
                  <div className="mt-2 p-4 bg-red-100 border-l-4 border-red-600 rounded">
                    <p className="font-bold text-red-800">⚠️ EMERGENCY</p>
                    <p className="text-red-700">Please seek immediate medical attention</p>
                  </div>
                )}
              </div>
            ))}
            
            {streaming && streamingMessage && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex-center flex-shrink-0">
                  🤖
                </div>
                <div className="max-w-md rounded-lg p-4 bg-slate-100">
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                </div>
              </div>
            )}
            
            {loading && !streaming && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Assessment Panel */}
      {showAssessment && assessment && (
        <div className="border-t bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Assessment Results</h3>
              <button onClick={() => setShowAssessment(false)} className="text-slate-600 hover:text-slate-900">
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm text-slate-600">Severity</p>
                <p className="font-bold capitalize">{assessment.severity}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded">
                <p className="text-sm text-slate-600">Urgency</p>
                <p className="font-bold capitalize">{assessment.urgency}</p>
              </div>
            </div>

            {assessment.possibleConditions && assessment.possibleConditions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Possible Conditions:</h4>
                <ul className="list-disc ml-5">
                  {assessment.possibleConditions.map((condition, idx) => (
                    <li key={idx}>{condition}</li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.recommendations && assessment.recommendations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-bold mb-2">Recommendations:</h4>
                <ul className="list-disc ml-5">
                  {assessment.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}

            {assessment.disclaimer && (
              <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 text-sm">
                <p className="text-yellow-800">{assessment.disclaimer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-100 border-t border-red-300">
          <p className="text-red-700 text-sm">Error: {error}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t bg-white">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={loading || streaming} 
        />
      </div>
    </div>
  );
};

export default EnhancedChatInterface;