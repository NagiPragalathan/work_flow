import { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WorkflowBuilder from '../components/workflow/WorkflowBuilder';
import PageBuilder from '../components/ui-builder/PageBuilder';
import Dashboard from '../dashboard/Dashboard';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';

// Create navigation context
export const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    // Return a safe fallback instead of throwing
    console.warn('useNavigation called outside NavigationProvider, using fallback');
    return {
      activeTab: 'workflow',
      navigateToBuilder: () => console.warn('Navigation not available')
    };
  }
  return context;
};

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-router" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#ffffff',
        color: '#000000'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Component - redirects to home if already authenticated
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-router" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#ffffff',
        color: '#000000'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 500 }}>Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRouter() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeBuilderTab') || 'workflow';
  });

  useEffect(() => {
    localStorage.setItem('activeBuilderTab', activeTab);
  }, [activeTab]);

  // Enter a builder (used from the Dashboard and from the in-builder tabs).
  const navigateToBuilder = (builder) => {
    setActiveTab(builder);
    navigate('/builder');
  };

  // Return to the dashboard.
  const goHome = () => navigate('/');

  return (
    <NavigationContext.Provider value={{ activeTab, navigateToBuilder, goHome }}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

        {/* Dashboard (landing) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Builders */}
        <Route
          path="/builder"
          element={
            <ProtectedRoute>
              <div className="app-router" style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
                {activeTab === 'workflow' && <WorkflowBuilder />}
                {activeTab === 'page-builder' && <PageBuilder />}
              </div>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </NavigationContext.Provider>
  );
}

export default AppRouter;

