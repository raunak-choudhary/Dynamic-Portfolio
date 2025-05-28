// =====================================================
// AchievementCertificateModal.js - Certificate Viewer Modal
// Blue Theme with PDF/Image Viewer and Download
// =====================================================

import React, { useEffect, useRef, useState } from 'react';

const AchievementCertificateModal = ({ achievement, onClose }) => {
  console.log('📄 Rendering AchievementCertificateModal for:', achievement?.title);

  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fileType, setFileType] = useState('unknown');

  // Determine file type from URL
  useEffect(() => {
    if (achievement?.certificate_url) {
      const url = achievement.certificate_url.toLowerCase();
      if (url.includes('.pdf')) {
        setFileType('pdf');
      } else if (url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
        setFileType('image');
      } else {
        setFileType('unknown');
      }
    }
  }, [achievement]);

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

  // Handle download
  const handleDownload = () => {
    console.log('📥 Downloading achievement certificate:', achievement.certificate_url);
    
    // Extract filename from URL or create one
    const urlParts = achievement.certificate_url.split('/');
    const filename = urlParts[urlParts.length - 1] || 
      `${achievement.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.${fileType === 'pdf' ? 'pdf' : 'jpg'}`;
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = achievement.certificate_url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Add haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  // Handle content load
  const handleContentLoad = () => {
    setIsLoading(false);
    setLoadError(false);
  };

  // Handle content error
  const handleContentError = () => {
    console.error('Failed to load achievement certificate content:', achievement.certificate_url);
    setIsLoading(false);
    setLoadError(true);
  };

  // Handle print
  const handlePrint = () => {
    if (fileType === 'pdf') {
      // For PDF, open in new window for printing
      window.open(achievement.certificate_url, '_blank');
    } else if (fileType === 'image') {
      // For images, open in new window for printing
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Achievement Certificate - ${achievement.title}</title>
            <style>
              body { margin: 0; padding: 20px; text-align: center; }
              img { max-width: 100%; height: auto; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <img src="${achievement.certificate_url}" alt="${achievement.title}" />
            <script>window.onload = () => window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!achievement?.certificate_url) {
    return null;
  }

  return (
    <div 
      className="achievement-certificate-modal-overlay" 
      ref={modalRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievement-certificate-modal-title"
    >
      <div className="achievement-certificate-modal">
        {/* Modal Header */}
        <div className="achievement-certificate-modal-header">
          <div className="achievement-certificate-header-content">
            <h2 id="achievement-certificate-modal-title" className="achievement-certificate-modal-title">
              {achievement.title}
            </h2>
            <div className="achievement-certificate-meta">
              {(achievement.issuing_organization || achievement.competition_name) && (
                <span className="achievement-certificate-issuer">
                  {achievement.issuing_organization || achievement.competition_name}
                </span>
              )}
              {achievement.formatted_date && (
                <span className="achievement-certificate-date">
                  {achievement.formatted_date}
                </span>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button 
            className="achievement-certificate-modal-close"
            onClick={onClose}
            aria-label="Close certificate viewer"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Modal Content - Certificate Viewer */}
        <div className="achievement-certificate-modal-content">
          {isLoading && (
            <div className="achievement-certificate-loading">
              <div className="loading-achievement-spinner">
                <div className="spinner-achievement-ring">
                  <div className="spinner-achievement-ring-inner"></div>
                </div>
              </div>
              <p className="loading-achievement-message">Loading certificate...</p>
            </div>
          )}

          {loadError && (
            <div className="achievement-certificate-error">
              <div className="error-achievement-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="error-achievement-title">Failed to Load Certificate</h3>
              <p className="error-achievement-message">
                The certificate file could not be displayed. You can still download it using the button below.
              </p>
              <button className="retry-achievement-btn" onClick={() => {
                setLoadError(false);
                setIsLoading(true);
              }}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Retry</span>
              </button>
            </div>
          )}

          {!loadError && (
            <div className="achievement-certificate-viewer">
              {fileType === 'pdf' ? (
                <iframe
                  src={achievement.certificate_url}
                  className="achievement-certificate-pdf-viewer"
                  title={`Achievement Certificate: ${achievement.title}`}
                  onLoad={handleContentLoad}
                  onError={handleContentError}
                />
              ) : fileType === 'image' ? (
                <img
                  src={achievement.certificate_url}
                  alt={`Achievement Certificate: ${achievement.title}`}
                  className="achievement-certificate-image-viewer"
                  onLoad={handleContentLoad}
                  onError={handleContentError}
                />
              ) : (
                <div className="unsupported-achievement-format">
                  <div className="unsupported-achievement-icon">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2"/>
                      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 11v6M12 11V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="unsupported-achievement-title">Preview Not Available</h3>
                  <p className="unsupported-achievement-message">
                    This file format cannot be previewed in the browser. You can download it to view the certificate.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer - Action Buttons */}
        <div className="achievement-certificate-modal-footer">
          <div className="achievement-certificate-actions">
            {/* Download Button */}
            <button 
              className="achievement-action-btn download-achievement-btn primary"
              onClick={handleDownload}
              aria-label="Download achievement certificate"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Download</span>
            </button>

            {/* Print Button */}
            <button 
              className="achievement-action-btn print-achievement-btn secondary"
              onClick={handlePrint}
              aria-label="Print achievement certificate"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <polyline points="6,9 6,2 18,2 18,9" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" stroke="currentColor" strokeWidth="2"/>
                <rect x="6" y="14" width="12" height="8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Print</span>
            </button>

            {/* Open in New Tab Button */}
            <button 
              className="achievement-action-btn external-achievement-btn secondary"
              onClick={() => window.open(achievement.certificate_url, '_blank')}
              aria-label="Open achievement certificate in new tab"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Open External</span>
            </button>

            {/* Close Button */}
            <button 
              className="achievement-action-btn close-achievement-btn tertiary"
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

export default AchievementCertificateModal;