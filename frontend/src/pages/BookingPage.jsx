import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { doctorService } from '../services/doctorService';
import { bookingService } from '../services/bookingService';
import { symptomService } from '../services/symptomService';

const BookingPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [reports, setReports] = useState([]);
  const [bookingData, setBookingData] = useState({
    bookingDate: '',
    bookingTime: '',
    reportId: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, [doctorId]);

  useEffect(() => {
    if (bookingData.bookingDate) {
      updateAvailableSlots();
    }
  }, [bookingData.bookingDate]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch doctor
      const doctorData = await doctorService.getDoctorById(doctorId);
      setDoctor(doctorData);

      // Fetch patient's reports
      const reportsData = await symptomService.getMyReports(1, 100);
      setReports(reportsData.reports);
    } catch (error) {
      toast.error('Error loading booking page');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateAvailableSlots = () => {
    if (!doctor || !bookingData.bookingDate) return;

    const selectedDate = new Date(bookingData.bookingDate);
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    const slots = doctor.availability[dayName] || [];
    setAvailableSlots(slots);
    
    if (!slots.includes(bookingData.bookingTime)) {
      setBookingData(prev => ({ ...prev, bookingTime: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const validateBooking = () => {
    if (!bookingData.bookingDate) {
      toast.error('Please select a date');
      return false;
    }
    if (!bookingData.bookingTime) {
      toast.error('Please select a time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateBooking()) return;

    setSubmitting(true);
    try {
      const result = await bookingService.createBooking({
        doctorId,
        bookingDate: bookingData.bookingDate,
        bookingTime: bookingData.bookingTime,
        reportId: bookingData.reportId || undefined,
        notes: bookingData.notes
      });

      if (result.success) {
        toast.success('Booking created successfully!');
        navigate('/my-bookings');
      }
    } catch (error) {
      toast.error('Error creating booking');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading booking details..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Doctor not found</p>
        </div>
        <Footer />
      </div>
    );
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const nextAvailableSlot = doctor.getNextAvailableSlot?.();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book Appointment</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <img
                src={doctor.profileImage}
                alt={doctor.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Dr. {doctor.name}</h2>
              <p className="text-blue-600 font-medium capitalize mb-4">{doctor.specialty}</p>

              <div className="space-y-3 mb-6 text-sm text-gray-600">
                <p>🎓 {doctor.qualification}</p>
                <p>👔 {doctor.experience} years experience</p>
                <p className="font-semibold text-gray-900">💰 ₹{doctor.fee} per session</p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-2">Next Available:</p>
                {nextAvailableSlot ? (
                  <p className="font-semibold text-gray-900">
                    {nextAvailableSlot.day} at {nextAvailableSlot.time}
                  </p>
                ) : (
                  <p className="text-gray-600">No slots available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={bookingData.bookingDate}
                    onChange={handleChange}
                    min={minDate}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Time Selection */}
                {bookingData.bookingDate && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Select Time Slot
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setBookingData(prev => ({ ...prev, bookingTime: slot }))}
                          className={`p-3 rounded-lg border-2 transition-all font-medium ${
                            bookingData.bookingTime === slot
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Report Selection */}
                {reports.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Attach Assessment Report (Optional)
                    </label>
                    <select
                      name="reportId"
                      value={bookingData.reportId}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a report</option>
                      {reports.map((report) => (
                        <option key={report._id} value={report._id}>
                          {new Date(report.createdAt).toLocaleDateString()} - {report.analysis.severity}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      Sharing your assessment report helps the doctor understand your situation better
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleChange}
                    placeholder="Any specific concerns or questions for the doctor..."
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Summary</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Doctor:</strong> Dr. {doctor.name}</p>
                    <p><strong>Date:</strong> {bookingData.bookingDate ? new Date(bookingData.bookingDate).toLocaleDateString() : 'Not selected'}</p>
                    <p><strong>Time:</strong> {bookingData.bookingTime || 'Not selected'}</p>
                    <p className="pt-2 border-t border-blue-200"><strong>Consultation Fee:</strong> ₹{doctor.fee}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate('/doctors')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={submitting}
                    disabled={submitting || !bookingData.bookingDate || !bookingData.bookingTime}
                  >
                    Confirm Booking
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;