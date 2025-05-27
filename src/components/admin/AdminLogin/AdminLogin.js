// src/components/admin/AdminLogin/AdminLogin.js
import React, { useState } from 'react';
import { useAuthContext } from '../../../contexts/AuthContext';
import LoadingSpinner from '../../common/LoadingSpinner';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  
  const { signIn, isSigningIn, error, clearError } = useAuthContext();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await signIn(credentials.username, credentials.password);
    
    if (result.success) {
      // Redirect to admin dashboard
      window.location.href = '/adminview/dashboard';
    }
  };
  
  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  return (
    <div className="admin-login-container">
      <div className="admin-login-card glass-card">
        <h2 className="login-title shimmer-text">Admin Login</h2>
        
        {error && (
          <div className="error-message">
            {error.message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={credentials.username}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              className="glass-input"
              required
            />
          </div>
          
          <button
            type="submit"
            className="neon-button login-button"
            disabled={isSigningIn}
          >
            {isSigningIn ? <LoadingSpinner size="small" message="" /> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;