import { useNavigate, useLocation } from 'react-router-dom';
import Cube3D from './Cube3D';
import { portfolioData } from '../../../data/portfolioData';
import { useSupabase } from '../../../hooks/useSupabase';
import LoadingSpinner from '../../common/LoadingSpinner';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use useSupabase hook for data fetching
  const { 
    data: apiHeroData, 
    loading
  } = useSupabase('hero_content', { status: 'active' }, { single: true });

  // Smart data mapping - preserve your current structure
  const heroData = apiHeroData ? {
    title: apiHeroData.title || portfolioData.hero.title,
    subtitle: apiHeroData.subtitle || portfolioData.hero.subtitle,
    description: apiHeroData.description || portfolioData.hero.description,
    highlights: Array.isArray(apiHeroData.highlights) && apiHeroData.highlights.length > 0 
      ? apiHeroData.highlights 
      : portfolioData.hero.highlights
  } : portfolioData.hero;

  const handleNavClick = (sectionId) => {
    if (location.pathname === '/') {
      // Already on landing page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${sectionId}`);
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
  };

  // Show loading only initially, not affecting layout
  if (loading) {
    return (
      <section className="hero-section">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <LoadingSpinner size="large" message="Loading..." />
        </div>
      </section>
    );
  }

  return (
    <section className="hero-section">
      {/* Moving Light Rays Background */}
      <div className="hero-light-rays">
        <div className="hero-light-ray"></div>
        <div className="hero-light-ray"></div>
        <div className="hero-light-ray"></div>
      </div>
      
      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
        <div className="floating-particle"></div>
      </div>

      <div className="hero-content">
        {/* Left Side: Introduction Text */}
        <div className="hero-text">
          <h1 className="hero-title">
            <span className="shimmer-text">{heroData.title}</span>
          </h1>
          <h2 className="hero-subtitle text-glow">
            {heroData.subtitle}
          </h2>
          <p className="hero-description">
            {heroData.description}
          </p>
          
          {/* Highlights */}
          <div className="hero-highlights">
            {heroData.highlights.map((highlight, index) => (
              <div 
                key={index} 
                className={`hero-highlight animate-fade-in-up animate-delay-${(index + 1) * 200}`}
              >
                <span className="highlight-icon">✓</span>
                <span className="highlight-text">{highlight}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hero-actions">
            <button 
              className="neon-button primary"
              onClick={() => handleNavClick('navigation')}
            >
              View My Work
            </button>
            <button 
              className="neon-button secondary"
              onClick={() => handleNavClick('contact')}
            >
              Contact Me
            </button>
          </div>
        </div>

        {/* Creative Divider Between Text and Cube */}
        <div className="hero-divider">
          <div className="hero-divider-icons">
            <div className="divider-icon code-bracket">&lt;/&gt;</div>
            <div className="divider-icon curly-brace">&#123;&#125;</div>
            <div className="divider-icon lambda-symbol">λ</div>
            <div className="divider-icon delta-symbol">Δ</div>
          </div>
        </div>

        {/* Right Side: 3D Cube */}
        <div className="hero-cube-wrapper">
          <Cube3D />
        </div>
      </div>
    </section>
  );
};

export default Hero;