import React from 'react';

const RecommendationCard = ({ recommendation }) => {
  return (
    <div className="recommendation-card glass-card hover-lift">
      <div className="quote-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21C3 9 9 5 9 5S9 9 9 13C9 17 5 21 3 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 21C15 9 21 5 21 5S21 9 21 13C21 17 17 21 15 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div className="recommendation-content">
        <p className="recommendation-text">"{recommendation.text}"</p>
        
        <div className="recommender-info">
          <div className="recommender-avatar">
            {recommendation.avatar ? (
              <img src={recommendation.avatar} alt={recommendation.name} className="avatar-image" />
            ) : (
              <div className="avatar-placeholder">
                {recommendation.name.split(' ').map(name => name[0]).join('').slice(0, 2)}
              </div>
            )}
          </div>
          
          <div className="recommender-details">
            <h4 className="recommender-name">{recommendation.name}</h4>
            <p className="recommender-position">{recommendation.position}</p>
            <p className="recommender-company">{recommendation.company}</p>
            {recommendation.relationship && (
              <p className="recommender-relationship">{recommendation.relationship}</p>
            )}
          </div>
        </div>
        
        {recommendation.date && (
          <div className="recommendation-date">
            <span className="date-text">{recommendation.date}</span>
          </div>
        )}
        
        {recommendation.linkedin_url && (
          <div className="recommendation-actions">
            <a 
              href={recommendation.linkedin_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="linkedin-button neon-button secondary"
            >
              View on LinkedIn
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationCard;