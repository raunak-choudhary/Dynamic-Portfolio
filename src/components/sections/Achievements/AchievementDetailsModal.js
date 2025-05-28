// =====================================================
// AchievementDetailsModal.js - Achievement Details Modal
// Blue Theme with Complete Information Display
// =====================================================

import React, { useEffect, useRef } from 'react';

const AchievementDetailsModal = ({ achievement, onClose }) => {
  console.log('🔍 Rendering AchievementDetailsModal for:', achievement?.title);

  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Handle click outside modal to close
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap for accessibility
  useEffect(() => {
    const modal = modalRef.current;
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      const handleTabKey = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      modal.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => modal.removeEventListener('keydown', handleTabKey);
    }
  }, []);

  // Check if content is scrollable
  const isContentScrollable = () => {
    if (contentRef.current) {
      return contentRef.current.scrollHeight > contentRef.current.clientHeight;
    }
    return false;
  };

  // Format verification URL for display
  const formatVerificationUrl = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.length > 50 ? url.substring(0, 47) + '...' : url;
    }
  };

  // Determine organization display - either issuing_organization or competition_name
  const getOrganizationInfo = () => {
    if (achievement.issuing_organization && achievement.issuing_organization.trim()) {
      return {
        label: 'Issuing Organization',
        value: achievement.issuing_organization,
        icon: '🏢'
      };
    } else if (achievement.competition_name && achievement.competition_name.trim()) {
      return {
        label: 'Competition',
        value: achievement.competition_name,
        icon: '🏆'
      };
    }
    return null;
  };

  if (!achievement) return null;

  const organizationInfo = getOrganizationInfo();

  return (
    <div 
      className="achievement-details-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-details-modal-title"
      aria-describedby="achievement-details-modal-description"
    >
      <div className="achievement-details-modal">
        {/* Modal Header */}
        <div className="achievement-details-modal-header">
          <div className="achievement-details-header-content">
            <h2 id="achievement-details-modal-title" className="achievement-details-modal-title">
              {achievement.title}
            </h2>
            {organizationInfo && (
              <div className="achievement-organization-name">
                {organizationInfo.value}
              </div>
            )}
          </div>

          {/* Close Button */}
          <button 
            className="achievement-details-modal-close"
            onClick={onClose}
            aria-label="Close achievement details"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div 
          className={`achievement-details-modal-content ${isContentScrollable() ? 'scrollable' : ''}`}
          ref={contentRef}
          id="achievement-details-modal-description"
        >
          
          {/* Achievement Date Section */}
          {achievement.formatted_date && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-high">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">📅</span>
                  <span className="achievement-detail-title">Achievement Date</span>
                </div>
                <div className="achievement-date-display">
                  <span className="achievement-date-value">
                    {achievement.formatted_date}
                  </span>
                  {achievement.days_since_achievement !== null && achievement.days_since_achievement >= 0 && (
                    <span className="achievement-time-since">
                      {achievement.days_since_achievement === 0 ? 'Today' : 
                       achievement.days_since_achievement === 1 ? '1 day ago' :
                       `${achievement.days_since_achievement} days ago`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Organization/Competition Section */}
          {organizationInfo && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-high">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">{organizationInfo.icon}</span>
                  <span className="achievement-detail-title">{organizationInfo.label}</span>
                </div>
                <p className="achievement-organization-description">
                  {organizationInfo.value}
                </p>
              </div>
            </div>
          )}

          {/* Description Section */}
          {achievement.description && achievement.description.trim() && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-medium">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">📝</span>
                  <span className="achievement-detail-title">Description</span>
                </div>
                <p className="achievement-description-text">
                  {achievement.description}
                </p>
              </div>
            </div>
          )}

          {/* Category Section */}
          {achievement.category && achievement.category.trim() && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-medium">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">🏷️</span>
                  <span className="achievement-detail-title">Category</span>
                </div>
                <div className="achievement-category-tag">
                  {achievement.category}
                </div>
              </div>
            </div>
          )}

          {/* Position & Participants Section */}
          {(achievement.position || achievement.participants_count) && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-medium">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">🥇</span>
                  <span className="achievement-detail-title">Competition Details</span>
                </div>
                <div className="achievement-competition-grid">
                  {achievement.position && (
                    <div className="achievement-competition-item">
                      <span className="achievement-competition-label">Position:</span>
                      <span className="achievement-competition-value position-highlight">
                        {achievement.position}
                      </span>
                    </div>
                  )}
                  {achievement.participants_count && (
                    <div className="achievement-competition-item">
                      <span className="achievement-competition-label">Participants:</span>
                      <span className="achievement-competition-value">
                        {achievement.participants_count.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Impact Section */}
          {achievement.impact && achievement.impact.trim() && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-medium">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">💡</span>
                  <span className="achievement-detail-title">Impact</span>
                </div>
                <p className="achievement-impact-text">
                  {achievement.impact}
                </p>
              </div>
            </div>
          )}

          {/* Verification URL Section */}
          {achievement.verification_url && achievement.verification_url.trim() && (
            <div className="achievement-details-section">
              <div className="achievement-details-card priority-low">
                <div className="achievement-detail-header">
                  <span className="achievement-detail-icon">🔗</span>
                  <span className="achievement-detail-title">Verification</span>
                </div>
                <div className="achievement-verification-info">
                  <a 
                    href={achievement.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="achievement-verification-link"
                    aria-label="Verify achievement details"
                  >
                    <span className="verification-link-text">{formatVerificationUrl(achievement.verification_url)}</span>
                    <svg viewBox="0 0 24 24" fill="none" className="external-achievement-link-icon">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="achievement-details-modal-footer">
          <div className="achievement-modal-actions">
            {/* View Certificate Button (if available) */}
            {achievement.certificate_url && (
              <button 
                className="achievement-action-btn view-achievement-certificate-btn primary"
                onClick={() => window.open(achievement.certificate_url, '_blank')}
                aria-label="View achievement certificate"
              >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <span>View Certificate</span>
              </button>
            )}

            {/* Close Button */}
            <button 
              className="achievement-action-btn close-achievement-btn secondary"
              onClick={onClose}
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementDetailsModal;