import React from 'react';

const OptionSelector = ({ options, onSelect, multiple = false }) => {
  const [selected, setSelected] = React.useState([]);

  const handleSelect = (option) => {
    if (multiple) {
      const newSelected = selected.includes(option)
        ? selected.filter(s => s !== option)
        : [...selected, option];
      setSelected(newSelected);
    } else {
      onSelect(option);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => handleSelect(option)}
          className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
            selected.includes(option)
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400'
          }`}
        >
          {multiple && (
            <input
              type="checkbox"
              checked={selected.includes(option)}
              readOnly
              className="mr-2"
            />
          )}
          {option}
        </button>
      ))}
      {multiple && (
        <button
          onClick={() => onSelect(selected)}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700"
        >
          Continue
        </button>
      )}
    </div>
  );
};

export default OptionSelector;