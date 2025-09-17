/**
 * @fileoverview Contextual Search API Service
 * @description API service for contextual search functionality within specific areas
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import axios from 'axios';
import { getApiUrl } from '@/config/apiConfig';

// ============================================================================
// API CONFIGURATION
// ============================================================================

const CONTEXT_SEARCH_API_BASE = `${getApiUrl()}/search/context`;

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
// CONTEXTUAL SEARCH API FUNCTIONS
// ============================================================================

/**
 * Contextual Search API Service
 * @description Handles contextual search operations within specific areas
 */
export const contextSearchApi = {
  /**
   * Perform contextual search within a specific area
   * @param {string} query - Search keyword
   * @param {string} context - Search context (employees, tasks, performance, etc.)
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} Search results or error
   * 
   * @example
   * const result = await contextSearchApi.search('john', 'employees', accessToken);
   * if (result.success) {
   *   console.log('Employee search results:', result.data);
   * }
   */
  search: async (query, context, accessToken) => {
    try {
      // Validate query parameter
      if (!query || query.trim().length === 0) {
        console.error('Search query is required');
        return { 
          success: false, 
          error: 'Search query is required' 
        };
      }

      // Validate context parameter
      if (!context || context.trim().length === 0) {
        console.error('Search context is required');
        return { 
          success: false, 
          error: 'Search context is required' 
        };
      }

      // Validate access token
      if (!accessToken) {
        console.error('Access token is required for contextual search');
        return { 
          success: false, 
          error: 'Access token is required' 
        };
      }

      console.log('Performing contextual search:', { query, context });
      console.log('API URL:', `${CONTEXT_SEARCH_API_BASE}?query=${encodeURIComponent(query)}&context=${encodeURIComponent(context)}`);
      console.log('Token present:', !!accessToken);
      console.log('Token length:', accessToken?.length);

      // Make API request
      const response = await axios.get(CONTEXT_SEARCH_API_BASE, {
        params: {
          query: query.trim(),
          context: context.trim()
        },
        headers: getAuthHeaders(accessToken)
      });

      console.log('Contextual search response:', response.data);
      return { 
        success: true, 
        data: response.data 
      };

    } catch (error) {
      console.error('Error performing contextual search:', error);
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
   * Search employees specifically
   * @param {string} query - Search keyword
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} Employee search results or error
   */
  searchEmployees: async (query, accessToken) => {
    return await contextSearchApi.search(query, 'employees', accessToken);
  },

  /**
   * Search tasks specifically
   * @param {string} query - Search keyword
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} Task search results or error
   */
  searchTasks: async (query, accessToken) => {
    return await contextSearchApi.search(query, 'tasks', accessToken);
  },

  /**
   * Search performance records specifically
   * @param {string} query - Search keyword
   * @param {string} accessToken - JWT access token
   * @returns {Promise<Object>} Performance search results or error
   */
  searchPerformance: async (query, accessToken) => {
    return await contextSearchApi.search(query, 'performance', accessToken);
  }
};

export default contextSearchApi;
