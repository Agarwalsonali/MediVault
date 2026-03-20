import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyOTP from './pages/VerifyOTP.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { getToken } from './services/authService.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Reports from './pages/Reports.jsx';
import UploadReport from './pages/UploadReport.jsx';
import Profile from './pages/Profile.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';

function PublicOnlyRoute({ isAuthenticated, children }) {
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(!!getToken());
    };

    window.addEventListener('auth-changed', syncAuthState);
    window.addEventListener('storage', syncAuthState);

    return () => {
      window.removeEventListener('auth-changed', syncAuthState);
      window.removeEventListener('storage', syncAuthState);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/dashboard"
          element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<DashboardHome />} />
          <Route path="staff" element={<StaffDashboard />} />
          <Route path="reports" element={<Reports />} />
          <Route path="upload" element={<UploadReport />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route
          path="/login"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <Signup />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <VerifyEmail />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicOnlyRoute isAuthenticated={isAuthenticated}>
              <VerifyOTP />
            </PublicOnlyRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Catch-all: redirect unknown routes */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
