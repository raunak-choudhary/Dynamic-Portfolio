// src/services/authService.js

import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';

// Authentication constants
const AUTH_CONFIG = {
  saltRounds: 12,
  sessionKey: 'portfolio_admin_session',
  tokenExpiry: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 2 * 60 * 60 * 1000 // 2 hours before expiry
};

// =============================================
// BCRYPT COMPATIBILITY HELPER
// =============================================

/**
 * Enhanced password verification with $2a/$2b compatibility
 * @param {string} password - Plain text password
 * @param {string} hash - Stored password hash
 * @returns {boolean} Password match result
 */
const verifyPasswordCompatible = async (password, hash) => {
  try {
    // First, try direct comparison
    const directMatch = await bcrypt.compare(password, hash);
    if (directMatch) {
      return true;
    }

    // If hash starts with $2a$, try converting to $2b$ for compatibility
    if (hash.startsWith('$2a$')) {
      const convertedHash = hash.replace('$2a$', '$2b$');
      const convertedMatch = await bcrypt.compare(password, convertedHash);
      if (convertedMatch) {
        console.log('✅ Password verified using $2a$ to $2b$ conversion');
        return true;
      }
    }

    // If hash starts with $2b$, try converting to $2a$ for compatibility
    if (hash.startsWith('$2b$')) {
      const convertedHash = hash.replace('$2b$', '$2a$');
      const convertedMatch = await bcrypt.compare(password, convertedHash);
      if (convertedMatch) {
        console.log('✅ Password verified using $2b$ to $2a$ conversion');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
};

// =============================================
// ADMIN AUTHENTICATION FUNCTIONS
// =============================================

/**
 * Sign in admin user with username and password
 * @param {string} username - Admin username
 * @param {string} password - Admin password
 * @returns {Object} Authentication result with session data
 */
export const signInAdmin = async (username, password) => {
  try {
    // Input validation
    if (!username || !password) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Username and password are required',
          details: 'Both username and password fields must be provided'
        }
      };
    }

    // Sanitize username
    const sanitizedUsername = username.trim().toLowerCase();

    console.log('🔐 Authentication attempt:', {
      username: sanitizedUsername,
      timestamp: new Date().toISOString()
    });

    // Get admin user from database
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, username, password_hash, email, is_active, last_login')
      .eq('username', sanitizedUsername)
      .eq('is_active', true)
      .single();

    if (fetchError || !adminUser) {
      console.warn(`❌ Failed login attempt - user not found: ${sanitizedUsername}`);
      
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
          details: 'No active admin user found with provided credentials'
        }
      };
    }

    console.log('👤 Admin user found:', {
      id: adminUser.id,
      username: adminUser.username,
      hashFormat: adminUser.password_hash.substring(0, 4) + '...'
    });

    // Verify password using enhanced compatibility function
    const isPasswordValid = await verifyPasswordCompatible(password, adminUser.password_hash);
    
    if (!isPasswordValid) {
      console.warn(`❌ Invalid password attempt for user: ${sanitizedUsername}`);
      
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid username or password',
          details: 'Password verification failed'
        }
      };
    }

    console.log('✅ Password verification successful');

    // Generate session token
    const sessionToken = generateSessionToken(adminUser);
    
    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', adminUser.id);

    if (updateError) {
      console.error('⚠️ Failed to update last login:', updateError);
    }

    // Store session in localStorage
    const sessionData = {
      token: sessionToken,
      user: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: 'admin'
      },
      expiresAt: new Date(Date.now() + AUTH_CONFIG.tokenExpiry).toISOString(),
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_CONFIG.sessionKey, JSON.stringify(sessionData));

    // Set auth header for future requests
    setAuthHeader(sessionToken);

    console.log(`🎉 Admin login successful: ${adminUser.username}`);

    return {
      success: true,
      data: {
        user: sessionData.user,
        token: sessionToken,
        expiresAt: sessionData.expiresAt,
        message: 'Login successful'
      }
    };

  } catch (error) {
    console.error('❌ Admin sign in error:', error);
    return {
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed. Please try again.',
        details: error.message
      }
    };
  }
};

/**
 * Sign out admin user and clear session
 * @returns {Object} Sign out result
 */
