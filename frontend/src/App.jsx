import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import VerifyOTP from './pages/VerifyOTP.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { getToken } from './services/authService.js';

function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-teal-50 px-4">
      <div className="max-w-2xl w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          MRMS Dashboard
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          You are now securely logged in. Welcome to the MRMS Dashboard.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-100 bg-sky-50/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
              Patient Records
            </p>
            <p className="mt-2 text-sm text-slate-700">
              View, upload and manage patient medical reports in one place.
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-teal-50/70 p-4">
            <p className="text-xs font-semibold tracking-wide text-teal-700 uppercase">
              Secure Access
            </p>
            <p className="mt-2 text-sm text-slate-700">
              Role-based access and OTP verification keep patient data safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const isAuthenticated = !!getToken();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Catch-all: redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
