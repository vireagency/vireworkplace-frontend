/**
 * @fileoverview Global Search API Service
 * @description API service for global search functionality across the system
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import axios from 'axios';
import { getApiUrl } from '@/config/apiConfig';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const GLOBAL_SEARCH_API_BASE = `${getApiUrl()}/search/global`;

/**
 * Get authentication headers for API requests
 * @param {string} accessToken - JWT access token
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = (accessToken) => {
  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };
};

// ============================================================================
// GLOBAL SEARCH API FUNCTIONS
// ============================================================================

/**
 * Global Search API Service
 * @description Handles all global search operations across the system
 */
export const globalSearchApi = {
  /**
   * Perform global search across tasks, users, performance, and more
   * @param {string} query - Search keyword
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} Search results or error
   * 
   * @example
   * const result = await globalSearchApi.search('report', accessToken);
   * if (result.success) {
   *   console.log('Search results:', result.data);
   * }
   */
  search: async (query, accessToken) => {
    try {
      // Validate query parameter
      if (!query || query.trim().length === 0) {
        console.error('Search query is required');
        return { 
          success: false, 
          error: 'Search query is required' 
        };
      }

      // Validate access token
      if (!accessToken) {
        console.error('Access token is required for global search');
        return { 
          success: false, 
          error: 'Access token is required' 
        };
      }

      console.log('Performing global search with query:', query);
      console.log('API URL:', `${GLOBAL_SEARCH_API_BASE}?query=${encodeURIComponent(query)}`);
      console.log('Token present:', !!accessToken);
      console.log('Token length:', accessToken?.length);

      // Make API request
      const response = await axios.get(GLOBAL_SEARCH_API_BASE, {
        params: {
          query: query.trim()
        },
        headers: getAuthHeaders(accessToken)
      });

      console.log('Global search response:', response.data);
      return { 
        success: true, 
        data: response.data 
      };

    } catch (error) {
      console.error('Error performing global search:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
};

export default globalSearchApi;
