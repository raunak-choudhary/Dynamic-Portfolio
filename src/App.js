// src/App.js

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import AppRouter from './Router';
import './styles/globals.css';
import { AuthProvider } from './contexts/AuthContext';

function App() {
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