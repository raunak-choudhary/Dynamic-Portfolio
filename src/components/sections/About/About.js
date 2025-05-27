import React, { useState, useEffect } from 'react';
import { portfolioData } from '../../../data/portfolioData';
import { getAboutData } from '../../../services/dataService';
import LoadingSpinner from '../../common/LoadingSpinner';
import './About.css';

const About = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [aboutData, setAboutData] = useState(portfolioData.about); // Start with static data
  const [loading, setLoading] = useState(true);

  // Fetch about data on component mount
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await getAboutData();
        
        if (response.success && response.data) {
          const apiData = response.data;
          
          // Smart data mapping - preserve your current structure
          const mappedData = {
            aboutMe: {
              title: apiData.about_me_title || apiData.aboutMe?.title || portfolioData.about.aboutMe.title,
              content: apiData.about_me_content || apiData.aboutMe?.content || portfolioData.about.aboutMe.content
            },
            basicInfo: {
              title: apiData.basic_info_title || apiData.basicInfo?.title || portfolioData.about.basicInfo.title,
              details: (apiData.basic_info && typeof apiData.basic_info === 'object') 
                ? apiData.basic_info 
                : (apiData.basicInfo?.details || portfolioData.about.basicInfo.details)
            },
            // Support for multiple profile images
            profileImages: {
              aboutMe: apiData.profile_image_about || null, // About Me tab image
              basicInfo: apiData.profile_image_info || null // Basic Info tab image
            }
          };
          
          setAboutData(mappedData);
        }
      } catch (error) {
        console.error('About API error:', error);
        // Keep using static data on error
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  const tabs = [
    { id: 'about', label: 'About Me', content: aboutData.aboutMe },
    { id: 'info', label: 'Basic Info', content: aboutData.basicInfo }
  ];

  // Smart profile image selection with multiple image support
  const getProfileImageSrc = () => {
    // Check if we have API images for different tabs
    if (aboutData.profileImages) {
      const apiImage = activeTab === 'about' 
        ? aboutData.profileImages.aboutMe 
        : aboutData.profileImages.basicInfo;
      
      if (apiImage) {
        return apiImage;
      }
    }
    
    // Fallback to your original tab-based image logic
    return activeTab === 'about' ? '/profile_pic_1.jpg' : '/profile_pic_2.jpg';
  };

  // Show loading only initially, not affecting layout
  if (loading) {
    return (
      <section id="about" className="about-section section">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <LoadingSpinner size="large" message="Loading..." />
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="about-section section">
      <div className="container">
        {/* Tab Navigation - Centered at top */}
        <div className="about-tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="about-content">
          {/* Left Side: Tab Content */}
          <div className="about-text">
            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'about' && (
                <div className="tab-panel animate-fade-in">
                  <h3 className="tab-title">{aboutData.aboutMe.title}</h3>
                  <div className="about-text-content">
                    {aboutData.aboutMe.content.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="about-paragraph">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="tab-panel animate-fade-in">
                  <h3 className="tab-title">{aboutData.basicInfo.title}</h3>
                  <div className="basic-info-grid">
                    {Object.entries(aboutData.basicInfo.details).map(([key, value]) => (
                      <div key={key} className="info-item glass-card">
                        <div className="info-label">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </div>
                        <div className="info-value">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Profile Picture - Absolute positioned */}
          <div className="about-image">
            <div className="profile-picture-container">
              <div className="profile-picture profile-neon">
                <img 
                  src={getProfileImageSrc()}
                  alt="Raunak Choudhary" 
                  className="profile-img"
                  onError={(e) => {
                    // Enhanced fallback logic for multiple images
                    if (e.target.src.includes('profile_pic_1.jpg')) {
                      e.target.src = '/profile_pic_2.jpg';
                    } else if (e.target.src.includes('profile_pic_2.jpg')) {
                      e.target.src = '/logo.png';
                    } else if (e.target.src.includes('/storage/')) {
                      // If Supabase image fails, fall back to local images
                      e.target.src = activeTab === 'about' ? '/profile_pic_1.jpg' : '/profile_pic_2.jpg';
                    } else {
                      e.target.src = '/logo.png';
                    }
                  }}
                />
              </div>
              
              {/* Background Glow Effect */}
              <div className="profile-background-glow"></div>
              
              {/* Floating Elements */}
              <div className="profile-floating-elements">
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
                <div className="floating-particle"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;