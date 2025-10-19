const Booking = require('../models/Booking');

class BookingService {
  async createBooking(bookingData) {
    const booking = new Booking(bookingData);
    await booking.save();
    logger.info('Booking created in service', { bookingId: booking._id });
    return booking;
  }

  async getBookingsByPatient(patientId) {
    return await Booking.find({ patientId }).populate('doctorId');
  }

  async getBookingById(id) {
    return await Booking.findById(id).populate(['patientId', 'doctorId']);
  }

  async updateBooking(id, updateData) {
    return await Booking.findByIdAndUpdate(id, updateData, { new: true });
  }

  async cancelBooking(id) {
    return await Booking.findByIdAndUpdate(id, { status: 'cancelled' }, { new: true });
  }
}

module.exports = new BookingService();