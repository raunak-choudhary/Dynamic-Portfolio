// src/components/admin/Analytics/AnalyticsDashboard.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import analyticsService from '../../../services/analyticsService';
import MetricsCard from './MetricsCard';
import PortfolioMetrics from './PortfolioMetrics';
import VisitorInsights from './VisitorInsights';
import AdminProductivity from './AdminProductivity';
import ContentAnalytics from './ContentAnalytics';
import TrendAnalysis from './TrendAnalysis';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [overviewData, setOverviewData] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Date range options
  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 3 Months' },
    { value: '1y', label: 'Last Year' }
  ];

  // Analytics tabs
  const analyticsTabs = [
    { id: 'overview', name: 'Overview', icon: '📊', shortcut: 'o' },
    { id: 'portfolio', name: 'Portfolio Metrics', icon: '📈', shortcut: 'p' },
    { id: 'content', name: 'Content Analytics', icon: '📝', shortcut: 'c' },
    { id: 'contacts', name: 'Contact Insights', icon: '📧', shortcut: 'i' },
    { id: 'admin', name: 'Admin Productivity', icon: '⚡', shortcut: 'a' },
    { id: 'trends', name: 'Trends & Patterns', icon: '📉', shortcut: 't' }
  ];

  // Load overview data
  const loadOverviewData = async () => {
    try {
      setIsLoading(true);
      
      const [
        portfolioCompleteness,
        contactAnalytics,
        adminProductivity,
        contentEngagement
      ] = await Promise.all([
        analyticsService.calculatePortfolioCompleteness(),
        analyticsService.getContactAnalytics(selectedDateRange),
        analyticsService.getAdminActivityAnalytics(selectedDateRange),
        analyticsService.calculateContentEngagement(null, parseDateRange(selectedDateRange))
      ]);

      setOverviewData({
        portfolioCompleteness,
        contactAnalytics,
        adminProductivity,
        contentEngagement,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error loading overview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle data refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOverviewData();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  // Parse date range helper
  const parseDateRange = (range) => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey || event.metaKey) {
        const tab = analyticsTabs.find(t => t.shortcut === event.key.toLowerCase());
        if (tab) {
          event.preventDefault();
          setActiveTab(tab.id);
        }
      }
      
      if (event.key === 'F5' || (event.ctrlKey && event.key === 'r')) {
        event.preventDefault();
        handleRefresh();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Load data on mount and date range change
  useEffect(() => {
    loadOverviewData();
  }, [selectedDateRange]);

  // Render overview tab content
  const renderOverviewContent = () => {
    const { portfolioCompleteness, contactAnalytics, adminProductivity, contentEngagement } = overviewData;

    return (
      <div className="analytics-overview">
        <div className="analytics-grid analytics-grid--4col">
          <MetricsCard
            title="Portfolio Completeness"
            value={`${portfolioCompleteness || 0}%`}
            icon="🎯"
            color="blue"
            description="Overall portfolio completion score"
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Total Messages"
            value={contactAnalytics?.totalMessages || 0}
            change={calculateChange(contactAnalytics?.totalMessages, 'messages')}
            changeType={getChangeType(calculateChange(contactAnalytics?.totalMessages, 'messages'))}
            icon="📬"
            color="emerald"
            description={`${selectedDateRange} contact inquiries`}
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Admin Sessions"
            value={adminProductivity?.totalSessions || 0}
            icon="⚡"
            color="purple"
            description={`Active sessions in ${selectedDateRange}`}
            isLoading={isLoading}
          />
          
          <MetricsCard
            title="Content Views"
            value={contentEngagement?.reduce((sum, item) => sum + (item.total_views || 0), 0) || 0}
            icon="👀"
            color="pink"
            description="Total content engagement"
            isLoading={isLoading}
          />
        </div>

        <div className="analytics-grid analytics-grid--2col">
          <MetricsCard
            title="Productivity Score"
            value={`${adminProductivity?.productivityScore || 0}/100`}
            icon="📊"
            color="orange"
            description="Admin workflow efficiency"
            isLoading={isLoading}
            size="large"
          />
          
          <MetricsCard
            title="Average Session Time"
            value={`${adminProductivity?.avgSessionTime || 0}m`}
            icon="⏱️"
            color="blue"
            description="Average admin session duration"
            isLoading={isLoading}
            size="large"
          />
        </div>

        {contactAnalytics?.popularSubjects && contactAnalytics.popularSubjects.length > 0 && (
          <div className="analytics-section">
            <h3 className="analytics-section-title">Popular Inquiry Topics</h3>
            <div className="popular-subjects">
              {contactAnalytics.popularSubjects.slice(0, 5).map((subject, index) => (
                <div key={index} className="subject-item">
                  <span className="subject-name">{subject.subject}</span>
                  <span className="subject-count">{subject.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate change percentage (placeholder logic)
  const calculateChange = (current, type) => {
    // This would normally compare with previous period
    // For now, return a placeholder value
    return Math.random() * 20 - 10; // Random -10% to +10%
  };

  // Determine change type
  const getChangeType = (change) => {
    if (change > 0) return 'positive';
    if (change < 0) return 'negative';
    return 'neutral';
  };

  return (
    <div className={`analytics-dashboard analytics-dashboard--${theme}`}>
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-content">
          <div className="analytics-title-section">
            <h1 className="analytics-title">
              <span className="analytics-icon">📊</span>
              Analytics Dashboard
            </h1>
            <p className="analytics-subtitle">
              Portfolio performance insights and metrics
            </p>
          </div>

          <div className="analytics-controls">
            <div className="date-range-selector">
              <label htmlFor="dateRange">Time Period:</label>
              <select
                id="dateRange"
                value={selectedDateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="date-range-select"
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className={`refresh-button ${refreshing ? 'refreshing' : ''}`}
              disabled={refreshing}
            >
              <span className="refresh-icon">🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="analytics-tabs">
        {analyticsTabs.map(tab => (
          <button
            key={tab.id}
            className={`analytics-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            title={`${tab.name} (Ctrl+${tab.shortcut})`}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="analytics-content">
        {activeTab === 'overview' && renderOverviewContent()}
        {activeTab === 'portfolio' && <PortfolioMetrics dateRange={selectedDateRange} />}
        {activeTab === 'content' && <ContentAnalytics dateRange={selectedDateRange} />}
        {activeTab === 'contacts' && <VisitorInsights dateRange={selectedDateRange} />}
        {activeTab === 'admin' && <AdminProductivity dateRange={selectedDateRange} />}
        {activeTab === 'trends' && <TrendAnalysis dateRange={selectedDateRange} />}
      </div>

      {/* Last Updated */}
      {overviewData.lastUpdated && (
        <div className="analytics-footer">
          <span className="last-updated">
            Last updated: {overviewData.lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;