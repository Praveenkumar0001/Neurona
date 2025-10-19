import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Phone, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import Modal from '../components/common/Modal';
import { bookingService } from '../services/bookingService';

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const filters = {};

      if (activeTab === 'upcoming') {
        filters.upcoming = 'true';
        filters.status = 'confirmed';
      } else if (activeTab === 'completed') {
        filters.status = 'completed';
      } else if (activeTab === 'cancelled') {
        filters.status = 'cancelled';
      }

      const result = await bookingService.getMyBookings(1, 100, filters);
      setBookings(result.bookings);
    } catch (error) {
      toast.error('Error fetching bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const submitCancellation = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.updateBookingStatus(
        selectedBooking._id,
        'cancelled',
        cancellationReason
      );

      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setCancellationReason('');
      fetchBookings();
    } catch (error) {
      toast.error('Error cancelling booking');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading your bookings..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-8">
            {['upcoming', 'completed', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'upcoming' ? 'Upcoming' : tab === 'completed' ? 'Completed' : 'Cancelled'}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking._id} className="hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-4 gap-6 mb-4">
                  {/* Doctor Info */}
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Doctor</p>
                    <p className="font-semibold text-gray-900">Dr. {booking.doctorId?.name}</p>
                    <p className="text-sm text-blue-600 capitalize">{booking.doctorId?.specialty}</p>
                  </div>

                  {/* Date & Time */}
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Date & Time</p>
                    <div className="flex items-center gap-2 text-gray-900 font-semibold">
                      <Calendar className="w-4 h-4" />
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Clock className="w-4 h-4" />
                      {booking.bookingTime}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)} capitalize`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Fee */}
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Fee</p>
                    <p className="text-2xl font-bold text-gray-900">₹{booking.amount}</p>
                    <p className="text-sm text-gray-600">{booking.paymentStatus}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200 flex gap-3">
                  {booking.status === 'confirmed' && new Date(booking.bookingDate) > new Date() && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/booking/${booking.doctorId._id}`)}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </Button>
                    </>
                  )}

                  {booking.status === 'completed' && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate('/doctors')}
                      >
                        Book Again
                      </Button>
                    </>
                  )}

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/my-bookings/${booking._id}`)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming'
                ? 'No upcoming appointments'
                : activeTab === 'completed'
                ? 'No completed appointments'
                : 'No cancelled appointments'}
            </p>
            <Button onClick={() => navigate('/doctors')}>
              Book an Appointment
            </Button>
          </Card>
        )}
      </main>

      {/* Cancellation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Booking"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this booking with Dr. {selectedBooking?.doctorId?.name}?
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Cancellation
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please tell us why you're cancelling..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowCancelModal(false)}
              disabled={submitting}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={submitCancellation}
              loading={submitting}
              disabled={submitting}
            >
              Cancel Booking
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
};

export default MyBookings;