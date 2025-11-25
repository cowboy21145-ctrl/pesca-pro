import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Public Pages
import Landing from './pages/Landing';
import UserLogin from './pages/auth/UserLogin';
import UserRegister from './pages/auth/UserRegister';
import OrganizerLogin from './pages/auth/OrganizerLogin';
import OrganizerRegister from './pages/auth/OrganizerRegister';
import PublicRegister from './pages/public/PublicRegister';
import PublicLeaderboard from './pages/public/PublicLeaderboard';

// User Pages
import UserDashboard from './pages/user/Dashboard';
import MyRegistrations from './pages/user/MyRegistrations';
import RegistrationDetail from './pages/user/RegistrationDetail';
import UploadCatch from './pages/user/UploadCatch';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/Dashboard';
import TournamentList from './pages/organizer/TournamentList';
import TournamentCreate from './pages/organizer/TournamentCreate';
import TournamentDetail from './pages/organizer/TournamentDetail';
import TournamentEdit from './pages/organizer/TournamentEdit';
import PondManager from './pages/organizer/PondManager';
import RegistrationManager from './pages/organizer/RegistrationManager';
import CatchApproval from './pages/organizer/CatchApproval';

// Protected Route Components
const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (role && user?.role !== role) {
    return <Navigate to={user?.role === 'organizer' ? '/organizer' : '/user'} />;
  }
  
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'organizer' ? '/organizer' : '/user'} />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      
      <Route path="/login" element={
        <PublicOnlyRoute><UserLogin /></PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute><UserRegister /></PublicOnlyRoute>
      } />
      <Route path="/organizer/login" element={
        <PublicOnlyRoute><OrganizerLogin /></PublicOnlyRoute>
      } />
      <Route path="/organizer/register" element={
        <PublicOnlyRoute><OrganizerRegister /></PublicOnlyRoute>
      } />
      
      {/* Public Tournament Routes */}
      <Route path="/t/:link" element={<PublicRegister />} />
      <Route path="/lb/:link" element={<PublicLeaderboard />} />
      
      {/* User Routes */}
      <Route path="/user" element={
        <ProtectedRoute role="user">
          <Layout role="user" />
        </ProtectedRoute>
      }>
        <Route index element={<UserDashboard />} />
        <Route path="registrations" element={<MyRegistrations />} />
        <Route path="registrations/:id" element={<RegistrationDetail />} />
        <Route path="upload-catch/:registrationId" element={<UploadCatch />} />
      </Route>
      
      {/* Organizer Routes */}
      <Route path="/organizer" element={
        <ProtectedRoute role="organizer">
          <Layout role="organizer" />
        </ProtectedRoute>
      }>
        <Route index element={<OrganizerDashboard />} />
        <Route path="tournaments" element={<TournamentList />} />
        <Route path="tournaments/create" element={<TournamentCreate />} />
        <Route path="tournaments/:id" element={<TournamentDetail />} />
        <Route path="tournaments/:id/edit" element={<TournamentEdit />} />
        <Route path="tournaments/:id/ponds" element={<PondManager />} />
        <Route path="tournaments/:id/registrations" element={<RegistrationManager />} />
        <Route path="tournaments/:id/catches" element={<CatchApproval />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f8fafc',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f8fafc',
              },
            },
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

