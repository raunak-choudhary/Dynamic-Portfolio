// src/Router.js

import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { withAuth } from './contexts/AuthContext';

// Page Components
import LandingPage from './pages/LandingPage';
import ProjectsPage from './pages/ProjectsPage';
import InternshipsPage from './pages/InternshipsPage';
import EducationPage from './pages/EducationPage';
import WorkExperiencePage from './pages/WorkExperiencePage';
import SkillsPage from './pages/SkillsPage';
import CertificationsPage from './pages/CertificationsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AchievementsPage from './pages/AchievementsPage';
import LeadershipPage from './pages/LeadershipPage';

// Admin Components
import AdminLogin from './components/admin/AdminLogin/AdminLogin';
import AdminWelcome from './components/admin/AdminWelcome/AdminWelcome';
import AdminSignOut from './components/admin/AdminSignOut/AdminSignOut';

// Protected Admin Components (wrapped with authentication)
const ProtectedAdminWelcome = withAuth(AdminWelcome);

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever route changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

const AppRouter = () => {
  const location = useLocation();
  
  // Check if current route is admin-related
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className="app-layout">
      <ScrollToTop />
      
      {/* Show Header/Footer only for public routes */}
      {!isAdminRoute && <Header />}
      
      <main className="main-content">
        <Routes>
          {/* ============================================ */}
          {/* PUBLIC PORTFOLIO ROUTES                      */}
          {/* ============================================ */}
          
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Individual Portfolio Pages */}
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/internships" element={<InternshipsPage />} />
          <Route path="/education" element={<EducationPage />} />
          <Route path="/work-experience" element={<WorkExperiencePage />} />
          <Route path="/skills" element={<SkillsPage />} />
          <Route path="/certifications" element={<CertificationsPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/leadership" element={<LeadershipPage />} />
          
          {/* ============================================ */}
          {/* ADMIN ROUTES                                 */}
          {/* ============================================ */}
          
          {/* Admin Login Page */}
          <Route path="/adminlogin" element={<AdminLogin />} />
          
          {/* Admin Dashboard with Welcome Animation */}
          <Route path="/admindashboard" element={<ProtectedAdminWelcome />} />

          {/* Admin Sign Out Animation */}
          <Route path="/adminsignout" element={<AdminSignOut />} />
          
          {/* ============================================ */}
          {/* FALLBACK ROUTES                              */}
          {/* ============================================ */}
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      
      {/* Show Footer only for public routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
};

// Enhanced 404 Page Component
const NotFoundPage = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  return (
    <div className={`not-found-page ${isAdminRoute ? 'admin-404' : 'public-404'}`}>
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-animation">
            <div className="error-code shimmer-text">404</div>
            <div className="error-icon">🚀</div>
          </div>
          
          <h1 className="not-found-title">
            {isAdminRoute ? 'Admin Page Not Found' : 'Page Not Found'}
          </h1>
          
          <p className="not-found-description">
            {isAdminRoute 
              ? 'The admin page you\'re looking for doesn\'t exist or you don\'t have permission to access it.'
              : 'The page you\'re looking for doesn\'t exist or has been moved.'
            }
          </p>
          
          <div className="not-found-actions">
            {isAdminRoute ? (
              <>
                <a href="/admindashboard" className="neon-button primary">
                  Admin Dashboard
                </a>
                <a href="/adminlogin" className="neon-button secondary">
                  Admin Login
                </a>
              </>
            ) : (
              <>
                <a href="/" className="neon-button primary">
                  Return Home
                </a>
                <a href="/projects" className="neon-button secondary">
                  View Projects
                </a>
              </>
            )}
          </div>
          
          {/* Helpful Links */}
          <div className="helpful-links">
            <p className="helpful-title">Quick Navigation:</p>
            <div className="link-grid">
              {isAdminRoute ? (
                <>
                  <a href="/" className="helpful-link">Public Portfolio</a>
                  <a href="/adminlogin" className="helpful-link">Admin Login</a>
                </>
              ) : (
                <>
                  <a href="/projects" className="helpful-link">Projects</a>
                  <a href="/work-experience" className="helpful-link">Experience</a>
                  <a href="/skills" className="helpful-link">Skills</a>
                  <a href="/#contact" className="helpful-link">Contact</a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppRouter;