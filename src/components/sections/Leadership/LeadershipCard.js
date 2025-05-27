// =====================================================
// LeadershipCard.js - 3D Flip Card Implementation
// =====================================================

import React, { useState, useEffect } from 'react';

const LeadershipCard = ({ leadership }) => {
  console.log('🎨 Rendering LeadershipCard:', leadership?.title);

  const [isFlipped, setIsFlipped] = useState(false);

  // Generate organization initials for fallback
  const generateOrganizationInitials = (organization) => {
    if (!organization) return 'ORG';
    
    const words = organization.split(' ').filter(word => word.length > 0);
    if (words.length === 1) {
      return words[0].substring(0, 3).toUpperCase();
    }
    return words.slice(0, 3).map(word => word.charAt(0).toUpperCase()).join('');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  // Format duration display
  const formatDuration = () => {
    const startDate = formatDate(leadership.start_date);
    const endDate = leadership.is_current ? 'Present' : formatDate(leadership.end_date);
    return `${startDate} - ${endDate}`;
  };

  // Check if there's content for back side
  const hasBackContent = () => {
    return (
      (leadership.key_responsibilities && leadership.key_responsibilities.length > 0) ||
      (leadership.achievements && leadership.achievements.length > 0) ||
      leadership.challenges_overcome ||
      leadership.impact ||
      (leadership.recognition_received && leadership.recognition_received.length > 0) ||
      (leadership.training_provided && leadership.training_provided.length > 0) ||
      leadership.organization_type ||
      leadership.team_size ||
      leadership.budget_managed ||
      leadership.volunteer_hours ||
      leadership.initiative_type ||
      leadership.mentees_count
    );
  };

  const canFlip = hasBackContent();

  // Card flip handler
  const handleCardClick = (e) => {
    // Don't flip if clicking on specific elements or if no back content
    if (!canFlip || 
        e.target.closest('.flip-icon-btn') ||
        e.target.closest('.featured-badge') ||
        e.target.closest('.status-badge')) {
      return;
    }
    
    console.log('🔄 Card flip triggered for:', leadership?.title);
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
      aria-label={`Leadership position card: ${leadership.title} at ${leadership.organization}. ${canFlip ? 'Press Enter or Space to flip and see details.' : 'No additional details available.'}`}
      aria-pressed={isFlipped}
    >
      <div className="project-card-3d">
        
        {/* =================== FRONT SIDE =================== */}
        <div className="card-side card-front">
          
          {/* Header with Organization Initials and Flip Icon */}
          <div className="card-header">
            <div className="organization-initials-section">
              <div className="organization-initials organization-initials-large">
                {generateOrganizationInitials(leadership.organization)}
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

          {/* Position Title */}
          <div className="title-section">
            <h3 className="position-title">{leadership.title?.toUpperCase()}</h3>
            <div className="title-underline"></div>
          </div>

          {/* Organization */}
          <div className="organization-section">
            <h4 className="organization-name">{leadership.organization}</h4>
          </div>

          {/* Location */}
          {leadership.location && (
            <div className="location-section">
              <div className="location-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="location-icon">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span>{leadership.location}</span>
              </div>
            </div>
          )}

          {/* Description with scrollable frame */}
          {leadership.description && (
            <div className="description-section">
              <div className="description-container">
                <div className="description-header">
                  <span className="description-icon">📝</span>
                  <span className="description-title">Description</span>
                </div>
                <div className="description-text-wrapper">
                  <p className="description-text">{leadership.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Duration */}
          <div className="duration-section">
            <div className="duration-header">
              <span className="duration-icon">📅</span>
              <span className="duration-title">Duration</span>
            </div>
            <p className="duration-text">{formatDuration()}</p>
          </div>

          {/* Status Badge */}
          <div className="status-section">
            <div className={`status-badge ${leadership.is_current ? 'active' : 'inactive'}`}>
              <span className="status-icon">
                {leadership.is_current ? '🟢' : '🔴'}
              </span>
              <span className="status-text">
                {leadership.is_current ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>

          {/* Featured Badge */}
          {leadership.is_featured && (
            <div className="featured-section">
              <div className="featured-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" className="star-icon">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span>Featured Position</span>
              </div>
            </div>
          )}

          {/* Skills Preview - First 5 skills */}
          {leadership.skills_developed && leadership.skills_developed.length > 0 && (
            <div className="skills-preview-section">
              <div className="skills-header">
                <span className="skills-icon">🎯</span>
                <span className="skills-title">Skills Developed</span>
              </div>
              <div className="skills-preview-container">
                {leadership.skills_developed.slice(0, 5).map((skill, index) => (
                  <span key={index} className="skill-tag-preview">
                    {skill}
                  </span>
                ))}
                {leadership.skills_developed.length > 5 && (
                  <span className="skill-tag-more">
                    +{leadership.skills_developed.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Card Footer */}
          <div className="card-footer">
            {canFlip ? (
              <div className="flip-hint">
                <span className="hint-text">Tap for details</span>
                <span className="hint-arrow">→</span>
              </div>
            ) : (
              <div className="no-flip-hint">
                <span className="hint-text">Position overview</span>
              </div>
            )}
          </div>
        </div>

        {/* =================== BACK SIDE =================== */}
        <div className="card-side card-back">
          
          {/* Back Header */}
          <div className="back-header">
            <h3 className="back-title">{leadership.title}</h3>
            <div className="back-subtitle">{leadership.organization}</div>
          </div>

          {/* Scrollable Content Area */}
          <div className="back-content">
            
            {/* Key Responsibilities */}
            {leadership.key_responsibilities && leadership.key_responsibilities.length > 0 && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">💼</span>
                  <span className="detail-title">Key Responsibilities</span>
                </div>
                <ul className="detail-list">
                  {leadership.key_responsibilities.map((responsibility, index) => (
                    <li key={index} className="detail-item">{responsibility}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Achievements */}
            {leadership.achievements && leadership.achievements.length > 0 && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">🏆</span>
                  <span className="detail-title">Achievements</span>
                </div>
                <ul className="detail-list">
                  {leadership.achievements.map((achievement, index) => (
                    <li key={index} className="detail-item">{achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Challenges Overcome */}
            {leadership.challenges_overcome && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">⚡</span>
                  <span className="detail-title">Challenges Overcome</span>
                </div>
                <p className="detail-text">{leadership.challenges_overcome}</p>
              </div>
            )}

            {/* Impact */}
            {leadership.impact && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">💫</span>
                  <span className="detail-title">Impact</span>
                </div>
                <p className="detail-text">{leadership.impact}</p>
              </div>
            )}

            {/* Recognition Received */}
            {leadership.recognition_received && leadership.recognition_received.length > 0 && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">🎖️</span>
                  <span className="detail-title">Recognition Received</span>
                </div>
                <ul className="detail-list">
                  {leadership.recognition_received.map((recognition, index) => (
                    <li key={index} className="detail-item">{recognition}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Training Provided */}
            {leadership.training_provided && leadership.training_provided.length > 0 && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">📚</span>
                  <span className="detail-title">Training Provided</span>
                </div>
                <ul className="detail-list">
                  {leadership.training_provided.map((training, index) => (
                    <li key={index} className="detail-item">{training}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* All Skills Developed */}
            {leadership.skills_developed && leadership.skills_developed.length > 0 && (
              <div className="detail-section">
                <div className="detail-header">
                  <span className="detail-icon">🎯</span>
                  <span className="detail-title">All Skills Developed</span>
                </div>
                <div className="skills-all-container">
                  {leadership.skills_developed.map((skill, index) => (
                    <span key={index} className="skill-tag-back">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Outside Frame - Separate Display */}
          <div className="back-metadata">
            <div className="metadata-grid">
              
              {/* Organization Type */}
              {leadership.organization_type && (
                <div className="metadata-item">
                  <span className="metadata-label">Type</span>
                  <span className="metadata-value">{leadership.organization_type}</span>
                </div>
              )}

              {/* Team Size */}
              {leadership.team_size && (
                <div className="metadata-item">
                  <span className="metadata-label">Team Size</span>
                  <span className="metadata-value">{leadership.team_size}</span>
                </div>
              )}

              {/* Budget Managed */}
              {leadership.budget_managed && (
                <div className="metadata-item">
                  <span className="metadata-label">Budget</span>
                  <span className="metadata-value">{leadership.budget_managed}</span>
                </div>
              )}

              {/* Volunteer Hours */}
              {leadership.volunteer_hours && (
                <div className="metadata-item">
                  <span className="metadata-label">Vol. Hours</span>
                  <span className="metadata-value">{leadership.volunteer_hours}</span>
                </div>
              )}

              {/* Initiative Type */}
              {leadership.initiative_type && (
                <div className="metadata-item">
                  <span className="metadata-label">Initiative</span>
                  <span className="metadata-value">{leadership.initiative_type}</span>
                </div>
              )}

              {/* Mentees Count */}
              {leadership.mentees_count && (
                <div className="metadata-item">
                  <span className="metadata-label">Mentees</span>
                  <span className="metadata-value">{leadership.mentees_count}</span>
                </div>
              )}
            </div>
          </div>

          {/* Back Footer */}
          <div className="card-footer">
            <div className="flip-hint">
              <span className="hint-arrow">←</span>
              <span className="hint-text">Back to overview</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadershipCard;