import api from './api';

export const bookingService = {
  createBooking: async (bookingData) => {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  getMyBookings: async (page = 1, limit = 10, filters = {}) => {
    const params = {
      page,
      limit,
      ...filters
    };
    const response = await api.get('/bookings', { params });
    return response.data;
  },

  getBookingById: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data.booking;
  },

  updateBookingStatus: async (bookingId, status, cancellationReason = '') => {
    const response = await api.put(`/bookings/${bookingId}/status`, {
      status,
      cancellationReason
    });
    return response.data;
  },

  rescheduleBooking: async (bookingId, newDate, newTime) => {
    const response = await api.put(`/bookings/${bookingId}/reschedule`, {
      newDate,
      newTime
    });
    return response.data;
  },

  addPrescription: async (bookingId, prescriptionData) => {
    const response = await api.put(`/bookings/${bookingId}/prescription`, prescriptionData);
    return response.data;
  },

  addDoctorNotes: async (bookingId, doctorNotes) => {
    const response = await api.put(`/bookings/${bookingId}/notes`, { doctorNotes });
    return response.data;
  },

  getBookingStats: async () => {
    const response = await api.get('/bookings/stats');
    return response.data.stats;
  }
};