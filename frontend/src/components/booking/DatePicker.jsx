import React, { useState } from 'react';

const DatePicker = ({ onSelect, minDate, maxDate, disabled = false }) => {
  const [selectedDate, setSelectedDate] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onSelect(date);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">Select Date</label>
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => handleDateChange(e.target.value)}
        min={minDate}
        max={maxDate}
        disabled={disabled}
        className="input-base"
      />
    </div>
  );
};

export default DatePicker;