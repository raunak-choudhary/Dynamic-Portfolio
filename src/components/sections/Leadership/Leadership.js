// =====================================================
// Leadership.js - Main Component
// =====================================================

import React, { useState, useEffect } from 'react';
import LeadershipCard from './LeadershipCard';
import { getLeadership } from '../../../services/dataService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './Leadership.css';

const Leadership = () => {
  // State management
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch leadership data from API
  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        console.log('🔍 Fetching leadership data...');
        setLoading(true);
        setError(null);
        
        const response = await getLeadership();
        
        if (response.success) {
          console.log('✅ Leadership fetched successfully:', response.data?.length || 0, 'entries');
          setLeadership(response.data || []);
        } else {
          console.error('❌ Failed to fetch leadership:', response.error);
          setError(response.error);
          setLeadership([]);
        }
      } catch (error) {
        console.error('❌ Leadership fetch error:', error);
        setError(error.message);
        setLeadership([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeadership();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <section className="leadership-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading leadership positions..." />
        </div>
      </section>
    );
  }

  return (
    <section className="leadership-section section">
      <div className="container">
        {/* Header matching Projects section style */}
        <div className="section-header">
          <h1 className="neon-title">Leadership</h1>
          <p className="neon-subtitle">Leadership roles and volunteer experiences that shaped my professional journey</p>
        </div>

        <div className="leadership-content">
          {error ? (
            // Error state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">Error Loading Leadership</h3>
              <p className="no-content-text">
                {error || 'Something went wrong while loading leadership positions. Please try again later.'}
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : leadership.length === 0 ? (
            // No leadership state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 8V14L23 11L20 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20 21V19C20 18.1 19.7 17.3 19.2 16.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 7.13C15.8 7.35 16.5 7.85 17 8.54C17.5 9.23 17.8 10.07 17.8 10.94C17.8 11.81 17.5 12.64 17 13.31C16.5 13.98 15.8 14.44 15 14.66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Leadership Experience Available</h3>
              <p className="no-content-text">
                No information present. Leadership roles and volunteer experiences will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            // Leadership grid - display actual data
            <div className="leadership-grid">
              {leadership.map((position, index) => (
                <LeadershipCard key={position.id || index} leadership={position} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Leadership;