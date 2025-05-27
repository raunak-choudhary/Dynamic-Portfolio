// src/services/dataService.js

// Complete data service with real Hero & About APIs
// Phase 2B-17.2: Hero & About APIs fully integrated
// Other sections still return static data until Phase 2B completion

import { supabase } from './supabaseClient';
import { getCurrentAdmin, requireAdminAuth } from './authService';
import { portfolioData, sectionTemplates } from '../data/portfolioData';
import { MESSAGES } from '../utils/constants';

// Simulate API delay for realistic loading experience
const simulateApiDelay = (ms = 500) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Generic error handler
const handleApiError = (error, context = 'API') => {
  console.error(`${context} Error:`, error);
  throw new Error(`${context} operation failed. Please try again.`);
};

// =====================================================
// HERO CONTENT APIs (Real Supabase Integration)
// =====================================================

// Get Hero Content - Public Access
export const getHeroData = async () => {
  try {
    await simulateApiDelay(300);
    
    const { data, error } = await supabase
      .from('hero_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('Hero data fetch error:', error);
      // Fallback to static data if no database content
      return {
        success: true,
        data: portfolioData.hero,
        message: 'Using default hero content'
      };
    }

    return {
      success: true,
      data: data || portfolioData.hero
    };
  } catch (error) {
    console.warn('getHeroData error:', error);
    // Fallback to static data on error
    return {
      success: true,
      data: portfolioData.hero,
      message: 'Using fallback hero content'
    };
  }
};

// Create Hero Content - Admin Only
export const createHeroContent = async (heroData) => {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('hero_content')
      .insert([{
        title: heroData.title,
        subtitle: heroData.subtitle,
        description: heroData.description,
        highlights: heroData.highlights || [],
        cta_text: heroData.cta_text,
        cta_link: heroData.cta_link,
        is_active: heroData.is_active !== undefined ? heroData.is_active : true
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create hero content: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Hero content created successfully'
    };
  } catch (error) {
    return handleApiError(error, 'Create Hero Content');
  }
};

// Update Hero Content - Admin Only
export const updateHeroContent = async (id, heroData) => {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('hero_content')
      .update({
        title: heroData.title,
        subtitle: heroData.subtitle,
        description: heroData.description,
        highlights: heroData.highlights || [],
        cta_text: heroData.cta_text,
        cta_link: heroData.cta_link,
        is_active: heroData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update hero content: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'Hero content updated successfully'
    };
  } catch (error) {
    return handleApiError(error, 'Update Hero Content');
  }
};

// =====================================================
// ABOUT CONTENT APIs (Real Supabase Integration)
// =====================================================

// Get About Content - Public Access
export const getAboutData = async () => {
  try {
    await simulateApiDelay(300);
    
    const { data, error } = await supabase
      .from('about_content')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.warn('About data fetch error:', error);
      // Fallback to static data if no database content
      return {
        success: true,
        data: portfolioData.about,
        message: 'Using default about content'
      };
    }

    return {
      success: true,
      data: data || portfolioData.about
    };
  } catch (error) {
    console.warn('getAboutData error:', error);
    // Fallback to static data on error
    return {
      success: true,
      data: portfolioData.about,
      message: 'Using fallback about content'
    };
  }
};

