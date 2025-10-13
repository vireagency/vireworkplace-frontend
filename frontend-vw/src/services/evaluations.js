/**
 * HR Evaluations API Service
 *
 * This service handles all API calls related to HR evaluations including:
 * - Creating new evaluation reviews
 * - Fetching evaluations
 * - Managing evaluation data
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for evaluations API
const EVALUATIONS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/evaluations`;

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
 * Create a new evaluation review
 * @param {Object} evaluationData - Evaluation data to create
 * @param {string} accessToken - JWT access token
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const createEvaluationReview = async (evaluationData, accessToken) => {
  try {
    // Validate required fields
    if (
      !evaluationData.formName ||
      !evaluationData.formType ||
      !evaluationData.description ||
      !evaluationData.reviewPeriod ||
      !evaluationData.reviewDeadline ||
      !evaluationData.sections ||
      !evaluationData.employees
    ) {
      console.error("Missing required fields:", {
        formName: !!evaluationData.formName,
        formType: !!evaluationData.formType,
        description: !!evaluationData.description,
        reviewPeriod: !!evaluationData.reviewPeriod,
        reviewDeadline: !!evaluationData.reviewDeadline,
        sections: !!evaluationData.sections,
        employees: !!evaluationData.employees,
      });
      return {
        success: false,
        error:
          "Missing required fields: formName, formType, description, reviewPeriod, reviewDeadline, sections, employees",
      };
    }

    // Validate sections array
    if (
      !Array.isArray(evaluationData.sections) ||
      evaluationData.sections.length === 0
    ) {
      return { success: false, error: "Sections must be a non-empty array" };
    }

    // Validate each section has questions
    for (let i = 0; i < evaluationData.sections.length; i++) {
      const section = evaluationData.sections[i];
      if (
        !section.questions ||
        !Array.isArray(section.questions) ||
        section.questions.length === 0
      ) {
        return {
          success: false,
          error: `Section ${i + 1} must have a non-empty questions array`,
        };
      }
    }

    // Validate employees array
    if (
      !Array.isArray(evaluationData.employees) ||
      evaluationData.employees.length === 0
    ) {
      return { success: false, error: "Employees must be a non-empty array" };
    }

    console.log("Creating evaluation review with data:", evaluationData);
    console.log("API URL:", `${EVALUATIONS_API_BASE}/reviews/create`);
    console.log("Headers:", getAuthHeaders(accessToken));
    console.log(
      "Access token length:",
      accessToken ? accessToken.length : "No token"
    );
    console.log("Sections being sent:", evaluationData.sections);
    console.log("Sections count:", evaluationData.sections?.length || 0);
    console.log("First section:", evaluationData.sections?.[0]);
    console.log(
      "First section questions:",
      evaluationData.sections?.[0]?.questions
    );
    console.log(
      "Questions count in first section:",
      evaluationData.sections?.[0]?.questions?.length || 0
    );
    console.log("Employees being sent:", evaluationData.employees);
    console.log("Employees count:", evaluationData.employees?.length || 0);
    console.log(
      "Full request payload:",
      JSON.stringify(evaluationData, null, 2)
    );

    const response = await axios.post(
      `${EVALUATIONS_API_BASE}/reviews/create`,
      evaluationData,
      {
        headers: getAuthHeaders(accessToken),
      }
    );

    console.log("Evaluation creation response status:", response.status);
    console.log("Evaluation creation response data:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error creating evaluation review:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);
    console.error("Error response status:", error.response?.status);
    console.error(
      "Full error details:",
      JSON.stringify(error.response?.data, null, 2)
    );

    // Log the specific error object
    if (error.response?.data?.error) {
      console.error("Backend error object:", error.response.data.error);
      console.error("Backend error type:", typeof error.response.data.error);
      console.error(
        "Backend error keys:",
        Object.keys(error.response.data.error || {})
      );
    }

    // Extract more detailed error information
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Failed to create evaluation review";
    const errorDetails = error.response?.data?.error
      ? JSON.stringify(error.response.data.error, null, 2)
      : "No additional error details";

    console.error("Error message:", errorMessage);
    console.error("Error details:", errorDetails);

    return {
      success: false,
      error: `${errorMessage}${
        errorDetails !== "No additional error details"
          ? `\n\nDetails: ${errorDetails}`
          : ""
      }`,
    };
  }
};

/**
 * HR Evaluations API Service
 */
