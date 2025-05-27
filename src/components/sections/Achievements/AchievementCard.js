import React from 'react';

const AchievementCard = ({ achievement }) => {
  return (
    <div className="achievement-card glass-card hover-lift">
      <div className="achievement-header">
        <div className="achievement-icon">
          {achievement.icon ? (
            <img src={achievement.icon} alt={achievement.title} className="achievement-icon-img" />
          ) : (
            <div className="default-achievement-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9C6 10.45 6.38 11.78 7 12.9L12 22L17 12.9C17.62 11.78 18 10.45 18 9C18 5.69 15.31 3 12 3S6 5.69 6 9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 13C14.21 13 16 11.21 16 9S14.21 5 12 5S8 6.79 8 9S9.79 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        <div className="achievement-badge">
          {achievement.level && (
            <span className="level-badge">{achievement.level}</span>
          )}
        </div>
      </div>
      
      <div className="achievement-content">
        <h3 className="achievement-title">{achievement.title}</h3>
        
        {achievement.organization && (
          <p className="achievement-organization">{achievement.organization}</p>
        )}
        
        {achievement.description && (
          <p className="achievement-description">{achievement.description}</p>
        )}
        
        <div className="achievement-details">
          {achievement.date && (
            <div className="detail-item">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{achievement.date}</span>
            </div>
          )}
          
          {achievement.category && (
            <div className="detail-item">
              <span className="detail-label">Category:</span>
              <span className="detail-value">{achievement.category}</span>
            </div>
          )}
          
          {achievement.rank && (
            <div className="detail-item">
              <span className="detail-label">Rank:</span>
              <span className="detail-value rank-highlight">{achievement.rank}</span>
            </div>
          )}
        </div>
        
        {achievement.skills && achievement.skills.length > 0 && (
          <div className="achievement-skills">
            <h4 className="skills-title">Related Skills</h4>
            <div className="skills-tags">
              {achievement.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {achievement.certificate_url && (
          <div className="achievement-actions">
            <a 
              href={achievement.certificate_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="certificate-button neon-button"
            >
              View Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementCard;