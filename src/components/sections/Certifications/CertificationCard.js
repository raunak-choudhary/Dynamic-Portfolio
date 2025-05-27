import React from 'react';

const CertificationCard = ({ certification }) => {
  return (
    <div className="certification-card glass-card hover-lift">
      <div className="certification-header">
        {certification.badge && (
          <div className="certification-badge">
            <img src={certification.badge} alt={certification.name} className="badge-image" />
          </div>
        )}
        <div className="certification-info">
          <h3 className="certification-name">{certification.name}</h3>
          <p className="certification-issuer">{certification.issuer}</p>
        </div>
      </div>
      
      <div className="certification-content">
        {certification.description && (
          <p className="certification-description">{certification.description}</p>
        )}
        
        <div className="certification-details">
          {certification.issued_date && (
            <div className="detail-item">
              <span className="detail-label">Issued:</span>
              <span className="detail-value">{certification.issued_date}</span>
            </div>
          )}
          
          {certification.expiry_date && (
            <div className="detail-item">
              <span className="detail-label">Expires:</span>
              <span className="detail-value">{certification.expiry_date}</span>
            </div>
          )}
          
          {certification.credential_id && (
            <div className="detail-item">
              <span className="detail-label">Credential ID:</span>
              <span className="detail-value credential-id">{certification.credential_id}</span>
            </div>
          )}
        </div>
        
        {certification.skills && certification.skills.length > 0 && (
          <div className="skills-covered">
            <h4 className="skills-title">Skills Covered</h4>
            <div className="skills-tags">
              {certification.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {certification.verification_url && (
          <div className="certification-actions">
            <a 
              href={certification.verification_url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="verify-button neon-button"
            >
              Verify Certificate
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificationCard;