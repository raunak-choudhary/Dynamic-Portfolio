// src/components/admin/AdminSignOut/AdminSignOut.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSignOut.css';

const AdminSignOut = () => {
  const navigate = useNavigate();
  
  // Animation states
  const [currentLanguageIndex, setCurrentLanguageIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [animationPhase, setAnimationPhase] = useState('typing'); // typing -> floating -> complete
  const [showFloatingElements, setShowFloatingElements] = useState(false);

  // Multi-language farewell messages
  const farewellMessages = [
    {
      language: 'Hindi',
      message: 'अलविदा! धन्यवाद!',
      code: 'HI',
      color: '#ff6b35',
      flag: '🇮🇳'
    },
    {
      language: 'Spanish', 
      message: '¡Adiós! ¡Gracias!',
      code: 'ES',
      color: '#e74c3c',
      flag: '🇪🇸'
    },
    {
      language: 'French',
      message: 'Au revoir! Merci!',
      code: 'FR', 
      color: '#3498db',
      flag: '🇫🇷'
    },
    {
      language: 'German',
      message: 'Auf Wiedersehen! Danke!',
      code: 'DE',
      color: '#f39c12',
      flag: '🇩🇪'
    },
    {
      language: 'Japanese',
      message: 'さようなら！ありがとう！',
      code: 'JA',
      color: '#e91e63',
      flag: '🇯🇵'
    },
    {
      language: 'Arabic',
      message: 'وداعا! شكرا لك!',
      code: 'AR',
      color: '#9c27b0',
      flag: '🇸🇦'
    },
    {
      language: 'English',
      message: 'Bye!! Thank You.',
      code: 'EN',
      color: '#00ff88',
      flag: '🇺🇸'
    }
  ];

  const currentMessage = farewellMessages[currentLanguageIndex];

  // Typewriter effect for current language
  useEffect(() => {
    if (animationPhase === 'typing') {
      let currentIndex = 0;
      const message = currentMessage.message;
      
      const typeInterval = setInterval(() => {
        if (currentIndex <= message.length) {
          setTypedText(message.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          
          // Wait 1.5 seconds after typing completes
          setTimeout(() => {
            if (currentLanguageIndex < farewellMessages.length - 1) {
              // Move to next language
              setCurrentLanguageIndex(prev => prev + 1);
              setTypedText('');
            } else {
              // All languages complete - start floating animation
              setAnimationPhase('floating');
              setShowFloatingElements(true);
              
              // After 3 seconds of floating, redirect
              setTimeout(() => {
                setAnimationPhase('complete');
                navigate('/adminlogin');
              }, 3000);
            }
          }, 1500);
        }
      }, 120); // 120ms per character

      return () => clearInterval(typeInterval);
    }
  }, [currentLanguageIndex, animationPhase, currentMessage.message, navigate]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="admin-signout">
      {/* Animated Background */}
      <div className="signout-background">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="signout-grid"></div>
        
        {/* Floating Elements (appear in final phase) */}
        {showFloatingElements && (
          <div className="floating-elements">
            <div className="floating-heart">❤️</div>
            <div className="floating-star">⭐</div>
            <div className="floating-wave">👋</div>
            <div className="floating-sparkle">✨</div>
            <div className="floating-smile">😊</div>
            <div className="floating-rocket">🚀</div>
          </div>
        )}
      </div>

      <div className="signout-container">
        {/* Header */}
        <div className="signout-header">
          <div className="signout-logo">
            <img src="/logo.png" alt="RC Portfolio" className="logo-image" />
            <h1 className="signout-title">
              <span className="title-text">RC Portfolio</span>
              <span className="title-admin">Admin</span>
            </h1>
          </div>
        </div>

        {/* Main Farewell Content */}
        <div className="farewell-section">
          {/* Language Progress Indicator */}
          <div className="language-progress">
            <div className="progress-text">
              {animationPhase === 'typing' ? (
                <>
                  <span className="current-language">{currentMessage.language}</span>
                  <span className="language-code">({currentMessage.code})</span>
                </>
              ) : (
                <span className="all-complete">All Languages Complete!</span>
              )}
            </div>
            <div className="progress-dots">
              {farewellMessages.map((_, index) => (
                <div 
                  key={index}
                  className={`progress-dot ${index <= currentLanguageIndex ? 'completed' : ''}`}
                  style={{
                    '--dot-color': farewellMessages[index].color
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Main Message Display */}
          <div className="message-display">
            <div className="language-flag">
              <span className="flag-emoji">{currentMessage.flag}</span>
            </div>
            
            <div className="message-container">
              <div 
                className="typed-message"
                style={{
                  '--message-color': currentMessage.color
                }}
              >
                {typedText}
                <span className={`cursor ${showCursor ? 'visible' : 'hidden'}`}>|</span>
              </div>
              
              <div className="message-language">
                {currentMessage.language}
              </div>
            </div>
          </div>

          {/* Creative Animation Elements */}
          <div className="creative-elements">
            {/* Animated Thank You Cards */}
            <div className="thank-you-cards">
              {farewellMessages.slice(0, currentLanguageIndex + 1).map((msg, index) => (
                <div 
                  key={index}
                  className="thank-you-card"
                  style={{
                    '--card-delay': `${index * 0.2}s`,
                    '--card-color': msg.color
                  }}
                >
                  <span className="card-flag">{msg.flag}</span>
                  <span className="card-message">{msg.message}</span>
                </div>
              ))}
            </div>

            {/* Ripple Effect */}
            <div className="ripple-container">
              <div className="ripple ripple-1"></div>
              <div className="ripple ripple-2"></div>
              <div className="ripple ripple-3"></div>
            </div>

            {/* Particle Trail */}
            <div className="particle-trail">
              <div className="trail-particle particle-1"></div>
              <div className="trail-particle particle-2"></div>
              <div className="trail-particle particle-3"></div>
              <div className="trail-particle particle-4"></div>
              <div className="trail-particle particle-5"></div>
            </div>
          </div>

          {/* Final Phase Message */}
          {animationPhase === 'floating' && (
            <div className="final-message animate-fade-in">
              <h2 className="final-title">
                <span className="sparkle">✨</span>
                Session Ended Successfully
                <span className="sparkle">✨</span>
              </h2>
              <p className="final-subtitle">
                Redirecting you back to login...
              </p>
              <div className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="signout-footer">
          <p className="security-note">
            🔒 Session securely terminated
          </p>
          <p className="redirect-info">
            Automatic redirect in {animationPhase === 'floating' ? '3' : '...'} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignOut;