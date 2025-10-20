/**
 * HR Performance Goals API Service
 *
 * This service handles all API calls related to HR performance goals including:
 * - Creating new goals
 * - Fetching all goals
 * - Fetching single goal by ID
 * - Updating existing goals
 * - Deleting goals
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for goals API
const GOALS_API_BASE = `${apiConfig.baseURL}/dashboard/hr/performance/goals`;

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
 * HR Performance Goals API Service
 */
// Sync pending goals when backend is available
const syncPendingGoals = async (accessToken) => {
  const pendingGoals = JSON.parse(localStorage.getItem("pendingGoals") || "[]");
  if (pendingGoals.length === 0) return;

  console.log(`🔄 Syncing ${pendingGoals.length} pending goals...`);

  const syncedGoals = [];
  const failedGoals = [];

  for (const goal of pendingGoals) {
    try {
      // Remove local-specific fields before sending to server
      const {
        id,
        status,
        createdAt,
        synced,
        retryCount,
        lastSyncAttempt,
        ...serverGoal
      } = goal;

      const response = await axios.post(GOALS_API_BASE, serverGoal, {
        headers: getAuthHeaders(accessToken),
        timeout: 10000,
      });

      if (response.data && response.data.success) {
        syncedGoals.push(goal.id);
        console.log(`✅ Synced goal: ${goal.goalTitle}`);
      } else {
        failedGoals.push(goal);
      }
    } catch (error) {
      console.log(`❌ Failed to sync goal: ${goal.goalTitle}`, error.message);
      failedGoals.push(goal);
    }
  }

  // Remove synced goals from localStorage
  const remainingGoals = pendingGoals.filter(
    (goal) => !syncedGoals.includes(goal.id)
  );
  localStorage.setItem("pendingGoals", JSON.stringify(remainingGoals));

  console.log(
    `✅ Synced ${syncedGoals.length} goals, ${failedGoals.length} still pending`
  );
  return { synced: syncedGoals.length, failed: failedGoals.length };
};

