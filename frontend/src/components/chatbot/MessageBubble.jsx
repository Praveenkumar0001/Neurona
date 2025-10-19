import React from 'react';
import Avatar from '../common/Avatar';

const MessageBubble = ({ message }) => {
  const isUser = message.type === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isUser && <Avatar name="Bot" size="sm" />}
      <div className={`max-w-md rounded-lg p-4 ${
        isUser ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-100 text-slate-900'
      }`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        <span className={`text-xs mt-2 block opacity-70`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;