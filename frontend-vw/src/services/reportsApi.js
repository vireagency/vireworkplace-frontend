/**
 * Reports API Service
 *
 * This service handles all API calls related to reports including:
 * - Creating new reports
 * - Fetching all reports with pagination and filters
 * - Fetching single report by ID
 * - Updating existing reports
 * - Deleting reports
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";
import { log, logError } from "@/utils/logger";

// Base URL for reports API
const REPORTS_API_BASE = `${apiConfig.baseURL}/dashboard/reports`;

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
 * Reports API Service
 */
export const reportsApi = {
  /**
   * Create a new report
   * @param {Object} reportData - Report data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createReport: async (reportData, accessToken) => {
    try {
      // Validate required fields
      if (!reportData.reportTitle || !reportData.reportDescription) {
        logError("Missing required fields:", {
          reportTitle: !!reportData.reportTitle,
          reportDescription: !!reportData.reportDescription,
        });
        return {
          success: false,
          error: "Missing required fields: reportTitle, reportDescription",
        };
      }

      // Map form data to API expected format
      const mappedData = {
        reportTitle: reportData.reportTitle?.trim(),
        reportDescription: reportData.reportDescription?.trim(),
        department: reportData.department || "Human Resource Management",
        reportType: reportData.reportType || "General",
        priorityLevel: reportData.priorityLevel || "Medium",
        recipients: reportData.recipients || [], // Array of user IDs
      };

      // Only add dueDate if it's provided and valid
      if (reportData.dueDate && reportData.dueDate.trim() !== "") {
        mappedData.dueDate = reportData.dueDate;
      }

      log("Creating report with data:", mappedData);
      log("Recipients:", mappedData.recipients);
      log("Access token present:", !!accessToken);

      const response = await axios.post(REPORTS_API_BASE, mappedData, {
        headers: getAuthHeaders(accessToken),
      });

      log("Report creation response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError("Error creating report:", error);
      logError("Error response data:", error.response?.data);
      logError("Error status:", error.response?.status);
      logError("Error message:", error.message);

      // Return more detailed error information
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create report";

      return {
        success: false,
        error: errorMessage,
        details: error.response?.data,
      };
    }
  },

  /**
   * Fetch all reports with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 10)
   * @param {string} params.department - Filter by department
   * @param {string} params.priorityLevel - Filter by priority level
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllReports: async (params = {}, accessToken) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.department && params.department !== "all") {
        queryParams.append("department", params.department);
      }
      if (params.priorityLevel && params.priorityLevel !== "all") {
        queryParams.append("priorityLevel", params.priorityLevel);
      }

      const url = `${REPORTS_API_BASE}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      log("Fetching reports from:", url);

      const response = await axios.get(url, {
        headers: getAuthHeaders(accessToken),
      });

      log("All reports response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError("Error fetching reports:", error);
      logError("Error response:", error.response?.data);

      // Treat 404 as "no reports found" rather than an error
      if (error.response?.status === 404) {
        log("No reports found (404), returning empty data");
        return {
          success: true,
          data: {
            success: true,
            data: [],
            pagination: { currentPage: 1, totalPages: 0, totalReports: 0 },
          },
        };
      }

      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch a single report by ID
   * @param {string} reportId - Report ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getReportById: async (reportId, accessToken) => {
    try {
      log(`Fetching report with ID: ${reportId}`);
      const response = await axios.get(`${REPORTS_API_BASE}/${reportId}`, {
        headers: getAuthHeaders(accessToken),
      });

      log("Single report response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError(
        "Error fetching report:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Update an existing report
   * @param {string} reportId - Report ID to update
   * @param {Object} reportData - Updated report data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateReport: async (reportId, reportData, accessToken) => {
    try {
      // Map form data to API expected format (only send fields that changed)
      const mappedData = {};

      if (reportData.reportTitle) {
        mappedData.reportTitle = reportData.reportTitle.trim();
      }
      if (reportData.reportDescription) {
        mappedData.reportDescription = reportData.reportDescription.trim();
      }
      if (reportData.department) {
        mappedData.department = reportData.department;
      }
      if (reportData.reportType) {
        mappedData.reportType = reportData.reportType;
      }
      if (reportData.priorityLevel) {
        mappedData.priorityLevel = reportData.priorityLevel;
      }
      if (reportData.dueDate !== undefined) {
        mappedData.dueDate = reportData.dueDate;
      }

      log(`Updating report ${reportId} with data:`, mappedData);

      const response = await axios.patch(
        `${REPORTS_API_BASE}/${reportId}`,
        mappedData,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      log("Report update response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError(
        "Error updating report:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Delete a report
   * @param {string} reportId - Report ID to delete
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  deleteReport: async (reportId, accessToken) => {
    try {
      log(`Deleting report with ID: ${reportId}`);
      const response = await axios.delete(`${REPORTS_API_BASE}/${reportId}`, {
        headers: getAuthHeaders(accessToken),
      });

      log("Report deletion response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      logError(
        "Error deleting report:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};

export default reportsApi;
