import React, { useState, useEffect, useRef } from 'react';
import { useLLM } from '../../hooks/useLLM';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { useNavigate } from 'react-router-dom';

const ChatInterface = () => {
  const {
    loading,
    messages,
    sessionId,
    summary,
    startConversation,
    sendMessage,
    generateSummary
  } = useLLM();

  const [input, setInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation on component mount
  useEffect(() => {
    if (!isStarted) {
      handleStart();
    }
  }, []);

  const handleStart = async () => {
    try {
      await startConversation();
      setIsStarted(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const messageText = input.trim();
    setInput('');

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleComplete = async () => {
    try {
      const summaryData = await generateSummary();
      
      if (summaryData) {
        // Navigate to doctor selection with summary data
        navigate('/doctors', {
          state: {
            sessionId,
            summary: summaryData.summary,
            urgency: summaryData.urgency,
            specialties: summaryData.specialties,
            structuredData: summaryData.structuredData
          }
        });
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
    }
  };

  if (!isStarted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 border-b">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            Symptom Assessment
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Tell us about your symptoms and we'll help you find the right doctor
          </p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <MessageBubble
              key={index}
              message={message}
              isUser={message.role === 'user'}
            />
          ))}
          
          {loading && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                onKeyPress={handleKeyPress}
                disabled={loading}
                placeholder="Type your message..."
              />
            </div>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>

          {/* Action Buttons */}
          {messages.length > 4 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleComplete}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Processing...' : 'Complete & Find Doctors'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 px-4 py-3 text-center text-sm text-blue-800">
        <p>
          💡 Tip: Provide detailed information about your symptoms for better doctor recommendations
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;