export const evaluationsApi = {
  /**
   * Create a new evaluation review
   * @param {Object} evaluationData - Evaluation data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createEvaluationReview,

  /**
   * Fetch all evaluations
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllEvaluations: async (accessToken) => {
    try {
      console.log("Fetching all evaluations...");
      const response = await axios.get(`${EVALUATIONS_API_BASE}/reviews`, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("All evaluations response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch a single evaluation by ID
   * @param {string} evaluationId - Evaluation ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getEvaluationById: async (evaluationId, accessToken) => {
    try {
      console.log(`Fetching evaluation with ID: ${evaluationId}`);
      const response = await axios.get(
        `${EVALUATIONS_API_BASE}/reviews/${evaluationId}`,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Single evaluation response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Error fetching evaluation:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch submitted evaluation responses
   * @param {string} accessToken - JWT access token
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getSubmittedEvaluations: async (accessToken, params = {}) => {
    try {
      const queryParams = {
        status: "submitted",
        page: params.page || 1,
        limit: params.limit || 10,
        ...params,
      };

      console.log("Fetching submitted evaluations with params:", queryParams);
      const response = await axios.get(
        `${EVALUATIONS_API_BASE}/reviews/submissions`,
        {
          headers: getAuthHeaders(accessToken),
          params: queryParams,
        }
      );

      console.log("Submitted evaluations response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Error fetching submitted evaluations:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch pending/overdue evaluations
   * @param {string} accessToken - JWT access token
   * @param {Object} params - Query parameters (status, page, limit)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getPendingEvaluations: async (accessToken, params = {}) => {
    try {
      const queryParams = {
        status: params.status || "pending",
        page: params.page || 1,
        limit: params.limit || 10,
        ...params,
      };

      console.log(
        "Fetching pending/overdue evaluations with params:",
        queryParams
      );
      const response = await axios.get(`${EVALUATIONS_API_BASE}/reviews`, {
        headers: getAuthHeaders(accessToken),
        params: queryParams,
      });

      console.log("Pending/overdue evaluations response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Error fetching pending/overdue evaluations:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch staff-submitted evaluation responses
   * This endpoint tries multiple API routes to find staff submissions
   * @param {string} accessToken - JWT access token
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getStaffSubmittedEvaluations: async (accessToken, params = {}) => {
    try {
      const queryParams = {
        status: "submitted",
        page: params.page || 1,
        limit: params.limit || 100, // Get more to ensure we catch all submissions
        ...params,
      };

      console.log(
        "Fetching staff-submitted evaluations with params:",
        queryParams
      );

      // Try the submissions endpoint first
      try {
        const response = await axios.get(
          `${EVALUATIONS_API_BASE}/reviews/submissions`,
          {
            headers: getAuthHeaders(accessToken),
            params: queryParams,
          }
        );

        console.log("Staff-submitted evaluations response:", response.data);
        return { success: true, data: response.data };
      } catch (submissionsError) {
        console.warn(
          "Submissions endpoint failed, trying main reviews endpoint:",
          submissionsError.message
        );

        // Fallback: Try to get all reviews and filter for submitted ones
        const allReviewsResponse = await axios.get(
          `${EVALUATIONS_API_BASE}/reviews`,
          {
            headers: getAuthHeaders(accessToken),
            params: queryParams,
          }
        );

        // Filter for submitted/completed reviews
        let reviewsData = Array.isArray(allReviewsResponse.data)
          ? allReviewsResponse.data
          : allReviewsResponse.data?.data || [];

        const submittedReviews = reviewsData.filter(
          (review) =>
            review.status === "submitted" || review.status === "completed"
        );

        console.log(
          "Filtered submitted evaluations from all reviews:",
          submittedReviews.length
        );
        return { success: true, data: submittedReviews };
      }
    } catch (error) {
      console.error(
        "Error fetching staff-submitted evaluations:",
        error.response?.data || error.message
      );

      // Return empty array instead of error to prevent UI from breaking
      console.log(
        "Returning empty array for staff submissions due to API error"
      );
      return {
        success: true,
        data: [],
        warning: "API endpoint not available, showing empty results",
      };
    }
  },
};

export default evaluationsApi;
