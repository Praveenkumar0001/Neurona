import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleBasedRoute from './components/auth/RoleBasedRoute';

// Pages - Lazy loaded for better performance
const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Patient Pages
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const SymptomIntake = lazy(() => import('./pages/SymptomIntake'));
const DoctorListing = lazy(() => import('./pages/DoctorListing'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const MyReports = lazy(() => import('./pages/MyReports'));

// Doctor Pages
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));

// Common Pages
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const HelpCenter = lazy(() => import('./pages/HelpCenter'));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />

        {/* Protected Patient Routes */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <PatientDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/symptom-intake"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <SymptomIntake />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <DoctorListing />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:doctorId"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <BookingPage />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <MyBookings />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="patient">
                <MyReports />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* Protected Doctor Routes */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute>
              <RoleBasedRoute requiredRole="doctor">
                <DoctorDashboard />
              </RoleBasedRoute>
            </ProtectedRoute>
          }
        />

        {/* Protected Common Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;