import React from 'react';
import Button from '../common/Button';

const BookingConfirmation = ({ booking, onConfirm, onCancel, loading }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between border-b pb-3">
          <span className="font-medium">Appointment ID:</span>
          <span>{booking.appointmentId}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="font-medium">Doctor:</span>
          <span>{booking.doctorName}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="font-medium">Date:</span>
          <span>{new Date(booking.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="font-medium">Time:</span>
          <span>{booking.timeSlot}</span>
        </div>
        <div className="flex justify-between border-b pb-3">
          <span className="font-medium">Fee:</span>
          <span className="text-lg font-bold">${booking.consultationFee}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="primary" fullWidth onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </Button>
        <Button variant="secondary" fullWidth onClick={onCancel}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;