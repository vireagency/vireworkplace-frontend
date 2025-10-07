/**
 * Staff Evaluations API Service
 *
 * This service handles all API calls related to staff evaluations including:
 * - Fetching assigned evaluations
 * - Getting evaluation form by ID
 * - Submitting evaluation responses
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for staff evaluations API
const STAFF_EVALUATIONS_API_BASE = `${apiConfig.baseURL}/api/v1/dashboard/staff/evaluations`;

/**
 * Create API headers with authentication token
 * @param {string} accessToken - JWT access token
 * @returns {Object} Headers object with Authorization
 */
const getAuthHeaders = (accessToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
});

/**
 * Staff Evaluations API Service
 */
export const staffEvaluationsApi = {
  /**
   * Get assigned evaluations for staff
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAssignedEvaluations: async (accessToken) => {
    try {
      console.log("Fetching assigned evaluations for staff...");
      const response = await axios.get(
        `${STAFF_EVALUATIONS_API_BASE}/reviews`,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Assigned evaluations response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching assigned evaluations:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Get evaluation form by ID
   * @param {string} evaluationId - Evaluation ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEvaluationFormById: async (evaluationId, accessToken) => {
    try {
      console.log(`Fetching evaluation form with ID: ${evaluationId}`);
      const response = await axios.get(
        `${STAFF_EVALUATIONS_API_BASE}/reviews/${evaluationId}`,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Evaluation form response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Error fetching evaluation form:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Submit evaluation response
   * @param {string} evaluationId - Evaluation ID
   * @param {Object} responseData - Response data to submit
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  submitEvaluationResponse: async (evaluationId, responseData, accessToken) => {
    try {
      // Validate required fields
      if (!responseData.responses || !Array.isArray(responseData.responses)) {
        return {
          success: false,
          error: "Responses must be a non-empty array",
        };
      }

      console.log(`Submitting evaluation response for ID: ${evaluationId}`);
      console.log("Response data:", responseData);

      const response = await axios.post(
        `${STAFF_EVALUATIONS_API_BASE}/reviews/${evaluationId}/response`,
        responseData,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Evaluation response submission result:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error submitting evaluation response:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default staffEvaluationsApi;