export const goalsApi = {
  /**
   * Create a new performance goal
   * @param {Object} goalData - Goal data to create
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createGoal: async (goalData, accessToken) => {
    // Check if access token is provided
    if (!accessToken) {
      console.error("No access token provided for goal creation");
      return {
        success: false,
        error: "Authentication required. Please log in again.",
      };
    }

    // Check if token is expired
    const isTokenExpired = (token) => {
      if (!token) return true;
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;
        return payload.exp < currentTime;
      } catch (error) {
        console.error("Error parsing token:", error);
        return true;
      }
    };

    if (isTokenExpired(accessToken)) {
      console.error("Access token is expired");
      return {
        success: false,
        error: "Session expired. Please log in again.",
      };
    }

    // Validate required fields based on schema
    if (
      !goalData.title ||
      !goalData.description ||
      !goalData.goalType ||
      !goalData.category ||
      !goalData.successCriteria ||
      !goalData.startDate ||
      !goalData.deadline
    ) {
      console.error("Missing required fields:", {
        title: !!goalData.title,
        description: !!goalData.description,
        goalType: !!goalData.goalType,
        category: !!goalData.category,
        successCriteria: !!goalData.successCriteria,
        startDate: !!goalData.startDate,
        deadline: !!goalData.deadline,
      });
      return {
        success: false,
        error:
          "Missing required fields: goalTitle, goalDescription, goalType, category, successCriteria, startDate, dueDate",
      };
    }

    // Validate metrics fields
    if (!goalData.currentMetric || !goalData.targetMetric) {
      console.error("Missing metrics fields:", {
        currentMetric: !!goalData.currentMetric,
        targetMetric: !!goalData.targetMetric,
      });
      return {
        success: false,
        error: "Missing required fields: currentMetric, targetMetric",
      };
    }

    // Map form field names to API expected field names based on API documentation
    const mappedData = {
      goalTitle: goalData.title?.trim(),
      goalDescription: goalData.description?.trim(),
      goalType: goalData.goalType || "Company",
      goalOwner: "64fa1c9a7c89d24b82e93f99", // Use a valid user ID as per API spec
      category: goalData.category || "Employee Engagement",
      priority: goalData.priority || "Medium",
      status: goalData.status || "Not Started",
      successCriteria:
        goalData.successCriteria?.trim() || "Success criteria to be defined",
      startDate: goalData.startDate || new Date().toISOString().split("T")[0],
      dueDate: goalData.deadline || new Date().toISOString().split("T")[0], // deadline maps to dueDate
      keyMetrics: [
        {
          metric: goalData.currentMetric || "General Performance",
          target: goalData.targetMetric || "To be defined",
        },
      ],
    };

    // Add team and department fields for team goals
    if (goalData.goalType === "Team") {
      // For team goals, use the selected team/department as the team name
      const teamName = goalData.team || goalData.owner || "Human Resources";
      mappedData.team = teamName;
      mappedData.department = teamName;

      // Keep goalOwner for team goals as per API spec
      // mappedData.goalOwner is already set above
    }

    // Validate data before sending
    console.log("=== GOAL CREATION DEBUG ===");
    console.log(
      "Creating goal with mapped data:",
      JSON.stringify(mappedData, null, 2)
    );
    console.log("Original form data:", JSON.stringify(goalData, null, 2));
    console.log("Goal type:", goalData.goalType);
    console.log("Team field:", mappedData.team);
    console.log("Department field:", mappedData.department);
    console.log("KeyMetrics:", JSON.stringify(mappedData.keyMetrics, null, 2));
    console.log("API URL:", GOALS_API_BASE);
    console.log("Headers:", getAuthHeaders(accessToken));
    console.log("Data validation:", {
      goalTitle: mappedData.goalTitle?.length > 0,
      goalDescription: mappedData.goalDescription?.length > 0,
      goalType: mappedData.goalType?.length > 0,
      goalOwner: mappedData.goalOwner?.length > 0,
      category: mappedData.category?.length > 0,
      priority: mappedData.priority?.length > 0,
      status: mappedData.status?.length > 0,
      keyMetrics: mappedData.keyMetrics?.length > 0,
      successCriteria: mappedData.successCriteria?.length > 0,
      startDate: mappedData.startDate?.length > 0,
      dueDate: mappedData.dueDate?.length > 0,
      team: mappedData.team?.length > 0,
      department: mappedData.department?.length > 0,
    });

    // Additional validation to prevent backend errors
    if (!mappedData.goalTitle || mappedData.goalTitle.trim().length === 0) {
      return {
        success: false,
        error: "Goal title is required and cannot be empty.",
      };
    }

    if (
      !mappedData.goalDescription ||
      mappedData.goalDescription.trim().length === 0
    ) {
      return {
        success: false,
        error: "Goal description is required and cannot be empty.",
      };
    }

    // Ensure dates are in correct format
    if (
      mappedData.startDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(mappedData.startDate)
    ) {
      return {
        success: false,
        error: "Start date must be in YYYY-MM-DD format.",
      };
    }

    if (mappedData.dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(mappedData.dueDate)) {
      return {
        success: false,
        error: "Due date must be in YYYY-MM-DD format.",
      };
    }

    try {
      // Add retry mechanism for 500 errors
      let response;
      let retryCount = 0;
      const maxRetries = 2;

      while (retryCount <= maxRetries) {
        try {
          response = await axios.post(GOALS_API_BASE, mappedData, {
            headers: getAuthHeaders(accessToken),
            timeout: 10000, // 10 second timeout
          });
          break; // Success, exit retry loop
        } catch (retryError) {
          if (retryError.response?.status === 500 && retryCount < maxRetries) {
            retryCount++;
            console.log(`Retry attempt ${retryCount} for goal creation...`);
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 * retryCount)
            ); // Wait before retry
            continue;
          } else {
            throw retryError; // Re-throw if not a 500 error or max retries reached
          }
        }
      }

      console.log("Goal creation response:", response.data);
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      // Handle the response based on API specification
      if (response.data && response.data.success) {
        // If backend is working, try to sync any pending goals
        setTimeout(() => {
          syncPendingGoals(accessToken);
        }, 1000);

        return { success: true, data: response.data.data || response.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Goal creation failed",
        };
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);

      // Handle specific error cases
      if (error.response?.status === 403) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: "Authentication failed. Please log in again.",
        };
      } else if (error.response?.status === 400) {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            "Invalid data provided. Please check your input.",
        };
      } else if (error.response?.status === 500) {
        console.error("Backend server error - 500 Internal Server Error");
        console.error("This indicates a backend issue, not a frontend problem");
        console.error("Server response:", error.response?.data);

        // Implement local storage fallback for 500 errors
        console.log(
          "🔄 Backend is down. Saving goal locally for later sync..."
        );

        const localGoal = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...mappedData,
          status: "pending_sync",
          createdAt: new Date().toISOString(),
          synced: false,
          retryCount: 0,
          lastSyncAttempt: null,
        };

        // Save to localStorage
        const pendingGoals = JSON.parse(
          localStorage.getItem("pendingGoals") || "[]"
        );
        pendingGoals.push(localGoal);
        localStorage.setItem("pendingGoals", JSON.stringify(pendingGoals));

        console.log("✅ Goal saved locally:", localGoal.id);
        console.log("📝 Total pending goals:", pendingGoals.length);

        // Return success with local data
        return {
          success: true,
          data: localGoal,
          local: true, // Flag to indicate this is a local save
          message:
            "Goal saved locally. It will be synced to the server when the backend is available.",
        };
      } else {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "An unexpected error occurred.",
        };
      }
    }
  },

  /**
   * Fetch all performance goals
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllGoals: async (accessToken) => {
    try {
      console.log("Fetching all goals...");
      console.log("API URL:", GOALS_API_BASE);
      console.log("Access token present:", !!accessToken);
      console.log("Token length:", accessToken?.length);

      const response = await axios.get(GOALS_API_BASE, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("All goals response:", response.data);

      // Handle the response based on API specification
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data || response.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Failed to fetch goals",
        };
      }
    } catch (error) {
      console.error("Error fetching goals:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Fetch a single goal by ID
   * @param {string} goalId - Goal ID to fetch
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getGoalById: async (goalId, accessToken) => {
    try {
      console.log(`Fetching goal with ID: ${goalId}`);
      const response = await axios.get(`${GOALS_API_BASE}/${goalId}`, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Single goal response:", response.data);

      // Handle the response based on API specification
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data || response.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Failed to fetch goal",
        };
      }
    } catch (error) {
      console.error(
        "Error fetching goal:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Update an existing goal
   * @param {string} goalId - Goal ID to update
   * @param {Object} goalData - Updated goal data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateGoal: async (goalId, goalData, accessToken) => {
    try {
      // Validate required fields for update based on schema
      if (
        !goalData.title ||
        !goalData.description ||
        !goalData.goalType ||
        !goalData.category ||
        !goalData.successCriteria ||
        !goalData.startDate ||
        !goalData.deadline
      ) {
        console.error("Missing required fields for update:", {
          title: !!goalData.title,
          description: !!goalData.description,
          goalType: !!goalData.goalType,
          category: !!goalData.category,
          successCriteria: !!goalData.successCriteria,
          startDate: !!goalData.startDate,
          deadline: !!goalData.deadline,
        });
        return {
          success: false,
          error:
            "Missing required fields: goalTitle, goalDescription, goalType, category, successCriteria, startDate, dueDate",
        };
      }

      // Validate metrics fields
      if (!goalData.currentMetric || !goalData.targetMetric) {
        console.error("Missing metrics fields for update:", {
          currentMetric: !!goalData.currentMetric,
          targetMetric: !!goalData.targetMetric,
        });
        return {
          success: false,
          error: "Missing required fields: currentMetric, targetMetric",
        };
      }

      // Map form field names to API expected field names based on API documentation
      const mappedData = {
        goalTitle: goalData.title?.trim(),
        goalDescription: goalData.description?.trim(),
        goalType: goalData.goalType || "Company",
        goalOwner: "64fa1c9a7c89d24b82e93f99", // Use a valid user ID as per API spec
        category: goalData.category || "Employee Engagement",
        priority: goalData.priority || "Medium",
        status: goalData.status || "Not Started",
        successCriteria:
          goalData.successCriteria?.trim() || "Success criteria to be defined",
        startDate: goalData.startDate || new Date().toISOString().split("T")[0],
        dueDate: goalData.deadline || new Date().toISOString().split("T")[0], // deadline maps to dueDate
        keyMetrics: [
          {
            metric: goalData.currentMetric || "General Performance",
            target: goalData.targetMetric || "To be defined",
          },
        ],
      };

      // Add team and department fields for team goals
      if (goalData.goalType === "Team") {
        // For team goals, use the selected team/department as the team name
        const teamName = goalData.team || goalData.owner || "Human Resources";
        mappedData.team = teamName;
        mappedData.department = teamName;

        // Keep goalOwner for team goals as per API spec
        // mappedData.goalOwner is already set above
      }

      console.log(`Updating goal ${goalId} with mapped data:`, mappedData);
      console.log("Original form data for update:", goalData);
      console.log("KeyMetrics structure for update:", mappedData.keyMetrics);
      console.log("Goal type for update:", goalData.goalType);
      console.log("Team field for update:", mappedData.team);
      console.log("Department field for update:", mappedData.department);
      console.log("API URL:", `${GOALS_API_BASE}/${goalId}`);
      console.log("Headers:", getAuthHeaders(accessToken));

      const response = await axios.patch(
        `${GOALS_API_BASE}/${goalId}`,
        mappedData,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Goal update response:", response.data);

      // Handle the response based on API specification
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data || response.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Goal update failed",
        };
      }
    } catch (error) {
      console.error(
        "Error updating goal:",
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  /**
   * Delete a goal
   * @param {string} goalId - Goal ID to delete
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  deleteGoal: async (goalId, accessToken) => {
    try {
      // Check if access token is provided
      if (!accessToken) {
        console.error("No access token provided for goal deletion");
        return {
          success: false,
          error: "Authentication required. Please log in again.",
        };
      }

      // Check if token is expired
      const isTokenExpired = (token) => {
        if (!token) return true;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const currentTime = Date.now() / 1000;
          return payload.exp < currentTime;
        } catch (error) {
          console.error("Error parsing token:", error);
          return true;
        }
      };

      if (isTokenExpired(accessToken)) {
        console.error("Access token is expired");
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      }

      console.log(`Deleting goal with ID: ${goalId}`);
      const response = await axios.delete(`${GOALS_API_BASE}/${goalId}`, {
        headers: getAuthHeaders(accessToken),
        timeout: 10000, // 10 second timeout
      });

      console.log("Goal deletion response:", response.data);

      // Handle the response based on API specification
      if (response.data && response.data.success) {
        return { success: true, data: response.data.data || response.data };
      } else {
        return {
          success: false,
          error: response.data?.message || "Goal deletion failed",
        };
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);

      // Handle specific error cases
      if (error.response?.status === 403) {
        return {
          success: false,
          error: "Session expired. Please log in again.",
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          error: "Authentication failed. Please log in again.",
        };
      } else if (error.response?.status === 404) {
        return {
          success: false,
          error: "Goal not found. It may have already been deleted.",
        };
      } else if (error.response?.status === 500) {
        return {
          success: false,
          error: "Server error. Please try again later.",
        };
      } else {
        return {
          success: false,
          error:
            error.response?.data?.message ||
            error.message ||
            "Failed to delete goal",
        };
      }
    }
  },

  /**
   * Sync pending goals to server
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{synced: number, failed: number}>}
   */
  syncPendingGoals: async (accessToken) => {
    return await syncPendingGoals(accessToken);
  },

  /**
   * Get pending goals from local storage
   * @returns {Array} Array of pending goals
   */
  getPendingGoals: () => {
    return JSON.parse(localStorage.getItem("pendingGoals") || "[]");
  },

  /**
   * Clear all pending goals (use with caution)
   */
  clearPendingGoals: () => {
    localStorage.removeItem("pendingGoals");
    console.log("🗑️ Cleared all pending goals");
  },

  /**
   * Delete a local goal from localStorage
   * @param {string} goalId - Local goal ID to delete
   * @returns {boolean} Success status
   */
  deleteLocalGoal: (goalId) => {
    try {
      const pendingGoals = JSON.parse(
        localStorage.getItem("pendingGoals") || "[]"
      );
      const updatedGoals = pendingGoals.filter((goal) => goal.id !== goalId);
      localStorage.setItem("pendingGoals", JSON.stringify(updatedGoals));
      console.log(`🗑️ Deleted local goal: ${goalId}`);
      return true;
    } catch (error) {
      console.error("Error deleting local goal:", error);
      return false;
    }
  },
};

export default goalsApi;
