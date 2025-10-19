import React from 'react';
import Button from '../common/Button';
import Badge from '../common/Badge';

const BookingCard = ({ booking, onReschedule, onCancel }) => {
  const statusColors = {
    pending: 'warning',
    confirmed: 'success',
    completed: 'success',
    cancelled: 'error',
  };

  return (
    <div className="card-base">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{booking.doctorName}</h3>
          <p className="text-sm text-slate-600">{booking.specialization}</p>
        </div>
        <Badge variant={statusColors[booking.status]}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <p>📅 {new Date(booking.date).toLocaleDateString()}</p>
        <p>⏰ {booking.timeSlot}</p>
        <p>💰 ${booking.consultationFee}</p>
      </div>

      <div className="flex gap-2">
        {booking.status === 'confirmed' && (
          <>
            <Button variant="secondary" size="sm" onClick={() => onReschedule(booking._id)}>
              Reschedule
            </Button>
            <Button variant="secondary" size="sm" onClick={() => onCancel(booking._id)}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingCard;