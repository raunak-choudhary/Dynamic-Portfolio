import React from 'react';

const LeadershipCard = ({ leadership }) => {
  return (
    <div className="leadership-card glass-card hover-lift">
      <div className="leadership-header">
        <div className="leadership-main">
          <h3 className="position-title">{leadership.position}</h3>
          <p className="organization-name">{leadership.organization}</p>
          {leadership.type && (
            <span className="leadership-type">{leadership.type}</span>
          )}
        </div>
        <div className="leadership-period">
          <span className="period-text">{leadership.period}</span>
          {leadership.status && <span className="status-badge">{leadership.status}</span>}
        </div>
      </div>
      
      {leadership.description && (
        <p className="leadership-description">{leadership.description}</p>
      )}
      
      {leadership.responsibilities && leadership.responsibilities.length > 0 && (
        <div className="responsibilities-section">
          <h4 className="responsibilities-title">Key Responsibilities</h4>
          <ul className="responsibilities-list">
            {leadership.responsibilities.map((responsibility, index) => (
              <li key={index} className="responsibility-item">
                {responsibility}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {leadership.achievements && leadership.achievements.length > 0 && (
        <div className="achievements-section">
          <h4 className="achievements-title">Key Achievements</h4>
          <ul className="achievements-list">
            {leadership.achievements.map((achievement, index) => (
              <li key={index} className="achievement-item">
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {leadership.impact && (
        <div className="impact-section">
          <h4 className="impact-title">Impact</h4>
          <p className="impact-text">{leadership.impact}</p>
        </div>
      )}
      
      {leadership.skills && leadership.skills.length > 0 && (
        <div className="skills-section">
          <h4 className="skills-title">Skills Developed</h4>
          <div className="skills-tags">
            {leadership.skills.map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {leadership.team_size && (
        <div className="team-info">
          <div className="team-size">
            <span className="team-label">Team Size:</span>
            <span className="team-value">{leadership.team_size}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadershipCard;