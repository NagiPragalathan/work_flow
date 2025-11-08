import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount and get CSRF token
  useEffect(() => {
    // First get CSRF token, then check auth
    const initialize = async () => {
      try {
        // Fetch CSRF token first to ensure cookie is set
        await fetch(`${apiService.baseURL}/auth/csrf-token/`, {
          method: 'GET',
          credentials: 'include',
        });
        // Then check actual auth status
        await checkAuthStatus();
      } catch (error) {
        console.warn('Failed to initialize auth:', error);
        // Still try to check auth status
        checkAuthStatus();
      }
    };
    initialize();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiService.checkAuth();
      if (response.authenticated && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(response.user));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authUser');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authUser');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      const response = await apiService.signup(userData);
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      throw new Error('Signup failed');
    } catch (error) {
      console.error('Signup error:', error);
      // Extract detailed error message from response
      const errorMessage = error.response?.message || error.response?.error || error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const signin = async (username, password) => {
    try {
      const response = await apiService.signin({ username, password });
      if (response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        localStorage.setItem('authUser', JSON.stringify(response.user));
        return { success: true, user: response.user };
      }
      throw new Error('Login failed');
    } catch (error) {
      console.error('Signin error:', error);
      // Extract detailed error message from response
      const errorMessage = error.response?.error || error.response?.message || error.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const signout = async () => {
    try {
      await apiService.signout();
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authUser');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signup,
    signin,
    signout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

