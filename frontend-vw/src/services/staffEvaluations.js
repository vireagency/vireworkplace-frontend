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
import { hrEvaluationsApi } from "./hrEvaluations";

// Base URL for staff evaluations API
const STAFF_EVALUATIONS_API_BASE = `${apiConfig.baseURL}/dashboard/staff/evaluations/reviews`;

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
// Helper function to check if evaluation is completed
const isEvaluationCompleted = (evaluationId) => {
  try {
    const completedEvaluations = JSON.parse(
      localStorage.getItem("completedEvaluations") || "[]"
    );
    return completedEvaluations.includes(evaluationId);
  } catch (error) {
    console.warn("Error checking completion status:", error);
    return false;
  }
};

// Helper function to get pending submissions
export const getPendingSubmissions = () => {
  try {
    return JSON.parse(
      localStorage.getItem("pendingEvaluationSubmissions") || "[]"
    );
  } catch (error) {
    console.error("Error getting pending submissions:", error);
    return [];
  }
};

// Helper function to sync pending submissions to backend
export const syncPendingSubmissions = async (accessToken) => {
  try {
    const pendingSubmissions = getPendingSubmissions();

    if (pendingSubmissions.length === 0) {
      console.log("No pending submissions to sync");
      return { success: true, synced: 0, total: 0 };
    }

    console.log(`Syncing ${pendingSubmissions.length} pending submissions...`);
    const syncedIds = [];
    const failedSubmissions = [];

    for (const submission of pendingSubmissions) {
      try {
        const result = await staffEvaluationsApi.submitEvaluationResponse(
          submission.evaluationId,
          {
            responses: submission.responses,
            comments: submission.comments,
          },
          accessToken
        );

        if (result.success) {
          syncedIds.push(submission.evaluationId);
          console.log(
            `✅ Synced submission for evaluation ${submission.evaluationId}`
          );
        } else {
          failedSubmissions.push(submission);
          console.error(
            `❌ Failed to sync evaluation ${submission.evaluationId}:`,
            result.error
          );
        }
      } catch (error) {
        failedSubmissions.push(submission);
        console.error(
          `❌ Error syncing evaluation ${submission.evaluationId}:`,
          error
        );
      }
    }

    // Update localStorage - keep only failed submissions
    localStorage.setItem(
      "pendingEvaluationSubmissions",
      JSON.stringify(failedSubmissions)
    );

    console.log(
      `Sync complete: ${syncedIds.length} synced, ${failedSubmissions.length} failed`
    );

    return {
      success: true,
      synced: syncedIds.length,
      failed: failedSubmissions.length,
      total: pendingSubmissions.length,
    };
  } catch (error) {
    console.error("Error syncing pending submissions:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const staffEvaluationsApi = {
  /**
   * Get assigned evaluations for staff
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAssignedEvaluations: async (accessToken) => {
    try {
      console.log("Fetching assigned evaluations for staff...");
      const response = await axios.get(STAFF_EVALUATIONS_API_BASE, {
        headers: getAuthHeaders(accessToken),
        timeout: 30000, // 30 second timeout
      });

      console.log("Assigned evaluations response:", response.data);

      // Handle different response structures
      let evaluationsData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          evaluationsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          evaluationsData = response.data.data;
        } else if (
          response.data.evaluations &&
          Array.isArray(response.data.evaluations)
        ) {
          evaluationsData = response.data.evaluations;
        }
      }

      return {
        success: true,
        data: evaluationsData,
        rawData: response.data,
      };
    } catch (error) {
      console.error("Error fetching assigned evaluations:", error);

      // Handle different error types
      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `Server error: ${error.response.status}`;
        return { success: false, error: errorMessage };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: "Network error: Unable to reach server",
        };
      } else {
        // Something else happened
        return { success: false, error: error.message };
      }
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
      if (!evaluationId) {
        return { success: false, error: "Evaluation ID is required" };
      }

      console.log(`Fetching evaluation form with ID: ${evaluationId}`);
      const response = await axios.get(
        `${STAFF_EVALUATIONS_API_BASE}/${evaluationId}`,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Evaluation form response:", response.data);

      // Ensure we have the evaluation data
      let evaluationData = response.data;
      if (response.data && response.data.data) {
        evaluationData = response.data.data;
      }

      return {
        success: true,
        data: evaluationData,
        rawData: response.data,
      };
    } catch (error) {
      console.error("Error fetching evaluation form:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage =
              "Access denied: You don't have permission to view this evaluation";
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
   * Submit evaluation response
   * @param {string} evaluationId - Evaluation ID
   * @param {Object} responseData - Response data to submit
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  submitEvaluationResponse: async (evaluationId, responseData, accessToken) => {
    try {
      if (!evaluationId) {
        return { success: false, error: "Evaluation ID is required" };
      }

      // Validate required fields
      if (!responseData.responses || !Array.isArray(responseData.responses)) {
        return {
          success: false,
          error: "Responses must be a non-empty array",
        };
      }

      console.log(`Submitting evaluation response for ID: ${evaluationId}`);
      console.log("Response data:", JSON.stringify(responseData, null, 2));
      console.log("Response data structure:", {
        hasResponses: Array.isArray(responseData.responses),
        responsesCount: responseData.responses?.length || 0,
        hasComments: !!responseData.comments,
        commentsLength: responseData.comments?.length || 0,
        sampleResponse: responseData.responses?.[0] || null,
      });

      const response = await axios.post(
        `${STAFF_EVALUATIONS_API_BASE}/${evaluationId}/response`,
        responseData,
        {
          headers: {
            ...getAuthHeaders(accessToken),
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      console.log("Evaluation response submission result:", response.data);

      // Mark evaluation as completed in local storage
      try {
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );
        if (!completedEvaluations.includes(evaluationId)) {
          completedEvaluations.push(evaluationId);
          localStorage.setItem(
            "completedEvaluations",
            JSON.stringify(completedEvaluations)
          );
          console.log(`Marked evaluation ${evaluationId} as completed`);
        }
      } catch (storageError) {
        console.warn("Failed to update completion status:", storageError);
      }

      // Sync with HR system (don't fail if this fails)
      try {
        await hrEvaluationsApi.syncStaffSubmission(
          evaluationId,
          responseData,
          accessToken
        );
        console.log("Successfully synced submission with HR system");
      } catch (syncError) {
        console.warn("Failed to sync with HR system:", syncError);
        // Don't fail the main submission
      }

      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Evaluation submitted successfully",
        completed: true,
      };
    } catch (error) {
      console.error("Error submitting evaluation response:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage =
              "Access denied: You don't have permission to submit this evaluation";
            break;
          case 404:
            errorMessage = "Evaluation not found";
            break;
          case 400:
            errorMessage =
              error.response.data?.message || "Invalid data provided";
            break;
          case 500:
            console.error("Server 500 error details:", {
              status: error.response.status,
              data: error.response.data,
              headers: error.response.headers,
              requestData: responseData,
            });
            errorMessage =
              error.response.data?.message ||
              `Server error: ${
                error.response.data?.error ||
                "Internal server error. Please try again."
              }`;
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
   * Check if an evaluation has been completed
   * @param {string} evaluationId - Evaluation ID to check
   * @returns {boolean} True if evaluation is completed
   */
  isEvaluationCompleted: (evaluationId) => {
    return isEvaluationCompleted(evaluationId);
  },

  /**
   * Get all completed evaluation IDs
   * @returns {string[]} Array of completed evaluation IDs
   */
  getCompletedEvaluations: () => {
    try {
      return JSON.parse(localStorage.getItem("completedEvaluations") || "[]");
    } catch (error) {
      console.warn("Error getting completed evaluations:", error);
      return [];
    }
  },

  /**
   * Clear completion status for an evaluation (for testing purposes)
   * @param {string} evaluationId - Evaluation ID to clear
   */
  clearCompletionStatus: (evaluationId) => {
    try {
      const completedEvaluations = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      const filtered = completedEvaluations.filter((id) => id !== evaluationId);
      localStorage.setItem("completedEvaluations", JSON.stringify(filtered));
      console.log(`Cleared completion status for evaluation ${evaluationId}`);
    } catch (error) {
      console.warn("Error clearing completion status:", error);
    }
  },
};

export default staffEvaluationsApi;
