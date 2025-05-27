// src/components/sections/Contact/ContactForm.js

import React, { useState } from 'react';
import './Contact.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    role: '',
    inquiryType: '',
    subject: '',
    message: '',
    attachments: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const roleOptions = [
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'hr-manager', label: 'HR Manager' },
    { value: 'hiring-manager', label: 'Hiring Manager' },
    { value: 'technical-lead', label: 'Technical Lead' },
    { value: 'developer', label: 'Developer' },
    { value: 'startup-founder', label: 'Startup Founder' },
    { value: 'student', label: 'Student' },
    { value: 'other', label: 'Other' }
  ];

  const inquiryTypes = [
    { value: '', label: 'Select inquiry type' },
    { value: 'job-opportunity', label: 'Job Opportunity' },
    { value: 'internship-offer', label: 'Internship Offer' },
    { value: 'freelance-project', label: 'Freelance Project' },
    { value: 'collaboration', label: 'Collaboration Opportunity' },
    { value: 'mentorship', label: 'Mentorship' },
    { value: 'speaking-event', label: 'Speaking/Event Invitation' },
    { value: 'networking', label: 'Networking' },
    { value: 'general-inquiry', label: 'General Inquiry' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization/University name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    if (!formData.inquiryType) {
      newErrors.inquiryType = 'Please select inquiry type';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      role: roleValue
    }));
    
    if (errors.role) {
      setErrors(prev => ({
        ...prev,
        role: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        alert(`File ${file.name} is not a supported format.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate form submission (will be replaced with actual API call in Phase 2)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        organization: '',
        role: '',
        inquiryType: '',
        subject: '',
        message: '',
        attachments: []
      });
      
      // Reset file input
      const fileInput = document.getElementById('attachments');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-form-container glass-card">
      {submitStatus === 'success' && (
        <div className="status-message success-message">
          <span className="status-icon">✓</span>
          Thank you for reaching out to me, I will reply to you as soon as possible!!
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="status-message error-message">
          <span className="status-icon">✗</span>
          Sorry, there was an error sending your message. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Your full name"
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your.email@company.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="organization" className="form-label">
            Organization/University Name *
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            className={`form-input ${errors.organization ? 'error' : ''}`}
            placeholder="Your company or university name"
          />
          {errors.organization && <span className="error-text">{errors.organization}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">
            Your Role/Position *
          </label>
          <div className="role-options">
            {roleOptions.map(option => (
              <label key={option.value} className="role-option">
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formData.role === option.value}
                  onChange={() => handleRoleChange(option.value)}
                  className="role-radio"
                />
                <span className="role-label">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.role && <span className="error-text">{errors.role}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="inquiryType" className="form-label">
            Inquiry Type *
          </label>
          <select
            id="inquiryType"
            name="inquiryType"
            value={formData.inquiryType}
            onChange={handleInputChange}
            className={`form-select ${errors.inquiryType ? 'error' : ''}`}
          >
            {inquiryTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.inquiryType && <span className="error-text">{errors.inquiryType}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="subject" className="form-label">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            className={`form-input ${errors.subject ? 'error' : ''}`}
            placeholder="Brief subject of your message"
          />
          {errors.subject && <span className="error-text">{errors.subject}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message" className="form-label">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            className={`form-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Please share details about the opportunity, role requirements, or your inquiry..."
            rows="6"
          />
          <div className="character-count">
            {formData.message.length} characters (minimum 10)
          </div>
          {errors.message && <span className="error-text">{errors.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="attachments" className="form-label">
            Attachments (Optional)
          </label>
          <div className="file-upload-container">
            <input
              type="file"
              id="attachments"
              multiple
              onChange={handleFileChange}
              className="file-input"
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
            />
            <label htmlFor="attachments" className="file-upload-label">
              <span className="upload-icon">📎</span>
              Choose Files
            </label>
            <div className="file-info">
              Job descriptions, project details, or relevant documents (Max 5MB each)
            </div>
          </div>

          {formData.attachments.length > 0 && (
            <div className="attachments-list">
              {formData.attachments.map((file, index) => (
                <div key={index} className="attachment-item">
                  <span className="attachment-name">{file.name}</span>
                  <span className="attachment-size">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="remove-attachment"
                  >
                    ✗
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`submit-button neon-button ${isSubmitting ? 'submitting' : ''}`}
        >
          {isSubmitting ? (
            <>
              <span className="loading-spinner"></span>
              Sending Message...
            </>
          ) : (
            'Send Message'
          )}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;