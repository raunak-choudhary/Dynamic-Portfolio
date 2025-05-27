import React, { useState, useEffect } from 'react';
import ExperienceCard from './ExperienceCard';
import { getWorkExperience } from '../../../services/dataService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './WorkExperience.css';

const WorkExperience = () => {
  // State management
  const [workExperiences, setWorkExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch work experience data from API
  useEffect(() => {
    const fetchWorkExperience = async () => {
      try {
        console.log('🔍 Fetching work experience data...');
        setLoading(true);
        setError(null);
        
        const response = await getWorkExperience();
        
        if (response.success) {
          console.log('✅ Work experience fetched successfully:', response.data?.length || 0, 'entries');
          setWorkExperiences(response.data || []);
        } else {
          console.error('❌ Failed to fetch work experience:', response.error);
          setError(response.error);
          setWorkExperiences([]);
        }
      } catch (error) {
        console.error('❌ Work experience fetch error:', error);
        setError(error.message);
        setWorkExperiences([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkExperience();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <section className="work-experience-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading work experience..." />
        </div>
      </section>
    );
  }

  return (
    <section className="work-experience-section section">
      <div className="container">
        {/* Header matching Projects section style */}
        <div className="section-header">
          <h1 className="neon-title">Work Experience</h1>
          <p className="neon-subtitle">Professional career journey and key achievements</p>
        </div>

        <div className="work-experience-content">
          {error ? (
            // Error state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">Error Loading Work Experience</h3>
              <p className="no-content-text">
                {error || 'Something went wrong while loading work experience. Please try again later.'}
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : workExperiences.length === 0 ? (
            // No work experience state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6H16L14 2H10L8 6H4C2.9 6 2 6.9 2 8V19C2 20.1 2.9 21 4 21H20C21.1 21 22 20.1 22 19V8C22 6.9 21.1 6 20 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9 14H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Work Experience Available</h3>
              <p className="no-content-text">
                No information present. Professional work history and achievements will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            // Work experience grid - display actual data
            <div className="work-experience-grid">
              {workExperiences.map((workExperience, index) => (
                <ExperienceCard key={workExperience.id || index} workExperience={workExperience} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WorkExperience;