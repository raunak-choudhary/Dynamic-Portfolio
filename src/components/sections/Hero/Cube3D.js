import React, { useState } from 'react';
import './Cube3D.css';

// Import all images directly - Fixed paths (3 levels up from Hero to src)
import reactLogo from '../../../assets/images/cube/tech-categories/reactjs.png';
import nextjsLogo from '../../../assets/images/cube/tech-categories/nextjs.png';
import nodejsLogo from '../../../assets/images/cube/tech-categories/nodejs.png';
import pythonLogo from '../../../assets/images/cube/tech-categories/python.png';
import awsLogo from '../../../assets/images/cube/tech-categories/aws.png';
import azureLogo from '../../../assets/images/cube/tech-categories/azure.png';
import mongodbLogo from '../../../assets/images/cube/tech-categories/mongodb.png';
import postgresqlLogo from '../../../assets/images/cube/tech-categories/postgresql.png';
import dockerLogo from '../../../assets/images/cube/tech-categories/docker.png';
import kubernetesLogo from '../../../assets/images/cube/tech-categories/kubernetes.png';
import tensorflowLogo from '../../../assets/images/cube/tech-categories/tensorflow.png';
import pytorchLogo from '../../../assets/images/cube/tech-categories/pytorch.png';

// Import certification images
import awsCloudPractitioner from '../../../assets/images/cube/certifications/aws-cloud-practitioner.png';
import awsDataAnalytics from '../../../assets/images/cube/certifications/aws-data-analytics.png';
import internshipVerzeo from '../../../assets/images/cube/certifications/internship-verzeo.jpg';
import internshipGreatLearning from '../../../assets/images/cube/certifications/internship-greatlearning.png';
import internshipHpe from '../../../assets/images/cube/certifications/internship-hpe.png';
import internshipWeb from '../../../assets/images/cube/certifications/internship-web.png';

// Import inner cube images
import photo1 from '../../../assets/images/cube/inner-cube/photo1.jpg';
import photo2 from '../../../assets/images/cube/inner-cube/photo2.jpg';
import photo3 from '../../../assets/images/cube/inner-cube/photo3.jpg';
import usFlag from '../../../assets/images/cube/inner-cube/us-flag.png';
import indiaFlag from '../../../assets/images/cube/inner-cube/india-flag.png';
import nyuLogo from '../../../assets/images/cube/inner-cube/nyu-logo.png';

const Cube3D = () => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div className="hero-cube">
      <div className="cube-container">
        <div 
          className={`cube ${isHovered ? 'cube-hovered' : ''}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Outer Cube */}
          <div className="outer-cube">
            {/* Front Face - Frontend */}
            <div className="outer-front">
              {!isHovered ? (
                <div className="tech-category frontend">
                  <div className="tech-logo-container">
                    <img 
                      src={reactLogo} 
                      alt="React.js" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load React logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={nextjsLogo} 
                      alt="Next.js" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Next.js logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>Frontend</h3>
                  <p>React & Next.js</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={awsCloudPractitioner} 
                    alt="AWS Cloud Practitioner Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Back Face - Backend */}
            <div className="outer-back">
              {!isHovered ? (
                <div className="tech-category backend">
                  <div className="tech-logo-container">
                    <img 
                      src={nodejsLogo} 
                      alt="Node.js" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Node.js logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={pythonLogo} 
                      alt="Python" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Python logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>Backend</h3>
                  <p>Node.js & Python</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={awsDataAnalytics} 
                    alt="AWS Data Analytics Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Left Face - Cloud */}
            <div className="outer-left">
              {!isHovered ? (
                <div className="tech-category cloud">
                  <div className="tech-logo-container">
                    <img 
                      src={awsLogo} 
                      alt="AWS" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load AWS logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={azureLogo} 
                      alt="Azure" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Azure logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>Cloud</h3>
                  <p>AWS & Azure</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={internshipVerzeo} 
                    alt="Verzeo Internship Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right Face - Database */}
            <div className="outer-right">
              {!isHovered ? (
                <div className="tech-category database">
                  <div className="tech-logo-container">
                    <img 
                      src={mongodbLogo} 
                      alt="MongoDB" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load MongoDB logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={postgresqlLogo} 
                      alt="PostgreSQL" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load PostgreSQL logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>Database</h3>
                  <p>MongoDB & PostgreSQL</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={internshipGreatLearning} 
                    alt="Great Learning Internship Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Top Face - DevOps */}
            <div className="outer-top">
              {!isHovered ? (
                <div className="tech-category devops">
                  <div className="tech-logo-container">
                    <img 
                      src={dockerLogo} 
                      alt="Docker" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Docker logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={kubernetesLogo} 
                      alt="Kubernetes" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load Kubernetes logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>DevOps</h3>
                  <p>Docker & Kubernetes</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={internshipHpe} 
                    alt="HPE Internship Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Bottom Face - AI/ML */}
            <div className="outer-bottom">
              {!isHovered ? (
                <div className="tech-category aiml">
                  <div className="tech-logo-container">
                    <img 
                      src={tensorflowLogo} 
                      alt="TensorFlow" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load TensorFlow logo');
                        e.target.style.display = 'none';
                      }}
                    />
                    <img 
                      src={pytorchLogo} 
                      alt="PyTorch" 
                      className="tech-logo"
                      onError={(e) => {
                        console.error('Failed to load PyTorch logo');
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3>AI/ML</h3>
                  <p>TensorFlow & PyTorch</p>
                </div>
              ) : (
                <div className="certification-container">
                  <img 
                    src={internshipWeb} 
                    alt="Web Development Internship Certificate"
                    className="certification-image"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      console.error('Failed to load certification image');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Inner Cube - Always shows images */}
          <div className="inner-cube">
            <div className="inner-front">
              <img 
                src={photo1} 
                alt="PersonalPhoto1"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
            <div className="inner-back">
              <img 
                src={photo2} 
                alt="PersonalPhoto2"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
            <div className="inner-left">
              <img 
                src={photo3} 
                alt="PersonalPhoto3"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
            <div className="inner-right">
              <img 
                src={usFlag} 
                alt="US Flag"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
            <div className="inner-top">
              <img 
                src={indiaFlag} 
                alt="India Flag"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
            <div className="inner-bottom">
              <img 
                src={nyuLogo} 
                alt="NYU Logo"
                className="inner-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  console.error('Failed to load inner cube image');
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cube3D;