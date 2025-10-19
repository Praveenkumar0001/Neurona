
import React, { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';

const BookingForm = ({ doctorId, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    symptoms: [],
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, doctorId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Select Date</label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Select Time Slot</label>
        <select
          name="timeSlot"
          value={formData.timeSlot}
          onChange={handleChange}
          className="input-base"
          required
        >
          <option value="">Choose a time slot</option>
          <option value="09:00">09:00 AM</option>
          <option value="09:30">09:30 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="10:30">10:30 AM</option>
          <option value="14:00">2:00 PM</option>
          <option value="14:30">2:30 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="15:30">3:30 PM</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Symptoms (Optional)</label>
        <textarea
          name="symptoms"
          value={formData.symptoms}
          onChange={handleChange}
          placeholder="Describe your symptoms..."
          className="input-base"
          rows="3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Additional Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information..."
          className="input-base"
          rows="2"
        />
      </div>

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Booking...' : 'Confirm Booking'}
      </Button>
    </form>
  );
};

export default BookingForm;