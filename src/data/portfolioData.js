// src/data/portfolioData.js

// This file contains static data structure for Phase 1
// In Phase 2-3, this will be replaced with Supabase data fetching

export const portfolioData = {
  // Hero Section Data
  hero: {
    title: "Hi, I'm Raunak Choudhary",
    subtitle: "Full Stack Developer & AWS Cloud Specialist",
    description: "Passionate about building innovative solutions with cutting-edge technologies. Currently pursuing MS in Computer Science at NYU with 3+ years of professional experience.",
    highlights: [
      "AWS Certified Cloud Practitioner",
      "MS Computer Science at NYU (GPA: 3.889/4.0)",
      "3+ Years AWS Developer Experience",
      "Machine Learning & Deep Learning Enthusiast"
    ]
  },

  // About Section Data
  about: {
    aboutMe: {
      title: "About Me",
      content: `I am a dedicated Full Stack Developer and AWS Cloud Specialist with over 3 years of professional experience at Tata Consultancy Services. Currently pursuing my Master's in Computer Science at NYU Tandon School of Engineering with a GPA of 3.889/4.0.

My passion lies in developing robust, scalable applications and cloud-native solutions. I have led infrastructure teams, reduced system downtime by 20%, and enhanced deployment efficiency by 25% through expertise in AWS Cloud Development and Infrastructure as Code.

I'm actively expanding my skills in Machine Learning, Deep Learning, and Adversarial AI while building diverse applications that solve real-world problems. My goal is to leverage technology to create meaningful impact in the digital world.`
    },
    basicInfo: {
      title: "Basic Info",
      details: {
        birthDate: "17 March 1998",
        currentResidence: "New York, United States",
        permanentResidence: "Rajasthan, India",
        nationality: "Indian",
        languages: "English, Hindi",
        availability: "Available for internships, full time jobs and other opportunities",
        visaStatus: "F-1 Student Visa, requires sponsorship for full-time roles",
        timeZoneRelocate: "EST (Willing to relocate globally)",
        workAuthorization: "CPT authorized for Summer 2025 | OPT available from May 2026",
        pronouns: "He/Him"
      }
    }
  },

  // Contact Information
  contact: {
    email: "raunakchoudhary17@gmail.com",
    phone: "+1 (929) 289-4648",
    location: "New York, USA",
    linkedin: "https://www.linkedin.com/in/raunak-choudhary",
    github: "https://github.com/raunak-choudhary"
  }
};

// Section Data Templates (will show "No information present" initially)
export const sectionTemplates = {
  projects: {
    title: "Projects",
    description: "Showcase of my technical projects and applications",
    items: [] // Will be populated from backend
  },
  
  internships: {
    title: "Internships",
    description: "Professional internship experiences and learning journey",
    items: []
  },
  
  education: {
    title: "Education",
    description: "Academic background and qualifications",
    items: []
  },
  
  workExperience: {
    title: "Work Experience",
    description: "Professional work history and achievements",
    items: []
  },
  
  skills: {
    title: "Skills & Competencies",
    description: "Technical skills and expertise areas",
    categories: []
  },
  
  certifications: {
    title: "Certifications & Badges",
    description: "Professional certifications and credentials",
    items: []
  },
  
  recommendations: {
    title: "LinkedIn Recommendations",
    description: "Professional recommendations and testimonials",
    items: []
  },
  
  achievements: {
    title: "Achievements & Awards",
    description: "Recognition and accomplishments",
    items: []
  },
  
  leadership: {
    title: "Leadership/Volunteering Positions",
    description: "Leadership roles and volunteer experiences",
    items: []
  }
};