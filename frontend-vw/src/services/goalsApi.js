/**
 * HR Performance Goals API Service
 * 
 * This service handles all API calls related to HR performance goals including:
 * - Creating new goals
 * - Fetching all goals
 * - Fetching single goal by ID
 * - Updating existing goals
 * - Deleting goals
 * 
 * All requests are authenticated using the access token from the auth context.
 */

import axios from 'axios';
import { apiConfig } from '@/config/apiConfig';

// Base URL for goals API
const GOALS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/performance/goals`;

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
 * HR Performance Goals API Service
 */
export const goalsApi = {
  /**
   * Create a new performance goal
   * @param {Object} goalData - Goal data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createGoal: async (goalData, accessToken) => {
    try {
      // Validate required fields based on schema
      if (!goalData.title || !goalData.description || !goalData.goalType || !goalData.category || !goalData.successCriteria || !goalData.startDate || !goalData.deadline) {
        console.error('Missing required fields:', {
          title: !!goalData.title,
          description: !!goalData.description,
          goalType: !!goalData.goalType,
          category: !!goalData.category,
          successCriteria: !!goalData.successCriteria,
          startDate: !!goalData.startDate,
          deadline: !!goalData.deadline
        });
        return { success: false, error: 'Missing required fields: goalTitle, goalDescription, goalType, category, successCriteria, startDate, targetDeadline' };
      }

      // Validate metrics fields
      if (!goalData.currentMetric || !goalData.targetMetric) {
        console.error('Missing metrics fields:', {
          currentMetric: !!goalData.currentMetric,
          targetMetric: !!goalData.targetMetric
        });
        return { success: false, error: 'Missing required fields: currentMetric, targetMetric' };
      }

      // Map form field names to API expected field names based on updated controller
      const mappedData = {
        goalTitle: goalData.title?.trim(),
        goalDescription: goalData.description?.trim(),
        goalType: goalData.goalType || 'Company',
        goalOwner: goalData.owner || 'Human Resources', // Optional field
        category: goalData.category || 'Employee Engagement',
        priority: goalData.priority || 'Medium',
        status: goalData.status || 'Not Started',
        keyMetrics: goalData.keyMetrics || [{ 
          metric: goalData.currentMetric || 'General Performance', // Map currentMetric to metric
          target: goalData.targetMetric || 'To be defined' // Map targetMetric to target
        }],
        successCriteria: goalData.successCriteria?.trim() || 'Success criteria to be defined',
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        targetDeadline: goalData.deadline || new Date().toISOString().split('T')[0] // deadline maps to targetDeadline
      };

      // Validate data before sending
      console.log('Creating goal with mapped data:', mappedData);
      console.log('Original form data:', goalData);
      console.log('Form data currentMetric:', goalData.currentMetric);
      console.log('Form data targetMetric:', goalData.targetMetric);
      console.log('Current metric type:', typeof goalData.currentMetric);
      console.log('Target metric type:', typeof goalData.targetMetric);
      console.log('Current metric length:', goalData.currentMetric?.length);
      console.log('Target metric length:', goalData.targetMetric?.length);
      console.log('KeyMetrics structure:', mappedData.keyMetrics);
      console.log('Mapped metric value:', mappedData.keyMetrics[0]?.metric);
      console.log('Mapped target value:', mappedData.keyMetrics[0]?.target);
      console.log('Data validation:', {
        goalTitle: mappedData.goalTitle?.length > 0,
        goalDescription: mappedData.goalDescription?.length > 0,
        goalType: mappedData.goalType?.length > 0,
        goalOwner: mappedData.goalOwner?.length > 0,
        category: mappedData.category?.length > 0,
        priority: mappedData.priority?.length > 0,
        status: mappedData.status?.length > 0,
        keyMetrics: mappedData.keyMetrics?.length > 0,
        successCriteria: mappedData.successCriteria?.length > 0,
        startDate: mappedData.startDate?.length > 0,
        targetDeadline: mappedData.targetDeadline?.length > 0
      });

      const response = await axios.post(GOALS_API_BASE, mappedData, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Goal creation response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating goal:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Fetch all performance goals
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllGoals: async (accessToken) => {
    try {
      console.log('Fetching all goals...');
      console.log('API URL:', GOALS_API_BASE);
      console.log('Access token present:', !!accessToken);
      console.log('Token length:', accessToken?.length);
      
      const response = await axios.get(GOALS_API_BASE, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('All goals response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching goals:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Fetch a single goal by ID
   * @param {string} goalId - Goal ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getGoalById: async (goalId, accessToken) => {
    try {
      console.log(`Fetching goal with ID: ${goalId}`);
      const response = await axios.get(`${GOALS_API_BASE}/${goalId}`, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Single goal response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching goal:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Update an existing goal
   * @param {string} goalId - Goal ID to update
   * @param {Object} goalData - Updated goal data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateGoal: async (goalId, goalData, accessToken) => {
    try {
      // Validate required fields for update based on schema
      if (!goalData.title || !goalData.description || !goalData.goalType || !goalData.category || !goalData.successCriteria || !goalData.startDate || !goalData.deadline) {
        console.error('Missing required fields for update:', {
          title: !!goalData.title,
          description: !!goalData.description,
          goalType: !!goalData.goalType,
          category: !!goalData.category,
          successCriteria: !!goalData.successCriteria,
          startDate: !!goalData.startDate,
          deadline: !!goalData.deadline
        });
        return { success: false, error: 'Missing required fields: goalTitle, goalDescription, goalType, category, successCriteria, startDate, targetDeadline' };
      }

      // Validate metrics fields
      if (!goalData.currentMetric || !goalData.targetMetric) {
        console.error('Missing metrics fields for update:', {
          currentMetric: !!goalData.currentMetric,
          targetMetric: !!goalData.targetMetric
        });
        return { success: false, error: 'Missing required fields: currentMetric, targetMetric' };
      }

      // Map form field names to API expected field names based on updated controller
      const mappedData = {
        goalTitle: goalData.title?.trim(),
        goalDescription: goalData.description?.trim(),
        goalType: goalData.goalType || 'Company',
        goalOwner: goalData.owner || 'Human Resources', // Optional field
        category: goalData.category || 'Employee Engagement',
        priority: goalData.priority || 'Medium',
        status: goalData.status || 'Not Started',
        keyMetrics: goalData.keyMetrics || [{ 
          metric: goalData.currentMetric || 'General Performance', // Map currentMetric to metric
          target: goalData.targetMetric || 'To be defined' // Map targetMetric to target
        }],
        successCriteria: goalData.successCriteria?.trim() || 'Success criteria to be defined',
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        targetDeadline: goalData.deadline || new Date().toISOString().split('T')[0] // deadline maps to targetDeadline
      };

      console.log(`Updating goal ${goalId} with mapped data:`, mappedData);
      console.log('Original form data for update:', goalData);
      console.log('KeyMetrics structure for update:', mappedData.keyMetrics);
      console.log('API URL:', `${GOALS_API_BASE}/${goalId}`);
      console.log('Headers:', getAuthHeaders(accessToken));
      
      const response = await axios.patch(`${GOALS_API_BASE}/${goalId}`, mappedData, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Goal update response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating goal:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  },

  /**
   * Delete a goal
   * @param {string} goalId - Goal ID to delete
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  deleteGoal: async (goalId, accessToken) => {
    try {
      console.log(`Deleting goal with ID: ${goalId}`);
      const response = await axios.delete(`${GOALS_API_BASE}/${goalId}`, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Goal deletion response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting goal:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

export default goalsApi;
