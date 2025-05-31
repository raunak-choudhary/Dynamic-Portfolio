// src/components/admin/AdminLogin/AdminLogin.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { 
    signIn, 
    isSigningIn, 
    error, 
    clearError, 
    isAuthenticated, 
    sessionChecked 
  } = useAuthContext();

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [attemptCount, setAttemptCount] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (sessionChecked && isAuthenticated) {
      navigate('/admindashboard');
    }
  }, [isAuthenticated, sessionChecked, navigate]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000); // Auto-clear after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field-specific errors
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error when user starts typing
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.trim().length < 2) {
      errors.username = 'Username must be at least 2 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setAttemptCount(prev => prev + 1);
      
      const result = await signIn(formData.username.trim(), formData.password);

      if (result.success) {
        // Success - redirect will happen via useEffect
        console.log('✅ Login successful, redirecting to /admindashboard...');
      } else {
        // Error handled by useAuthContext
        console.error('❌ Login failed:', result.error);
      }
    } catch (err) {
      console.error('❌ Login error:', err);
    }
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Don't render if already authenticated
  if (sessionChecked && isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-login-page">
      {/* Animated Background Effects */}
      <div className="login-background-effects">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="login-grid-overlay"></div>
      </div>

      <div className="login-container">
        <div className="login-card glass-card">
          {/* Header */}
          <div className="login-header">
            <div className="login-logo">
              <img src="/logo.png" alt="RC Portfolio" className="header-logo" />
              <h1 className="login-title">
                <span className="title-text">RC Portfolio</span>
                <span className="title-admin">Admin</span>
              </h1>
            </div>
            <p className="login-subtitle">
              Secure Content Management System
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="login-error animate-fade-in">
              <div className="error-icon">⚠️</div>
              <div className="error-content">
                <strong>Authentication Failed</strong>
                <p>{error.message || 'Invalid credentials. Please try again.'}</p>
                {attemptCount >= 3 && (
                  <p className="error-hint">
                    💡 Hint: Check if Caps Lock is on
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username Field */}
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.username ? 'error' : ''}`}
                  placeholder="Enter your admin username"
                  autoComplete="username"
                  disabled={isSigningIn}
                />
                <div className="input-icon">
                  <span>👤</span>
                </div>
              </div>
              {formErrors.username && (
                <span className="field-error">{formErrors.username}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`form-input ${formErrors.password ? 'error' : ''}`}
                  placeholder="Enter your admin password"
                  autoComplete="current-password"
                  disabled={isSigningIn}
                />
                <button
                  type="button"
                  className="input-icon password-toggle"
                  onClick={togglePasswordVisibility}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              {formErrors.password && (
                <span className="field-error">{formErrors.password}</span>
              )}
            </div>

            {/* Remember Me */}
            <div className="form-options">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="checkbox-input"
                  disabled={isSigningIn}
                />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Keep me signed in</span>
              </label>

              <a href="#forgot" className="forgot-password-link">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSigningIn}
              className={`login-button neon-button ${isSigningIn ? 'signing-in' : ''}`}
            >
              {isSigningIn ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span className="button-icon">🚀</span>
                  <span>Access Dashboard</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="login-footer">
            <p className="security-note">
              🔒 Secure connection protected by encryption
            </p>
            <p className="session-info">
              Session expires after 12 hours of inactivity
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;