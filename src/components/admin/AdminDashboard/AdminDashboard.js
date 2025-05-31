// src/components/admin/AdminDashboard/AdminDashboard.js - DATA-SECTION ATTRIBUTE ADDED

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth'; // Assuming path is correct
import { getPortfolioStats } from '../../../services/dataService'; // Assuming path is correct
import LoadingSpinner from '../../common/LoadingSpinner'; // Assuming path is correct
import ThemeToggle from '../../common/ThemeToggle'; // Assuming path is correct
import logoImage from '../../../assets/images/logo.png'; // Assuming path is correct
import './AdminDashboard.css';

import HeroContentManager from './sections/HeroContentManager';

import AboutSectionManager from './sections/AboutSectionManager';
import ProjectsManager from './sections/ProjectsManager';
import InternshipsManager from './sections/InternshipsManager';
import EducationManager from './sections/EducationManager';

const AdminDashboard = () => {
  const { signOut } = useAuth();
  
  // Core dashboard state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showPreview, setShowPreview] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  // Navigation and state management
  const [sectionLoading, setSectionLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [sectionHistory, setSectionHistory] = useState(['dashboard']);

  // Enhanced Preview State
  const [previewMode, setPreviewMode] = useState('desktop');
  const [previewUrl, setPreviewUrl] = useState('/');

  // Dashboard sections configuration
  const dashboardSections = [
    { id: 'dashboard', name: 'Dashboard Overview', icon: '📊', color: 'cyan', shortcut: '1' },
    { id: 'hero', name: 'Hero Content', icon: '🚀', color: 'purple', shortcut: 'h' },
    { id: 'about', name: 'About Section', icon: '👤', color: 'pink', shortcut: 'a' },
    { id: 'projects', name: 'Projects', icon: '💻', color: 'blue', shortcut: '2' },
    { id: 'internships', name: 'Internships', icon: '🏢', color: 'green', shortcut: 'i' },
    { id: 'education', name: 'Education', icon: '🎓', color: 'orange', shortcut: 'e' },
    { id: 'work', name: 'Work Experience', icon: '💼', color: 'red', shortcut: 'w' },
    { id: 'skills', name: 'Skills', icon: '⚡', color: 'yellow', shortcut: 's' },
    { id: 'certifications', name: 'Certifications', icon: '🏆', color: 'indigo', shortcut: 'c' },
    { id: 'recommendations', name: 'Recommendations', icon: '⭐', color: 'teal', shortcut: 'r' },
    { id: 'achievements', name: 'Achievements', icon: '🥇', color: 'lime', shortcut: 'm' },
    { id: 'leadership', name: 'Leadership', icon: '👑', color: 'violet', shortcut: 'l' },
    { id: 'contact', name: 'Contact Messages', icon: '📧', color: 'rose', shortcut: '3' }
  ];

  // Section-specific state management (assuming this structure is intended)
  const [sectionStates, setSectionStates] = useState(() => {
    const initialStates = {};
    dashboardSections.forEach(section => {
      initialStates[section.id] = {
        loaded: section.id === 'dashboard',
        data: null, // Or some initial data structure
        hasChanges: false
      };
    });
    return initialStates;
  });

  // Load section data function (placeholder, adapt as needed)
  const loadSectionData = useCallback(async (sectionId) => {
    console.log(`Attempting to load data for section: ${sectionId}`);
    // Placeholder: Simulate API call or data fetching
    // await new Promise(resolve => setTimeout(resolve, 500)); 
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], loaded: true, data: { message: `Data for ${sectionId}` } }
    }));
    console.log(`Data loaded for section: ${sectionId}`);
  }, []);

  // Enhanced section change handler with URL management
  const handleSectionChange = useCallback(async (sectionId) => {
    if (hasUnsavedChanges) {
      // Replace window.confirm with a custom modal in a real app
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this section?'
      );
      if (!confirmed) return;
    }

    try {
      setSectionLoading(true);
      setActiveSection(sectionId); // Set active section immediately for UI feedback

      if (!sectionStates[sectionId]?.loaded && sectionId !== 'dashboard') {
        await loadSectionData(sectionId);
      }
      
      setHasUnsavedChanges(false); // Reset unsaved changes flag
      
      const newUrl = sectionId === 'dashboard' 
        ? '/admindashboard' 
        : `/admindashboard?section=${sectionId}`;
      window.history.pushState({ section: sectionId }, '', newUrl);
      
      setSectionHistory(prev => {
        const newHistory = prev.filter(s => s !== sectionId);
        return [sectionId, ...newHistory].slice(0, 10); // Keep last 10
      });
      
    } catch (error) {
      console.error('Error switching section:', error);
      // Add user-friendly error handling here
    } finally {
      setSectionLoading(false);
    }
  }, [hasUnsavedChanges, sectionStates, loadSectionData]);

  // Enhanced quick save handler
  const handleQuickSave = useCallback(() => {
    if (hasUnsavedChanges) {
      // Implement actual save logic here
      console.log('Changes saved for section:', activeSection);
      setHasUnsavedChanges(false);
      // Update sectionStates if needed
      setSectionStates(prev => ({
        ...prev,
        [activeSection]: { ...prev[activeSection], hasChanges: false }
      }));
    }
  }, [hasUnsavedChanges, activeSection]);

  // Enhanced auto-save handler
  const handleAutoSave = useCallback(() => {
    if (hasUnsavedChanges) {
      console.log('Auto-saved for section:', activeSection);
      // Implement actual auto-save logic here (could be same as handleQuickSave)
      handleQuickSave(); 
    }
  }, [hasUnsavedChanges, activeSection, handleQuickSave]);

  // Enhanced preview toggle
  const togglePreview = () => {
    setShowPreview(prevShowPreview => !prevShowPreview);
    if (!showPreview) { // If turning preview on
      // Potentially refresh preview URL or content
      setPreviewUrl(`/?preview=${Date.now()}`); // Example: force refresh
    }
  };

  // Enhanced preview mode handlers
  const handlePreviewModeChange = (mode) => {
    setPreviewMode(mode);
  };

  // Navigate preview (opens in new tab, ensure pop-up blockers are handled)
  const navigatePreview = (path) => {
    const previewWindow = window.open(path, '_blank');
    if (previewWindow) {
      previewWindow.focus();
    } else {
      // Handle pop-up blocker scenario
      alert('Preview window was blocked. Please allow pop-ups for this site.');
    }
  };

    const handleSignOut = () => {
    if (hasUnsavedChanges) {
        const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to sign out?'
        );
        if (!confirmed) return;
    }
    
    setHasUnsavedChanges(false); // Clear flag
    // Optionally reset active section if desired, like your original:
    // setActiveSection('dashboard'); 
    
    try {
        signOut(); // Call auth hook's signOut
        // Explicitly redirect AFTER signOut() is called
        window.location.href = '/adminsignout'; // Ensure this line is active
    } catch (error) {
        console.error('Error during sign out:', error);
        // You might still want to attempt redirection even if signOut() fails locally,
        // or handle the error more gracefully. For now, this matches your original working logic.
        // window.location.href = '/adminsignout'; // Consider if this should be here too.
    }
    };

  // Enhanced go back functionality
  const goBack = () => {
    if (sectionHistory.length > 1) {
      const previousSection = sectionHistory[1]; // Get the one before current
      handleSectionChange(previousSection);
    }
  };

  // Enhanced refresh section functionality
  const refreshSection = async () => {
    setSectionLoading(true);
    try {
      if (activeSection === 'dashboard') {
        const stats = await getPortfolioStats();
        setPortfolioStats(stats);
        setLastUpdated(new Date().toLocaleString());
        setSectionStates(prev => ({
          ...prev,
          dashboard: { ...prev.dashboard, data: stats, loaded: true }
        }));
      } else {
        await loadSectionData(activeSection); // Reload current section data
      }
    } catch (error) {
      console.error(`Error refreshing section ${activeSection}:`, error);
    } finally {
      setSectionLoading(false);
    }
  };

  // Return to dashboard handler
  const returnToDashboard = () => {
    handleSectionChange('dashboard');
  };

  // Load portfolio statistics on initial mount for dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const stats = await getPortfolioStats();
        setPortfolioStats(stats);
        setLastUpdated(new Date().toLocaleString());
        setSectionStates(prev => ({
          ...prev,
          dashboard: { ...prev.dashboard, data: stats, loaded: true }
        }));
      } catch (error) {
        console.error('Error loading initial dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardData();
  }, []); // Empty dependency array: runs once on mount

  // Handle URL changes (browser back/forward) and initial URL section
  useEffect(() => {
    const handlePopState = (event) => {
      const sectionFromUrl = event.state?.section || 
                             new URLSearchParams(window.location.search).get('section') || 
                             'dashboard';
      if (sectionFromUrl !== activeSection) {
        // Don't call handleSectionChange directly to avoid loop with history.pushState
        // Just update the activeSection state, data loading will be handled if needed
        setActiveSection(sectionFromUrl);
        if (!sectionStates[sectionFromUrl]?.loaded && sectionFromUrl !== 'dashboard') {
            loadSectionData(sectionFromUrl);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Handle initial URL on load
    const urlParams = new URLSearchParams(window.location.search);
    const initialSectionFromUrl = urlParams.get('section');
    if (initialSectionFromUrl && initialSectionFromUrl !== activeSection) {
      setActiveSection(initialSectionFromUrl);
      if (!sectionStates[initialSectionFromUrl]?.loaded && initialSectionFromUrl !== 'dashboard') {
        loadSectionData(initialSectionFromUrl);
      }
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeSection, sectionStates, loadSectionData]); // Dependencies are important here

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) { // Check for Ctrl (Windows/Linux) or Cmd (Mac)
        switch (e.key.toLowerCase()) { // Use toLowerCase for case-insensitivity
          case '1': e.preventDefault(); handleSectionChange('dashboard'); break;
          case '2': e.preventDefault(); handleSectionChange('projects'); break;
          case '3': e.preventDefault(); handleSectionChange('contact'); break;
          case 'h': e.preventDefault(); handleSectionChange('hero'); break;
          case 'a': e.preventDefault(); handleSectionChange('about'); break;
          case 'i': e.preventDefault(); handleSectionChange('internships'); break;
          case 'e': e.preventDefault(); handleSectionChange('education'); break;
          case 'w': e.preventDefault(); handleSectionChange('work'); break;
          case 's':
            e.preventDefault();
            if (e.shiftKey) { // Ctrl/Cmd + Shift + S for skills
              handleSectionChange('skills');
            } else { // Ctrl/Cmd + S for save
              handleQuickSave();
            }
            break;
          case 'c': e.preventDefault(); handleSectionChange('certifications'); break;
          case 'r': e.preventDefault(); handleSectionChange('recommendations'); break;
          case 'm': e.preventDefault(); handleSectionChange('achievements'); break;
          case 'l': e.preventDefault(); handleSectionChange('leadership'); break;
          case 'p': e.preventDefault(); togglePreview(); break;
          default: break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleSectionChange, handleQuickSave, togglePreview]); // Add togglePreview to dependencies

  // Auto-save functionality
  useEffect(() => {
    let autoSaveInterval;
    if (hasUnsavedChanges) { // Only run interval if there are unsaved changes
      autoSaveInterval = setInterval(() => {
        handleAutoSave();
      }, 30000); // 30 seconds
    }
    return () => clearInterval(autoSaveInterval); // Clear interval on unmount or when no unsaved changes
  }, [hasUnsavedChanges, handleAutoSave]);


  // Render enhanced dashboard overview
  const renderDashboardOverview = () => (
    <div className="dashboard-overview">
      <div className="overview-header">
        <h2 className="overview-title">
          <span className="gradient-text">Welcome back, RC! 🎯</span>
        </h2>
        <p className="overview-subtitle">Your portfolio command center</p>
      </div>

    <div className="stats-grid">
        {isLoading && !portfolioStats ? (
            <div className="loading-stats" style={{ gridColumn: '1 / -1' }}>
            <LoadingSpinner />
            <p>Loading portfolio statistics...</p>
            </div>
        ) : portfolioStats ? (
            <>
            {/* Projects Card - Clickable */}
            <div 
                className="stat-card cyan-glow" 
                onClick={() => handleSectionChange('projects')}
                style={{ cursor: 'pointer' }}
                title="Click to manage projects"
            >
                <div className="stat-icon">💻</div>
                <div className="stat-content">
                <h3>{portfolioStats.projects || 0}</h3>
                <p>Active Projects</p>
                </div>
            </div>

            {/* Internships Card - Clickable */}
            <div 
                className="stat-card purple-glow"
                onClick={() => handleSectionChange('internships')}
                style={{ cursor: 'pointer' }}
                title="Click to manage internships"
            >
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                <h3>{portfolioStats.internships || 0}</h3>
                <p>Internships</p>
                </div>
            </div>

            {/* Education Card - Clickable */}
            <div 
                className="stat-card orange-glow"
                onClick={() => handleSectionChange('education')}
                style={{ cursor: 'pointer' }}
                title="Click to manage education"
            >
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                <h3>{portfolioStats.education || 0}</h3>
                <p>Education Entries</p>
                </div>
            </div>

            {/* Work Experience Card - Clickable */}
            <div 
                className="stat-card red-glow"
                onClick={() => handleSectionChange('work')}
                style={{ cursor: 'pointer' }}
                title="Click to manage work experience"
            >
                <div className="stat-icon">💼</div>
                <div className="stat-content">
                <h3>{portfolioStats.workExperience || 0}</h3>
                <p>Work Experiences</p>
                </div>
            </div>

            {/* Skills Card - Clickable */}
            <div 
                className="stat-card yellow-glow"
                onClick={() => handleSectionChange('skills')}
                style={{ cursor: 'pointer' }}
                title="Click to manage skills"
            >
                <div className="stat-icon">⚡</div>
                <div className="stat-content">
                <h3>{portfolioStats.skills || 0}</h3>
                <p>Skills Listed</p>
                </div>
            </div>

            {/* Certifications Card - Clickable */}
            <div 
                className="stat-card indigo-glow"
                onClick={() => handleSectionChange('certifications')}
                style={{ cursor: 'pointer' }}
                title="Click to manage certifications"
            >
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                <h3>{portfolioStats.certifications || 0}</h3>
                <p>Certifications</p>
                </div>
            </div>

            {/* Recommendations Card - Clickable */}
            <div 
                className="stat-card teal-glow"
                onClick={() => handleSectionChange('recommendations')}
                style={{ cursor: 'pointer' }}
                title="Click to manage recommendations"
            >
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                <h3>{portfolioStats.recommendations || 0}</h3>
                <p>Recommendations</p>
                </div>
            </div>

            {/* Achievements Card - Clickable */}
            <div 
                className="stat-card lime-glow"
                onClick={() => handleSectionChange('achievements')}
                style={{ cursor: 'pointer' }}
                title="Click to manage achievements"
            >
                <div className="stat-icon">🥇</div>
                <div className="stat-content">
                <h3>{portfolioStats.achievements || 0}</h3>
                <p>Achievements</p>
                </div>
            </div>

            {/* Leadership Card - Clickable */}
            <div 
                className="stat-card violet-glow"
                onClick={() => handleSectionChange('leadership')}
                style={{ cursor: 'pointer' }}
                title="Click to manage leadership"
            >
                <div className="stat-icon">👑</div>
                <div className="stat-content">
                <h3>{portfolioStats.leadership || 0}</h3>
                <p>Leadership Roles</p>
                </div>
            </div>

            {/* Contact Messages Card - Clickable */}
            <div 
                className="stat-card rose-glow"
                onClick={() => handleSectionChange('contact')}
                style={{ cursor: 'pointer' }}
                title="Click to view contact messages"
            >
                <div className="stat-icon">📧</div>
                <div className="stat-content">
                <h3>{portfolioStats.messages || 0}</h3>
                <p>New Messages</p>
                </div>
            </div>
            </>
        ) : (
            <div className="loading-stats" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p>Could not load statistics.</p>
            </div>
        )}
    </div>

      <div className="quick-actions">
        <h3 className="quick-actions-title">Quick Actions</h3>
        <div className="action-buttons">
          <button 
            className="action-btn primary-action"
            onClick={() => handleSectionChange('projects')}
          >
            <span className="btn-icon" role="img" aria-label="Add Project">➕</span>
            Add New Project
          </button>
          <button 
            className="action-btn secondary-action"
            onClick={() => handleSectionChange('contact')}
          >
            <span className="btn-icon" role="img" aria-label="Check Messages">📧</span>
            Check Messages
          </button>
          <button 
            className="action-btn tertiary-action"
            onClick={togglePreview}
          >
            <span className="btn-icon" role="img" aria-label="Preview Portfolio">👁️</span>
            Preview Portfolio
          </button>
        </div>
      </div>

      {lastUpdated && (
        <div className="last-updated">
          <p>Dashboard last updated: {lastUpdated}</p>
        </div>
      )}
    </div>
  );

  // Render section content
  // Render section content
    const renderSectionContent = () => {
        if (activeSection === 'dashboard') {
            return renderDashboardOverview();
        }

        const currentSection = dashboardSections.find(s => s.id === activeSection);
        const currentSectionData = sectionStates[activeSection]?.data;

        if (sectionLoading && !currentSectionData) {
            return (
            <div className="admin-section-content" style={{textAlign: 'center', paddingTop: '50px'}}>
                <LoadingSpinner />
                <p>Loading {currentSection?.name}...</p>
            </div>
            );
        }

        // Handle specific sections with dedicated managers
        switch (activeSection) {
            case 'hero':
                return <HeroContentManager />;

            case 'about':
                return <AboutSectionManager />;

            case 'projects':
                return <ProjectsManager />;

            case 'internships':
                return <InternshipsManager />;

            case 'education':
                return <EducationManager />;
            
            // Future sections will go here:
            // case 'projects':
            //   return <ProjectsManager />;
            
            default:
            // Placeholder for sections not yet implemented
            return (
                <div className="admin-section-content">
                <div className="admin-section-header">
                    <h2 className="admin-section-title">
                    <span className="admin-section-icon" role="img" aria-label={currentSection?.name}>{currentSection?.icon}</span>
                    {currentSection?.name}
                    </h2>
                    <p className="admin-section-subtitle">
                    Manage your {currentSection?.name.toLowerCase()} content here.
                    </p>
                </div>
                
                <div className="section-placeholder">
                    <div className="placeholder-content">
                    <div className="placeholder-icon" role="img" aria-label="Under Construction">🚧</div>
                    <h3>Content Management for "{currentSection?.name}"</h3>
                    <p>
                        The interface for managing {currentSection?.name.toLowerCase()} will be implemented here.
                        {currentSectionData ? ` (Loaded: ${JSON.stringify(currentSectionData).substring(0,50)}...)` : ' (No data loaded yet)'}
                    </p>
                    <button className="placeholder-btn" onClick={returnToDashboard}>
                        Return to Dashboard
                    </button>
                    </div>
                </div>
                </div>
            );
        }
    };

  // Loading state for the entire dashboard
  if (isLoading && activeSection === 'dashboard' && !portfolioStats) {
    return (
      <div className="admin-loading">
        <LoadingSpinner />
        <p>Loading RC's Admin Dashboard...</p>
      </div>
    );
  }

  // Main render
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-left">
          <button className="sidebar-toggle-btn" onClick={() => {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.admin-sidebar-overlay');
            sidebar?.classList.toggle('mobile-open');
            overlay?.classList.toggle('active');
          }}>
            ☰ 
          </button>
          <div className="admin-logo" onClick={returnToDashboard} style={{cursor: 'pointer'}}>
            <div className="logo-image">
              <img src={logoImage} alt="RC Logo" />
            </div>
            <div className="logo-content">
              <span className="logo-subtitle">ADMIN PORTAL</span>
            </div>
          </div>
          
          <div className="navigation-controls">
            <button 
              className="nav-control-btn"
              onClick={goBack}
              disabled={sectionHistory.length <= 1}
              title="Go Back"
            >
              <span role="img" aria-label="Go back">←</span>
            </button>
            
            <div className="breadcrumb">
              <span 
                className="breadcrumb-home"
                onClick={returnToDashboard}
                style={{ cursor: 'pointer' }}
              >
                Dashboard
              </span>
              {activeSection !== 'dashboard' && (
                <>
                  <span className="breadcrumb-separator">→</span>
                  <span className="breadcrumb-current">
                    {dashboardSections.find(s => s.id === activeSection)?.name || 'Current Section'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <ThemeToggle />
            <button 
              className="preview-btn"
              onClick={togglePreview}
              title="Preview Portfolio (Ctrl/Cmd + P)"
            >
              <span className="btn-icon" role="img" aria-label="Preview">👁️</span>
              Preview
            </button>
            <button 
              className="refresh-btn"
              onClick={refreshSection}
              title="Refresh Section"
              disabled={sectionLoading}
            >
              <span className="btn-icon" role="img" aria-label="Refresh">🔄</span>
              {sectionLoading && activeSection !== 'dashboard' ? 'Loading...' : 'Refresh'}
            </button>
            {hasUnsavedChanges && (
              <button 
                className="save-btn"
                onClick={handleQuickSave}
                title="Quick Save (Ctrl/Cmd + S)"
              >
                <span className="btn-icon" role="img" aria-label="Save">💾</span>
                Save
              </button>
            )}
          </div>
          
          <div className="admin-profile">
            <div className="profile-info">
              <span className="profile-name">RC</span>
              <span className="profile-role">Administrator</span>
            </div>
            {/* <div className="profile-actions"> */}
              <button 
                className="signout-btn"
                onClick={handleSignOut}
                title="Sign Out"
              >
                <span className="btn-icon" role="img" aria-label="Sign Out">🚪</span>
                Sign Out
              </button>
            {/* </div> */}
          </div>
        </div>
      </header>

      <div className="dashboard-body">
         <div className="admin-sidebar-overlay" onClick={() => {
            const sidebar = document.querySelector('.admin-sidebar');
            const overlay = document.querySelector('.admin-sidebar-overlay');
            sidebar?.classList.remove('mobile-open');
            overlay?.classList.remove('active');
          }}></div>
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {dashboardSections.map(section => (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                data-section={section.id} // <<< CRITICAL FIX: ADD THIS ATTRIBUTE
                onClick={() => handleSectionChange(section.id)}
                disabled={sectionLoading && activeSection !== section.id} // Disable only if loading a DIFFERENT section
                title={section.name + (section.shortcut ? ` (Ctrl/Cmd + ${section.shortcut.toUpperCase()})` : '')}
              >
                <span className="nav-icon" role="img" aria-label={section.name}>{section.icon}</span>
                <span className="nav-text">{section.name}</span>
                {sectionStates[section.id]?.hasChanges && (
                  <span className="nav-changes-indicator" title="Unsaved changes">●</span>
                )}
                {section.id === 'contact' && portfolioStats?.messages > 0 && (
                  <span className="nav-badge">{portfolioStats.messages}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        <main className="admin-main">
          {sectionLoading && activeSection !== 'dashboard' ? (
             <div style={{textAlign: 'center', paddingTop: '50px'}}>
                <LoadingSpinner />
                <p>Loading {dashboardSections.find(s => s.id === activeSection)?.name}...</p>
            </div>
          ) : renderSectionContent()}
        </main>
      </div>

      {showPreview && (
        <div className="preview-modal"> {/* Ensure z-index is high enough if needed */}
          <div className="preview-backdrop" onClick={togglePreview}></div>
          <div className="preview-container">
            <div className="preview-header">
              <div className="preview-title">
                <span className="preview-icon" role="img" aria-label="Preview">👁️</span>
                Portfolio Preview
              </div>

              <div className="preview-controls">
                <div className="preview-device-controls">
                  <button 
                    className={`preview-control-btn ${previewMode === 'desktop' ? 'active' : ''}`}
                    onClick={() => handlePreviewModeChange('desktop')}
                    title="Desktop Mode"
                  >
                    <span role="img" aria-label="Desktop mode">🖥️</span>
                  </button>
                  <button 
                    className={`preview-control-btn ${previewMode === 'tablet' ? 'active' : ''}`}
                    onClick={() => handlePreviewModeChange('tablet')}
                    title="Tablet Mode"
                  >
                    <span role="img" aria-label="Tablet mode">📱</span>
                  </button>
                  <button 
                    className={`preview-control-btn ${previewMode === 'mobile' ? 'active' : ''}`}
                    onClick={() => handlePreviewModeChange('mobile')}
                    title="Mobile Mode"
                  >
                   <span role="img" aria-label="Mobile mode">📲</span>
                  </button>
                </div>

                <button className="preview-close-btn" onClick={togglePreview} title="Close Preview">
                  <span role="img" aria-label="Close">✕</span>
                </button>
              </div>
            </div>
            
            <div className="preview-content">
              <div className={`preview-iframe-container ${previewMode}`}>
                <iframe
                  src={previewUrl} // Make sure previewUrl is a valid URL
                  title="Portfolio Preview"
                  className={`preview-iframe ${previewMode}`}
                  frameBorder="0"
                  key={previewUrl} // Force re-render if URL changes
                  sandbox="allow-scripts allow-same-origin" // For security if previewing external/dynamic content
                />
              </div>
              
              <div className="preview-stats-bar">
                <div className="preview-stats-left">
                  <div className="preview-stat-item">
                    <span className="preview-stat-icon" role="img" aria-label="Current view mode">📐</span>
                    <span className="preview-mode-indicator">
                      {previewMode === 'desktop' && 'Desktop View'}
                      {previewMode === 'tablet' && 'Tablet View'}
                      {previewMode === 'mobile' && 'Mobile View'}
                    </span>
                  </div>
                  <div className="preview-stat-item">
                    <span className="preview-stat-icon" role="img" aria-label="Device width">↔️</span>
                    <span className="preview-device-info">
                      {previewMode === 'desktop' && 'Full Width'}
                      {previewMode === 'tablet' && '~768px Wide'}
                      {previewMode === 'mobile' && '~375px Wide'}
                    </span>
                  </div>
                </div>
                <div className="preview-stats-right">
                  <div className="preview-stat-item">
                    <span className="preview-stat-icon" role="img" aria-label="Status">⚡</span>
                    <span className="preview-performance-indicator">Live Preview</span>
                  </div>
                  <div className="preview-stat-item">
                    <span className="preview-stat-icon" role="img" aria-label="Last updated">🕒</span>
                    <span className="preview-last-updated">
                      {/* Ensure lastUpdated is a string */}
                      {lastUpdated ? `Updated: ${typeof lastUpdated === 'string' ? (lastUpdated.split(',')[1]?.trim() || lastUpdated) : new Date(lastUpdated).toLocaleTimeString()}` : 'Recently Updated'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;