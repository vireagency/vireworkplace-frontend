/**
 * HR Performance Trends API Service
 * 
 * This service handles API calls related to HR performance trends including:
 * - Fetching performance trends for the current quarter
 * - Getting organization-wide performance analytics
 * - Retrieving top performers and department performance data
 * 
 * All requests are authenticated using the access token from the auth context.
 */

import axios from 'axios';
import { apiConfig } from '@/config/apiConfig';

// Base URL for performance trends API
const TRENDS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/performance/trends`;

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
 * HR Performance Trends API Service
 */
export const performanceTrendsApi = {
  /**
   * Fetch performance trends for the current quarter
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getPerformanceTrends: async (accessToken) => {
    try {
      console.log('Fetching performance trends...');
      const response = await axios.get(TRENDS_API_BASE, {
        headers: getAuthHeaders(accessToken)
      });
      
      console.log('Performance trends response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching performance trends:', error);
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

export default performanceTrendsApi;
