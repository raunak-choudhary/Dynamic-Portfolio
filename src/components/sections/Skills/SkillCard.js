import React from 'react';

const SkillCard = ({ category }) => {
  return (
    <div className="skill-card glass-card hover-lift">
      <div className="skill-category-header">
        <div className="category-icon">
          {category.icon && (
            <img src={category.icon} alt={category.name} className="category-icon-img" />
          )}
        </div>
        <h3 className="category-title">{category.name}</h3>
      </div>
      
      <div className="skills-list">
        {category.skills && category.skills.map((skill, index) => (
          <div key={index} className="skill-item">
            <div className="skill-info">
              <span className="skill-name">{skill.name}</span>
              {skill.level && (
                <span className="skill-level">{skill.level}</span>
              )}
            </div>
            
            {skill.proficiency && (
              <div className="skill-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${skill.proficiency}%` }}
                  ></div>
                </div>
                <span className="proficiency-text">{skill.proficiency}%</span>
              </div>
            )}
            
            {skill.years_experience && (
              <div className="experience-indicator">
                <span className="years-text">{skill.years_experience} years</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillCard;