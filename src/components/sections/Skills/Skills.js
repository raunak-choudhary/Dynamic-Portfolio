import React, { useEffect } from 'react';
import SkillCard from './SkillCard';
import { sectionTemplates } from '../../../data/portfolioData';
import './Skills.css';

const Skills = () => {
  const { skills } = sectionTemplates;

  // Fix Issue 1: Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <section className="skills-section section">
      <div className="container">
        {/* Header matching Explore Portfolio section style */}
        <div className="section-header">
          <h1 className="neon-title">{skills.title}</h1>
          <p className="neon-subtitle">{skills.description}</p>
        </div>

        <div className="skills-content">
          {skills.categories.length === 0 ? (
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 6.3C15.1 5.9 15.1 5.3 14.7 4.9L19.1 0.5C19.5 0.1 19.5 -0.5 19.1 -0.9C18.7 -1.3 18.1 -1.3 17.7 -0.9L13.3 3.5C12.9 3.1 12.3 3.1 11.9 3.5L4.9 10.5C4.5 10.9 4.5 11.5 4.9 11.9L6.1 13.1L2.7 16.5C2.3 16.9 2.3 17.5 2.7 17.9L6.1 21.3C6.5 21.7 7.1 21.7 7.5 21.3L10.9 17.9L12.1 19.1C12.5 19.5 13.1 19.5 13.5 19.1L20.5 12.1C20.9 11.7 20.9 11.1 20.5 10.7L14.7 6.3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L12 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="11.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Skills Information Available</h3>
              <p className="no-content-text">
                No information present. Technical skills and expertise areas will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            <div className="skills-grid">
              {skills.categories.map((category, index) => (
                <SkillCard key={index} category={category} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Skills;