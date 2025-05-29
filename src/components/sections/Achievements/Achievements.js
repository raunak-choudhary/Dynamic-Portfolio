import React, { useState, useEffect, useMemo } from 'react';
import AchievementCard from './AchievementCard';
import AchievementCertificateModal from './AchievementCertificateModal';
import AchievementDetailsModal from './AchievementDetailsModal';
import { useSupabaseByStatus } from '../../../hooks/useSupabase';
import LoadingSpinner from '../../common/LoadingSpinner';
import './Achievements.css';

const Achievements = () => {
  // 🔧 UPDATED: Database integration with useSupabase hook
  const { data: flatAchievements, loading, error } = useSupabaseByStatus(
    'achievements', 
    'active',
    {},
    { 
      orderBy: { column: 'date_achieved', ascending: false }
    }
  );

  // 🔧 ADDED: Process flat achievements data into sorted structure
  const achievementsData = useMemo(() => {
    if (!flatAchievements || flatAchievements.length === 0) {
      return [];
    }

    console.log('✅ Achievements fetched successfully:', flatAchievements.length, 'entries');
    
    // Sort achievements: featured first, then by order_index, then by date_achieved
    const sortedAchievements = flatAchievements.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      if (a.order_index !== b.order_index) {
        return (a.order_index || 999) - (b.order_index || 999);
      }
      if (a.date_achieved && b.date_achieved) {
        return new Date(b.date_achieved) - new Date(a.date_achieved);
      }
      return 0;
    });
    
    console.log('🏅 Processed achievements:', sortedAchievements.length);
    return sortedAchievements || [];
  }, [flatAchievements]);

  // Modal state management
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle View Certificate button click
  const handleViewCertificate = (achievement) => {
    console.log('📄 Opening certificate modal for:', achievement.title);
    setSelectedAchievement(achievement);
    setIsCertificateModalOpen(true);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle View Details button click
  const handleViewDetails = (achievement) => {
    console.log('🔍 Opening details modal for:', achievement.title);
    setSelectedAchievement(achievement);
    setIsDetailsModalOpen(true);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    console.log('❌ Closing modals');
    setIsCertificateModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedAchievement(null);
  };

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && (isCertificateModalOpen || isDetailsModalOpen)) {
        handleModalClose();
      }
    };

    if (isCertificateModalOpen || isDetailsModalOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isCertificateModalOpen, isDetailsModalOpen]);

  // Show loading spinner
  if (loading) {
    return (
      <section className="accomplishments-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading achievements..." />
        </div>
      </section>
    );
  }

  return (
    <section className="accomplishments-section section">
      <div className="container">
        {/* Main Header */}
        <div className="accomplishments-header">
          <h1 className="distinction-title">Achievements & Awards</h1>
          <p className="distinction-subtitle">Moments of distinction and success</p>
        </div>

        <div className="accomplishments-content">
          {error ? (
            // Error state - 🔧 UPDATED: Enhanced error handling
            <div className="no-achievements-message glass-achievement-card">
              <div className="no-achievements-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-achievements-title">Error Loading Achievements</h3>
              <p className="no-achievements-text">
                {typeof error === 'object' ? error.message : error || 'Something went wrong while loading achievements. Please try again later.'}
              </p>
              <div className="no-achievements-decoration">
                <div className="floating-achievement-particle"></div>
                <div className="floating-achievement-particle"></div>
                <div className="floating-achievement-particle"></div>
              </div>
            </div>
          ) : achievementsData.length === 0 ? (
            // No data state
            <div className="no-achievements-message glass-achievement-card">
              <div className="no-achievements-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-achievements-title">No Achievements Available</h3>
              <p className="no-achievements-text">
                No information present. Recognition and accomplishments will be displayed here once they are added to the portfolio.
              </p>
              <div className="no-achievements-decoration">
                <div className="floating-achievement-particle"></div>
                <div className="floating-achievement-particle"></div>
                <div className="floating-achievement-particle"></div>
              </div>
            </div>
          ) : (
            // Achievements grid
            <div className="accomplishments-grid">
              {achievementsData.map((achievement, index) => (
                <AchievementCard 
                  key={achievement.id || index} 
                  achievement={achievement} 
                  onViewCertificate={() => handleViewCertificate(achievement)}
                  onViewDetails={() => handleViewDetails(achievement)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {isCertificateModalOpen && selectedAchievement && (
        <AchievementCertificateModal 
          achievement={selectedAchievement} 
          onClose={handleModalClose}
        />
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedAchievement && (
        <AchievementDetailsModal 
          achievement={selectedAchievement} 
          onClose={handleModalClose}
        />
      )}
    </section>
  );
};

export default Achievements;