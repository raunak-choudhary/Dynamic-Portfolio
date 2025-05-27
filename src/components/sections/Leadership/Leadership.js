import React, { useEffect } from 'react';
import LeadershipCard from './LeadershipCard';
import { sectionTemplates } from '../../../data/portfolioData';
import './Leadership.css';

const Leadership = () => {
  const { leadership } = sectionTemplates;

  // Fix Issue 1: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="leadership-section section">
      <div className="container">
        {/* Header matching Explore Portfolio section style */}
        <div className="section-header">
          <h1 className="neon-title">{leadership.title}</h1>
          <p className="neon-subtitle">{leadership.description}</p>
        </div>

        <div className="leadership-content">
          {leadership.items.length === 0 ? (
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
            <div className="leadership-grid">
              {leadership.items.map((item, index) => (
                <LeadershipCard key={index} leadership={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Leadership;