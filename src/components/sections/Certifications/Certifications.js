// =====================================================
// Certifications.js - Complete Frontend Implementation
// Yellow/Gold Theme with Certifications Grid and Badges Carousel
// =====================================================

import React, { useState, useEffect, useRef } from 'react';
import CertificationCard from './CertificationCard';
import CertificateModal from './CertificateModal';
import CertificationDetailsModal from './CertificationDetailsModal';
import { getCertifications } from '../../../services/dataService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './Certifications.css';

const Certifications = () => {
  // State management
  const [certificationsData, setCertificationsData] = useState([]);
  const [badgesData, setBadgesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Refs for badges carousel
  const badgesCarouselRef = useRef(null);

  // Fetch certifications data from API
  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        console.log('🏆 Fetching certifications data...');
        setLoading(true);
        setError(null);
        
        const response = await getCertifications();
        
        if (response.success) {
          console.log('✅ Certifications fetched successfully:', response.data?.length || 0, 'entries');
          
          // Sort certifications: featured first, then by order_index, then by issue_date
          const sortedCertifications = response.data.sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            if (a.order_index !== b.order_index) {
              return (a.order_index || 999) - (b.order_index || 999);
            }
            if (a.issue_date && b.issue_date) {
              return new Date(b.issue_date) - new Date(a.issue_date);
            }
            return 0;
          });
          
          setCertificationsData(sortedCertifications || []);
          
          // Filter badges data - only entries with valid badge images from our Supabase bucket
          const validBadges = sortedCertifications.filter(cert => 
            cert.badge_image_url && 
            cert.badge_image_url.trim() !== '' &&
            cert.badge_image_url.startsWith('https://emaaaeooafqawdvdreaz.supabase.co/storage/') &&
            cert.badge_image_url.includes('certification-badges')
          );
          setBadgesData(validBadges);
          
          console.log('🏅 Valid badges found:', validBadges.length);
        } else {
          console.error('❌ Failed to fetch certifications:', response.error);
          setError(response.error);
          setCertificationsData([]);
          setBadgesData([]);
        }
      } catch (error) {
        console.error('❌ Certifications fetch error:', error);
        setError(error.message);
        setCertificationsData([]);
        setBadgesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle View Certificate button click
  const handleViewCertificate = (certification) => {
    console.log('📄 Opening certificate modal for:', certification.title);
    setSelectedCertificate(certification);
    setIsCertificateModalOpen(true);
    
    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  // Handle View Details button click
  const handleViewDetails = (certification) => {
    console.log('🔍 Opening details modal for:', certification.title);
    setSelectedCertificate(certification);
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
    setSelectedCertificate(null);
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

  // Badges carousel scroll function
  const scrollBadgesCarousel = (direction) => {
    const carousel = badgesCarouselRef.current;
    if (!carousel) return;

    const track = carousel.querySelector('.badges-track');
    if (!track) return;

    const cardWidth = 200; // Approximate card width + gap
    const scrollAmount = cardWidth * 2; // Scroll 2 cards at a time

    if (direction === 'left') {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Setup touch swipe for badges carousel
  useEffect(() => {
    const carousel = badgesCarouselRef.current;
    if (!carousel || badgesData.length === 0) return;

    const track = carousel.querySelector('.badges-track');
    if (!track) return;

    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    const handleTouchStart = (e) => {
      isDown = true;
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    };

    const handleTouchMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    };

    const handleTouchEnd = () => {
      isDown = false;
      track.style.cursor = 'grab';
    };

    // Mouse events for desktop
    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 2;
      track.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      isDown = false;
      track.style.cursor = 'grab';
    };

    const handleMouseLeave = () => {
      isDown = false;
      track.style.cursor = 'grab';
    };

    // Add event listeners
    track.addEventListener('touchstart', handleTouchStart, { passive: false });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    track.addEventListener('touchend', handleTouchEnd);
    track.addEventListener('mousedown', handleMouseDown);
    track.addEventListener('mousemove', handleMouseMove);
    track.addEventListener('mouseup', handleMouseUp);
    track.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      track.removeEventListener('touchstart', handleTouchStart);
      track.removeEventListener('touchmove', handleTouchMove);
      track.removeEventListener('touchend', handleTouchEnd);
      track.removeEventListener('mousedown', handleMouseDown);
      track.removeEventListener('mousemove', handleMouseMove);
      track.removeEventListener('mouseup', handleMouseUp);
      track.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [badgesData]);

  // Show loading spinner
  if (loading) {
    return (
      <section className="certifications-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading certifications..." />
        </div>
      </section>
    );
  }

  return (
    <section className="certifications-section section">
      <div className="container">
        {/* Main Header */}
        <div className="section-header">
          <h1 className="neon-title">Certifications & Badges</h1>
          <p className="neon-subtitle">Validating expertise through recognized achievements</p>
        </div>

        <div className="certifications-content">
          {error ? (
            // Error state
            <div className="no-content-message glass-card">
              <div className="no-content-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="no-content-title">Error Loading Certifications</h3>
              <p className="no-content-text">
                {error || 'Something went wrong while loading certifications. Please try again later.'}
              </p>
              <div className="no-content-decoration">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          ) : (
            <>
              {/* CERTIFICATIONS SECTION */}
              <div className="certifications-main-section">
                <h2 className="category-heading">
                  <span className="category-pipe">|</span>
                  <span className="category-text">Certifications</span>
                </h2>
                
                {certificationsData.length === 0 ? (
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
                    {certificationsData.map((certification, index) => (
                      <CertificationCard 
                        key={certification.id || index} 
                        certification={certification} 
                        onViewCertificate={() => handleViewCertificate(certification)}
                        onViewDetails={() => handleViewDetails(certification)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* BADGES SECTION */}
              {badgesData.length > 0 && (
                <div className="badges-section">
                  <h2 className="category-heading">
                    <span className="category-pipe">|</span>
                    <span className="category-text">Badges</span>
                  </h2>
                  
                  <div className="badges-carousel-wrapper">
                    <div className="badges-carousel" ref={badgesCarouselRef}>
                      <div className="badges-track">
                        {badgesData.map((badge, index) => (
                          <div key={badge.id || index} className="badge-card">
                            <div className="badge-image-container">
                              <img 
                                src={badge.badge_image_url}
                                alt={`${badge.title} badge`}
                                className="badge-image"
                                onError={(e) => {
                                  console.warn('Failed to load badge image:', badge.badge_image_url);
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Carousel Navigation - Always visible when badges exist */}
                    {badgesData.length > 0 && (
                      <div className="carousel-navigation">
                        <button 
                          className="carousel-btn carousel-btn-prev"
                          onClick={() => scrollBadgesCarousel('left')}
                          aria-label="Previous badges"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                        <button 
                          className="carousel-btn carousel-btn-next"
                          onClick={() => scrollBadgesCarousel('right')}
                          aria-label="Next badges"
                        >
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {isCertificateModalOpen && selectedCertificate && (
        <CertificateModal 
          certification={selectedCertificate} 
          onClose={handleModalClose}
        />
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedCertificate && (
        <CertificationDetailsModal 
          certification={selectedCertificate} 
          onClose={handleModalClose}
        />
      )}
    </section>
  );
};

export default Certifications;