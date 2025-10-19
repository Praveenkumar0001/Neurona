import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, FileText, Heart, TrendingUp } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { useAuth } from '../hooks/useAuth';
import { bookingService } from '../services/bookingService';
import { symptomService } from '../services/symptomService';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsData = await bookingService.getBookingStats();
      setStats(statsData);

      // Fetch upcoming bookings
      const bookingsData = await bookingService.getMyBookings(1, 5, { upcoming: 'true' });
      setUpcomingBookings(bookingsData.bookings);

      // Fetch latest report
      const report = await symptomService.getLatestReport();
      setLatestReport(report);
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
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.name}!
          </h1>
          <p className="text-lg text-gray-600">Here's what's happening with your mental health journey</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
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
              <Heart className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Upcoming Appointments</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.upcomingBookings || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-orange-500 opacity-20" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Health Score</p>
                <p className="text-3xl font-bold text-gray-900">{latestReport?.analysis?.severity === 'mild' ? '85' : latestReport?.analysis?.severity === 'moderate' ? '65' : '45'}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Appointments</h2>
              </div>

              {upcomingBookings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Dr. {booking.doctorId?.name}
                        </h3>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{booking.doctorId?.specialty}</p>
                      <p className="text-gray-600 text-sm">
                        📅 {new Date(booking.bookingDate).toLocaleDateString()} at {booking.bookingTime}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full"
                        onClick={() => navigate(`/my-bookings`)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No upcoming appointments</p>
                  <Button onClick={() => navigate('/doctors')}>
                    Book an Appointment
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Latest Assessment */}
          <div>
            <Card>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Latest Assessment</h2>
              </div>

              {latestReport ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Overall Score</p>
                    <p className="text-3xl font-bold text-gray-900">{latestReport.analysis?.overallScore}/30</p>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Severity</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        latestReport.analysis?.severity === 'mild' ? 'bg-green-500' :
                        latestReport.analysis?.severity === 'moderate' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="font-medium text-gray-900 capitalize">
                        {latestReport.analysis?.severity}
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-600 text-sm mb-1">Recommendation</p>
                    <p className="font-medium text-gray-900 capitalize">
                      Consult a {latestReport.analysis?.recommendation}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => navigate('/my-reports')}
                    >
                      <FileText className="w-4 h-4" />
                      View All Reports
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No assessments yet</p>
                  <Button onClick={() => navigate('/symptom-intake')}>
                    Start Assessment
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/symptom-intake')}
                >
                  📋 New Assessment
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/doctors')}
                >
                  🔍 Find Doctor
                </Button>
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  onClick={() => navigate('/my-bookings')}
                >
                  📅 My Bookings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientDashboard;