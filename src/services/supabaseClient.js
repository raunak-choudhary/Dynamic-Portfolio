// src/services/supabaseClient.js - FIXED VERSION

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Environment Variables Debug:');
  console.log('URL:', supabaseUrl);
  console.log('Anon Key Present:', !!supabaseAnonKey);
  console.log('Service Key Present:', !!supabaseServiceRoleKey);
}

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.\n' +
    'Required variables:\n' +
    '- REACT_APP_SUPABASE_URL\n' +
    '- REACT_APP_SUPABASE_ANON_KEY'
  );
}

// 🔧 SIMPLIFIED: Basic client configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
};

// Create public Supabase client (for frontend operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseConfig);

// Admin client configuration (for admin operations only)
let supabaseAdmin = null;

// Create admin client only when needed and service role key is available
export const getSupabaseAdmin = () => {
  if (!supabaseServiceRoleKey) {
    console.warn('Service role key not available. Admin operations will be limited.');
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-application-name': 'dynamic-portfolio-admin',
          'Authorization': `Bearer ${supabaseServiceRoleKey}`
        }
      }
    });
  }

  return supabaseAdmin;
};

// Test connection function
export const testConnection = async () => {
  try {
    const {error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);

    if (error && error.code === '42P01') {
      console.log('✅ Supabase connection successful (table not found is expected)');
      return { success: true, message: 'Connection established' };
    } else if (error) {
      throw error;
    }

    console.log('✅ Supabase connection successful');
    return { success: true, message: 'Connection established' };
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return { 
      success: false, 
      error: error.message,
      details: 'Check your environment variables and network connection'
    };
  }
};

// 🔧 ADDED: Test anonymous access specifically
export const testAnonymousAccess = async () => {
  try {
    console.log('🔍 Testing anonymous access to contact_messages...');
    
    // Try to insert a test record (will fail but should give us RLS info)
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name: 'Test User',
        email: 'test@example.com',
        organization: 'Test Org',
        role_position: 'tester',
        inquiry_type: 'general-inquiry',
        subject: 'Test Subject',
        message: 'Test message for RLS verification',
        priority: 'normal',
        status: 'unread'
      }])
      .select();

    if (error) {
      console.error('❌ Anonymous access test failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Anonymous access test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Anonymous access test error:', error);
    return { success: false, error: error.message };
  }
};

// Get current session
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    return { success: true, session };
  } catch (error) {
    console.error('Error getting session:', error.message);
    return { success: false, error: error.message, session: null };
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const { session } = await getCurrentSession();
  return !!session?.user;
};

// Sign out function
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return { success: true, message: 'Signed out successfully' };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { success: false, error: error.message };
  }
};

// Error handler utility
export const handleSupabaseError = (error, context = 'Operation') => {
  console.error(`${context} failed:`, error);
  
  const errorMessages = {
    'Failed to fetch': 'Network error. Please check your connection.',
    'Invalid JWT': 'Authentication expired. Please sign in again.',
    'Row Level Security': 'Permission denied. Contact administrator.',
    'duplicate key value': 'This record already exists.',
    'foreign key constraint': 'Cannot delete: record is being used elsewhere.'
  };

  const userFriendlyMessage = Object.keys(errorMessages).find(key => 
    error.message?.includes(key)
  );

  return {
    success: false,
    error: userFriendlyMessage ? errorMessages[userFriendlyMessage] : error.message,
    technical: error.message,
    context
  };
};

// Export configuration for debugging
export const config = {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceRoleKey,
  environment: process.env.NODE_ENV
};

// Development helper
if (process.env.NODE_ENV === 'development') {
  window.supabase = supabase;
  window.supabaseConfig = config;
  window.testAnonymousAccess = testAnonymousAccess; // 🔧 ADDED: Test function
  console.log('🔧 Supabase client available in window.supabase for debugging');
  console.log('🔧 Test anonymous access with: window.testAnonymousAccess()');
}

export default supabase;