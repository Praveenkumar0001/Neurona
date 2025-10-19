
import React, { useEffect, useState } from 'react';
import { useBooking } from '../../hooks/useBooking';
import BookingCard from './BookingCard';
import Loading from '../common/Loading';

const BookingHistory = () => {
  const { bookings, loading, fetchBookings } = useBooking();

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Booking History</h2>
      {bookings.length === 0 ? (
        <p className="text-center text-slate-600">No bookings found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map(booking => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;