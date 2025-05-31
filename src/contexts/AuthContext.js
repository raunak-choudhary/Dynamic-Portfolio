// src/contexts/AuthContext.js

import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

// Create AuthContext
const AuthContext = createContext();

// AuthContext hook
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  const value = {
    // Authentication state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    sessionChecked: auth.sessionChecked,

    // Loading states
    isSigningIn: auth.isSigningIn,
    isSigningOut: auth.isSigningOut,
    isVerifyingSession: auth.isVerifyingSession,

    // Authentication methods
    signIn: auth.signIn,
    signOut: auth.signOut,
    refreshSession: auth.refreshSession,
    clearError: auth.clearError,

    // Utility methods
    hasAdminRole: auth.hasAdminRole,
    requireAuth: auth.requireAuth,
    isAdmin: auth.isAdmin,

    // Status helpers
    isFullyLoaded: auth.isFullyLoaded,
    canAccessAdmin: auth.canAccessAdmin,

    // User information
    username: auth.user?.username || null,
    email: auth.user?.email || null,
    userId: auth.user?.id || null,

    // Session information
    isSessionValid: auth.isAuthenticated && !auth.error,
    hasActiveSession: auth.sessionChecked && auth.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Higher-order component for protecting routes that require authentication
 */
export const withAuth = (WrappedComponent) => {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading, sessionChecked } = useAuthContext();

    // Show loading while checking session
    if (!sessionChecked || isLoading) {
      return (
        <div className="auth-loading">
          <div className="loading-spinner-container">
            <div className="loading-spinner">
              <div className="spinner-ring">
                <div className="spinner-ring-inner"></div>
              </div>
            </div>
            <p className="loading-message">Verifying authentication...</p>
          </div>
        </div>
      );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      window.location.href = '/adminlogin';
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

/**
 * Component for protecting admin-only content
 */
export const AdminOnly = ({ children, fallback = null }) => {
  const { canAccessAdmin, isFullyLoaded } = useAuthContext();

  if (!isFullyLoaded) {
    return (
      <div className="auth-checking">
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!canAccessAdmin) {
    return fallback || (
      <div className="access-denied">
        <h3>Access Denied</h3>
        <p>You don't have permission to view this content.</p>
      </div>
    );
  }

  return children;
};

/**
 * Component for showing content only to authenticated users
 */
export const AuthenticatedOnly = ({ children, fallback = null }) => {
  const { isAuthenticated, isFullyLoaded } = useAuthContext();

  if (!isFullyLoaded) {
    return null;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

/**
 * Component for showing content only to non-authenticated users
 */
export const UnauthenticatedOnly = ({ children }) => {
  const { isAuthenticated, isFullyLoaded } = useAuthContext();

  if (!isFullyLoaded) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
};

export default AuthContext;