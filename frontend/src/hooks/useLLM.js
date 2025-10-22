// Custom React Hook for LLM operations
import { useState, useCallback } from 'react';
import llmService from '../services/llmService';
import { useToast } from './useToast';

export const useLLM = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const { showToast } = useToast();

  /**
   * Start a new conversation
   */
  const startConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await llmService.startConversation();
      
      if (response.success) {
        setSessionId(response.data.sessionId);
        setMessages([{
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        }]);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to start conversation', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (message) => {
    if (!sessionId) {
      showToast('No active session', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    // Optimistically add user message
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await llmService.sendMessage(sessionId, message);
      
      if (response.success) {
        // Add AI response
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.message,
          timestamp: new Date()
        }]);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      // Remove optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
      showToast('Failed to send message', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  /**
   * Generate summary
   */
  const generateSummary = useCallback(async () => {
    if (!sessionId) {
      showToast('No active session', 'error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await llmService.generateSummary(sessionId);
      
      if (response.success) {
        setSummary(response.data);
        showToast('Summary generated successfully', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to generate summary', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  /**
   * Load conversation history
   */
  const loadConversation = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.getConversation(id);
      
      if (response.success) {
        setSessionId(id);
        setMessages(response.data.conversationHistory || []);
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to load conversation', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Reset conversation
   */
  const resetConversation = useCallback(() => {
    setSessionId(null);
    setMessages([]);
    setSummary(null);
    setError(null);
  }, []);

  /**
   * Test LLM connection
   */
  const testConnection = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await llmService.testConnection();
      
      if (response.success) {
        showToast('LLM connection successful', 'success');
        return response.data;
      }
    } catch (err) {
      setError(err.message);
      showToast('LLM connection failed', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  return {
    // State
    loading,
    error,
    sessionId,
    messages,
    summary,
    
    // Actions
    startConversation,
    sendMessage,
    generateSummary,
    loadConversation,
    resetConversation,
    testConnection
  };
};