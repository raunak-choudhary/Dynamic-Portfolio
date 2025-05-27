import React, { useState, useEffect } from 'react';
import InternshipCard from './InternshipCard';
import { getInternships } from '../../../services/dataService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './Internships.css';

const Internships = () => {
  // State management
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch internships data from API
  useEffect(() => {
    const fetchInternships = async () => {
      try {
        console.log('🔍 Fetching internships data...');
        setLoading(true);
        setError(null);
        
        const response = await getInternships();
        
        if (response.success) {
          console.log('✅ Internships fetched successfully:', response.data?.length || 0, 'internships');
          setInternships(response.data || []);
        } else {
          console.error('❌ Failed to fetch internships:', response.error);
          setError(response.error);
          setInternships([]);
        }
      } catch (error) {
        console.error('❌ Internships fetch error:', error);
        setError(error.message);
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show loading spinner
  if (loading) {
    return (
      <section className="internships-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading internships..." />
        </div>
      </section>
    );
  }

  return (
    <section className="internships-section section">
      <div className="container">
        {/* Header matching Projects section style */}
        <div className="section-header">
          <h1 className="neon-title">Internships</h1>
          <p className="neon-subtitle">Professional internship experiences and learning opportunities</p>
        </div>

        <div className="internships-content">
          {error ? (
            // Error state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">Error Loading Internships</h3>
              <p className="no-content-text">
                {error || 'Something went wrong while loading internships. Please try again later.'}
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : internships.length === 0 ? (
            // No internships state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 7H4C2.9 7 2 7.9 2 9V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V9C22 7.9 21.1 7 20 7Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 7V5C8 4.4 8.4 4 9 4H15C15.6 4 16 4.4 16 5V7" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 12L16 16M16 12L12 16" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="no-content-title">No Internships Available</h3>
              <p className="no-content-text">
                No information present. Internship experiences will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            // Internships grid - display actual data
            <div className="internships-grid">
              {internships.map((internship, index) => (
                <InternshipCard key={internship.id || index} internship={internship} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Internships;