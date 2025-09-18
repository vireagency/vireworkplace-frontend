/**
 * HR Evaluations API Service
 * 
 * This service handles all API calls related to HR evaluations including:
 * - Creating new evaluation reviews
 * - Fetching evaluations
 * - Managing evaluation data
 * 
 * All requests are authenticated using the access token from the auth context.
 */

import axios from 'axios';
import { apiConfig } from '@/config/apiConfig';

// Base URL for evaluations API
const EVALUATIONS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/evaluations`;

/**
 * Create API headers with authentication token
 * @param {string} accessToken - JWT access token
 * @returns {Object} Headers object with Authorization
 */
const getAuthHeaders = (accessToken) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
});

/**
 * Create a new evaluation review
 * @param {Object} evaluationData - Evaluation data to create
 * @param {string} accessToken - JWT access token
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const createEvaluationReview = async (evaluationData, accessToken) => {
  try {
    // Validate required fields
    if (!evaluationData.formName || !evaluationData.formType || !evaluationData.description || !evaluationData.reviewPeriod || !evaluationData.reviewDeadline || !evaluationData.sections || !evaluationData.employees) {
      console.error('Missing required fields:', {
        formName: !!evaluationData.formName,
        formType: !!evaluationData.formType,
        description: !!evaluationData.description,
        reviewPeriod: !!evaluationData.reviewPeriod,
        reviewDeadline: !!evaluationData.reviewDeadline,
        sections: !!evaluationData.sections,
        employees: !!evaluationData.employees
      });
      return { success: false, error: 'Missing required fields: formName, formType, description, reviewPeriod, reviewDeadline, sections, employees' };
    }

    // Validate sections array
    if (!Array.isArray(evaluationData.sections) || evaluationData.sections.length === 0) {
      return { success: false, error: 'Sections must be a non-empty array' };
    }

    // Validate each section has questions
    for (let i = 0; i < evaluationData.sections.length; i++) {
      const section = evaluationData.sections[i];
      if (!section.questions || !Array.isArray(section.questions) || section.questions.length === 0) {
        return { success: false, error: `Section ${i + 1} must have a non-empty questions array` };
      }
    }

    // Validate employees array
    if (!Array.isArray(evaluationData.employees) || evaluationData.employees.length === 0) {
      return { success: false, error: 'Employees must be a non-empty array' };
    }

    console.log('Creating evaluation review with data:', evaluationData);
    console.log('API URL:', `${EVALUATIONS_API_BASE}/reviews/create`);
    console.log('Headers:', getAuthHeaders(accessToken));
    console.log('Access token length:', accessToken ? accessToken.length : 'No token');
    console.log('Sections being sent:', evaluationData.sections);
    console.log('Sections count:', evaluationData.sections?.length || 0);
    console.log('First section:', evaluationData.sections?.[0]);
    console.log('First section questions:', evaluationData.sections?.[0]?.questions);
    console.log('Questions count in first section:', evaluationData.sections?.[0]?.questions?.length || 0);
    console.log('Employees being sent:', evaluationData.employees);
    console.log('Employees count:', evaluationData.employees?.length || 0);
    console.log('Full request payload:', JSON.stringify(evaluationData, null, 2));

    const response = await axios.post(`${EVALUATIONS_API_BASE}/reviews/create`, evaluationData, {
      headers: getAuthHeaders(accessToken)
    });
    
    console.log('Evaluation creation response status:', response.status);
    console.log('Evaluation creation response data:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error creating evaluation review:', error);
    console.error('Error response:', error.response);
    console.error('Error response data:', error.response?.data);
    console.error('Error response status:', error.response?.status);
    console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
    
    // Log the specific error object
    if (error.response?.data?.error) {
      console.error('Backend error object:', error.response.data.error);
      console.error('Backend error type:', typeof error.response.data.error);
      console.error('Backend error keys:', Object.keys(error.response.data.error || {}));
    }
    
    // Extract more detailed error information
    const errorMessage = error.response?.data?.message || error.message || 'Failed to create evaluation review';
    const errorDetails = error.response?.data?.error ? JSON.stringify(error.response.data.error, null, 2) : 'No additional error details';
    
    console.error('Error message:', errorMessage);
    console.error('Error details:', errorDetails);
    
    return { 
      success: false, 
      error: `${errorMessage}${errorDetails !== 'No additional error details' ? `\n\nDetails: ${errorDetails}` : ''}`
    };
  }
};

/**
 * HR Evaluations API Service
 */
export const evaluationsApi = {
  /**
   * Create a new evaluation review
   * @param {Object} evaluationData - Evaluation data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createEvaluationReview,

  /**
   * Fetch all evaluations
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllEvaluations: async (accessToken) => {
    try {
      console.log('Fetching all evaluations...');
      const response = await axios.get(`${EVALUATIONS_API_BASE}/reviews`, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('All evaluations response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Fetch a single evaluation by ID
   * @param {string} evaluationId - Evaluation ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEvaluationById: async (evaluationId, accessToken) => {
    try {
      console.log(`Fetching evaluation with ID: ${evaluationId}`);
      const response = await axios.get(`${EVALUATIONS_API_BASE}/reviews/${evaluationId}`, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Single evaluation response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching evaluation:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

export default evaluationsApi;
