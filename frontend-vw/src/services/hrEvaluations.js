import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for HR evaluations API
const HR_EVALUATIONS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/evaluations/reviews`;

// Helper function to get auth headers
const getAuthHeaders = (accessToken) => {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
};

/**
 * HR Evaluations API Service
 * Handles communication between staff evaluations and HR system
 */
export const hrEvaluationsApi = {
  /**
   * Create a custom evaluation review
   * @param {Object} evaluationData - Evaluation data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createEvaluationReview: async (evaluationData, accessToken) => {
    try {
      console.log("Creating evaluation review:", evaluationData);

      const response = await axios.post(
        `${HR_EVALUATIONS_API_BASE}/create`,
        evaluationData,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Evaluation creation response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Evaluation created successfully",
      };
    } catch (error) {
      console.error("Error creating evaluation:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              "Invalid evaluation data provided";
            break;
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage = "Access denied: Only HR can create evaluations";
            break;
          case 500:
            errorMessage = "Server error: Please try again later";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Server error: ${status}`;
        }

        return { success: false, error: errorMessage };
      } else if (error.request) {
        return {
          success: false,
          error: "Network error: Unable to reach server",
        };
      } else {
        return { success: false, error: error.message };
      }
    }
  },

  /**
   * Fetch submitted evaluation responses with filters and pagination
   * @param {Object} filters - Query filters (status, page, limit)
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getSubmittedEvaluations: async (filters = {}, accessToken) => {
    try {
      console.log("Fetching submitted evaluations with filters:", filters);

      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);

      const url = `${HR_EVALUATIONS_API_BASE}/submissions${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axios.get(url, {
        headers: getAuthHeaders(accessToken),
        timeout: 30000,
      });

      console.log("Submitted evaluations response:", response.data);
      return {
        success: true,
        data: response.data,
        submissions: response.data?.data || response.data?.submissions || [],
      };
    } catch (error) {
      console.error("Error fetching submitted evaluations:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage = "Access denied: Only HR can view submissions";
            break;
          case 500:
            errorMessage = "Server error: Please try again later";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Server error: ${status}`;
        }

        return { success: false, error: errorMessage };
      } else if (error.request) {
        return {
          success: false,
          error: "Network error: Unable to reach server",
        };
      } else {
        return { success: false, error: error.message };
      }
    }
  },

  /**
   * Fetch evaluation details by ID
   * @param {string} evaluationId - Evaluation ID
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEvaluationDetails: async (evaluationId, accessToken) => {
    try {
      if (!evaluationId) {
        return { success: false, error: "Evaluation ID is required" };
      }

      console.log(`Fetching evaluation details for ID: ${evaluationId}`);

      const response = await axios.get(
        `${HR_EVALUATIONS_API_BASE}/${evaluationId}`,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Evaluation details response:", response.data);
      return {
        success: true,
        data: response.data,
        evaluation: response.data?.data || response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation details:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage =
              "Access denied: Only HR can access evaluation details";
            break;
          case 404:
            errorMessage = "Evaluation not found";
            break;
          case 500:
            errorMessage = "Server error: Please try again later";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Server error: ${status}`;
        }

        return { success: false, error: errorMessage };
      } else if (error.request) {
        return {
          success: false,
          error: "Network error: Unable to reach server",
        };
      } else {
        return { success: false, error: error.message };
      }
    }
  },

  /**
   * Fetch pending/overdue evaluations with filters and pagination
   * @param {Object} filters - Query filters (status, page, limit)
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getPendingEvaluations: async (filters = {}, accessToken) => {
    try {
      console.log("Fetching pending evaluations with filters:", filters);

      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.page) queryParams.append("page", filters.page);
      if (filters.limit) queryParams.append("limit", filters.limit);

      const url = `${HR_EVALUATIONS_API_BASE}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await axios.get(url, {
        headers: getAuthHeaders(accessToken),
        timeout: 30000,
      });

      console.log("Pending evaluations response:", response.data);
      return {
        success: true,
        data: response.data,
        evaluations: response.data?.data || response.data?.evaluations || [],
      };
    } catch (error) {
      console.error("Error fetching pending evaluations:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage = "Access denied: Only HR can access evaluations";
            break;
          case 500:
            errorMessage = "Server error: Please try again later";
            break;
          default:
            errorMessage =
              error.response.data?.message || `Server error: ${status}`;
        }

        return { success: false, error: errorMessage };
      } else if (error.request) {
        return {
          success: false,
          error: "Network error: Unable to reach server",
        };
      } else {
        return { success: false, error: error.message };
      }
    }
  },

  /**
   * Sync staff evaluation submission with HR system
   * This ensures HR gets notified when staff submits evaluations
   * @param {string} evaluationId - Evaluation ID
   * @param {Object} submissionData - Submission data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  syncStaffSubmission: async (evaluationId, submissionData, accessToken) => {
    try {
      console.log(
        `Syncing staff submission for evaluation ${evaluationId}:`,
        submissionData
      );

      // This would typically be handled by the backend when staff submits
      // But we can add a notification endpoint if needed
      const response = await axios.post(
        `${HR_EVALUATIONS_API_BASE}/${evaluationId}/notify`,
        {
          evaluationId,
          submissionData,
          timestamp: new Date().toISOString(),
          source: "staff_submission",
        },
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Staff submission sync response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Submission synced successfully",
      };
    } catch (error) {
      console.error("Error syncing staff submission:", error);

      // Don't fail the main submission if sync fails
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        warning: "Submission completed but HR notification failed",
      };
    }
  },
};

export default hrEvaluationsApi;
