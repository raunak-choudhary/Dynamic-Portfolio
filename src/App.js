// src/App.js

import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './Router';
import './styles/globals.css';
import { AuthProvider } from './contexts/AuthContext';
import { viewportUtils } from './utils/viewportUtils';

function App() {
  // Add viewport fixes - this won't interfere with existing functionality
  useEffect(() => {
    // Initialize viewport fixes immediately
    viewportUtils.init();
    
    // Apply additional fixes after component mount
    const timer = setTimeout(() => {
      viewportUtils.reset();
    }, 100);
    
    // Cleanup timer
    return () => clearTimeout(timer);
  }, []);

  // Handle production environment detection
  useEffect(() => {
    const isProduction = window.location.hostname !== 'localhost' && 
                        !window.location.hostname.includes('127.0.0.1') &&
                        !window.location.hostname.includes('local');
    
    if (isProduction) {
      // Apply production-specific fixes only
      document.documentElement.classList.add('production-environment');
      document.body.classList.add('production-environment');
      
      // Force consistent scaling in production
      const applyProductionFixes = () => {
        const html = document.documentElement;
        const body = document.body;
        
        html.style.setProperty('zoom', '1', 'important');
        html.style.setProperty('transform', 'scale(1)', 'important');
        html.style.setProperty('font-size', '16px', 'important');
        
        body.style.setProperty('zoom', '1', 'important');
        body.style.setProperty('transform', 'scale(1)', 'important');
        body.style.setProperty('font-size', '16px', 'important');
      };
      
      applyProductionFixes();
      setTimeout(applyProductionFixes, 500);
    }
  }, []);

  return (
    <ErrorBoundary fallbackMessage="Something went wrong with the portfolio. Please refresh the page.">
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="App">
              <AppRouter />
            </div>
          </Router>
        </AuthProvider> 
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;