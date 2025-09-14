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
      // Validate required fields
      if (!goalData.title || !goalData.description || !goalData.owner) {
        console.error('Missing required fields:', {
          title: !!goalData.title,
          description: !!goalData.description,
          owner: !!goalData.owner
        });
        return { success: false, error: 'Missing required fields' };
      }

      // Map form field names to API expected field names
      const mappedData = {
        goalTitle: goalData.title?.trim(),
        goalDescription: goalData.description?.trim(),
        goalOwner: goalData.owner?.trim() || 'Human Resources',
        goalType: goalData.goalType || 'company',
        priority: goalData.priority || 'Medium Priority',
        category: goalData.category || 'General',
        deadline: goalData.deadline || new Date().toISOString().split('T')[0],
        metrics: goalData.metrics?.trim() || 'No specific metrics defined'
      };

      // Validate data before sending
      console.log('Creating goal with mapped data:', mappedData);
      console.log('Data validation:', {
        goalTitle: mappedData.goalTitle?.length > 0,
        goalDescription: mappedData.goalDescription?.length > 0,
        goalOwner: mappedData.goalOwner?.length > 0,
        goalType: mappedData.goalType?.length > 0,
        priority: mappedData.priority?.length > 0,
        category: mappedData.category?.length > 0,
        deadline: mappedData.deadline?.length > 0,
        metrics: mappedData.metrics?.length > 0
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
      const response = await axios.get(GOALS_API_BASE, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('All goals response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching goals:', error.response?.data || error.message);
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
      // Map form field names to API expected field names
      const mappedData = {
        goalTitle: goalData.title,
        goalDescription: goalData.description,
        goalOwner: goalData.owner || 'Human Resources', // Default owner if not provided
        goalType: goalData.goalType || 'company',
        priority: goalData.priority,
        category: goalData.category,
        deadline: goalData.deadline,
        metrics: goalData.metrics
      };

      console.log(`Updating goal ${goalId} with mapped data:`, mappedData);
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
