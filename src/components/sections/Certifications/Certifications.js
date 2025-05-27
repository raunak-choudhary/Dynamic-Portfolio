import React, { useEffect } from 'react';
import CertificationCard from './CertificationCard';
import { sectionTemplates } from '../../../data/portfolioData';
import './Certifications.css';

const Certifications = () => {
  const { certifications } = sectionTemplates;

  // Fix Issue 1: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="certifications-section section">
      <div className="container">
        {/* Header matching Explore Portfolio section style */}
        <div className="section-header">
          <h1 className="neon-title">{certifications.title}</h1>
          <p className="neon-subtitle">{certifications.description}</p>
        </div>

        <div className="certifications-content">
          {certifications.items.length === 0 ? (
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 10L10 12L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 20H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 20V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M15 20V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Certifications Available</h3>
              <p className="no-content-text">
                No information present. Professional certifications and credentials will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            <div className="certifications-grid">
              {certifications.items.map((item, index) => (
                <CertificationCard key={index} certification={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Certifications;