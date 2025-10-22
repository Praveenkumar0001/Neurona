import { useState, useCallback } from 'react';
import llmService from '../services/llmService';

export const useLLM = () => {
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);

  // Send regular chat message
  const sendMessage = useCallback(async (message, conversationHistory = [], context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.sendChatMessage(message, conversationHistory, context);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get response');
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Stream chat message
  const streamMessage = useCallback(async (message, conversationHistory, onChunk, onComplete) => {
    setStreaming(true);
    setError(null);

    try {
      await llmService.streamChatMessage(
        message,
        conversationHistory,
        onChunk,
        (fullMessage) => {
          setStreaming(false);
          onComplete(fullMessage);
        },
        (errorMsg) => {
          setError(errorMsg);
          setStreaming(false);
        }
      );
    } catch (err) {
      setError(err.message);
      setStreaming(false);
      throw err;
    }
  }, []);

  // Assess symptoms
  const assessSymptoms = useCallback(async (symptoms, duration, severity, conversationHistory = []) => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.assessSymptoms(
        symptoms,
        duration,
        severity,
        conversationHistory
      );

      if (!response.success) {
        throw new Error(response.error || 'Assessment failed');
      }

      // Check for emergency
      if (response.emergency) {
        return {
          emergency: true,
          message: response.message,
        };
      }

      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get follow-up questions
  const getFollowUpQuestions = useCallback(async (symptoms, context = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.getFollowUpQuestions(symptoms, context);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get questions');
      }

      return response.data.questions;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get specialty recommendations
  const getSpecialtyRecommendations = useCallback(async (assessment) => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.getSpecialtyRecommendations(assessment);

      if (!response.success) {
        throw new Error(response.error || 'Failed to get recommendations');
      }

      return response.data.specialties;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get greeting
  const getGreeting = useCallback(async () => {
    try {
      const response = await llmService.getGreeting();
      return response.data.message;
    } catch (err) {
      return "Hello! I'm here to help you understand your symptoms. How can I assist you today?";
    }
  }, []);

  return {
    loading,
    streaming,
    error,
    sendMessage,
    streamMessage,
    assessSymptoms,
    getFollowUpQuestions,
    getSpecialtyRecommendations,
    getGreeting,
  };
};

export default useLLM;