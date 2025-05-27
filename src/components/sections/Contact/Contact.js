// src/components/sections/Contact/Contact.js

import React from 'react';
import ContactForm from './ContactForm';
import './Contact.css';

const Contact = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title-contact shimmer-text">Get In Touch</h2>
          <p className="section-subtitle-contact">
            I'm actively seeking new opportunities and collaborations. Whether you're a recruiter, hiring manager, or looking to collaborate on exciting projects, I'd love to hear from you!
          </p>
        </div>
        
        <div className="form-header-main">
          <h3 className="form-title-main">Let's Connect!</h3>
          <p className="form-subtitle-main">
            Ready to discuss opportunities? I'm excited to hear from you!
          </p>
        </div>

        <div className="contact-content">
          <ContactForm />
        </div>
      </div>
    </section>
  );
};

export default Contact;