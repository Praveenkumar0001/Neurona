import React from 'react';

const TimeSlotSelector = ({ slots, selectedSlot, onSelect, disabled = false }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          disabled={disabled}
          className={`p-3 rounded-lg border-2 transition-colors ${
            selectedSlot === slot
              ? 'border-blue-600 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
};

export default TimeSlotSelector;