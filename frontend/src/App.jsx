import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyOTP from './pages/VerifyOTP.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import SetPassword from './pages/SetPassword.jsx';
import Home from './pages/Home.jsx';
import { decodeJwtToken, getDashboardPathByRole, getRole, getToken } from './services/authService.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Reports from './pages/Reports.jsx';
import UploadReport from './pages/UploadReport.jsx';
import PatientUploadReport from './pages/PatientUploadReport.jsx';
import Profile from './pages/Profile.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import StaffProfile from './pages/StaffProfile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManageStaff from './pages/ManageStaff.jsx';
import AdminProfile from './pages/AdminProfile.jsx';
import { getUser } from './utils/getUser.js';
import { useSessionTimeout } from './hooks/useSessionTimeout.js';

const STAFF_ROLES = ['Nurse', 'Doctor', 'Staff'];
const PATIENT_ROLES = ['Patient'];

function PublicOnlyRoute({ isAuthenticated, role, children }) {
  if (isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }
  return children;
}

function RoleRoute({ isAuthenticated, role, allowedRoles, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return children;
}

function AdminOnlyRoute({ children }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const decoded = decodeJwtToken(token);
  if (!decoded || decoded.role !== 'Admin') {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Session timeout manager component
function SessionTimeoutManager({ isAuthenticated, children }) {
  // Enable session timeout only when user is authenticated (300 minutes)
  useSessionTimeout(isAuthenticated ? 300 : false);
  return children;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken());
  const [role, setRole] = useState(() => getUser()?.role || getRole());

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(!!getToken());
      setRole(getUser()?.role || getRole());
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
      <SessionTimeoutManager isAuthenticated={isAuthenticated}>
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to={getDashboardPathByRole(role)} replace /> : <Home />}
          />

          <Route
            path="/dashboard"
            element={
              <RoleRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={PATIENT_ROLES}>
                <DashboardLayout />
              </RoleRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="reports" element={<Reports />} />
            <Route path="upload" element={<PatientUploadReport />} />
            <Route path="upload-report" element={<PatientUploadReport />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route
            path="/staff-dashboard"
            element={
              <RoleRoute isAuthenticated={isAuthenticated} role={role} allowedRoles={STAFF_ROLES}>
                <DashboardLayout />
              </RoleRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="upload" element={<UploadReport />} />
            <Route path="profile" element={<StaffProfile />} />
          </Route>

          <Route
            path="/admin-dashboard"
            element={
              <AdminOnlyRoute>
                <DashboardLayout />
              </AdminOnlyRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
          </Route>

          <Route
            path="/manage-staff"
            element={
              <AdminOnlyRoute>
                <DashboardLayout />
              </AdminOnlyRoute>
            }
          >
            <Route index element={<ManageStaff />} />
          </Route>

          <Route
            path="/admin-profile"
            element={
              <AdminOnlyRoute>
                <DashboardLayout />
              </AdminOnlyRoute>
            }
          >
            <Route index element={<AdminProfile />} />
          </Route>

          <Route
            path="/login"
            element={
              <PublicOnlyRoute isAuthenticated={isAuthenticated} role={role}>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute isAuthenticated={isAuthenticated} role={role}>
                <Signup />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/verify-email"
            element={
              <PublicOnlyRoute isAuthenticated={isAuthenticated} role={role}>
                <VerifyEmail />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <PublicOnlyRoute isAuthenticated={isAuthenticated} role={role}>
                <VerifyOTP />
              </PublicOnlyRoute>
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Catch-all: redirect unknown routes */}
          <Route path="*" element={<Navigate to={isAuthenticated ? getDashboardPathByRole(role) : '/'} replace />} />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </SessionTimeoutManager>
    </BrowserRouter>
  );
}

export default App;
