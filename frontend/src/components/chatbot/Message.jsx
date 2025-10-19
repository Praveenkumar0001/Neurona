import React from 'react';

const Message = ({ text, type, timestamp }) => {
  const isUser = type === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs rounded-lg p-3 ${
        isUser ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
      }`}>
        <p>{text}</p>
        <span className={`text-xs mt-1 block ${isUser ? 'text-blue-100' : 'text-slate-600'}`}>
          {timestamp ? new Date(timestamp).toLocaleTimeString() : ''}
        </span>
      </div>
    </div>
  );
};

export default Message;