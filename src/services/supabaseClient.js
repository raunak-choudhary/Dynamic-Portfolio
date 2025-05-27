// src/services/supabaseClient.js

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
  console.log('All SUPABASE env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
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

// Public client configuration for frontend operations
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Recommended for security
    storage: window.localStorage, // Use localStorage for session persistence
    storageKey: 'portfolio-auth-token',
    debug: process.env.NODE_ENV === 'development'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'dynamic-portfolio'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
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
          'x-application-name': 'dynamic-portfolio-admin'
        }
      }
    });
  }

  return supabaseAdmin;
};

// Test connection function
export const testConnection = async () => {
  try {
    // Simple query to test connection - this will work even with no tables
    const {error } = await supabase
      .from('nonexistent_table')
      .select('*')
      .limit(1);

    // We expect an error here, but if we get a specific "table doesn't exist" error,
    // it means the connection is working
    if (error && error.code === '42P01') {
      // 42P01 = table doesn't exist, which means connection is working!
      console.log('✅ Supabase connection successful (table not found is expected)');
      return { success: true, message: 'Connection established' };
    } else if (error) {
      throw error;
    }

    // If no error, connection is definitely working
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

// Database health check
export const healthCheck = async () => {
  try {
    // Same approach for health check
    const {error } = await supabase
      .from('health_check_table')
      .select('*')
      .limit(1);

    // Table not found error means connection is healthy
    if (error && error.code === '42P01') {
      return { 
        success: true, 
        database: 'healthy',
        timestamp: new Date().toISOString()
      };
    } else if (error) {
      throw error;
    }

    return { 
      success: true, 
      database: 'healthy',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return { 
      success: false, 
      database: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
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
  
  // Common error messages mapping
  const errorMessages = {
    'Failed to fetch': 'Network error. Please check your connection.',
    'Invalid JWT': 'Authentication expired. Please sign in again.',
    'Row Level Security': 'Permission denied. Contact administrator.',
    'duplicate key value': 'This record already exists.',
    'foreign key constraint': 'Cannot delete: record is being used elsewhere.'
  };

  // Find matching error message
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

// Realtime subscription helper
export const createRealtimeSubscription = (table, callback, filters = {}) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: table,
        ...filters 
      }, 
      callback
    )
    .subscribe();

  return channel;
};

// Unsubscribe from realtime
export const unsubscribeRealtime = (channel) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
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
  console.log('🔧 Supabase client available in window.supabase for debugging');
}

// Add auth header support for admin operations
export const setSupabaseAuthHeader = (token) => {
    if (token) {
      supabase.auth.setSession({
        access_token: token,
        refresh_token: token
      });
    }
  };
  
  export const clearSupabaseAuthHeader = () => {
    supabase.auth.signOut();
  };

export default supabase;