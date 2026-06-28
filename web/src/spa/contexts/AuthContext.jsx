'use client';
import { createContext, useContext } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

/** Map a NextAuth session user onto the shape the app expects. */
function mapUser(sessionUser) {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    username: sessionUser.name || sessionUser.username || '',
    email: sessionUser.email || '',
    first_name: sessionUser.first_name || '',
    last_name: sessionUser.last_name || '',
  };
}

export const AuthProvider = ({ children }) => {
  const { data: session, status } = useSession();

  const user = mapUser(session?.user);
  const isAuthenticated = status === 'authenticated';
  const loading = status === 'loading';

  const signin = async (username, password) => {
    try {
      const res = await signIn('credentials', { redirect: false, username, password });
      if (res?.ok && !res?.error) {
        return { success: true };
      }
      return { success: false, error: 'Invalid username or password' };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.message || data.error || 'Registration failed' };
      }
      // Auto-login after successful registration.
      const username = userData.username;
      const password = userData.password;
      await signIn('credentials', { redirect: false, username, password });
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  };

  const signout = async () => {
    try {
      localStorage.removeItem('authUser');
      await signOut({ redirect: false });
    } catch (error) {
      console.error('Signout error:', error);
    }
  };

  // Kept for API compatibility with existing callers.
  const checkAuthStatus = async () => {};

  const value = { user, loading, isAuthenticated, signup, signin, signout, checkAuthStatus };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
