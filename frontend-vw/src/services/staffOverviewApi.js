/**
 * Staff Overview API Service
 *
 * This service handles API calls related to staff performance overview including:
 * - Fetching personal performance summary for an employee
 * - Getting task completion metrics
 * - Retrieving hours worked and performance scores
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for staff overview API
const STAFF_OVERVIEW_API_BASE = `${apiConfig.baseURL}/dashboard/staff/overview`;

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
 * Staff Overview API Service
 */
export const staffOverviewApi = {
  /**
   * Fetch staff performance overview
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getStaffOverview: async (accessToken) => {
    try {
      console.log("Fetching staff overview...");
      const response = await axios.get(STAFF_OVERVIEW_API_BASE, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Staff overview response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching staff overview:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default staffOverviewApi;
