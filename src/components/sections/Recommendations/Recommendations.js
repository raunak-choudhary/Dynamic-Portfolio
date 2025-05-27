import React, { useEffect } from 'react';
import RecommendationCard from './RecommendationCard';
import { sectionTemplates } from '../../../data/portfolioData';
import './Recommendations.css';

const Recommendations = () => {
  const { recommendations } = sectionTemplates;

  // Fix Issue 1: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="recommendations-section section">
      <div className="container">
        {/* Header matching Projects section style */}
        <div className="section-header">
          <h1 className="neon-title">{recommendations.title}</h1>
          <p className="neon-subtitle">{recommendations.description}</p>
        </div>

        <div className="recommendations-content">
          {recommendations.items.length === 0 ? (
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21C3 17.686 5.686 15 9 15S15 17.686 15 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  <path d="M16 3.13C16.84 3.35 17.56 3.85 18.07 4.54C18.58 5.23 18.84 6.07 18.82 6.94C18.8 7.81 18.5 8.64 17.96 9.31C17.42 9.98 16.66 10.44 15.82 10.62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M19 21C19 19.74 18.65 18.55 18.05 17.55" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Recommendations Available</h3>
              <p className="no-content-text">
                No information present. Professional recommendations and testimonials will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            <div className="recommendations-grid">
              {recommendations.items.map((item, index) => (
                <RecommendationCard key={index} recommendation={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Recommendations;