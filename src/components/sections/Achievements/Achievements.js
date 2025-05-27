import React, { useEffect } from 'react';
import AchievementCard from './AchievementCard';
import { sectionTemplates } from '../../../data/portfolioData';
import './Achievements.css';

const Achievements = () => {
  const { achievements } = sectionTemplates;

  // Fix Issue 1: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="achievements-section section">
      <div className="container">
        {/* Header matching Explore Portfolio section style */}
        <div className="section-header">
          <h1 className="neon-title">{achievements.title}</h1>
          <p className="neon-subtitle">{achievements.description}</p>
        </div>

        <div className="achievements-content">
          {achievements.items.length === 0 ? (
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9C6 10.45 6.38 11.78 7 12.9L12 22L17 12.9C17.62 11.78 18 10.45 18 9C18 5.69 15.31 3 12 3S6 5.69 6 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 13C14.21 13 16 11.21 16 9S14.21 5 12 5S8 6.79 8 9S9.79 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 9L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 11L12 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Achievements Available</h3>
              <p className="no-content-text">
                No information present. Recognition and accomplishments will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            <div className="achievements-grid">
              {achievements.items.map((item, index) => (
                <AchievementCard key={index} achievement={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Achievements;