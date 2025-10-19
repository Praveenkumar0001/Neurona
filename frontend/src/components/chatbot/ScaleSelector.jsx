import React, { useState } from 'react';

const ScaleSelector = ({ min = 1, max = 10, onSelect, label = 'Rate' }) => {
  const [value, setValue] = useState(min);

  const handleSelect = () => {
    onSelect(value);
  };

  return (
    <div className="space-y-4">
      <label className="text-lg font-medium">{label}</label>
      <div className="flex justify-between items-center gap-2">
        {Array.from({ length: max - min + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setValue(min + i)}
            className={`w-10 h-10 rounded-lg border-2 transition-colors ${
              value === min + i
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 hover:border-blue-400'
            }`}
          >
            {min + i}
          </button>
        ))}
      </div>
      <button
        onClick={handleSelect}
        className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
      >
        Continue
      </button>
    </div>
  );
};

export default ScaleSelector;