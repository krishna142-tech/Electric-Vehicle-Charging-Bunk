import { FC, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import Bookings from './pages/admin/Bookings';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStations from './pages/admin/ManageStations';
import Stations from './pages/user/Stations';
import UserBookings from './pages/user/UserBookings';
import NotFound from './pages/NotFound';
import FirebaseConnectionError from './components/FirebaseConnectionError';
import { initializeFirestore } from './utils/firebaseErrorHandler';
import { db } from './config/firebase';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import PaymentPage from './pages/PaymentPage';
import AdminStationsMap from './pages/admin/AdminStationsMap';
import ScanQR from './pages/admin/ScanQR';
import { startExpiredBookingsCheck } from './services/booking';

const App: FC = () => {
  const [firebaseError, setFirebaseError] = useState<string>();

  useEffect(() => {
    initializeFirestore(db).then(({ success, error }) => {
      if (!success && error) {
        setFirebaseError(error);
      }
    });

    // Start checking for expired bookings
    const interval = startExpiredBookingsCheck();

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout>
            <FirebaseConnectionError error={firebaseError} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/stations" element={
                <ProtectedRoute>
                  <Stations />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute>
                  <UserBookings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } />

              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/stations" element={
                <ProtectedRoute requiredRole="admin">
                  <ManageStations />
                </ProtectedRoute>
              } />
              <Route path="/admin/bookings" element={
                <ProtectedRoute requiredRole="admin">
                  <Bookings />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProfile />
                </ProtectedRoute>
              } />
              <Route path="/admin/stations-map" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminStationsMap />
                </ProtectedRoute>
              } />
              <Route path="/admin/scan-qr" element={
                <ProtectedRoute requiredRole="admin">
                  <ScanQR />
                </ProtectedRoute>
              } />

              {/* Payment Route */}
              <Route path="/payment" element={<PaymentPage />} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
