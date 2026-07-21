import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import PatientDashboard from './pages/patient/PatientDashboard';
import FindDoctors from './pages/patient/FindDoctors';
import MyAppointments from './pages/patient/MyAppointments';
import Prescriptions from './pages/patient/Prescriptions';
import Profile from './pages/patient/Profile';

import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AppointmentRequests from './pages/doctor/AppointmentRequests';
import Availability from './pages/doctor/Availability';
import DoctorProfile from './pages/doctor/DoctorProfile';

import AdminDashboard from './pages/admin/AdminDashboard';
import DoctorsAdmin from './pages/admin/DoctorsAdmin';
import DepartmentsAdmin from './pages/admin/DepartmentsAdmin';
import PatientsAdmin from './pages/admin/PatientsAdmin';
import AppointmentsAdmin from './pages/admin/AppointmentsAdmin';

// Renders the correct "home" dashboard/appointments page for the logged-in role
function RoleDashboard() {
  const { user } = useAuth();
  if (user?.role === 'doctor') return <DoctorDashboard />;
  if (user?.role === 'admin') return <AdminDashboard />;
  return <PatientDashboard />;
}

function RoleAppointments() {
  const { user } = useAuth();
  if (user?.role === 'doctor') return <AppointmentRequests />;
  if (user?.role === 'admin') return <AppointmentsAdmin />;
  return <MyAppointments />;
}

function RoleProfile() {
  const { user } = useAuth();
  if (user?.role === 'doctor') return <DoctorProfile />;
  return <Profile />;
}

function RoleDoctors() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <DoctorsAdmin />;
  return <FindDoctors />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px' } }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<RoleDashboard />} />
            <Route path="appointments" element={<RoleAppointments />} />
            <Route path="profile" element={<RoleProfile />} />

            {/* Shared path, role-dispatched: patients see search/booking, admins see management */}
            <Route
              path="doctors"
              element={
                <ProtectedRoute allowedRoles={['patient', 'admin']}>
                  <RoleDoctors />
                </ProtectedRoute>
              }
            />

            {/* Patient-only */}
            <Route
              path="prescriptions"
              element={
                <ProtectedRoute allowedRoles={['patient']}>
                  <Prescriptions />
                </ProtectedRoute>
              }
            />

            {/* Doctor-only */}
            <Route
              path="availability"
              element={
                <ProtectedRoute allowedRoles={['doctor']}>
                  <Availability />
                </ProtectedRoute>
              }
            />

            {/* Admin-only */}
            <Route
              path="departments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DepartmentsAdmin />
                </ProtectedRoute>
              }
            />
            <Route
              path="patients-admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <PatientsAdmin />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