export const signOutAdmin = async () => {
  try {
    // Get current session
    const session = getCurrentSession();
    
    if (session && session.user) {
      console.log(`👋 Admin logout: ${session.user.username}`);
    }

    // Clear localStorage
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    
    // Clear auth header
    clearAuthHeader();

    // Clear any cached data
    clearAuthCache();

    console.log('✅ Logout successful');

    return {
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    };

  } catch (error) {
    console.error('❌ Admin sign out error:', error);
    
    // Force clear session even if error occurs
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    clearAuthHeader();
    
    return {
      success: true, // Return success even on error to ensure logout
      data: {
        message: 'Logged out successfully'
      }
    };
  }
};

/**
 * Get current admin user session
 * @returns {Object|null} Current admin session or null
 */
export const getCurrentAdmin = () => {
  try {
    const session = getCurrentSession();
    
    if (!session) {
      return null;
    }

    // Check if session is expired
    if (isSessionExpired(session)) {
      console.warn('⚠️ Session expired, clearing local storage');
      signOutAdmin();
      return null;
    }

    // Check if session needs refresh
    if (shouldRefreshSession(session)) {
      console.log('🔄 Session needs refresh');
      // Auto-refresh could be implemented here
    }

    return {
      user: session.user,
      token: session.token,
      expiresAt: session.expiresAt,
      isAuthenticated: true
    };

  } catch (error) {
    console.error('❌ Get current admin error:', error);
    return null;
  }
};

/**
 * Verify admin session validity
 * @returns {Object} Session verification result
 */
export const verifyAdminSession = async () => {
  try {
    const session = getCurrentSession();
    
    if (!session) {
      return {
        success: false,
        error: {
          code: 'NO_SESSION',
          message: 'No active session found',
          details: 'User is not logged in'
        }
      };
    }

    // Check if session is expired
    if (isSessionExpired(session)) {
      signOutAdmin();
      return {
        success: false,
        error: {
          code: 'SESSION_EXPIRED',
          message: 'Session has expired',
          details: 'Please log in again'
        }
      };
    }

    // Verify token integrity
    if (!verifySessionToken(session.token, session.user)) {
      signOutAdmin();
      return {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid session token',
          details: 'Session has been tampered with'
        }
      };
    }

    // Verify user still exists and is active
    const { data: adminUser, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, username, is_active')
      .eq('id', session.user.id)
      .eq('is_active', true)
      .single();

    if (fetchError || !adminUser) {
      signOutAdmin();
      return {
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Admin user no longer exists or is inactive',
          details: 'Account may have been deactivated'
        }
      };
    }

    // Set auth header if not already set
    setAuthHeader(session.token);

    return {
      success: true,
      data: {
        user: session.user,
        isValid: true,
        expiresAt: session.expiresAt,
        message: 'Session is valid'
      }
    };

  } catch (error) {
    console.error('❌ Verify admin session error:', error);
    return {
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'Session verification failed',
        details: error.message
      }
    };
  }
};

// =============================================
// PASSWORD HASHING UTILITIES
// =============================================

/**
 * Hash password with bcrypt (always uses $2b$ format for consistency)
 * @param {string} password - Plain text password
 * @returns {string} Hashed password
 */
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(AUTH_CONFIG.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Ensure we always use $2b$ format for new hashes
    if (hashedPassword.startsWith('$2a$')) {
      return hashedPassword.replace('$2a$', '$2b$');
    }
    
    return hashedPassword;
  } catch (error) {
    console.error('❌ Password hashing error:', error);
    throw new Error('Failed to hash password');
  }
};

/**
 * Verify password against hash (with compatibility for $2a$ and $2b$)
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {boolean} Password match result
 */
export const verifyPassword = async (password, hash) => {
  return await verifyPasswordCompatible(password, hash);
};

// =============================================
// SESSION MANAGEMENT UTILITIES
// =============================================

/**
 * Generate session token
 * @param {Object} user - Admin user object
 * @returns {string} Generated session token
 */
const generateSessionToken = (user) => {
  const payload = {
    userId: user.id,
    username: user.username,
    role: 'admin',
    timestamp: Date.now()
  };
  
  // Simple token generation (in production, use proper JWT)
  const tokenData = btoa(JSON.stringify(payload));
  const signature = btoa(`${tokenData}.${process.env.REACT_APP_JWT_SECRET || 'default-secret'}`);
  
  return `${tokenData}.${signature}`;
};

