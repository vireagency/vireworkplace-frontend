/**
 * HR Overview API Service
 * 
 * This service handles API calls related to HR dashboard overview including:
 * - Fetching performance overview for Admin and HR
 * - Getting key metrics and summaries
 * - Retrieving department performance data
 * 
 * All requests are authenticated using the access token from the auth context.
 */

import axios from 'axios';
import { apiConfig } from '@/config/apiConfig';

// Base URL for HR overview API
const OVERVIEW_API_BASE = `${apiConfig.baseURL}/dashboard/hr/overview`;

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
 * HR Overview API Service
 */
export const hrOverviewApi = {
  /**
   * Fetch HR dashboard overview
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getOverview: async (accessToken) => {
    try {
      console.log('Fetching HR overview...');
      const response = await axios.get(OVERVIEW_API_BASE, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('HR overview response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching HR overview:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }
};

export default hrOverviewApi;
