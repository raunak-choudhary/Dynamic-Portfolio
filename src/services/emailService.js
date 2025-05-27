// src/services/emailService.js

// This file handles contact form email functionality
// Phase 1: Simulates email sending
// Phase 3: Will integrate with Supabase Edge Functions + EmailJS/Resend

import { CONTACT_INFO, MESSAGES } from '../utils/constants';
import { isValidEmail } from '../utils/helpers';

// Simulate email sending delay
const simulateEmailDelay = (ms = 2000) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Validate contact form data
const validateContactForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }

  if (!formData.email || !isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!formData.contactType) {
    errors.contactType = 'Please select a contact type';
  }

  if (!formData.subject || formData.subject.trim().length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  }

  if (!formData.message || formData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Format contact form data for email
const formatEmailContent = (formData) => {
  const timestamp = new Date().toLocaleString();
  
  return {
    to: CONTACT_INFO.email,
    subject: `Portfolio Contact: ${formData.subject}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #00FFFF; border-bottom: 2px solid #00FFFF; padding-bottom: 10px;">
          New Portfolio Contact Message
        </h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Contact Information</h3>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Contact Type:</strong> ${formData.contactType}</p>
          <p><strong>Subject:</strong> ${formData.subject}</p>
          <p><strong>Received:</strong> ${timestamp}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border-left: 4px solid #8A2BE2; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Message</h3>
          <p style="line-height: 1.6; color: #555;">${formData.message.replace(/\n/g, '<br>')}</p>
        </div>
        
        ${formData.attachment ? `
          <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Attachment:</strong> ${formData.attachment.name} (${formData.attachment.size} bytes)</p>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>This message was sent from your portfolio contact form.</p>
        </div>
      </div>
    `,
    textContent: `
      New Portfolio Contact Message
      
      Name: ${formData.name}
      Email: ${formData.email}
      Contact Type: ${formData.contactType}
      Subject: ${formData.subject}
      Received: ${timestamp}
      
      Message:
      ${formData.message}
      
      ${formData.attachment ? `Attachment: ${formData.attachment.name}` : ''}
    `
  };
};

// Send contact form email
export const sendContactEmail = async (formData) => {
  try {
    // Validate form data
    const validation = validateContactForm(formData);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Please fix the form errors and try again.'
      };
    }

    // Format email content
    const emailContent = formatEmailContent(formData);
    
    // Phase 1: Simulate email sending
    await simulateEmailDelay(2000);
    
    // Log email content for development
    console.log('Email would be sent:', emailContent);
    
    // Simulate successful email sending
    return {
      success: true,
      message: MESSAGES.CONTACT_SUCCESS,
      data: {
        emailSent: true,
        timestamp: new Date().toISOString(),
        recipient: CONTACT_INFO.email
      }
    };
    
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message
    };
  }
};

// Validate attachment file
export const validateAttachment = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!file) {
    return { isValid: true }; // Attachment is optional
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 5MB'
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPG, PNG, PDF, or DOC files only.'
    };
  }

  return { isValid: true };
};

// Get contact form configuration
export const getContactFormConfig = () => {
  return {
    recipientEmail: CONTACT_INFO.email,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png', 
      'image/jpg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    contactTypes: [
      { value: 'hr-representative', label: 'HR Representative' },
      { value: 'recruiter', label: 'Recruiter' },
      { value: 'manager', label: 'Manager' },
      { value: 'other', label: 'Other' }
    ]
  };
};