// src/components/common/Header.js

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', section: 'hero' },
    { name: 'About', path: '/#about', section: 'about' },
    { name: 'Explore Portfolio', path: '/#navigation', section: 'navigation' },
    { name: 'Contact Me', path: '/#contact', section: 'contact' }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    if (path === '/') {
      // Home is active only when on root path with no hash
      return location.pathname === '/' && !location.hash;
    }
    
    if (path.includes('#')) {
      // For hash-based navigation (About, Explore Portfolio, Contact Me)
      const targetHash = path.split('#')[1];
      return location.hash === `#${targetHash}`;
    }
    
    // For regular routes
    return location.pathname === path;
  };

  const handleNavClick = (item) => {
    closeMenu();
    
    if (item.path === '/') {
      // Navigate to home and scroll to top
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (item.path.includes('#')) {
      const sectionId = item.section;
      
      if (location.pathname === '/') {
        // Already on landing page, just scroll to section
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          // Update URL hash using navigate to trigger location change
          navigate(`/#${sectionId}`);
        }
      } else {
        // Navigate to landing page then scroll to section
        navigate(`/#${sectionId}`);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 300);
      }
    }
  };

  return (
    <header className="header glass-header">
      <div className="header-container container">
        {/* Logo and Brand */}
        <div className="header-brand">
          <button onClick={() => handleNavClick(navItems[0])} className="brand-link">
            <img 
              src="/logo.png" 
              alt="RC Portfolio Logo" 
              className="brand-logo"
              onError={(e) => {
                e.target.style.display = 'none';
                console.error('Logo failed to load - make sure logo.png is in public folder');
              }}
            />
            <span className="brand-text shimmer-text">RC Portfolio</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Theme Toggle and Mobile Menu Button */}
        <div className="header-actions">
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button
            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle mobile menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`header-nav mobile-nav ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="nav-item">
                <button
                  onClick={() => handleNavClick(item)}
                  className={`nav-link ${isActivePath(item.path) ? 'active' : ''}`}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="mobile-menu-overlay" onClick={closeMenu}></div>
        )}
      </div>
    </header>
  );
};

export default Header;