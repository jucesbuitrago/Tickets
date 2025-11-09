import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/AdminDashboard';
import ImportGraduates from './pages/ImportGraduates';
import CreateEventAuditorium from './pages/CreateEventAuditorium';
import OccupancyDashboard from './pages/OccupancyDashboard';
import TicketsList from './pages/TicketsList';

// Placeholder components for role-based dashboards
const StaffDashboard = () => <div className="p-8"><h1>Staff Dashboard</h1></div>;

// Graduate components
import GraduateProfile from './pages/GraduateProfile';
import GraduateInvitations from './pages/GraduateInvitations';
import GraduateTickets from './pages/GraduateTickets';
import QRScanner from './pages/QRScanner';
import HomeGraduado from './pages/HomeGraduado';
import PerfilGraduado from './pages/PerfilGraduado';
import TicketView from './pages/TicketView';
import FormInvitado from './pages/FormInvitado';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* Role-based protected routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/import-graduates"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <ImportGraduates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/create-event-auditorium"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <CreateEventAuditorium />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/occupancy-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <OccupancyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tickets-list"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <TicketsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff/*"
          element={
            <ProtectedRoute allowedRoles={['STAFF']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/scanner"
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
              <QRScanner />
            </ProtectedRoute>
          }
        />

        <Route
          path="/graduate"
          element={
            <ProtectedRoute allowedRoles={['GRADUANDO']}>
              <HomeGraduado />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graduate/profile"
          element={
            <ProtectedRoute allowedRoles={['GRADUANDO']}>
              <PerfilGraduado />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graduate/invitations"
          element={
            <ProtectedRoute allowedRoles={['GRADUANDO']}>
              <GraduateInvitations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graduate/tickets"
          element={
            <ProtectedRoute allowedRoles={['GRADUANDO']}>
              <TicketView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/graduate/add-guest"
          element={
            <ProtectedRoute allowedRoles={['GRADUANDO']}>
              <FormInvitado />
            </ProtectedRoute>
          }
        />

        {/* Default redirect based on authentication and role */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              (() => {
                switch (user.role) {
                  case 'ADMIN':
                    return <Navigate to="/admin" replace />;
                  case 'STAFF':
                    return <Navigate to="/staff" replace />;
                  case 'GRADUANDO':
                    return <Navigate to="/graduate" replace />;
                  default:
                    return <Navigate to="/login" replace />;
                }
              })()
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;