// src/hooks/useSupabase.js

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Custom hook for Supabase data fetching with loading states and error handling
 * 
 * @param {string} table - Supabase table name
 * @param {Object} filters - Query filters object
 * @param {Object} options - Additional options for the query
 * @returns {Object} { data, loading, error, refetch }
 */
export const useSupabase = (table, filters = {}, options = {}) => {
  // State management
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Destructure options with defaults
  const {
    select = '*',
    orderBy = null,
    limit = null,
    single = false,
    enabled = true,
    realtime = false
  } = options;

  // Stringify objects to prevent infinite re-renders
  const filtersString = JSON.stringify(filters);
  const orderByString = JSON.stringify(orderBy);

  /**
   * Main data fetching function
   */
  const fetchData = useCallback(async () => {
    // Don't fetch if disabled
    if (!enabled || !table) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Parse back the stringified filters and orderBy
      const parsedFilters = JSON.parse(filtersString);
      const parsedOrderBy = JSON.parse(orderByString);

      console.log(`🔍 useSupabase: Fetching data from ${table}`, { filters: parsedFilters, options });

      // Build Supabase query
      let query = supabase.from(table).select(select);

      // Apply filters dynamically
      Object.entries(parsedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value.operator) {
            // Handle custom operators like { operator: 'gte', value: '2023-01-01' }
            switch (value.operator) {
              case 'gte':
                query = query.gte(key, value.value);
                break;
              case 'lte':
                query = query.lte(key, value.value);
                break;
              case 'gt':
                query = query.gt(key, value.value);
                break;
              case 'lt':
                query = query.lt(key, value.value);
                break;
              case 'like':
                query = query.like(key, value.value);
                break;
              case 'ilike':
                query = query.ilike(key, value.value);
                break;
              case 'neq':
                query = query.neq(key, value.value);
                break;
              default:
                query = query.eq(key, value.value);
            }
          } else {
            query = query.eq(key, value);
          }
        }
      });

      // Apply ordering
      if (parsedOrderBy) {
        if (Array.isArray(parsedOrderBy)) {
          // Multiple order columns: [{ column: 'created_at', ascending: false }]
          parsedOrderBy.forEach(order => {
            query = query.order(order.column, { ascending: order.ascending !== false });
          });
        } else if (typeof parsedOrderBy === 'object') {
          // Single order object: { column: 'created_at', ascending: false }
          query = query.order(parsedOrderBy.column, { ascending: parsedOrderBy.ascending !== false });
        } else {
          // Simple string: 'created_at'
          query = query.order(parsedOrderBy, { ascending: false });
        }
      }

      // Apply limit
      if (limit && typeof limit === 'number') {
        query = query.limit(limit);
      }

      // Execute query
      const { data: result, error: queryError } = single 
        ? await query.single()
        : await query;

      if (queryError) {
        throw queryError;
      }

      console.log(`✅ useSupabase: Successfully fetched ${single ? 'single record' : `${result?.length || 0} records`} from ${table}`);
      
      setData(result);
      setError(null);

    } catch (err) {
      console.error(`❌ useSupabase: Error fetching from ${table}:`, err);
      
      // Provide user-friendly error messages
      let userFriendlyError = err.message;
      
      if (err.code === 'PGRST116') {
        userFriendlyError = single 
          ? `No ${table.replace(/_/g, ' ')} record found`
          : `No ${table.replace(/_/g, ' ')} records found`;
      } else if (err.message?.includes('JWT')) {
        userFriendlyError = 'Authentication expired. Please refresh the page.';
      } else if (err.message?.includes('permission denied')) {
        userFriendlyError = 'Permission denied. You may not have access to this data.';
      } else if (err.message?.includes('relation') && err.message?.includes('does not exist')) {
        userFriendlyError = `Database table '${table}' not found.`;
      }

      setError({
        message: userFriendlyError,
        code: err.code || 'UNKNOWN_ERROR',
        details: err.message,
        table: table
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [table, filtersString, orderByString, select, limit, single, enabled]);

  /**
   * Manual refetch function
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Clear data and reset states
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  // Initial data fetch and dependency updates
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription (optional)
  useEffect(() => {
    if (!realtime || !table || !enabled) return;

    console.log(`🔴 useSupabase: Setting up real-time subscription for ${table}`);

    const subscription = supabase
      .channel(`public:${table}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: table 
      }, (payload) => {
        console.log(`🔄 useSupabase: Real-time update for ${table}:`, payload);
        
        // Refetch data on any change
        refetch();
      })
      .subscribe();

    // Cleanup subscription
    return () => {
      console.log(`🔴 useSupabase: Cleaning up real-time subscription for ${table}`);
      supabase.removeChannel(subscription);
    };
  }, [table, realtime, enabled, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    reset
  };
};

/**
 * Specialized hook for fetching a single record by ID
 * 
 * @param {string} table - Supabase table name
 * @param {string} id - Record ID
 * @param {Object} options - Additional options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useSupabaseById = (table, id, options = {}) => {
  return useSupabase(
    table,
    { id },
    {
      ...options,
      single: true,
      enabled: !!id && options.enabled !== false
    }
  );
};

/**
 * Hook for fetching data with status filter (common pattern)
 * 
 * @param {string} table - Supabase table name
 * @param {string} status - Status filter value (default: 'active')
 * @param {Object} additionalFilters - Additional filters
 * @param {Object} options - Additional options
 * @returns {Object} { data, loading, error, refetch }
 */
export const useSupabaseByStatus = (table, status = 'active', additionalFilters = {}, options = {}) => {
  return useSupabase(
    table,
    {
      status,
      ...additionalFilters
    },
    options
  );
};

/**
 * Hook for fetching paginated data
 * 
 * @param {string} table - Supabase table name
 * @param {Object} filters - Query filters
 * @param {number} page - Current page (0-based)
 * @param {number} pageSize - Items per page
 * @param {Object} options - Additional options
 * @returns {Object} { data, loading, error, refetch, pagination }
 */
export const useSupabasePaginated = (table, filters = {}, page = 0, pageSize = 10, options = {}) => {
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const [totalCount, setTotalCount] = useState(0);
  const [paginatedData, setPaginatedData] = useState(null);
  const [paginatedLoading, setPaginatedLoading] = useState(true);
  const [paginatedError, setPaginatedError] = useState(null);

  // Stringify objects to prevent infinite re-renders
  const filtersString = JSON.stringify(filters);
  const optionsString = JSON.stringify(options);

  // Fetch paginated data
  const fetchPaginated = useCallback(async () => {
    if (!table) return;

    try {
      setPaginatedLoading(true);
      setPaginatedError(null);
      
      // Parse back the stringified values
      const parsedFilters = JSON.parse(filtersString);
      const parsedOptions = JSON.parse(optionsString);
      
      // Get total count
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);

      // Get paginated data
      let query = supabase.from(table).select(parsedOptions.select || '*');
      
      // Apply filters
      Object.entries(parsedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (parsedOptions.orderBy) {
        query = query.order(parsedOptions.orderBy.column || parsedOptions.orderBy, { 
          ascending: parsedOptions.orderBy.ascending !== false 
        });
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error } = await query;

      if (error) throw error;

      setPaginatedData(data);

    } catch (error) {
      console.error('Pagination fetch error:', error);
      setPaginatedError(error);
      setPaginatedData(null);
    } finally {
      setPaginatedLoading(false);
    }
  }, [table, filtersString, optionsString, from, to]);

  const pagination = {
    page,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    hasNext: (page + 1) * pageSize < totalCount,
    hasPrev: page > 0
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchPaginated();
  }, [fetchPaginated]);

  return {
    data: paginatedData,
    loading: paginatedLoading,
    error: paginatedError,
    pagination,
    refetch: fetchPaginated
  };
};

export default useSupabase;