/**
 * Employees API Service
 *
 * This service handles all API calls related to employee management including:
 * - Fetching all employees (excluding Admins & HRs)
 * - Fetching detailed employee data by ID
 * - Employee profile and attendance information
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for employees API
const EMPLOYEES_API_BASE = `${apiConfig.baseURL}/employees`;

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
 * Handle API errors with detailed logging
 * @param {Error} error - The error object
 * @param {string} operation - The operation being performed
 * @returns {Object} Error response object
 */
const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  console.error("Error response:", error.response);
  console.error("Error response data:", error.response?.data);
  console.error("Error response status:", error.response?.status);

  return {
    success: false,
    error: error.response?.data?.message || error.message,
    status: error.response?.status,
  };
};

/**
 * Employees API Service
 */
export const employeesApi = {
  /**
   * Fetch all employees (excluding Admins & HRs)
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllEmployees: async (accessToken) => {
    try {
      console.log("Fetching all employees...");
      console.log("API URL:", `${EMPLOYEES_API_BASE}/list`);
      console.log("Headers:", getAuthHeaders(accessToken));

      // Optional quick connectivity hint (non-blocking)
      try {
        await axios.get(`${apiConfig.baseURL}/health`, { timeout: 1000 });
      } catch (_) {
        // Ignore health check failures; proceed to real request immediately
      }

      const response = await axios.get(`${EMPLOYEES_API_BASE}/list`, {
        headers: getAuthHeaders(accessToken),
        timeout: 10000, // 10 second timeout
      });

      console.log("Employees fetch response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error in getAllEmployees:", error);
      return handleApiError(error, "fetching all employees");
    }
  },

  /**
   * Fetch detailed employee data by ID (profile + attendance)
   * @param {string} accessToken - JWT access token
   * @param {string} employeeId - Employee ID (MongoDB ObjectId)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEmployeeById: async (accessToken, employeeId) => {
    try {
      console.log("Fetching employee by ID:", employeeId);
      const response = await axios.get(`${EMPLOYEES_API_BASE}/${employeeId}`, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Employee fetch response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "fetching employee by ID");
    }
  },
};

export default employeesApi;
