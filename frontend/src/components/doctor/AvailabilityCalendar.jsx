import React, { useState, useEffect } from 'react';
import { useDoctors } from '../../hooks/useDoctors';

const AvailabilityCalendar = ({ doctorId }) => {
  const [availability, setAvailability] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Fetch availability for doctor
    const fetchAvailability = async () => {
      // Implementation to fetch and set availability
    };
    fetchAvailability();
  }, [doctorId]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Available Slots</h3>
      
      {availability && (
        <div className="space-y-4">
          {availability.availableSlots?.map((slot, idx) => (
            <div key={idx} className="border rounded-lg p-4">
              <p className="font-bold mb-2">
                {new Date(slot.date).toLocaleDateString()}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {slot.slots.map((time, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedDate({ date: slot.date, time })}
                    className={`p-2 rounded border ${
                      selectedDate?.time === time
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-300'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;