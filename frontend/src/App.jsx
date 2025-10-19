import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import SymptomIntake from './pages/SymptomIntake';
import DoctorListing from './pages/DoctorListing';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import MyReports from './pages/MyReports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <RoleBasedRoute role="patient">
                <PatientDashboard />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/symptom-intake"
            element={
              <ProtectedRoute>
                <SymptomIntake />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <DoctorListing />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/:doctorId"
            element={
              <RoleBasedRoute role="patient">
                <BookingPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <RoleBasedRoute role="patient">
                <MyReports />
              </RoleBasedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <RoleBasedRoute role="doctor">
                <DoctorDashboard />
              </RoleBasedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found */}
          <Route path="/not-found" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;