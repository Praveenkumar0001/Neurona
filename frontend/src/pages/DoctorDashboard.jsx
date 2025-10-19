import { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, TrendingUp } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { bookingService } from '../services/bookingService';
import { doctorService } from '../services/doctorService';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch booking stats
      const statsData = await bookingService.getBookingStats();
      setStats(statsData);

      // Fetch upcoming bookings
      const bookingsData = await bookingService.getMyBookings(1, 5, { upcoming: 'true' });
      setUpcomingBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loading text="Loading your dashboard..." />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, Dr. {user?.profile?.name}!
          </h1>
          <p className="text-lg text-gray-600">Here's your practice overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Completed Sessions</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.completedBookings || 0}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Upcoming Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.upcomingBookings || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.totalBookings > 0 
                    ? Math.round((stats.completedBookings / stats.totalBookings) * 100) 
                    : 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Appointments</h2>

          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.patientId?.profile?.name}</h3>
                      <p className="text-sm text-gray-600">Age: {booking.patientId?.profile?.age} • {booking.patientId?.profile?.gender}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div>📅 {new Date(booking.bookingDate).toLocaleDateString()}</div>
                    <div>🕐 {booking.bookingTime}</div>
                    <div>📞 {booking.patientId?.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No upcoming appointments</p>
          )}
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;