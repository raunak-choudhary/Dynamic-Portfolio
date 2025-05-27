// =====================================================
// RecommendationCard.js - 3D Flip Card Implementation
// =====================================================

import React, { useState, useEffect } from 'react';

const RecommendationCard = ({ recommendation }) => {
  console.log('🎨 Rendering RecommendationCard:', recommendation?.recommender_name);

  const [isFlipped, setIsFlipped] = useState(false);

  // Generate recommender initials for fallback
  const generateRecommenderInitials = (name) => {
    if (!name) return 'R';
    
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
  };

  // Format date with fallback
  const formatDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format LinkedIn URL for display
  const formatLinkedInUrl = (url) => {
    if (!url) return null;
    
    // Ensure URL starts with protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Check if there's content for back side
  const hasBackContent = () => {
    return (
      recommendation.recommender_title ||
      recommendation.organization ||
      recommendation.date_received ||
      recommendation.rating ||
      recommendation.recommendation_type
    );
  };

  const canFlip = hasBackContent();

  // Card flip handler
  const handleCardClick = (e) => {
    // Don't flip if clicking on links or buttons, or if no back content
    if (!canFlip || 
        e.target.closest('.linkedin-link') || 
        e.target.closest('.flip-icon-btn') ||
        e.target.closest('.featured-badge')) {
      return;
    }
    
    console.log('🔄 Card flip triggered for:', recommendation?.recommender_name);
    setIsFlipped(!isFlipped);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle flip icon click
  const handleFlipIconClick = (e) => {
    e.stopPropagation();
    if (canFlip) {
      setIsFlipped(!isFlipped);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (canFlip) {
        handleCardClick(e);
      }
    }
    if (e.key === 'Escape' && isFlipped) {
      setIsFlipped(false);
    }
  };

  // Handle escape key to close card
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFlipped) {
        setIsFlipped(false);
      }
    };

    if (isFlipped) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFlipped]);

  return (
    <div 
      className={`project-card-wrapper ${isFlipped ? 'flipped' : ''} ${!canFlip ? 'no-flip' : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Recommendation card from ${recommendation.recommender_name}. ${canFlip ? 'Press Enter or Space to flip and see details.' : 'No additional details available.'}`}
      aria-pressed={isFlipped}
    >
      <div className="project-card-3d">
        
        {/* =================== FRONT SIDE =================== */}
        <div className="card-side card-front">
          
          {/* Header with Profile Image and Flip Icon */}
          <div className="card-header">
            <div className="profile-image-section">
              {recommendation.profile_image_url ? (
                <img 
                  src={recommendation.profile_image_url}
                  alt={`${recommendation.recommender_name} profile`}
                  className="recommender-photo recommender-photo-large"
                  onError={(e) => {
                    console.warn(`Failed to load profile image for ${recommendation.recommender_name}`);
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Temp profile with initials */}
              <div 
                className="recommender-photo-temp recommender-photo-large"
                style={{ display: recommendation.profile_image_url ? 'none' : 'flex' }}
              >
                {generateRecommenderInitials(recommendation.recommender_name)}
              </div>
            </div>

            {/* Flip Icon - only show if there's back content */}
            {canFlip && (
              <button 
                className="flip-icon-btn"
                onClick={handleFlipIconClick}
                aria-label="Flip card to see details"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12l18-9v18l-18-9z" fill="currentColor"/>
                </svg>
              </button>
            )}
          </div>

          {/* Recommender Name */}
          <div className="name-section">
            <h3 className="recommender-name">{recommendation.recommender_name}</h3>
            <div className="name-underline"></div>
          </div>

          {/* Relationship */}
          {recommendation.relationship && (
            <div className="relationship-section">
              <div className="relationship-badge">
                {recommendation.relationship}
              </div>
            </div>
          )}

          {/* Featured Badge */}
          {recommendation.is_featured && (
            <div className="featured-section">
              <div className="featured-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="star-icon">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Featured</span>
              </div>
            </div>
          )}

          {/* Content and LinkedIn Section */}
          <div className="content-section">
            <div className="content-container">
              
              {/* Recommendation Content */}
              <div className="recommendation-content">
                <div className="content-header">
                  <span className="content-icon">💬</span>
                  <span className="content-title">Recommendation</span>
                </div>
                <div className="content-text-wrapper">
                  <p className="content-text">"{recommendation.content}"</p>
                </div>
              </div>

              {/* LinkedIn Profile Link */}
              {recommendation.linkedin_profile_url && (
                <div className="linkedin-section">
                  <a 
                    href={formatLinkedInUrl(recommendation.linkedin_profile_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="linkedin-link"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="linkedin-icon">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span>Recommender's LinkedIn</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Card Footer */}
          <div className="card-footer">
            {canFlip ? (
              <div className="flip-hint">
                <span className="hint-text">Tap for details</span>
                <span className="hint-arrow">→</span>
              </div>
            ) : (
              <div className="no-flip-hint">
                <span className="hint-text">Recommendation details</span>
              </div>
            )}
          </div>
        </div>

        {/* =================== BACK SIDE =================== */}
        <div className="card-side card-back">
          
          {/* Back Header */}
          <div className="back-header">
            <h3 className="back-title">{recommendation.recommender_name}</h3>
            <div className="back-subtitle">Additional Details</div>
          </div>

          {/* Scrollable Content */}
          <div className="back-content">
            
            {/* Recommender Title */}
            {recommendation.recommender_title && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">💼</span>
                  <span className="detail-title">Position</span>
                </div>
                <p className="detail-text">{recommendation.recommender_title}</p>
              </div>
            )}

            {/* Organization */}
            {recommendation.organization && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">🏢</span>
                  <span className="detail-title">Organization</span>
                </div>
                <p className="detail-text">{recommendation.organization}</p>
              </div>
            )}

            {/* Date Received */}
            {recommendation.date_received && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">📅</span>
                  <span className="detail-title">Date Received</span>
                </div>
                <p className="detail-text">{formatDate(recommendation.date_received)}</p>
              </div>
            )}

            {/* Rating */}
            {recommendation.rating && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">⭐</span>
                  <span className="detail-title">Rating</span>
                </div>
                <div className="rating-display">
                  {[...Array(5)].map((_, index) => (
                    <span 
                      key={index} 
                      className={`star ${index < recommendation.rating ? 'filled' : 'empty'}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="rating-text">({recommendation.rating}/5)</span>
                </div>
              </div>
            )}

            {/* Recommendation Type */}
            {recommendation.recommendation_type && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">📝</span>
                  <span className="detail-title">Type</span>
                </div>
                <div className="type-badge">
                  {recommendation.recommendation_type}
                </div>
              </div>
            )}
          </div>

          {/* Back Footer */}
          <div className="card-footer">
            <div className="flip-hint">
              <span className="hint-arrow">←</span>
              <span className="hint-text">Back to recommendation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;