/**
 * Verify session token integrity
 * @param {string} token - Session token
 * @param {Object} user - User object
 * @returns {boolean} Token validity
 */
const verifySessionToken = (token, user) => {
  try {
    const [tokenData, signature] = token.split('.');
    const expectedSignature = btoa(`${tokenData}.${process.env.REACT_APP_JWT_SECRET || 'default-secret'}`);
    
    if (signature !== expectedSignature) {
      return false;
    }
    
    const payload = JSON.parse(atob(tokenData));
    return payload.userId === user.id && payload.username === user.username;
  } catch (error) {
    return false;
  }
};

/**
 * Get current session from localStorage
 * @returns {Object|null} Session data or null
 */
const getCurrentSession = () => {
  try {
    const sessionData = localStorage.getItem(AUTH_CONFIG.sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error('❌ Failed to parse session data:', error);
    localStorage.removeItem(AUTH_CONFIG.sessionKey);
    return null;
  }
};

/**
 * Check if session is expired
 * @param {Object} session - Session object
 * @returns {boolean} Expiry status
 */
const isSessionExpired = (session) => {
  if (!session || !session.expiresAt) {
    return true;
  }
  
  return new Date(session.expiresAt) <= new Date();
};

/**
 * Check if session should be refreshed
 * @param {Object} session - Session object
 * @returns {boolean} Refresh needed status
 */
const shouldRefreshSession = (session) => {
  if (!session || !session.expiresAt) {
    return false;
  }
  
  const expiryTime = new Date(session.expiresAt).getTime();
  const currentTime = Date.now();
  const timeUntilExpiry = expiryTime - currentTime;
  
  return timeUntilExpiry <= AUTH_CONFIG.refreshThreshold;
};

/**
 * Set authorization header for API requests
 * @param {string} token - Session token
 */
const setAuthHeader = (token) => {
  // This would be used with your HTTP client
  // For Supabase, we'll handle this differently
  if (typeof window !== 'undefined') {
    window.supabaseAuthToken = token;
  }
};

/**
 * Clear authorization header
 */
const clearAuthHeader = () => {
  if (typeof window !== 'undefined' && window.supabaseAuthToken) {
    delete window.supabaseAuthToken;
  }
};

/**
 * Clear authentication cache
 */
const clearAuthCache = () => {
  // Clear any cached admin data
  if (typeof window !== 'undefined' && window.adminCache) {
    window.adminCache = {};
  }
};

// =============================================
// ROLE-BASED ACCESS CONTROL
// =============================================

/**
 * Check if current user has admin role
 * @returns {boolean} Admin role status
 */
export const isAdmin = () => {
  const currentAdmin = getCurrentAdmin();
  return currentAdmin && currentAdmin.user && currentAdmin.user.role === 'admin';
};

/**
 * Check if current user is authenticated
 * @returns {boolean} Authentication status
 */
export const isAuthenticated = () => {
  const currentAdmin = getCurrentAdmin();
  return currentAdmin && currentAdmin.isAuthenticated;
};

/**
 * Require admin authentication (for protected operations)
 * @returns {Object} Access verification result
 */
export const requireAdminAuth = async () => {
  const sessionVerification = await verifyAdminSession();
  
  if (!sessionVerification.success) {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Admin authentication required',
        details: 'This operation requires admin privileges'
      }
    };
  }

  return {
    success: true,
    data: sessionVerification.data
  };
};

// =============================================
// INITIALIZATION AND UTILITIES
// =============================================

/**
 * Initialize authentication system
 */
export const initializeAuth = () => {
  // Check for existing session on app load
  const session = getCurrentSession();
  
  if (session && !isSessionExpired(session)) {
    setAuthHeader(session.token);
    console.log('🔄 Existing admin session restored');
  } else if (session && isSessionExpired(session)) {
    console.log('🗑️ Expired session cleared');
    signOutAdmin();
  }
};

/**
 * Get authentication configuration
 */
export const getAuthConfig = () => {
  return {
    sessionDuration: AUTH_CONFIG.tokenExpiry,
    refreshThreshold: AUTH_CONFIG.refreshThreshold,
    isSecure: process.env.NODE_ENV === 'production'
  };
};

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
    initializeAuth();
  }