// Update About Content - Admin Only
export const updateAboutContent = async (id, aboutData) => {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    const { data, error } = await supabase
      .from('about_content')
      .update({
        about_me_title: aboutData.about_me_title || 'About Me',
        about_me_content: aboutData.about_me_content,
        basic_info_title: aboutData.basic_info_title || 'Basic Info',
        basic_info: aboutData.basic_info || {},
        profile_image_about: aboutData.profile_image_about,
        profile_image_info: aboutData.profile_image_info,
        profile_image_url: aboutData.profile_image_url,
        is_active: aboutData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update about content: ${error.message}`);
    }

    return {
      success: true,
      data: data,
      message: 'About content updated successfully'
    };
  } catch (error) {
    return handleApiError(error, 'Update About Content');
  }
};

// Upload Profile Image - Admin Only
export const uploadProfileImage = async (file, imageType = 'general') => {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, JPG, and PNG files are allowed');
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${imageType}-profile-${timestamp}.${fileExtension}`;
    const filePath = `about/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    return {
      success: true,
      data: {
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type
      },
      message: 'Profile image uploaded successfully'
    };

  } catch (error) {
    return handleApiError(error, 'Upload Profile Image');
  }
};

// Delete Profile Image - Admin Only
export const deleteProfileImage = async (filePath) => {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    const { error } = await supabase.storage
      .from('profile-images')
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    return {
      success: true,
      message: 'Profile image deleted successfully'
    };

  } catch (error) {
    return handleApiError(error, 'Delete Profile Image');
  }
};

// =====================================================
// EXISTING STATIC APIs (Unchanged for other sections)
// =====================================================


// Projects Data (Real Supabase Integration - Updated in Phase 2B-18.1)
export const getProjectsData = async () => {
  // This function is deprecated - use getProjects() instead
  console.warn('getProjectsData is deprecated, use getProjects() instead');
  return await getProjects();
};

// Internships Data (Real Supabase Integration - Updated in Phase 2B-18.2)
export const getInternshipsData = async () => {
  // This function is deprecated - use getInternships() instead
  console.warn('getInternshipsData is deprecated, use getInternships() instead');
  return await getInternships();
};

// Education Data (Real Supabase Integration - Updated in Phase 2B-18.2)
export const getEducationData = async () => {
  // This function is deprecated - use getEducation() instead
  console.warn('getEducationData is deprecated, use getEducation() instead');
  return await getEducation();
};

// Work Experience Data (Real Supabase Integration - Updated in Phase 2B-18.2)
export const getWorkExperienceData = async () => {
  // This function is deprecated - use getWorkExperience() instead
  console.warn('getWorkExperienceData is deprecated, use getWorkExperience() instead');
  return await getWorkExperience();
};

// Skills Data (Still static - will be updated in Phase 2B-18.3)
export const getSkillsData = async () => {
  try {
    await simulateApiDelay(500);
    return {
      success: true,
      data: sectionTemplates.skills.categories,
      message: sectionTemplates.skills.categories.length === 0 ? MESSAGES.NO_DATA : null
    };
  } catch (error) {
    return handleApiError(error, 'Skills Data');
  }
};

// Certifications Data (Still static - will be updated in Phase 2B-18.3)
export const getCertificationsData = async () => {
  try {
    await simulateApiDelay(500);
    return {
      success: true,
      data: sectionTemplates.certifications.items,
      message: sectionTemplates.certifications.items.length === 0 ? MESSAGES.NO_DATA : null
    };
  } catch (error) {
    return handleApiError(error, 'Certifications Data');
  }
};

// Recommendations Data (Real Supabase Integration - Updated in Phase 2B-19.1)
export const getRecommendationsData = async () => {
  // This function is deprecated - use getRecommendations() instead
  console.warn('getRecommendationsData is deprecated, use getRecommendations() instead');
  return await getRecommendations();
};

// Achievements Data (Still static - will be updated in Phase 2B-19.1)
export const getAchievementsData = async () => {
  try {
    await simulateApiDelay(500);
    return {
      success: true,
      data: sectionTemplates.achievements.items,
      message: sectionTemplates.achievements.items.length === 0 ? MESSAGES.NO_DATA : null
    };
  } catch (error) {
    return handleApiError(error, 'Achievements Data');
  }
};

// Leadership Data (Real Supabase Integration - Updated in Phase 2B-19.2)
export const getLeadershipData = async () => {
  console.warn('getLeadershipData is deprecated, use getLeadership() instead');
  return await getLeadership();
};

// Contact Information (Real Supabase Integration - Updated in Phase 2B-19.2)
export const getContactData = async () => {
  try {
    await simulateApiDelay(300);
    return {
      success: true,
      data: {
        formConfig: {
          recipientEmail: 'raunakchoudhary17@gmail.com',
          maxFileSize: 5 * 1024 * 1024, // 5MB
          maxFiles: 5,
          allowedFileTypes: [
            'application/pdf',
            'image/jpeg', 'image/jpg', 'image/png',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          roleOptions: [
            { value: 'recruiter', label: 'Recruiter' },
            { value: 'hr-manager', label: 'HR Manager' },
            { value: 'hiring-manager', label: 'Hiring Manager' },
            { value: 'technical-lead', label: 'Technical Lead' },
            { value: 'developer', label: 'Developer' },
            { value: 'startup-founder', label: 'Startup Founder' },
            { value: 'student', label: 'Student' },
            { value: 'other', label: 'Other' }
          ],
          inquiryTypes: [
            { value: 'job-opportunity', label: 'Job Opportunity' },
            { value: 'internship-offer', label: 'Internship Offer' },
            { value: 'freelance-project', label: 'Freelance Project' },
            { value: 'collaboration', label: 'Collaboration Opportunity' },
            { value: 'mentorship', label: 'Mentorship' },
            { value: 'speaking-event', label: 'Speaking/Event Invitation' },
            { value: 'networking', label: 'Networking' },
            { value: 'general-inquiry', label: 'General Inquiry' }
          ]
        }
      }
    };
  } catch (error) {
    return handleApiError(error, 'Contact Data');
  }
};

// Generic section data fetcher (Updated with real Projects APIs)
export const getSectionData = async (sectionName) => {
  const dataFetchers = {
    hero: getHeroData, // ✅ Real API
    about: getAboutData, // ✅ Real API
    projects: getProjects, // ✅ Real API
    internships: getInternships, // ✅ Real API
    education: getEducation, // ✅ Real API
    'work-experience': getWorkExperience, // ✅ Real API
    recommendations: getRecommendations, // ✅ Real API
    leadership: getLeadership, // ✅ Real API
    contact: getContactData, // ✅ Static config + Real submission API
    skills: getSkillsData, // 🔄 Still static - Phase 2B-18.3
    certifications: getCertificationsData, // 🔄 Still static - Phase 2B-18.3
    achievements: getAchievementsData // 🔄 Still static - Phase 2B-19.3
  };

  const fetcher = dataFetchers[sectionName];
  if (!fetcher) {
    throw new Error(`Unknown section: ${sectionName}`);
  }

  return await fetcher();
};

// =====================================================
// PROJECTS APIs (Real Supabase Integration)
// =====================================================

// Get All Projects - Public Access
export const getProjects = async () => {
  try {
    console.log('🔍 Fetching all active projects...');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Projects fetch error:', error);
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // Process image URLs for each project
    const processedProjects = data.map(project => ({
      ...project,
      // Ensure image_urls is always an array
      image_urls: Array.isArray(project.image_urls) ? project.image_urls : [],
      // For backward compatibility, set first image as primary
      primary_image: Array.isArray(project.image_urls) && project.image_urls.length > 0 
        ? project.image_urls[0] 
        : null,
      image_count: Array.isArray(project.image_urls) ? project.image_urls.length : 0
    }));

    console.log(`✅ Retrieved ${processedProjects.length} projects`);
    
    return {
      success: true,
      data: processedProjects,
      message: processedProjects.length === 0 ? 'No projects found' : `Found ${processedProjects.length} projects`
    };
  } catch (error) {
    console.error('❌ getProjects error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get Single Project by ID - Public Access
export const getProjectById = async (id) => {
  try {
    console.log('🔍 Fetching project by ID:', id);
    
    if (!id) {
      throw new Error('Project ID is required');
    }

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Project fetch error:', error);
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    console.log('✅ Retrieved project:', data?.title);
    
    return {
      success: true,
      data: data,
      message: 'Project retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getProjectById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Get Featured Projects - Public Access
export const getFeaturedProjects = async () => {
  try {
    console.log('🔍 Fetching featured projects...');
    
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .eq('featured', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Featured projects fetch error:', error);
      throw new Error(`Failed to fetch featured projects: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} featured projects`);
    
    return {
      success: true,
      data: data || [],
      message: data?.length === 0 ? 'No featured projects found' : `Found ${data.length} featured projects`
    };
  } catch (error) {
    console.error('❌ getFeaturedProjects error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Create New Project - Admin Only
export const createProject = async (projectData) => {
  try {
    console.log('📝 Creating new project...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields
    if (!projectData.title) {
      throw new Error('Project title is required');
    }

    // Prepare project data for database
    const projectInsert = {
      project_number: projectData.project_number || null,
      title: projectData.title,
      short_description: projectData.short_description || null,
      detailed_description: projectData.detailed_description || null,
      technologies: projectData.technologies || [],
      live_url: projectData.live_url || null,
      github_urls: projectData.github_urls || [],
      image_url: projectData.image_url || null,
      featured: projectData.featured || false,
      project_type: projectData.project_type || null,
      duration: projectData.duration || null,
      team_size: projectData.team_size || null,
      key_features: projectData.key_features || [],
      challenges: projectData.challenges || null,
      learnings: projectData.learnings || null,
      order_index: projectData.order_index || null,
      status: projectData.status || 'active'
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([projectInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Project creation error:', error);
      throw new Error(`Failed to create project: ${error.message}`);
    }

    console.log('✅ Project created successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Project created successfully'
    };
  } catch (error) {
    console.error('❌ createProject error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Update Project - Admin Only
export const updateProject = async (id, projectData) => {
  try {
    console.log('📝 Updating project:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Project ID is required');
    }

    // Prepare update data
    const projectUpdate = {
      project_number: projectData.project_number,
      title: projectData.title,
      short_description: projectData.short_description,
      detailed_description: projectData.detailed_description,
      technologies: projectData.technologies || [],
      live_url: projectData.live_url,
      github_urls: projectData.github_urls || [],
      image_url: projectData.image_url,
      featured: projectData.featured,
      project_type: projectData.project_type,
      duration: projectData.duration,
      team_size: projectData.team_size,
      key_features: projectData.key_features || [],
      challenges: projectData.challenges,
      learnings: projectData.learnings,
      order_index: projectData.order_index,
      status: projectData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .update(projectUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Project update error:', error);
      throw new Error(`Failed to update project: ${error.message}`);
    }

    console.log('✅ Project updated successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Project updated successfully'
    };
  } catch (error) {
    console.error('❌ updateProject error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Project - Admin Only
export const deleteProject = async (id) => {
  try {
    console.log('🗑️ Deleting project:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Project ID is required');
    }

    // Get project info before deletion for logging
    const { data: projectInfo } = await supabase
      .from('projects')
      .select('title')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Project deletion error:', error);
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    console.log('✅ Project deleted successfully:', projectInfo?.title || id);
    
    return {
      success: true,
      data: { id, title: projectInfo?.title },
      message: 'Project deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteProject error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Reorder Projects - Admin Only
export const reorderProjects = async (orderArray) => {
  try {
    console.log('🔄 Reordering projects...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each project's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('projects')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some project reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} projects`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} projects`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} projects`
    };
  } catch (error) {
    console.error('❌ reorderProjects error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Upload Multiple Project Images - Admin Only
export const uploadProjectImages = async (files, projectId, projectTitle = 'project') => {
  try {
    console.log(`📸 Uploading ${files.length} project images for project: ${projectId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB per file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 10; // Maximum 10 images per project

    // Validate files
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} images allowed per project`);
    }

    for (const file of files) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
      }
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} has invalid type. Only JPEG, JPG, PNG, and WebP are allowed`);
      }
    }

    // Create folder name: project-{projectId}
    const folderName = `project-${projectId}`;
    const sanitizedTitle = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    // Upload all files
    const uploadPromises = files.map(async (file, index) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${sanitizedTitle}-${timestamp}-${index + 1}.${fileExtension}`;
      const filePath = `projects/${folderName}/${fileName}`;

      console.log(`🔄 Uploading: ${fileName}`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`❌ Upload failed for ${fileName}:`, uploadError);
        throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return {
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploadData: uploadData
      };
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    // Extract URLs for database
    const imageUrls = uploadResults.map(result => result.url);

    // Update project with new image URLs
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ 
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded files if database update fails
      await Promise.all(uploadResults.map(result => 
        supabase.storage.from('project-images').remove([result.filePath])
      ));
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully uploaded ${uploadResults.length} images for project ${projectTitle}`);

    return {
      success: true,
      data: {
        projectId: projectId,
        uploadedFiles: uploadResults,
        imageUrls: imageUrls,
        updatedProject: updatedProject
      },
      message: `Successfully uploaded ${uploadResults.length} images`
    };

  } catch (error) {
    console.error('❌ uploadProjectImages error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Get Project Images - Public Access
export const getProjectImages = async (projectId) => {
  try {
    console.log(`🖼️ Fetching images for project: ${projectId}`);

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Get project with image URLs
    const { data: project, error } = await supabase
      .from('projects')
      .select('id, title, image_urls')
      .eq('id', projectId)
      .eq('status', 'active')
      .single();

    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    const imageUrls = Array.isArray(project.image_urls) ? project.image_urls : [];

    console.log(`✅ Found ${imageUrls.length} images for project ${project.title}`);

    return {
      success: true,
      data: {
        projectId: projectId,
        projectTitle: project.title,
        imageUrls: imageUrls,
        imageCount: imageUrls.length
      },
      message: `Found ${imageUrls.length} images`
    };

  } catch (error) {
    console.error('❌ getProjectImages error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Project Images - Admin Only
export const deleteProjectImages = async (projectId, imageUrls) => {
  try {
    console.log(`🗑️ Deleting ${imageUrls.length} images for project: ${projectId}`);

    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!projectId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      throw new Error('Project ID and image URLs array are required');
    }

    // Extract file paths from URLs
    const filePaths = imageUrls.map(url => {
      // Extract path from Supabase public URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/project-images/{path}
      const urlParts = url.split('/storage/v1/object/public/project-images/');
      return urlParts.length > 1 ? urlParts[1] : url; 
    });

    // Delete files from storage
    const { error: storageError } = await supabase.storage
      .from('project-images')
      .remove(filePaths);

    if (storageError) {
      console.warn('⚠️ Some files may not have been deleted from storage:', storageError);
    }

    // Get current project image URLs
    const { data: currentProject } = await supabase
      .from('projects')
      .select('image_urls')
      .eq('id', projectId)
      .single();

    if (currentProject) {
      // Remove deleted URLs from project
      const currentUrls = Array.isArray(currentProject.image_urls) ? currentProject.image_urls : [];
      const remainingUrls = currentUrls.filter(url => !imageUrls.includes(url));

      // Update project with remaining URLs
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          image_urls: remainingUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }
    }

    console.log('✅ Project images deleted successfully');

    return {
      success: true,
      data: {
        deletedUrls: imageUrls,
        deletedCount: imageUrls.length
      },
      message: `Successfully deleted ${imageUrls.length} images`
    };

  } catch (error) {
    console.error('❌ deleteProjectImages error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// INTERNSHIPS APIs
// =====================================================

// Get All Internships - Public Access
export const getInternships = async () => {
  try {
    console.log('🔍 Fetching all active internships...');
    
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .order('start_date', { ascending: false });

    if (error) {
      console.error('❌ Internships fetch error:', error);
      throw new Error(`Failed to fetch internships: ${error.message}`);
    }

    // Process certificate URLs for each internship
    const processedInternships = data.map(internship => ({
      ...internship,
      // Ensure certificate_urls is always an array (backward compatibility)
      certificate_urls: Array.isArray(internship.certificate_urls) 
        ? internship.certificate_urls 
        : (internship.certificate_url ? [internship.certificate_url] : []),
      // For backward compatibility, set first certificate as primary
      primary_certificate: Array.isArray(internship.certificate_urls) && internship.certificate_urls.length > 0 
        ? internship.certificate_urls[0] 
        : internship.certificate_url || null,
      certificate_count: Array.isArray(internship.certificate_urls) 
        ? internship.certificate_urls.length 
        : (internship.certificate_url ? 1 : 0)
    }));

    console.log(`✅ Retrieved ${processedInternships.length} internships`);
    
    return {
      success: true,
      data: processedInternships,
      message: processedInternships.length === 0 ? 'No internships found' : `Found ${processedInternships.length} internships`
    };
  } catch (error) {
    console.error('❌ getInternships error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get Single Internship by ID - Public Access
export const getInternshipById = async (id) => {
  try {
    console.log('🔍 Fetching internship by ID:', id);
    
    if (!id) {
      throw new Error('Internship ID is required');
    }

    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Internship fetch error:', error);
      throw new Error(`Failed to fetch internship: ${error.message}`);
    }

    console.log('✅ Retrieved internship:', data?.title);
    
    return {
      success: true,
      data: data,
      message: 'Internship retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getInternshipById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Create New Internship - Admin Only
export const createInternship = async (internshipData) => {
  try {
    console.log('📝 Creating new internship...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields
    if (!internshipData.title || !internshipData.company) {
      throw new Error('Internship title and company are required');
    }

    // Prepare internship data for database
    const internshipInsert = {
      internship_number: internshipData.internship_number || null,
      title: internshipData.title,
      company: internshipData.company,
      company_logo_url: internshipData.company_logo_url || null,
      start_date: internshipData.start_date || null,
      end_date: internshipData.end_date || null,
      duration: internshipData.duration || null,
      location: internshipData.location || null,
      description: internshipData.description || null,
      key_responsibilities: internshipData.key_responsibilities || [],
      technologies: internshipData.technologies || [],
      achievements: internshipData.achievements || [],
      skills_gained: internshipData.skills_gained || [],
      certificate_urls: internshipData.certificate_urls || [],
      internship_type: internshipData.internship_type || null,
      order_index: internshipData.order_index || null,
      status: internshipData.status || 'active'
    };

    const { data, error } = await supabase
      .from('internships')
      .insert([internshipInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Internship creation error:', error);
      throw new Error(`Failed to create internship: ${error.message}`);
    }

    console.log('✅ Internship created successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Internship created successfully'
    };
  } catch (error) {
    console.error('❌ createInternship error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Update Internship - Admin Only
export const updateInternship = async (id, internshipData) => {
  try {
    console.log('📝 Updating internship:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Internship ID is required');
    }

    // Prepare update data
    const internshipUpdate = {
      internship_number: internshipData.internship_number,
      title: internshipData.title,
      company: internshipData.company,
      company_logo_url: internshipData.company_logo_url,
      start_date: internshipData.start_date,
      end_date: internshipData.end_date,
      duration: internshipData.duration,
      location: internshipData.location,
      description: internshipData.description,
      key_responsibilities: internshipData.key_responsibilities || [],
      technologies: internshipData.technologies || [],
      achievements: internshipData.achievements || [],
      skills_gained: internshipData.skills_gained || [],
      certificate_urls: internshipData.certificate_urls || [],
      internship_type: internshipData.internship_type,
      order_index: internshipData.order_index,
      status: internshipData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('internships')
      .update(internshipUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Internship update error:', error);
      throw new Error(`Failed to update internship: ${error.message}`);
    }

    console.log('✅ Internship updated successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Internship updated successfully'
    };
  } catch (error) {
    console.error('❌ updateInternship error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Internship - Admin Only
export const deleteInternship = async (id) => {
  try {
    console.log('🗑️ Deleting internship:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Internship ID is required');
    }

    // Get internship info before deletion for logging
    const { data: internshipInfo } = await supabase
      .from('internships')
      .select('title, company')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Internship deletion error:', error);
      throw new Error(`Failed to delete internship: ${error.message}`);
    }

    console.log('✅ Internship deleted successfully:', internshipInfo?.title || id);
    
    return {
      success: true,
      data: { id, title: internshipInfo?.title, company: internshipInfo?.company },
      message: 'Internship deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteInternship error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Reorder Internships - Admin Only
export const reorderInternships = async (orderArray) => {
  try {
    console.log('🔄 Reordering internships...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each internship's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('internships')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some internship reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} internships`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} internships`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} internships`
    };
  } catch (error) {
    console.error('❌ reorderInternships error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// INTERNSHIP FILE UPLOAD APIs
// =====================================================

// Upload Company Logo - Admin Only
export const uploadCompanyLogo = async (file, internshipId, companyName = 'company') => {
  try {
    console.log(`🏢 Uploading company logo for internship: ${internshipId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!file || !internshipId) {
      throw new Error('File and internship ID are required');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validate file
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, JPG, PNG, and WebP files are allowed');
    }

    // Create folder path: organization-logos/internships/internship_{id}/
    const sanitizedCompany = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${sanitizedCompany}-logo-${timestamp}.${fileExtension}`;
    const filePath = `internships/internship_${internshipId}/${fileName}`;

    console.log(`🔄 Uploading: ${fileName} to organization-logos bucket`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${fileName}:`, uploadError);
      throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(filePath);

    // Update internship with logo URL
    const { error: updateError } = await supabase
      .from('internships')
      .update({ 
        company_logo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', internshipId);

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded file if database update fails
      await supabase.storage.from('organization-logos').remove([filePath]);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Company logo uploaded successfully for internship`);

    return {
      success: true,
      data: {
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type
      },
      message: 'Company logo uploaded successfully'
    };

  } catch (error) {
    console.error('❌ uploadCompanyLogo error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Upload Multiple Internship Certificates - Admin Only
export const uploadInternshipCertificates = async (files, internshipId, internshipTitle = 'internship') => {
  try {
    console.log(`📜 Uploading ${files.length} certificates for internship: ${internshipId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!files || files.length === 0) {
      throw new Error('No files provided');
    }

    if (!internshipId) {
      throw new Error('Internship ID is required');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB per certificate
    const allowedTypes = [
      'application/pdf',
      'image/jpeg', 
      'image/jpg', 
      'image/png',
      'image/webp'
    ];
    const maxFiles = 5; // Maximum 5 certificates per internship

    // Validate files
    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} certificates allowed per internship`);
    }

    for (const file of files) {
      if (file.size > maxSize) {
        throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
      }
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File ${file.name} has invalid type. Only PDF and image files are allowed`);
      }
    }

    // Create folder name: documents/internships/internship_{id}/
    const sanitizedTitle = internshipTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    // Upload all files
    const uploadPromises = files.map(async (file, index) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${sanitizedTitle}-certificate-${timestamp}-${index + 1}.${fileExtension}`;
      const filePath = `internships/internship_${internshipId}/${fileName}`;

      console.log(`🔄 Uploading certificate: ${fileName}`);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error(`❌ Upload failed for ${fileName}:`, uploadError);
        throw new Error(`Upload failed for ${fileName}: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return {
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        uploadData: uploadData
      };
    });

    // Wait for all uploads to complete
    const uploadResults = await Promise.all(uploadPromises);
    
    // Extract URLs for database
    const certificateUrls = uploadResults.map(result => result.url);

    // Update internship with certificate URLs
    const { data: updatedInternship, error: updateError } = await supabase
      .from('internships')
      .update({ 
        certificate_urls: certificateUrls,
        updated_at: new Date().toISOString()
      })
      .eq('id', internshipId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded files if database update fails
      await Promise.all(uploadResults.map(result => 
        supabase.storage.from('documents').remove([result.filePath])
      ));
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully uploaded ${uploadResults.length} certificates for internship`);

    return {
      success: true,
      data: {
        internshipId: internshipId,
        uploadedFiles: uploadResults,
        certificateUrls: certificateUrls,
        updatedInternship: updatedInternship
      },
      message: `Successfully uploaded ${uploadResults.length} certificates`
    };

  } catch (error) {
    console.error('❌ uploadInternshipCertificates error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Get Internship Certificates - Public Access
export const getInternshipCertificates = async (internshipId) => {
  try {
    console.log(`📜 Fetching certificates for internship: ${internshipId}`);

    if (!internshipId) {
      throw new Error('Internship ID is required');
    }

    // Get internship with certificate URLs
    const { data: internship, error } = await supabase
      .from('internships')
      .select('id, title, company, certificate_urls')
      .eq('id', internshipId)
      .eq('status', 'active')
      .single();

    if (error) {
      throw new Error(`Failed to fetch internship: ${error.message}`);
    }

    const certificateUrls = Array.isArray(internship.certificate_urls) ? internship.certificate_urls : [];

    console.log(`✅ Found ${certificateUrls.length} certificates for internship ${internship.title}`);

    return {
      success: true,
      data: {
        internshipId: internshipId,
        internshipTitle: internship.title,
        company: internship.company,
        certificateUrls: certificateUrls,
        certificateCount: certificateUrls.length
      },
      message: `Found ${certificateUrls.length} certificates`
    };

  } catch (error) {
    console.error('❌ getInternshipCertificates error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Internship Certificates - Admin Only
export const deleteInternshipCertificates = async (internshipId, certificateUrls) => {
  try {
    console.log(`🗑️ Deleting ${certificateUrls.length} certificates for internship: ${internshipId}`);

    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!internshipId || !Array.isArray(certificateUrls) || certificateUrls.length === 0) {
      throw new Error('Internship ID and certificate URLs array are required');
    }

    // Extract file paths from URLs
    const filePaths = certificateUrls.map(url => {
      // Extract path from Supabase public URL
      // URL format: https://{project}.supabase.co/storage/v1/object/public/documents/{path}
      const urlParts = url.split('/storage/v1/object/public/documents/');
      return urlParts.length > 1 ? urlParts[1] : url; 
    });

    // Delete files from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove(filePaths);

    if (storageError) {
      console.warn('⚠️ Some files may not have been deleted from storage:', storageError);
    }

    // Get current internship certificate URLs
    const { data: currentInternship } = await supabase
      .from('internships')
      .select('certificate_urls')
      .eq('id', internshipId)
      .single();

    if (currentInternship) {
      // Remove deleted URLs from internship
      const currentUrls = Array.isArray(currentInternship.certificate_urls) ? currentInternship.certificate_urls : [];
      const remainingUrls = currentUrls.filter(url => !certificateUrls.includes(url));

      // Update internship with remaining URLs
      const { error: updateError } = await supabase
        .from('internships')
        .update({ 
          certificate_urls: remainingUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', internshipId);

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`);
      }
    }

    console.log('✅ Internship certificates deleted successfully');

    return {
      success: true,
      data: {
        deletedUrls: certificateUrls,
        deletedCount: certificateUrls.length
      },
      message: `Successfully deleted ${certificateUrls.length} certificates`
    };

  } catch (error) {
    console.error('❌ deleteInternshipCertificates error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// EDUCATION APIs (Real Supabase Integration)
// =====================================================

// Get All Education Records - Public Access
export const getEducation = async () => {
  try {
    console.log('🎓 Fetching all active education records...');
    
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .order('start_date', { ascending: false }); // Most recent first

    if (error) {
      console.error('❌ Education fetch error:', error);
      throw new Error(`Failed to fetch education records: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} education records`);
    
    return {
      success: true,
      data: data || [],
      message: data?.length === 0 ? 'No education records found' : `Found ${data.length} education records`
    };
  } catch (error) {
    console.error('❌ getEducation error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get Single Education Record by ID - Public Access
export const getEducationById = async (id) => {
  try {
    console.log('🎓 Fetching education record by ID:', id);
    
    if (!id) {
      throw new Error('Education ID is required');
    }

    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Education fetch error:', error);
      throw new Error(`Failed to fetch education record: ${error.message}`);
    }

    console.log('✅ Retrieved education record:', data?.degree);
    
    return {
      success: true,
      data: data,
      message: 'Education record retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getEducationById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Create New Education Record - Admin Only
export const createEducation = async (educationData) => {
  try {
    console.log('📝 Creating new education record...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields (UPDATED VALIDATION)
    if (!educationData.degree) {
      throw new Error('Degree is required');
    }
    if (!educationData.college) {
      throw new Error('College/School name is required');
    }

    // Prepare education data for database (UPDATED FIELDS)
    const educationInsert = {
      education_level: educationData.education_level || null,
      degree: educationData.degree,
      institution: educationData.institution || null, // NOW OPTIONAL
      college: educationData.college, // NOW MANDATORY
      institution_logo_url: educationData.institution_logo_url || null,
      start_date: educationData.start_date || null,
      end_date: educationData.end_date || null,
      gpa_received: educationData.gpa_received || null,
      max_gpa_scale: educationData.max_gpa_scale || null,
      location: educationData.location || null,
      description: educationData.description || null,
      major: educationData.major || null,
      minor: educationData.minor || null,
      coursework: educationData.coursework || [],
      achievements: educationData.achievements || [],
      activities: educationData.activities || [],
      thesis_title: educationData.thesis_title || null,
      degree_type: educationData.degree_type || null,
      education_status: educationData.education_status || 'completed',
      order_index: educationData.order_index || null,
      status: educationData.status || 'active'
    };

    const { data, error } = await supabase
      .from('education')
      .insert([educationInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Education creation error:', error);
      throw new Error(`Failed to create education record: ${error.message}`);
    }

    console.log('✅ Education record created successfully:', data.degree, 'at', data.college);
    
    return {
      success: true,
      data: data,
      message: 'Education record created successfully'
    };
  } catch (error) {
    console.error('❌ createEducation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Update Education Record - Admin Only
export const updateEducation = async (id, educationData) => {
  try {
    console.log('📝 Updating education record:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Education ID is required');
    }

    // Prepare update data (UPDATED FIELDS)
    const educationUpdate = {
      education_level: educationData.education_level,
      degree: educationData.degree,
      institution: educationData.institution, // NOW OPTIONAL (can be null)
      college: educationData.college, // NOW MANDATORY
      institution_logo_url: educationData.institution_logo_url,
      start_date: educationData.start_date,
      end_date: educationData.end_date,
      gpa_received: educationData.gpa_received,
      max_gpa_scale: educationData.max_gpa_scale,
      location: educationData.location,
      description: educationData.description,
      major: educationData.major,
      minor: educationData.minor,
      coursework: educationData.coursework || [],
      achievements: educationData.achievements || [],
      activities: educationData.activities || [],
      thesis_title: educationData.thesis_title,
      degree_type: educationData.degree_type,
      education_status: educationData.education_status,
      order_index: educationData.order_index,
      status: educationData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('education')
      .update(educationUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Education update error:', error);
      throw new Error(`Failed to update education record: ${error.message}`);
    }

    console.log('✅ Education record updated successfully:', data.degree, 'at', data.college);
    
    return {
      success: true,
      data: data,
      message: 'Education record updated successfully'
    };
  } catch (error) {
    console.error('❌ updateEducation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Education Record - Admin Only
export const deleteEducation = async (id) => {
  try {
    console.log('🗑️ Deleting education record:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Education ID is required');
    }

    // Get education info before deletion for logging (UPDATED FIELDS)
    const { data: educationInfo } = await supabase
      .from('education')
      .select('degree, institution, college')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Education deletion error:', error);
      throw new Error(`Failed to delete education record: ${error.message}`);
    }

    console.log('✅ Education record deleted successfully:', 
      educationInfo?.degree || id, 
      'at', 
      educationInfo?.college || educationInfo?.institution || 'Unknown'
    );
    
    return {
      success: true,
      data: { 
        id, 
        degree: educationInfo?.degree, 
        institution: educationInfo?.institution,
        college: educationInfo?.college 
      },
      message: 'Education record deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteEducation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Reorder Education Records - Admin Only
export const reorderEducation = async (orderArray) => {
  try {
    console.log('🔄 Reordering education records...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each education record's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('education')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some education reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} education records`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} education records`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} education records`
    };
  } catch (error) {
    console.error('❌ reorderEducation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Upload Institution Logo - Admin Only
export const uploadInstitutionLogo = async (file, educationId, institutionName = 'institution') => {
  try {
    console.log(`🏫 Uploading institution logo for education: ${educationId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!file) {
      throw new Error('No file provided');
    }

    if (!educationId) {
      throw new Error('Education ID is required');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validate file
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed');
    }

    // Create folder and file naming (UPDATED NAMING LOGIC)
    const folderName = `education_${educationId}`;
    const sanitizedName = institutionName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${sanitizedName}-logo-${timestamp}.${fileExtension}`;
    const filePath = `education/${folderName}/${fileName}`;

    console.log(`🔄 Uploading logo: ${fileName}`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Logo upload failed:`, uploadError);
      throw new Error(`Logo upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(filePath);

    // Update education record with logo URL
    const { data: updatedEducation, error: updateError } = await supabase
      .from('education')
      .update({ 
        institution_logo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', educationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded file if database update fails
      await supabase.storage.from('organization-logos').remove([filePath]);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully uploaded logo for ${institutionName}`);

    return {
      success: true,
      data: {
        educationId: educationId,
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        updatedEducation: updatedEducation
      },
      message: 'Institution logo uploaded successfully'
    };

  } catch (error) {
    console.error('❌ uploadInstitutionLogo error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// WORK EXPERIENCE APIs (Real Supabase Integration)
// Phase 2B-18.2: Work Experience APIs
// =====================================================

// Get All Work Experiences - Public Access
export const getWorkExperience = async () => {
  try {
    console.log('🔍 Fetching all work experiences...');
    
    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .order('start_date', { ascending: false }); // Most recent first

    if (error) {
      console.error('❌ Work experience fetch error:', error);
      throw new Error(`Failed to fetch work experience: ${error.message}`);
    }

    // Process the data for frontend consumption
    const processedWorkExperience = data.map(work => ({
      ...work,
      // Ensure arrays are always arrays
      key_responsibilities: Array.isArray(work.key_responsibilities) ? work.key_responsibilities : [],
      achievements: Array.isArray(work.achievements) ? work.achievements : [],
      technologies: Array.isArray(work.technologies) ? work.technologies : [],
      clients_served: Array.isArray(work.clients_served) ? work.clients_served : [],
      
      // Add computed fields for frontend
      duration: calculateWorkDuration(work.start_date, work.end_date, work.is_current),
      formatted_start_date: formatDate(work.start_date),
      formatted_end_date: work.is_current ? 'Present' : formatDate(work.end_date),
      
      // Company logo fallback
      company_initials: generateCompanyInitials(work.company)
    }));

    console.log(`✅ Retrieved ${processedWorkExperience.length} work experiences`);
    
    return {
      success: true,
      data: processedWorkExperience,
      message: processedWorkExperience.length === 0 ? 'No work experience found' : `Found ${processedWorkExperience.length} work experiences`
    };
  } catch (error) {
    console.error('❌ getWorkExperience error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get Single Work Experience by ID - Public Access
export const getWorkExperienceById = async (id) => {
  try {
    console.log('🔍 Fetching work experience by ID:', id);
    
    if (!id) {
      throw new Error('Work experience ID is required');
    }

    const { data, error } = await supabase
      .from('work_experience')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Work experience fetch error:', error);
      throw new Error(`Failed to fetch work experience: ${error.message}`);
    }

    console.log('✅ Retrieved work experience:', data?.title);
    
    return {
      success: true,
      data: data,
      message: 'Work experience retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getWorkExperienceById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Create New Work Experience - Admin Only
export const createWorkExperience = async (workData) => {
  try {
    console.log('📝 Creating new work experience...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields
    if (!workData.title) {
      throw new Error('Job title is required');
    }
    if (!workData.company) {
      throw new Error('Company name is required');
    }

    // Prepare work experience data for database
    const workInsert = {
      job_number: workData.job_number || null,
      title: workData.title,
      company: workData.company,
      company_logo_url: workData.company_logo_url || null,
      employment_type: workData.employment_type || null,
      start_date: workData.start_date || null,
      end_date: workData.end_date || null,
      location: workData.location || null,
      is_current: workData.is_current || false,
      description: workData.description || null,
      key_responsibilities: workData.key_responsibilities || [],
      achievements: workData.achievements || [],
      technologies: workData.technologies || [],
      team_size: workData.team_size || null,
      clients_served: workData.clients_served || [],
      salary_range: workData.salary_range || null,
      department: workData.department || null,
      performance_rating: workData.performance_rating || null,
      reason_for_leaving: workData.reason_for_leaving || null,
      order_index: workData.order_index || null,
      status: workData.status || 'active'
    };

    const { data, error } = await supabase
      .from('work_experience')
      .insert([workInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Work experience creation error:', error);
      throw new Error(`Failed to create work experience: ${error.message}`);
    }

    console.log('✅ Work experience created successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Work experience created successfully'
    };
  } catch (error) {
    console.error('❌ createWorkExperience error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Update Work Experience - Admin Only
export const updateWorkExperience = async (id, workData) => {
  try {
    console.log('📝 Updating work experience:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Work experience ID is required');
    }

    // Prepare update data
    const workUpdate = {
      job_number: workData.job_number,
      title: workData.title,
      company: workData.company,
      company_logo_url: workData.company_logo_url,
      employment_type: workData.employment_type,
      start_date: workData.start_date,
      end_date: workData.end_date,
      location: workData.location,
      is_current: workData.is_current,
      description: workData.description,
      key_responsibilities: workData.key_responsibilities || [],
      achievements: workData.achievements || [],
      technologies: workData.technologies || [],
      team_size: workData.team_size,
      clients_served: workData.clients_served || [],
      salary_range: workData.salary_range,
      department: workData.department,
      performance_rating: workData.performance_rating,
      reason_for_leaving: workData.reason_for_leaving,
      order_index: workData.order_index,
      status: workData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('work_experience')
      .update(workUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Work experience update error:', error);
      throw new Error(`Failed to update work experience: ${error.message}`);
    }

    console.log('✅ Work experience updated successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Work experience updated successfully'
    };
  } catch (error) {
    console.error('❌ updateWorkExperience error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Work Experience - Admin Only
export const deleteWorkExperience = async (id) => {
  try {
    console.log('🗑️ Deleting work experience:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Work experience ID is required');
    }

    // Get work experience info before deletion for logging
    const { data: workInfo } = await supabase
      .from('work_experience')
      .select('title, company')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('work_experience')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Work experience deletion error:', error);
      throw new Error(`Failed to delete work experience: ${error.message}`);
    }

    console.log('✅ Work experience deleted successfully:', workInfo?.title || id);
    
    return {
      success: true,
      data: { id, title: workInfo?.title, company: workInfo?.company },
      message: 'Work experience deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteWorkExperience error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Reorder Work Experiences - Admin Only
export const reorderWorkExperience = async (orderArray) => {
  try {
    console.log('🔄 Reordering work experiences...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each work experience's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('work_experience')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some work experience reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} work experiences`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} work experiences`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} work experiences`
    };
  } catch (error) {
    console.error('❌ reorderWorkExperience error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Upload Company Logo - Admin Only
export const uploadWorkCompanyLogo = async (file, workId, companyName = 'company') => {
  try {
    console.log(`📸 Uploading work company logo for work experience: ${workId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!file) {
      throw new Error('No file provided');
    }

    if (!workId) {
      throw new Error('Work experience ID is required');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validate file
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, JPG, PNG, and WebP files are allowed');
    }

    // Create folder path: organization-logos/work/work_{workId}/
    const folderName = `work/work_${workId}`;
    const sanitizedCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${sanitizedCompanyName}-logo-${timestamp}.${fileExtension}`;
    const filePath = `${folderName}/${fileName}`;

    console.log(`🔄 Uploading logo: ${fileName} to organization-logos bucket`);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('organization-logos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Logo upload failed for ${fileName}:`, uploadError);
      throw new Error(`Logo upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('organization-logos')
      .getPublicUrl(filePath);

    // Update work experience with logo URL
    const { data: updatedWork, error: updateError } = await supabase
      .from('work_experience')
      .update({ 
        company_logo_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', workId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded file if database update fails
      await supabase.storage
        .from('organization-logos')
        .remove([filePath]);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully uploaded logo for ${companyName}`);

    return {
      success: true,
      data: {
        workId: workId,
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        updatedWork: updatedWork
      },
      message: 'Company logo uploaded successfully'
    };

  } catch (error) {
    console.error('❌ uploadWorkCompanyLogo error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Company Logo - Admin Only
export const deleteWorkCompanyLogo = async (workId) => {
  try {
    console.log(`🗑️ Deleting work company logo for work experience: ${workId}`);

    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!workId) {
      throw new Error('Work experience ID is required');
    }

    // Get current work experience to find logo URL
    const { data: currentWork } = await supabase
      .from('work_experience')
      .select('company_logo_url')
      .eq('id', workId)
      .single();

    if (currentWork?.company_logo_url) {
      // Extract file path from URL
      const urlParts = currentWork.company_logo_url.split('/storage/v1/object/public/organization-logos/');
      const filePath = urlParts.length > 1 ? urlParts[1] : null;

      if (filePath) {
        // Delete file from storage
        const { error: storageError } = await supabase.storage
          .from('organization-logos')
          .remove([filePath]);

        if (storageError) {
          console.warn('⚠️ Logo file may not have been deleted from storage:', storageError);
        }
      }
    }

    // Update work experience to remove logo URL
    const { error: updateError } = await supabase
      .from('work_experience')
      .update({ 
        company_logo_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', workId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Company logo deleted successfully');

    return {
      success: true,
      data: { workId },
      message: 'Company logo deleted successfully'
    };

  } catch (error) {
    console.error('❌ deleteWorkCompanyLogo error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// HELPER FUNCTIONS FOR WORK EXPERIENCE
// =====================================================

// Calculate work duration
const calculateWorkDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return 'N/A';
  
  try {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : new Date(endDate);
    
    if (!end || isNaN(end.getTime())) return 'N/A';
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.round(diffDays / 30);
    const diffYears = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    
    if (diffYears > 0) {
      if (remainingMonths > 0) {
        return `${diffYears} year${diffYears > 1 ? 's' : ''} ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
      }
      return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    }
    
    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
    
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  } catch (error) {
    return 'N/A';
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  } catch (error) {
    return dateString || 'N/A';
  }
};

// Generate company initials for fallback logo
const generateCompanyInitials = (companyName) => {
  if (!companyName) return 'CO';
  
  const words = companyName.split(' ').filter(word => word.length > 0);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
};

// =====================================================
// RECOMMENDATIONS APIs (Real Supabase Integration)
// =====================================================

/**
 * Get All Recommendations - Public Access
 */
export const getRecommendations = async () => {
  try {
    console.log('🔍 Fetching all public recommendations...');
    
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Recommendations fetch error:', error);
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    // Process recommendations data
    const processedRecommendations = data.map(recommendation => ({
      ...recommendation,
      // Ensure word_count is calculated if not stored
      word_count: recommendation.word_count || 
                  (recommendation.content ? recommendation.content.split(' ').length : 0),
      // Format date for display
      formatted_date: recommendation.date_received ? 
                     formatRecommendationDate(recommendation.date_received) : null,
      // Generate initials for avatar fallback
      recommender_initials: generateInitials(recommendation.recommender_name),
      // Check if LinkedIn URL is valid
      has_linkedin: isValidLinkedInUrl(recommendation.linkedin_profile_url)
    }));

    console.log(`✅ Retrieved ${processedRecommendations.length} recommendations`);
    
    return {
      success: true,
      data: processedRecommendations,
      message: processedRecommendations.length === 0 
        ? 'No recommendations found' 
        : `Found ${processedRecommendations.length} recommendations`
    };
  } catch (error) {
    console.error('❌ getRecommendations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get Single Recommendation by ID - Public Access
 */
export const getRecommendationById = async (id) => {
  try {
    console.log('🔍 Fetching recommendation by ID:', id);
    
    if (!id) {
      throw new Error('Recommendation ID is required');
    }

    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .eq('is_public', true)
      .single();

    if (error) {
      console.error('❌ Recommendation fetch error:', error);
      throw new Error(`Failed to fetch recommendation: ${error.message}`);
    }

    console.log('✅ Retrieved recommendation:', data?.recommender_name);
    
    return {
      success: true,
      data: data,
      message: 'Recommendation retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getRecommendationById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Get Featured Recommendations - Public Access
 */
export const getFeaturedRecommendations = async () => {
  try {
    console.log('🔍 Fetching featured recommendations...');
    
    const { data, error } = await supabase
      .from('recommendations')
      .select('*')
      .eq('status', 'active')
      .eq('is_public', true)
      .eq('is_featured', true)
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Featured recommendations fetch error:', error);
      throw new Error(`Failed to fetch featured recommendations: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} featured recommendations`);
    
    return {
      success: true,
      data: data || [],
      message: data?.length === 0 
        ? 'No featured recommendations found' 
        : `Found ${data.length} featured recommendations`
    };
  } catch (error) {
    console.error('❌ getFeaturedRecommendations error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Create New Recommendation - Admin Only
 */
export const createRecommendation = async (recommendationData) => {
  try {
    console.log('📝 Creating new recommendation...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields
    if (!recommendationData.recommender_name) {
      throw new Error('Recommender name is required');
    }

    if (!recommendationData.content) {
      throw new Error('Recommendation content is required');
    }

    // Calculate word count
    const wordCount = recommendationData.content.split(' ').length;

    // Prepare recommendation data for database
    const recommendationInsert = {
      recommendation_number: recommendationData.recommendation_number || null,
      recommender_name: recommendationData.recommender_name,
      recommender_title: recommendationData.recommender_title || null,
      organization: recommendationData.organization || null,
      relationship: recommendationData.relationship || null,
      content: recommendationData.content,
      linkedin_profile_url: recommendationData.linkedin_profile_url || null,
      profile_image_url: recommendationData.profile_image_url || null,
      date_received: recommendationData.date_received || null,
      recommendation_type: recommendationData.recommendation_type || 'LinkedIn',
      rating: recommendationData.rating || null,
      is_featured: recommendationData.is_featured || false,
      is_public: recommendationData.is_public !== undefined ? recommendationData.is_public : true,
      word_count: wordCount,
      order_index: recommendationData.order_index || null,
      status: recommendationData.status || 'active'
    };

    const { data, error } = await supabase
      .from('recommendations')
      .insert([recommendationInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Recommendation creation error:', error);
      throw new Error(`Failed to create recommendation: ${error.message}`);
    }

    console.log('✅ Recommendation created successfully:', data.recommender_name);
    
    return {
      success: true,
      data: data,
      message: 'Recommendation created successfully'
    };
  } catch (error) {
    console.error('❌ createRecommendation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Update Recommendation - Admin Only
 */
export const updateRecommendation = async (id, recommendationData) => {
  try {
    console.log('📝 Updating recommendation:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Recommendation ID is required');
    }

    // Calculate word count if content is being updated
    const wordCount = recommendationData.content ? 
      recommendationData.content.split(' ').length : undefined;

    // Prepare update data
    const recommendationUpdate = {
      recommendation_number: recommendationData.recommendation_number,
      recommender_name: recommendationData.recommender_name,
      recommender_title: recommendationData.recommender_title,
      organization: recommendationData.organization,
      relationship: recommendationData.relationship,
      content: recommendationData.content,
      linkedin_profile_url: recommendationData.linkedin_profile_url,
      profile_image_url: recommendationData.profile_image_url,
      date_received: recommendationData.date_received,
      recommendation_type: recommendationData.recommendation_type,
      rating: recommendationData.rating,
      is_featured: recommendationData.is_featured,
      is_public: recommendationData.is_public,
      word_count: wordCount,
      order_index: recommendationData.order_index,
      status: recommendationData.status,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(recommendationUpdate).forEach(key => {
      if (recommendationUpdate[key] === undefined) {
        delete recommendationUpdate[key];
      }
    });

    const { data, error } = await supabase
      .from('recommendations')
      .update(recommendationUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Recommendation update error:', error);
      throw new Error(`Failed to update recommendation: ${error.message}`);
    }

    console.log('✅ Recommendation updated successfully:', data.recommender_name);
    
    return {
      success: true,
      data: data,
      message: 'Recommendation updated successfully'
    };
  } catch (error) {
    console.error('❌ updateRecommendation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Delete Recommendation - Admin Only
 */
export const deleteRecommendation = async (id) => {
  try {
    console.log('🗑️ Deleting recommendation:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Recommendation ID is required');
    }

    // Get recommendation info before deletion for cleanup
    const { data: recommendationInfo } = await supabase
      .from('recommendations')
      .select('recommender_name, profile_image_url')
      .eq('id', id)
      .single();

    // Delete associated profile image if exists
    if (recommendationInfo?.profile_image_url) {
      console.log('🧹 Cleaning up associated profile image...');
      await deleteRecommenderPhoto(id, recommendationInfo.profile_image_url);
    }

    const { error } = await supabase
      .from('recommendations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Recommendation deletion error:', error);
      throw new Error(`Failed to delete recommendation: ${error.message}`);
    }

    console.log('✅ Recommendation deleted successfully:', recommendationInfo?.recommender_name || id);
    
    return {
      success: true,
      data: { id, recommender_name: recommendationInfo?.recommender_name },
      message: 'Recommendation deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteRecommendation error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Reorder Recommendations - Admin Only
 */
export const reorderRecommendations = async (orderArray) => {
  try {
    console.log('🔄 Reordering recommendations...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each recommendation's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('recommendations')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some recommendation reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} recommendations`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} recommendations`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} recommendations`
    };
  } catch (error) {
    console.error('❌ reorderRecommendations error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Upload Recommender Profile Photo - Admin Only
 */
export const uploadRecommenderPhoto = async (file, recommendationId, recommenderName = 'recommender') => {
  try {
    console.log(`📸 Uploading recommender photo for recommendation: ${recommendationId}`);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate inputs
    if (!file) {
      throw new Error('No file provided');
    }

    if (!recommendationId) {
      throw new Error('Recommendation ID is required');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Validate file
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed');
    }

    // Create folder and file naming
    const folderName = `recommendations/recommendation_${recommendationId}`;
    const sanitizedName = recommenderName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `recommender-photo-${sanitizedName}-${timestamp}.${fileExtension}`;
    const filePath = `${folderName}/${fileName}`;

    console.log(`🔄 Uploading: ${fileName}`);

    // Upload to Supabase Storage - documents bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error(`❌ Upload failed for ${fileName}:`, uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    // Update recommendation with new profile image URL
    const { data: updatedRecommendation, error: updateError } = await supabase
      .from('recommendations')
      .update({ 
        profile_image_url: urlData.publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', recommendationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Database update error:', updateError);
      // Clean up uploaded file if database update fails
      await supabase.storage.from('documents').remove([filePath]);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log(`✅ Successfully uploaded recommender photo for ${recommenderName}`);

    return {
      success: true,
      data: {
        recommendationId: recommendationId,
        fileName: fileName,
        filePath: filePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
        updatedRecommendation: updatedRecommendation
      },
      message: 'Recommender photo uploaded successfully'
    };

  } catch (error) {
    console.error('❌ uploadRecommenderPhoto error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Delete Recommender Profile Photo - Admin Only
 */
export const deleteRecommenderPhoto = async (recommendationId, imageUrl) => {
  try {
    console.log(`🗑️ Deleting recommender photo for recommendation: ${recommendationId}`);

    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!recommendationId || !imageUrl) {
      throw new Error('Recommendation ID and image URL are required');
    }

    // Extract file path from URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/documents/{path}
    const urlParts = imageUrl.split('/storage/v1/object/public/documents/');
    const filePath = urlParts.length > 1 ? urlParts[1] : imageUrl;

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([filePath]);

    if (storageError) {
      console.warn('⚠️ File may not have been deleted from storage:', storageError);
    }

    // Update recommendation to remove profile image URL
    const { error: updateError } = await supabase
      .from('recommendations')
      .update({ 
        profile_image_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', recommendationId);

    if (updateError) {
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    console.log('✅ Recommender photo deleted successfully');

    return {
      success: true,
      data: {
        recommendationId: recommendationId,
        deletedUrl: imageUrl
      },
      message: 'Recommender photo deleted successfully'
    };

  } catch (error) {
    console.error('❌ deleteRecommenderPhoto error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// =====================================================
// UTILITY FUNCTIONS FOR RECOMMENDATIONS
// =====================================================

/**
 * Format recommendation date for display
 */
const formatRecommendationDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

/**
 * Generate initials from recommender name
 */
const generateInitials = (name) => {
  if (!name) return 'R';
  
  const words = name.split(' ').filter(word => word.length > 0);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
};

/**
 * Validate LinkedIn URL format
 */
const isValidLinkedInUrl = (url) => {
  if (!url) return false;
  
  const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
  return linkedinRegex.test(url);
};

// =====================================================
// LEADERSHIP APIs (Real Supabase Integration)
// Phase 2B-19.2: Leadership APIs Implementation
// =====================================================

// Get All Leadership Positions - Public Access
export const getLeadership = async () => {
  try {
    console.log('🔍 Fetching all active leadership positions...');
    
    const { data, error } = await supabase
      .from('leadership')
      .select('*')
      .eq('status', 'active')
      .order('order_index', { ascending: true })
      .order('start_date', { ascending: false }); // Most recent first

    if (error) {
      console.error('❌ Leadership fetch error:', error);
      throw new Error(`Failed to fetch leadership positions: ${error.message}`);
    }

    // Process the data for frontend
    const processedLeadership = data.map(position => ({
      ...position,
      // Ensure arrays are properly formatted
      key_responsibilities: Array.isArray(position.key_responsibilities) ? position.key_responsibilities : [],
      achievements: Array.isArray(position.achievements) ? position.achievements : [],
      skills_developed: Array.isArray(position.skills_developed) ? position.skills_developed : [],
      recognition_received: Array.isArray(position.recognition_received) ? position.recognition_received : [],
      training_provided: Array.isArray(position.training_provided) ? position.training_provided : [],
      // Format dates
      formatted_start_date: position.start_date ? new Date(position.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
      formatted_end_date: position.end_date ? new Date(position.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
      // Calculate duration
      duration: calculatePositionDuration(position.start_date, position.end_date, position.is_current)
    }));

    console.log(`✅ Retrieved ${processedLeadership.length} leadership positions`);
    
    return {
      success: true,
      data: processedLeadership,
      message: processedLeadership.length === 0 ? 'No leadership positions found' : `Found ${processedLeadership.length} leadership positions`
    };
  } catch (error) {
    console.error('❌ getLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Get Single Leadership Position by ID - Public Access
export const getLeadershipById = async (id) => {
  try {
    console.log('🔍 Fetching leadership position by ID:', id);
    
    if (!id) {
      throw new Error('Leadership position ID is required');
    }

    const { data, error } = await supabase
      .from('leadership')
      .select('*')
      .eq('id', id)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Leadership position fetch error:', error);
      throw new Error(`Failed to fetch leadership position: ${error.message}`);
    }

    // Process the data
    const processedPosition = {
      ...data,
      key_responsibilities: Array.isArray(data.key_responsibilities) ? data.key_responsibilities : [],
      achievements: Array.isArray(data.achievements) ? data.achievements : [],
      skills_developed: Array.isArray(data.skills_developed) ? data.skills_developed : [],
      recognition_received: Array.isArray(data.recognition_received) ? data.recognition_received : [],
      training_provided: Array.isArray(data.training_provided) ? data.training_provided : [],
      formatted_start_date: data.start_date ? new Date(data.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
      formatted_end_date: data.end_date ? new Date(data.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : null,
      duration: calculatePositionDuration(data.start_date, data.end_date, data.is_current)
    };

    console.log('✅ Retrieved leadership position:', data?.title);
    
    return {
      success: true,
      data: processedPosition,
      message: 'Leadership position retrieved successfully'
    };
  } catch (error) {
    console.error('❌ getLeadershipById error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Get Featured Leadership Positions - Public Access
export const getFeaturedLeadership = async () => {
  try {
    console.log('🔍 Fetching featured leadership positions...');
    
    const { data, error } = await supabase
      .from('leadership')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('order_index', { ascending: true })
      .order('start_date', { ascending: false });

    if (error) {
      console.error('❌ Featured leadership fetch error:', error);
      throw new Error(`Failed to fetch featured leadership positions: ${error.message}`);
    }

    console.log(`✅ Retrieved ${data?.length || 0} featured leadership positions`);
    
    return {
      success: true,
      data: data || [],
      message: data?.length === 0 ? 'No featured leadership positions found' : `Found ${data.length} featured leadership positions`
    };
  } catch (error) {
    console.error('❌ getFeaturedLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Create New Leadership Position - Admin Only
export const createLeadership = async (leadershipData) => {
  try {
    console.log('📝 Creating new leadership position...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    // Validate required fields
    if (!leadershipData.title) {
      throw new Error('Position title is required');
    }
    if (!leadershipData.organization) {
      throw new Error('Organization name is required');
    }

    // Prepare leadership data for database
    const leadershipInsert = {
      position_number: leadershipData.position_number || null,
      title: leadershipData.title,
      organization: leadershipData.organization,
      organization_type: leadershipData.organization_type || null,
      start_date: leadershipData.start_date || null,
      end_date: leadershipData.end_date || null,
      is_current: leadershipData.is_current || false,
      location: leadershipData.location || null,
      description: leadershipData.description || null,
      team_size: leadershipData.team_size || null,
      budget_managed: leadershipData.budget_managed || null,
      key_responsibilities: leadershipData.key_responsibilities || [],
      achievements: leadershipData.achievements || [],
      skills_developed: leadershipData.skills_developed || [],
      challenges_overcome: leadershipData.challenges_overcome || null,
      impact: leadershipData.impact || null,
      volunteer_hours: leadershipData.volunteer_hours || null,
      initiative_type: leadershipData.initiative_type || null,
      recognition_received: leadershipData.recognition_received || [],
      mentees_count: leadershipData.mentees_count || null,
      training_provided: leadershipData.training_provided || [],
      is_featured: leadershipData.is_featured || false,
      order_index: leadershipData.order_index || null,
      status: leadershipData.status || 'active'
    };

    const { data, error } = await supabase
      .from('leadership')
      .insert([leadershipInsert])
      .select()
      .single();

    if (error) {
      console.error('❌ Leadership position creation error:', error);
      throw new Error(`Failed to create leadership position: ${error.message}`);
    }

    console.log('✅ Leadership position created successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Leadership position created successfully'
    };
  } catch (error) {
    console.error('❌ createLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Update Leadership Position - Admin Only
export const updateLeadership = async (id, leadershipData) => {
  try {
    console.log('📝 Updating leadership position:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Leadership position ID is required');
    }

    // Prepare update data
    const leadershipUpdate = {
      position_number: leadershipData.position_number,
      title: leadershipData.title,
      organization: leadershipData.organization,
      organization_type: leadershipData.organization_type,
      start_date: leadershipData.start_date,
      end_date: leadershipData.end_date,
      is_current: leadershipData.is_current,
      location: leadershipData.location,
      description: leadershipData.description,
      team_size: leadershipData.team_size,
      budget_managed: leadershipData.budget_managed,
      key_responsibilities: leadershipData.key_responsibilities || [],
      achievements: leadershipData.achievements || [],
      skills_developed: leadershipData.skills_developed || [],
      challenges_overcome: leadershipData.challenges_overcome,
      impact: leadershipData.impact,
      volunteer_hours: leadershipData.volunteer_hours,
      initiative_type: leadershipData.initiative_type,
      recognition_received: leadershipData.recognition_received || [],
      mentees_count: leadershipData.mentees_count,
      training_provided: leadershipData.training_provided || [],
      is_featured: leadershipData.is_featured,
      order_index: leadershipData.order_index,
      status: leadershipData.status,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('leadership')
      .update(leadershipUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Leadership position update error:', error);
      throw new Error(`Failed to update leadership position: ${error.message}`);
    }

    console.log('✅ Leadership position updated successfully:', data.title);
    
    return {
      success: true,
      data: data,
      message: 'Leadership position updated successfully'
    };
  } catch (error) {
    console.error('❌ updateLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Delete Leadership Position - Admin Only
export const deleteLeadership = async (id) => {
  try {
    console.log('🗑️ Deleting leadership position:', id);
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!id) {
      throw new Error('Leadership position ID is required');
    }

    // Get position info before deletion for logging
    const { data: positionInfo } = await supabase
      .from('leadership')
      .select('title, organization')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('leadership')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Leadership position deletion error:', error);
      throw new Error(`Failed to delete leadership position: ${error.message}`);
    }

    console.log('✅ Leadership position deleted successfully:', positionInfo?.title || id);
    
    return {
      success: true,
      data: { id, title: positionInfo?.title, organization: positionInfo?.organization },
      message: 'Leadership position deleted successfully'
    };
  } catch (error) {
    console.error('❌ deleteLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Reorder Leadership Positions - Admin Only
export const reorderLeadership = async (orderArray) => {
  try {
    console.log('🔄 Reordering leadership positions...');
    
    // Verify admin authentication
    const authResult = await requireAdminAuth();
    if (!authResult.success) {
      throw new Error('Authentication required');
    }

    if (!Array.isArray(orderArray) || orderArray.length === 0) {
      throw new Error('Order array is required and must not be empty');
    }

    // Validate orderArray format: [{ id: 'uuid', order_index: number }, ...]
    for (const item of orderArray) {
      if (!item.id || typeof item.order_index !== 'number') {
        throw new Error('Each order item must have id and order_index');
      }
    }

    // Update each position's order_index
    const updatePromises = orderArray.map(item => 
      supabase
        .from('leadership')
        .update({ 
          order_index: item.order_index,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.id)
    );

    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('❌ Some leadership reorder operations failed:', errors);
      throw new Error(`Failed to reorder ${errors.length} leadership positions`);
    }

    console.log(`✅ Successfully reordered ${orderArray.length} leadership positions`);
    
    return {
      success: true,
      data: { 
        reorderedCount: orderArray.length,
        orderArray: orderArray
      },
      message: `Successfully reordered ${orderArray.length} leadership positions`
    };
  } catch (error) {
    console.error('❌ reorderLeadership error:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// Helper function to calculate position duration
const calculatePositionDuration = (startDate, endDate, isCurrent) => {
  if (!startDate) return null;
  
  const start = new Date(startDate);
  const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date());
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    const remainingMonths = diffMonths % 12;
    if (remainingMonths > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`;
    }
    return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  } else {
    return 'Less than 1 month';
  }
};