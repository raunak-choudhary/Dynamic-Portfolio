// src/components/admin/Analytics/PortfolioMetrics.js
import React, { useState, useEffect } from 'react';
import analyticsService from '../../../services/analyticsService';
import MetricsCard from './MetricsCard';
import './PortfolioMetrics.css';

const PortfolioMetrics = ({ dateRange = '30d' }) => {
  const [portfolioData, setPortfolioData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState([]);
  const [sectionProgress, setSectionProgress] = useState([]);

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

  // Calculate section completeness
  const calculateSectionCompleteness = async () => {
    try {
      // Mock section data - in real implementation, this would check actual content
      const sections = [
        { name: 'Hero Content', weight: 10, hasContent: true },
        { name: 'About Section', weight: 10, hasContent: true },
        { name: 'Projects', weight: 20, hasContent: true },
        { name: 'Work Experience', weight: 15, hasContent: true },
        { name: 'Skills', weight: 10, hasContent: true },
        { name: 'Education', weight: 10, hasContent: true },
        { name: 'Certifications', weight: 10, hasContent: false },
        { name: 'Internships', weight: 5, hasContent: true },
        { name: 'Achievements', weight: 5, hasContent: false },
        { name: 'Leadership', weight: 5, hasContent: false }
      ];

      return sections.map(section => ({
        ...section,
        completeness: section.hasContent ? 100 : 0
      }));
    } catch (error) {
      console.error('Error calculating section completeness:', error);
      return [];
    }
  };

  // Process portfolio metrics for display
  const processPortfolioMetrics = (portfolioMetrics, contentEngagement, sectionCompleteness) => {
    const totalSections = sectionCompleteness.length;
    const completedSections = sectionCompleteness.filter(s => s.completeness > 0).length;
    const totalProjects = 8; // Mock data
    const totalSkills = 25; // Mock data
    const totalCertifications = 3; // Mock data

    return [
      {
        title: 'Total Projects',
        value: totalProjects,
        icon: '💼',
        color: 'blue',
        change: 12.5,
        changeType: 'positive'
      },
      {
        title: 'Skills Listed',
        value: totalSkills,
        icon: '🛠️',
        color: 'emerald',
        change: 8.3,
        changeType: 'positive'
      },
      {
        title: 'Certifications',
        value: totalCertifications,
        icon: '🏆',
        color: 'orange',
        change: 0,
        changeType: 'neutral'
      },
      {
        title: 'Sections Complete',
        value: `${completedSections}/${totalSections}`,
        icon: '✅',
        color: 'purple',
        change: completedSections > 7 ? 5.2 : -2.1,
        changeType: completedSections > 7 ? 'positive' : 'negative'
      }
    ];
  };

  // Load portfolio metrics data
  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      
      const [
        completenessScore,
        portfolioMetrics,
        contentEngagement
      ] = await Promise.all([
        analyticsService.calculatePortfolioCompleteness(),
        analyticsService.getPortfolioMetrics(),
        analyticsService.calculateContentEngagement(null, parseDateRange(dateRange))
      ]);

      // Calculate section completeness
      const sectionCompleteness = await calculateSectionCompleteness();
      
      setPortfolioData({
        completenessScore,
        portfolioMetrics: portfolioMetrics.slice(0, 30),
        contentEngagement,
        lastUpdated: new Date()
      });

      setSectionProgress(sectionCompleteness);

      // Process metrics for cards
      const processedMetrics = processPortfolioMetrics(portfolioMetrics, contentEngagement, sectionCompleteness);
      setMetrics(processedMetrics);

    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts or dateRange changes
  useEffect(() => {
    loadPortfolioData();
  }, [dateRange]);

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    if (sectionProgress.length === 0) return 0;
    
    const totalWeight = sectionProgress.reduce((sum, section) => sum + section.weight, 0);
    const completedWeight = sectionProgress.reduce((sum, section) => {
      return sum + (section.completeness / 100) * section.weight;
    }, 0);
    
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="portfolio-metrics">
      {/* Header Section */}
      <div className="portfolio-metrics-header">
        <h2 className="portfolio-metrics-title">
          <span className="metrics-icon">📈</span>
          Portfolio Performance Metrics
        </h2>
        <p className="portfolio-metrics-subtitle">
          Comprehensive analysis of your portfolio completeness and content effectiveness
        </p>
      </div>

      {/* Overall Completeness Score */}
      <div className="completeness-overview">
        <div className="completeness-card">
          <div className="completeness-content">
            <h3 className="completeness-title">Overall Portfolio Completeness</h3>
            <div className="completeness-score">
              <span className="score-value">{portfolioData.completenessScore || overallProgress}%</span>
              <div className="score-progress">
                <div 
                  className="score-progress-fill"
                  style={{ width: `${portfolioData.completenessScore || overallProgress}%` }}
                ></div>
              </div>
            </div>
            <p className="completeness-description">
              Based on content quality, section completion, and engagement metrics
            </p>
          </div>
          <div className="completeness-visual">
            <div className="circular-progress">
              <svg viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - (portfolioData.completenessScore || overallProgress) / 100)}`}
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--neon-cyan)" />
                    <stop offset="50%" stopColor="var(--neon-purple)" />
                    <stop offset="100%" stopColor="var(--neon-pink)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="progress-percentage">
                {portfolioData.completenessScore || overallProgress}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="portfolio-metrics-grid">
        {metrics.map((metric, index) => (
          <MetricsCard
            key={index}
            title={metric.title}
            value={metric.value}
            icon={metric.icon}
            color={metric.color}
            change={metric.change}
            changeType={metric.changeType}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Section Progress Breakdown */}
      <div className="section-progress">
        <h3 className="section-progress-title">Section Completion Breakdown</h3>
        <div className="section-progress-grid">
          {sectionProgress.map((section, index) => (
            <div key={index} className="section-item">
              <div className="section-header">
                <span className="section-name">{section.name}</span>
                <span className="section-percentage">{section.completeness}%</span>
              </div>
              <div className="section-progress-bar">
                <div 
                  className={`section-progress-fill ${section.completeness === 100 ? 'complete' : section.completeness > 0 ? 'partial' : 'empty'}`}
                  style={{ width: `${section.completeness}%` }}
                ></div>
              </div>
              <div className="section-weight">Weight: {section.weight}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Engagement Summary */}
      {portfolioData.contentEngagement && portfolioData.contentEngagement.length > 0 && (
        <div className="engagement-summary">
          <h3 className="engagement-title">Content Engagement Overview</h3>
          <div className="engagement-grid">
            {portfolioData.contentEngagement.slice(0, 6).map((content, index) => (
              <div key={index} className="engagement-item">
                <div className="engagement-type">{content.content_type}</div>
                <div className="engagement-stats">
                  <span className="stat-views">{content.total_views} views</span>
                  <span className="stat-score">Score: {content.avg_engagement}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Timeline */}
      <div className="growth-timeline">
        <h3 className="timeline-title">Portfolio Growth Timeline</h3>
        <div className="timeline-content">
          <p className="timeline-description">
            Your portfolio has grown significantly over the past {dateRange}. 
            {portfolioData.portfolioMetrics && portfolioData.portfolioMetrics.length > 0 
              ? ` Latest metrics show ${portfolioData.portfolioMetrics.length} data points recorded.`
              : ' Continue adding content to see detailed growth analytics.'
            }
          </p>
          {portfolioData.lastUpdated && (
            <p className="timeline-updated">
              Last updated: {portfolioData.lastUpdated.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioMetrics;