import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/ui';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import LogWorkout from './pages/LogWorkout';
import Insights from './pages/Insights';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import PersonalRecords from './pages/PersonalRecords';
import Goals from './pages/Goals';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen text="Loading..." />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <DashboardLayout>{children}</DashboardLayout>;
}

// Public Route Component (redirects to dashboard if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen text="Loading..." />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/workouts" element={
        <ProtectedRoute>
          <Workouts />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/log-workout" element={
        <ProtectedRoute>
          <LogWorkout />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/insights" element={
        <ProtectedRoute>
          <Insights />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/analytics" element={
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/records" element={
        <ProtectedRoute>
          <PersonalRecords />
        </ProtectedRoute>
      } />
      <Route path="/dashboard/goals" element={
        <ProtectedRoute>
          <Goals />
        </ProtectedRoute>
      } />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
