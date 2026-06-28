'use client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter.jsx';
import { ThemeProvider } from './theme.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import './index.css';
import './App.css';

/**
 * Entry point for the legacy React SPA, mounted inside Next.js as a
 * client-only application. NextAuth's SessionProvider is provided by the
 * root layout; AuthProvider consumes it.
 */
export default function SpaApp() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
