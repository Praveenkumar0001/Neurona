
import React, { useState } from 'react';
import Button from '../common/Button';

const ChatInput = ({ onSend, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="input-base flex-1"
          disabled={disabled}
        />
        <Button type="submit" variant="primary" disabled={disabled || !message.trim()}>
          Send
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;