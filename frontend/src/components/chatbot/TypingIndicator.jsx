import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex gap-2 p-4">
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
};

export default TypingIndicator;