// src/services/analyticsService.js
import { supabase } from './supabaseClient';

// =====================================================
// ANALYTICS SERVICE FOR RC PORTFOLIO
// Complete data collection, processing, and retrieval
// =====================================================

// ===== CORE DATA COLLECTION FUNCTIONS =====

/**
 * Track user/admin events throughout the system
 * @param {string} eventType - Type of event (page_view, content_update, etc.)
 * @param {string} category - Event category (portfolio, admin, contact)
 * @param {string} action - Specific action taken
 * @param {string} label - Additional context label
 * @param {number} value - Numeric value if applicable
 * @param {object} metadata - Additional event data
 * @param {string} userType - 'visitor' or 'admin'
 * @param {string} sessionId - Current session identifier
 */
export const trackEvent = async (eventType, category, action, label = null, value = null, metadata = {}, userType = 'visitor', sessionId = null) => {
  try {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([
        {
          event_type: eventType,
          event_category: category,
          event_action: action,
          event_label: label,
          event_value: value,
          user_type: userType,
          session_id: sessionId || generateSessionId(),
          metadata: metadata,
          timestamp: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error tracking event:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackEvent:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track content view events for portfolio sections
 * @param {string} contentType - Type of content (project, skill, certification, etc.)
 * @param {string} contentId - Unique identifier for the content
 */
export const trackContentView = async (contentType, contentId) => {
  try {
    // Track the view event
    await trackEvent('content_view', 'portfolio', `view_${contentType}`, contentId, 1);

    // Update content performance tracking
    const today = new Date().toISOString().split('T')[0];
    
    const { data: existing } = await supabase
      .from('content_performance')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('performance_date', today)
      .single();

    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('content_performance')
        .update({
          view_count: existing.view_count + 1,
          last_updated: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (error) console.error('Error updating content performance:', error);
    } else {
      // Create new record
      const { error } = await supabase
        .from('content_performance')
        .insert([
          {
            content_type: contentType,
            content_id: contentId,
            performance_date: today,
            view_count: 1,
            engagement_score: 10, // Base engagement score
            last_updated: new Date().toISOString()
          }
        ]);

      if (error) console.error('Error creating content performance record:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackContentView:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track admin session activity and productivity
 * @param {Date} sessionStart - Session start time
 * @param {Date} sessionEnd - Session end time
 * @param {Array} sectionsVisited - Array of section IDs visited
 * @param {number} actionsPerformed - Number of actions performed
 */
export const trackAdminSession = async (sessionStart, sessionEnd, sectionsVisited = [], actionsPerformed = 0) => {
  try {
    const sessionId = generateSessionId();
    const duration = Math.round((sessionEnd - sessionStart) / (1000 * 60)); // Duration in minutes

    // Insert admin session record
    const { data, error } = await supabase
      .from('admin_sessions')
      .insert([
        {
          session_id: sessionId,
          start_time: sessionStart.toISOString(),
          end_time: sessionEnd.toISOString(),
          duration_minutes: duration,
          sections_visited: sectionsVisited,
          actions_performed: actionsPerformed,
          last_activity: sessionEnd.toISOString()
        }
      ]);

    if (error) {
      console.error('Error tracking admin session:', error);
      return { success: false, error };
    }

    // Update daily admin activity analytics
    await updateAdminActivityAnalytics(sessionStart, duration, sectionsVisited.length, actionsPerformed);

    return { success: true, data };
  } catch (error) {
    console.error('Error in trackAdminSession:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Track content updates made by admin
 * @param {string} contentType - Type of content updated
 * @param {string} contentId - ID of updated content
 * @param {string} updateType - Type of update (create, edit, delete)
 * @param {object} changes - Object describing what changed
 */
export const trackContentUpdate = async (contentType, contentId, updateType, changes = {}) => {
  try {
    await trackEvent(
      'content_update',
      'admin',
      `${updateType}_${contentType}`,
      contentId,
      1,
      { changes, timestamp: new Date().toISOString() },
      'admin'
    );

    // Update content performance if applicable
    if (updateType === 'edit') {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('content_performance')
        .upsert([
          {
            content_type: contentType,
            content_id: contentId,
            performance_date: today,
            last_updated: new Date().toISOString(),
            engagement_score: 15 // Boost engagement score for updated content
          }
        ]);

      if (error) console.error('Error updating content performance:', error);
    }

    return { success: true };
  } catch (error) {
    console.error('Error in trackContentUpdate:', error);
    return { success: false, error: error.message };
  }
};

// ===== METRICS CALCULATION FUNCTIONS =====

/**
 * Calculate overall portfolio completeness score
 * @returns {Promise<number>} Completeness score (0-100)
 */
export const calculatePortfolioCompleteness = async () => {
  try {
    const { data, error } = await supabase.rpc('calculate_portfolio_completeness');
    
    if (error) {
      console.error('Error calculating portfolio completeness:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Error in calculatePortfolioCompleteness:', error);
    return 0;
  }
};

/**
 * Calculate content engagement scores based on views and interactions
 * @param {string} contentType - Type of content to analyze
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Array of content with engagement scores
 */
export const calculateContentEngagement = async (contentType = null, days = 30) => {
  try {
    let query = supabase
      .from('content_performance')
      .select('*')
      .gte('performance_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('engagement_score', { ascending: false });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error calculating content engagement:', error);
      return [];
    }

    // Group by content and calculate total engagement
    const engagementMap = {};
    data.forEach(item => {
      const key = `${item.content_type}_${item.content_id}`;
      if (!engagementMap[key]) {
        engagementMap[key] = {
          content_type: item.content_type,
          content_id: item.content_id,
          total_views: 0,
          avg_engagement: 0,
          last_updated: item.last_updated
        };
      }
      engagementMap[key].total_views += item.view_count;
      engagementMap[key].avg_engagement += item.engagement_score;
    });

    // Convert to array and sort by engagement
    return Object.values(engagementMap).sort((a, b) => b.avg_engagement - a.avg_engagement);
  } catch (error) {
    console.error('Error in calculateContentEngagement:', error);
    return [];
  }
};

/**
 * Calculate admin productivity metrics
 * @param {number} days - Number of days to analyze
 * @returns {Promise<object>} Productivity metrics object
 */
export const calculateAdminProductivity = async (days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('admin_sessions')
      .select('*')
      .gte('start_time', startDate);

    if (sessionsError) {
      console.error('Error calculating admin productivity:', sessionsError);
      return {};
    }

    // Calculate metrics
    const totalSessions = sessions?.length || 0;
    const totalTime = sessions?.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) || 0;
    const avgSessionTime = totalSessions > 0 ? totalTime / totalSessions : 0;
    const totalActions = sessions?.reduce((sum, session) => sum + (session.actions_performed || 0), 0) || 0;
    const actionsPerMinute = totalTime > 0 ? totalActions / totalTime : 0;

    // Most used sections
    const sectionCounts = {};
    sessions?.forEach(session => {
      session.sections_visited?.forEach(section => {
        sectionCounts[section] = (sectionCounts[section] || 0) + 1;
      });
    });

    const mostUsedSection = Object.keys(sectionCounts).reduce((a, b) => 
      sectionCounts[a] > sectionCounts[b] ? a : b, null
    );

    return {
      totalSessions,
      totalTime,
      avgSessionTime: Math.round(avgSessionTime),
      totalActions,
      actionsPerMinute: Math.round(actionsPerMinute * 100) / 100,
      mostUsedSection,
      sectionUsage: sectionCounts,
      productivityScore: Math.min(100, Math.round(actionsPerMinute * 10 + (totalSessions * 2)))
    };
  } catch (error) {
    console.error('Error in calculateAdminProductivity:', error);
    return {};
  }
};

/**
 * Calculate contact form trends and patterns
 * @param {number} days - Number of days to analyze
 * @returns {Promise<object>} Contact analytics object
 */
export const calculateContactTrends = async (days = 30) => {
  try {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .gte('created_at', startDate);

    if (error) {
      console.error('Error calculating contact trends:', error);
      return {};
    }

    if (!messages || messages.length === 0) {
      return {
        totalMessages: 0,
        contactTypes: {},
        peakHours: {},
        avgResponseTime: 0,
        popularSubjects: []
      };
    }

    // Analyze contact types
    const contactTypes = {};
    messages.forEach(msg => {
      const type = msg.contact_type || 'other';
      contactTypes[type] = (contactTypes[type] || 0) + 1;
    });

    // Analyze peak hours
    const peakHours = {};
    messages.forEach(msg => {
      const hour = new Date(msg.created_at).getHours();
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    // Find most common subjects
    const subjects = messages.map(msg => msg.subject?.toLowerCase()).filter(Boolean);
    const subjectCounts = {};
    subjects.forEach(subject => {
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });

    const popularSubjects = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, count }));

    return {
      totalMessages: messages.length,
      contactTypes,
      peakHours,
      avgResponseTime: 0, // Would need response tracking
      popularSubjects,
      dailyTrend: calculateDailyTrend(messages, days)
    };
  } catch (error) {
    console.error('Error in calculateContactTrends:', error);
    return {};
  }
};

// ===== DATA RETRIEVAL FUNCTIONS =====

/**
 * Get portfolio metrics for a date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Portfolio metrics data
 */
export const getPortfolioMetrics = async (startDate = null, endDate = null) => {
  try {
    let query = supabase
      .from('portfolio_metrics')
      .select('*')
      .order('metric_date', { ascending: false });

    if (startDate) {
      query = query.gte('metric_date', startDate);
    }
    if (endDate) {
      query = query.lte('metric_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting portfolio metrics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPortfolioMetrics:', error);
    return [];
  }
};

/**
 * Get content analytics for specific content type
 * @param {string} contentType - Type of content to analyze
 * @param {string} dateRange - Date range ('7d', '30d', '90d', '1y')
 * @returns {Promise<Array>} Content analytics data
 */
export const getContentAnalytics = async (contentType = null, dateRange = '30d') => {
  try {
    const days = parseDateRange(dateRange);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let query = supabase
      .from('content_performance')
      .select('*')
      .gte('performance_date', startDate)
      .order('performance_date', { ascending: false });

    if (contentType) {
      query = query.eq('content_type', contentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error getting content analytics:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getContentAnalytics:', error);
    return [];
  }
};

/**
 * Get contact analytics for date range
 * @param {string} dateRange - Date range ('7d', '30d', '90d', '1y')
 * @returns {Promise<object>} Contact analytics data
 */
export const getContactAnalytics = async (dateRange = '30d') => {
  try {
    const days = parseDateRange(dateRange);
    return await calculateContactTrends(days);
  } catch (error) {
    console.error('Error in getContactAnalytics:', error);
    return {};
  }
};

/**
 * Get admin activity analytics
 * @param {string} dateRange - Date range ('7d', '30d', '90d', '1y')
 * @returns {Promise<object>} Admin activity data
 */
export const getAdminActivityAnalytics = async (dateRange = '30d') => {
  try {
    const days = parseDateRange(dateRange);
    return await calculateAdminProductivity(days);
  } catch (error) {
    console.error('Error in getAdminActivityAnalytics:', error);
    return {};
  }
};

/**
 * Get trend analysis for specific metric
 * @param {string} metricType - Type of metric to analyze
 * @param {string} timeframe - Timeframe for analysis
 * @returns {Promise<object>} Trend analysis data
 */
export const getTrendAnalysis = async (metricType, timeframe = '30d') => {
  try {
    const days = parseDateRange(timeframe);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let data = [];
    let tableName = '';

    switch (metricType) {
      case 'portfolio_completeness':
        tableName = 'portfolio_metrics';
        break;
      case 'contact_volume':
        tableName = 'contact_analytics';
        break;
      case 'admin_productivity':
        tableName = 'admin_activity_analytics';
        break;
      default:
        return { trend: 'stable', data: [], change: 0 };
    }

    const { data: trendData, error } = await supabase
      .from(tableName)
      .select('*')
      .gte(tableName === 'portfolio_metrics' ? 'metric_date' : 'analysis_date', startDate)
      .order(tableName === 'portfolio_metrics' ? 'metric_date' : 'analysis_date', { ascending: true });

    if (error) {
      console.error('Error getting trend analysis:', error);
      return { trend: 'stable', data: [], change: 0 };
    }

    data = trendData || [];

    // Calculate trend direction
    if (data.length < 2) {
      return { trend: 'stable', data, change: 0 };
    }

    const firstValue = getMetricValue(data[0], metricType);
    const lastValue = getMetricValue(data[data.length - 1], metricType);
    const change = ((lastValue - firstValue) / firstValue) * 100;

    let trend = 'stable';
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';

    return {
      trend,
      data,
      change: Math.round(change * 100) / 100,
      firstValue,
      lastValue
    };
  } catch (error) {
    console.error('Error in getTrendAnalysis:', error);
    return { trend: 'stable', data: [], change: 0 };
  }
};

// ===== AGGREGATION FUNCTIONS =====

/**
 * Generate daily metrics for all analytics
 * @param {Date} date - Date to generate metrics for
 * @returns {Promise<object>} Success status
 */
export const generateDailyMetrics = async (date = new Date()) => {
  try {
    const dateStr = date.toISOString().split('T')[0];

    // Generate portfolio metrics
    const { error: portfolioError } = await supabase.rpc('generate_daily_portfolio_metrics');
    if (portfolioError) {
      console.error('Error generating portfolio metrics:', portfolioError);
    }

    // Generate contact analytics
    await generateDailyContactAnalytics(dateStr);

    // Generate admin activity analytics
    await generateDailyAdminAnalytics(dateStr);

    return { success: true };
  } catch (error) {
    console.error('Error in generateDailyMetrics:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate weekly analytics report
 * @returns {Promise<object>} Weekly report data
 */
export const generateWeeklyReport = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const portfolioMetrics = await getPortfolioMetrics(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const contactAnalytics = await getContactAnalytics('7d');
    const adminActivity = await getAdminActivityAnalytics('7d');
    const contentEngagement = await calculateContentEngagement(null, 7);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      portfolio: portfolioMetrics,
      contacts: contactAnalytics,
      admin: adminActivity,
      content: contentEngagement,
      summary: {
        totalViews: contentEngagement.reduce((sum, item) => sum + item.total_views, 0),
        totalMessages: contactAnalytics.totalMessages || 0,
        adminSessions: adminActivity.totalSessions || 0,
        productivityScore: adminActivity.productivityScore || 0
      }
    };
  } catch (error) {
    console.error('Error generating weekly report:', error);
    return null;
  }
};

/**
 * Generate monthly analytics report
 * @returns {Promise<object>} Monthly report data
 */
export const generateMonthlyReport = async () => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    const portfolioMetrics = await getPortfolioMetrics(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const contactAnalytics = await getContactAnalytics('30d');
    const adminActivity = await getAdminActivityAnalytics('30d');
    const contentEngagement = await calculateContentEngagement(null, 30);

    return {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0]
      },
      portfolio: portfolioMetrics,
      contacts: contactAnalytics,
      admin: adminActivity,
      content: contentEngagement,
      trends: {
        portfolio: await getTrendAnalysis('portfolio_completeness', '30d'),
        contacts: await getTrendAnalysis('contact_volume', '30d'),
        productivity: await getTrendAnalysis('admin_productivity', '30d')
      },
      summary: {
        portfolioCompleteness: await calculatePortfolioCompleteness(),
        totalViews: contentEngagement.reduce((sum, item) => sum + item.total_views, 0),
        totalMessages: contactAnalytics.totalMessages || 0,
        adminSessions: adminActivity.totalSessions || 0,
        avgProductivity: adminActivity.productivityScore || 0
      }
    };
  } catch (error) {
    console.error('Error generating monthly report:', error);
    return null;
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Generate unique session ID
 * @returns {string} Session ID
 */
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse date range string to days
 * @param {string} dateRange - Date range string
 * @returns {number} Number of days
 */
const parseDateRange = (dateRange) => {
  switch (dateRange) {
    case '7d': return 7;
    case '30d': return 30;
    case '90d': return 90;
    case '1y': return 365;
    default: return 30;
  }
};

/**
 * Get metric value from data object
 * @param {object} dataItem - Data item
 * @param {string} metricType - Metric type
 * @returns {number} Metric value
 */
const getMetricValue = (dataItem, metricType) => {
  switch (metricType) {
    case 'portfolio_completeness':
      return dataItem.content_completeness_score || 0;
    case 'contact_volume':
      return dataItem.total_messages || 0;
    case 'admin_productivity':
      return dataItem.productivity_score || 0;
    default:
      return 0;
  }
};

/**
 * Calculate daily trend from messages
 * @param {Array} messages - Messages array
 * @param {number} days - Number of days
 * @returns {Array} Daily trend data
 */
const calculateDailyTrend = (messages, days) => {
  const trend = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayMessages = messages.filter(msg => 
      msg.created_at.startsWith(dateStr)
    );

    trend.push({
      date: dateStr,
      count: dayMessages.length,
      day: date.toLocaleDateString('en-US', { weekday: 'short' })
    });
  }

  return trend;
};

/**
 * Generate daily contact analytics
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 */
const generateDailyContactAnalytics = async (dateStr) => {
  try {
    const { data: messages } = await supabase
      .from('contact_messages')
      .select('*')
      .gte('created_at', `${dateStr}T00:00:00`)
      .lt('created_at', `${dateStr}T23:59:59`);

    if (!messages || messages.length === 0) return;

    const contactTypes = { hr: 0, recruiter: 0, manager: 0, other: 0 };
    const subjects = [];
    const hours = {};

    messages.forEach(msg => {
      // Count contact types
      const type = msg.contact_type?.toLowerCase() || 'other';
      if (contactTypes.hasOwnProperty(type)) {
        contactTypes[type]++;
      } else {
        contactTypes.other++;
      }

      // Collect subjects
      if (msg.subject) subjects.push(msg.subject);

      // Track hours
      const hour = new Date(msg.created_at).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    // Find peak hour
    const peakHour = Object.keys(hours).reduce((a, b) => hours[a] > hours[b] ? a : b, 0);

    // Insert/update contact analytics
    await supabase
      .from('contact_analytics')
      .upsert([
        {
          analysis_date: dateStr,
          total_messages: messages.length,
          hr_messages: contactTypes.hr,
          recruiter_messages: contactTypes.recruiter,
          manager_messages: contactTypes.manager,
          other_messages: contactTypes.other,
          peak_contact_hour: parseInt(peakHour),
          popular_subjects: subjects.slice(0, 10) // Top 10 subjects
        }
      ]);
  } catch (error) {
    console.error('Error generating daily contact analytics:', error);
  }
};

/**
 * Generate daily admin analytics
 * @param {string} dateStr - Date string (YYYY-MM-DD)
 */
const generateDailyAdminAnalytics = async (dateStr) => {
  try {
    const { data: sessions } = await supabase
      .from('admin_sessions')
      .select('*')
      .gte('start_time', `${dateStr}T00:00:00`)
      .lt('start_time', `${dateStr}T23:59:59`);

    if (!sessions || sessions.length === 0) return;

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalActions = sessions.reduce((sum, s) => sum + (s.actions_performed || 0), 0);

    // Count unique sections visited
    const allSections = sessions.flatMap(s => s.sections_visited || []);
    const uniqueSections = [...new Set(allSections)];

    // Find most used section
    const sectionCounts = {};
    allSections.forEach(section => {
      sectionCounts[section] = (sectionCounts[section] || 0) + 1;
    });
    const mostUsedSection = Object.keys(sectionCounts).reduce((a, b) => 
      sectionCounts[a] > sectionCounts[b] ? a : b, null
    );

    // Calculate productivity score
    const productivityScore = Math.min(100, Math.round(
      (totalActions / Math.max(totalTime, 1)) * 10 + (totalSessions * 2)
    ));

    // Insert/update admin activity analytics
    await supabase
      .from('admin_activity_analytics')
      .upsert([
        {
          activity_date: dateStr,
          total_sessions: totalSessions,
          total_active_time_minutes: totalTime,
          sections_visited: uniqueSections.length,
          content_updates: totalActions, // Approximation
          most_used_section: mostUsedSection,
          productivity_score: productivityScore
        }
      ]);
  } catch (error) {
    console.error('Error generating daily admin analytics:', error);
  }
};

/**
* Update admin activity analytics in real-time
* @param {Date} sessionDate - Session date
* @param {number} duration - Session duration in minutes
* @param {number} sectionsCount - Number of sections visited
* @param {number} actions - Number of actions performed
*/
const updateAdminActivityAnalytics = async (sessionDate, duration, sectionsCount, actions) => {
 try {
   const dateStr = sessionDate.toISOString().split('T')[0];
   
   const { data: existing } = await supabase
     .from('admin_activity_analytics')
     .select('*')
     .eq('activity_date', dateStr)
     .single();

   if (existing) {
     // Update existing record
     const newTotalSessions = existing.total_sessions + 1;
     const newTotalTime = existing.total_active_time_minutes + duration;
     const newTotalActions = existing.content_updates + actions;
     const newProductivityScore = Math.min(100, Math.round(
       (newTotalActions / Math.max(newTotalTime, 1)) * 10 + (newTotalSessions * 2)
     ));

     await supabase
       .from('admin_activity_analytics')
       .update({
         total_sessions: newTotalSessions,
         total_active_time_minutes: newTotalTime,
         sections_visited: Math.max(existing.sections_visited, sectionsCount),
         content_updates: newTotalActions,
         productivity_score: newProductivityScore
       })
       .eq('id', existing.id);
   } else {
     // Create new record
     const productivityScore = Math.min(100, Math.round(
       (actions / Math.max(duration, 1)) * 10 + 2
     ));

     await supabase
       .from('admin_activity_analytics')
       .insert([
         {
           activity_date: dateStr,
           total_sessions: 1,
           total_active_time_minutes: duration,
           sections_visited: sectionsCount,
           content_updates: actions,
           productivity_score: productivityScore
         }
       ]);
   }
 } catch (error) {
   console.error('Error updating admin activity analytics:', error);
 }
};

// ===== COMPARISON FUNCTIONS =====

/**
* Compare performance between two time periods
* @param {string} period1Start - Start date of first period
* @param {string} period1End - End date of first period
* @param {string} period2Start - Start date of second period
* @param {string} period2End - End date of second period
* @returns {Promise<object>} Comparison data
*/
export const comparePerformancePeriods = async (period1Start, period1End, period2Start, period2End) => {
 try {
   // Get portfolio metrics for both periods
   const period1Portfolio = await getPortfolioMetrics(period1Start, period1End);
   const period2Portfolio = await getPortfolioMetrics(period2Start, period2End);

   // Calculate averages for period 1
   const period1Avg = calculatePeriodAverages(period1Portfolio);
   const period2Avg = calculatePeriodAverages(period2Portfolio);

   // Calculate percentage changes
   const changes = {};
   Object.keys(period1Avg).forEach(key => {
     if (period1Avg[key] > 0) {
       changes[key] = ((period2Avg[key] - period1Avg[key]) / period1Avg[key]) * 100;
     } else {
       changes[key] = period2Avg[key] > 0 ? 100 : 0;
     }
   });

   return {
     period1: { start: period1Start, end: period1End, metrics: period1Avg },
     period2: { start: period2Start, end: period2End, metrics: period2Avg },
     changes,
     summary: {
       improvement: Object.values(changes).filter(change => change > 0).length,
       decline: Object.values(changes).filter(change => change < 0).length,
       stable: Object.values(changes).filter(change => Math.abs(change) < 5).length
     }
   };
 } catch (error) {
   console.error('Error comparing performance periods:', error);
   return null;
 }
};

/**
* Benchmark current metrics against historical performance
* @param {string} metricType - Type of metric to benchmark
* @param {number} days - Number of days to look back
* @returns {Promise<object>} Benchmark data
*/
export const benchmarkMetrics = async (metricType = 'portfolio_completeness', days = 90) => {
  try {
    const trendData = await getTrendAnalysis(metricType, `${days}d`);
    
    if (!trendData.data || trendData.data.length === 0) {
      return { benchmark: 'insufficient_data', percentile: 0, recommendation: 'Collect more data for benchmarking' };
    }

    const values = trendData.data.map(item => getMetricValue(item, metricType)).filter(val => val > 0);
    const currentValue = trendData.lastValue;

    if (values.length === 0) {
      return { benchmark: 'no_data', percentile: 0, recommendation: 'No valid data for benchmarking' };
    }

    // Calculate percentile ranking
    const sortedValues = [...values].sort((a, b) => a - b);
    const percentile = Math.round((sortedValues.filter(val => val <= currentValue).length / sortedValues.length) * 100);

    // Determine benchmark status
    let benchmark = 'average';
    let recommendation = 'Maintain current performance levels';

    if (percentile >= 80) {
      benchmark = 'excellent';
      recommendation = 'Outstanding performance! Consider sharing best practices';
    } else if (percentile >= 60) {
      benchmark = 'good';
      recommendation = 'Good performance with room for optimization';
    } else if (percentile >= 40) {
      benchmark = 'average';
      recommendation = 'Performance is average. Focus on key improvement areas';
    } else {
      benchmark = 'below_average';
      recommendation = 'Performance needs attention. Review strategy and processes';
    }

    return {
      benchmark,
      percentile,
      currentValue,
      average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
      median: sortedValues[Math.floor(sortedValues.length / 2)],
      min: Math.min(...values),
      max: Math.max(...values),
      recommendation
    };
  } catch (error) {
    console.error('Error benchmarking metrics:', error);
    return { benchmark: 'error', percentile: 0, recommendation: 'Unable to calculate benchmark' };
  }
};

/**
* Identify trends in metrics over time
* @param {string} metricType - Type of metric to analyze
* @param {string} timeframe - Analysis timeframe
* @returns {Promise<object>} Trend identification data
*/
export const identifyTrends = async (metricType, timeframe = '30d') => {
 try {
   const trendData = await getTrendAnalysis(metricType, timeframe);
   
   if (!trendData.data || trendData.data.length < 3) {
     return { trend: 'insufficient_data', patterns: [], forecast: null };
   }

   const values = trendData.data.map(item => getMetricValue(item, metricType));
   
   // Identify patterns
   const patterns = [];
   
   // Check for consistent growth/decline
   const consistentGrowth = values.every((val, idx) => idx === 0 || val >= values[idx - 1]);
   const consistentDecline = values.every((val, idx) => idx === 0 || val <= values[idx - 1]);
   
   if (consistentGrowth && values[values.length - 1] > values[0]) {
     patterns.push('consistent_growth');
   } else if (consistentDecline && values[values.length - 1] < values[0]) {
     patterns.push('consistent_decline');
   }
   
   // Check for volatility
   const average = values.reduce((sum, val) => sum + val, 0) / values.length;
   const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
   const standardDeviation = Math.sqrt(variance);
   
   if (standardDeviation > average * 0.2) {
     patterns.push('high_volatility');
   } else if (standardDeviation < average * 0.05) {
     patterns.push('stable');
   }
   
   // Simple linear forecast for next period
   const forecast = calculateLinearForecast(values);
   
   return {
     trend: trendData.trend,
     patterns,
     forecast,
     volatility: {
       standardDeviation: Math.round(standardDeviation * 100) / 100,
       coefficient: Math.round((standardDeviation / average) * 10000) / 100 // Coefficient of variation as percentage
     },
     insights: generateTrendInsights(patterns, trendData.trend, forecast)
   };
 } catch (error) {
   console.error('Error identifying trends:', error);
   return { trend: 'error', patterns: [], forecast: null };
 }
};

/**
* Detect anomalies in metric patterns
* @param {string} metricType - Type of metric to analyze
* @param {number} sensitivityLevel - Sensitivity level (1-5, higher = more sensitive)
* @returns {Promise<object>} Anomaly detection results
*/
export const detectAnomalies = async (metricType, sensitivityLevel = 3) => {
 try {
   const trendData = await getTrendAnalysis(metricType, '30d');
   
   if (!trendData.data || trendData.data.length < 7) {
     return { anomalies: [], status: 'insufficient_data' };
   }

   const values = trendData.data.map(item => getMetricValue(item, metricType));
   const dates = trendData.data.map(item => 
     item.metric_date || item.analysis_date || item.activity_date
   );

   // Calculate statistical thresholds
   const average = values.reduce((sum, val) => sum + val, 0) / values.length;
   const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
   const standardDeviation = Math.sqrt(variance);
   
   // Adjust threshold based on sensitivity level
   const sensitivityMultiplier = 3 - (sensitivityLevel - 1) * 0.5; // Range: 1.0 to 3.0
   const threshold = standardDeviation * sensitivityMultiplier;

   // Detect anomalies
   const anomalies = [];
   values.forEach((value, index) => {
     const deviation = Math.abs(value - average);
     if (deviation > threshold) {
       anomalies.push({
         date: dates[index],
         value,
         expected: Math.round(average * 100) / 100,
         deviation: Math.round(deviation * 100) / 100,
         type: value > average ? 'spike' : 'drop',
         severity: deviation > threshold * 1.5 ? 'high' : 'medium'
       });
     }
   });

   // Generate status and recommendations
   let status = 'normal';
   let recommendations = [];

   if (anomalies.length > values.length * 0.3) {
     status = 'high_volatility';
     recommendations.push('Consider investigating causes of high volatility');
   } else if (anomalies.length > 0) {
     status = 'anomalies_detected';
     recommendations.push('Review anomalous periods for insights');
   }

   // Check for recent anomalies
   const recentAnomalies = anomalies.filter(anomaly => {
     const anomalyDate = new Date(anomaly.date);
     const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
     return anomalyDate >= threeDaysAgo;
   });

   if (recentAnomalies.length > 0) {
     recommendations.push('Recent anomalies detected - monitor closely');
   }

   return {
     anomalies,
     status,
     summary: {
       total: anomalies.length,
       spikes: anomalies.filter(a => a.type === 'spike').length,
       drops: anomalies.filter(a => a.type === 'drop').length,
       recent: recentAnomalies.length
     },
     statistics: {
       average: Math.round(average * 100) / 100,
       standardDeviation: Math.round(standardDeviation * 100) / 100,
       threshold: Math.round(threshold * 100) / 100
     },
     recommendations
   };
 } catch (error) {
   console.error('Error detecting anomalies:', error);
   return { anomalies: [], status: 'error' };
 }
};

// ===== EXPORT FUNCTIONS =====

/**
* Export analytics data in specified format
* @param {string} format - Export format ('csv', 'json', 'pdf')
* @param {string} dateRange - Date range for export
* @param {Array} sections - Sections to include in export
* @returns {Promise<object>} Export data
*/
export const exportAnalyticsData = async (format = 'json', dateRange = '30d', sections = ['all']) => {
 try {
   const exportData = {};
   
   // Determine date range
   const days = parseDateRange(dateRange);
   const endDate = new Date();
   const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
   const startDateStr = startDate.toISOString().split('T')[0];
   const endDateStr = endDate.toISOString().split('T')[0];

   // Collect data based on requested sections
   if (sections.includes('all') || sections.includes('portfolio')) {
     exportData.portfolio = await getPortfolioMetrics(startDateStr, endDateStr);
   }
   
   if (sections.includes('all') || sections.includes('contacts')) {
     exportData.contacts = await getContactAnalytics(dateRange);
   }
   
   if (sections.includes('all') || sections.includes('admin')) {
     exportData.admin = await getAdminActivityAnalytics(dateRange);
   }
   
   if (sections.includes('all') || sections.includes('content')) {
     exportData.content = await getContentAnalytics(null, dateRange);
   }

   // Add metadata
   exportData.metadata = {
     exportDate: new Date().toISOString(),
     dateRange: { start: startDateStr, end: endDateStr },
     format,
     sections: sections.includes('all') ? ['portfolio', 'contacts', 'admin', 'content'] : sections
   };

   // Format data based on requested format
   switch (format.toLowerCase()) {
     case 'csv':
       return { success: true, data: convertToCSV(exportData), filename: `analytics_${dateRange}_${Date.now()}.csv` };
     case 'json':
       return { success: true, data: JSON.stringify(exportData, null, 2), filename: `analytics_${dateRange}_${Date.now()}.json` };
     case 'pdf':
       // PDF generation would require additional libraries
       return { success: false, error: 'PDF export not yet implemented' };
     default:
       return { success: true, data: exportData, filename: `analytics_${dateRange}_${Date.now()}.json` };
   }
 } catch (error) {
   console.error('Error exporting analytics data:', error);
   return { success: false, error: error.message };
 }
};

// ===== HELPER FUNCTIONS =====

/**
* Calculate period averages for portfolio metrics
* @param {Array} metrics - Portfolio metrics array
* @returns {object} Average values
*/
const calculatePeriodAverages = (metrics) => {
 if (!metrics || metrics.length === 0) {
   return {
     total_projects: 0,
     total_skills: 0,
     total_certifications: 0,
     content_completeness_score: 0
   };
 }

 const totals = metrics.reduce((acc, metric) => {
   Object.keys(metric).forEach(key => {
     if (typeof metric[key] === 'number' && key !== 'id') {
       acc[key] = (acc[key] || 0) + metric[key];
     }
   });
   return acc;
 }, {});

 const averages = {};
 Object.keys(totals).forEach(key => {
   averages[key] = Math.round((totals[key] / metrics.length) * 100) / 100;
 });

 return averages;
};

/**
* Calculate linear forecast for next period
* @param {Array} values - Historical values
* @returns {number} Forecasted value
*/
const calculateLinearForecast = (values) => {
 if (values.length < 2) return values[0] || 0;

 // Simple linear regression
 const n = values.length;
 const x = Array.from({ length: n }, (_, i) => i);
 const y = values;

 const sumX = x.reduce((sum, val) => sum + val, 0);
 const sumY = y.reduce((sum, val) => sum + val, 0);
 const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
 const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

 const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
 const intercept = (sumY - slope * sumX) / n;

 // Forecast next value
 return Math.round((slope * n + intercept) * 100) / 100;
};

/**
* Generate insights based on trend patterns
* @param {Array} patterns - Detected patterns
* @param {string} trend - Overall trend direction
* @param {number} forecast - Forecasted value
* @returns {Array} Insights array
*/
const generateTrendInsights = (patterns, trend, forecast) => {
 const insights = [];

 if (patterns.includes('consistent_growth')) {
   insights.push('Metrics show consistent improvement over time');
 }
 
 if (patterns.includes('consistent_decline')) {
   insights.push('Metrics show concerning decline - review strategy');
 }
 
 if (patterns.includes('high_volatility')) {
   insights.push('High volatility detected - consider stabilization measures');
 }
 
 if (patterns.includes('stable')) {
   insights.push('Metrics are stable with minimal fluctuation');
 }

 if (trend === 'increasing' && forecast) {
   insights.push(`Positive trend continues - forecast suggests further improvement to ${forecast}`);
 } else if (trend === 'decreasing' && forecast) {
   insights.push(`Declining trend continues - forecast predicts drop to ${forecast}`);
 }

 return insights.length > 0 ? insights : ['No significant patterns detected in current data'];
};

/**
* Convert data object to CSV format
* @param {object} data - Data to convert
* @returns {string} CSV formatted string
*/
const convertToCSV = (data) => {
 // Simple CSV conversion for portfolio metrics
 if (data.portfolio && Array.isArray(data.portfolio)) {
   const headers = Object.keys(data.portfolio[0] || {});
   const csvRows = [headers.join(',')];
   
   data.portfolio.forEach(row => {
     const values = headers.map(header => row[header] || '');
     csvRows.push(values.join(','));
   });
   
   return csvRows.join('\n');
 }
 
 return JSON.stringify(data, null, 2);
};

// ===== REAL-TIME TRACKING HELPERS =====

/**
* Start tracking admin session
* @returns {object} Session tracking object
*/
export const startAdminSession = () => {
 const sessionId = generateSessionId();
 const startTime = new Date();
 
 return {
   sessionId,
   startTime,
   sectionsVisited: [],
   actionsPerformed: 0,
   
   visitSection: function(sectionId) {
     if (!this.sectionsVisited.includes(sectionId)) {
       this.sectionsVisited.push(sectionId);
     }
     trackEvent('section_visit', 'admin', 'visit_section', sectionId, 1, {}, 'admin', this.sessionId);
   },
   
   performAction: function(actionType, details = {}) {
     this.actionsPerformed++;
     trackEvent('admin_action', 'admin', actionType, null, 1, details, 'admin', this.sessionId);
   },
   
   endSession: async function() {
     const endTime = new Date();
     await trackAdminSession(this.startTime, endTime, this.sectionsVisited, this.actionsPerformed);
     return {
       duration: endTime - this.startTime,
       sectionsVisited: this.sectionsVisited.length,
       actionsPerformed: this.actionsPerformed
     };
   }
 };
};

// Export all functions for use in components
const analyticsService = {
  // Core tracking
  trackEvent,
  trackContentView,
  trackAdminSession,
  trackContentUpdate,
  
  // Metrics calculation
  calculatePortfolioCompleteness,
  calculateContentEngagement,
  calculateAdminProductivity,
  calculateContactTrends,
  
  // Data retrieval
  getPortfolioMetrics,
  getContentAnalytics,
  getContactAnalytics,
  getAdminActivityAnalytics,
  getTrendAnalysis,
  
  // Aggregation
  generateDailyMetrics,
  generateWeeklyReport,
  generateMonthlyReport,
  
  // Comparison and analysis
  comparePerformancePeriods,
  benchmarkMetrics,
  identifyTrends,
  detectAnomalies,
  
  // Export
  exportAnalyticsData,
  
  // Real-time tracking
  startAdminSession
};

export default analyticsService;