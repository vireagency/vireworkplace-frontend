/**
 * Tasks API Service
 *
 * This service handles all API calls related to task management including:
 * - Creating new tasks
 * - Fetching all tasks with filters
 * - Fetching single task by ID
 * - Updating existing tasks
 * - Deleting tasks
 * - Updating task status
 * - Searching for assignees
 *
 * All requests are authenticated using the access token from the auth context.
 */

import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Base URL for tasks API
const TASKS_API_BASE = `${apiConfig.baseURL}/tasks`;

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
 * Tasks API Service
 */
export const tasksApi = {
  /**
   * Create a new task
   * @param {string} accessToken - JWT access token
   * @param {Object} taskData - Task data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  createTask: async (accessToken, taskData) => {
    try {
      console.log("Creating new task...");
      const response = await axios.post(`${TASKS_API_BASE}/create`, taskData, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Task creation response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "creating task");
    }
  },

  /**
   * Fetch all tasks with optional filters
   * @param {string} accessToken - JWT access token
   * @param {Object} filters - Optional filters (status, priority, dueDate)
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getAllTasks: async (accessToken, filters = {}) => {
    try {
      console.log("Fetching tasks with filters:", filters);

      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.priority) params.append("priority", filters.priority);
      if (filters.dueDate) params.append("dueDate", filters.dueDate);

      const url = params.toString()
        ? `${TASKS_API_BASE}?${params.toString()}`
        : TASKS_API_BASE;

      const response = await axios.get(url, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Tasks fetch response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "fetching tasks");
    }
  },

  /**
   * Fetch a single task by ID
   * @param {string} accessToken - JWT access token
   * @param {string} taskId - Task ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getTaskById: async (accessToken, taskId) => {
    try {
      console.log("Fetching task by ID:", taskId);
      const response = await axios.get(`${TASKS_API_BASE}/${taskId}`, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Task fetch response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "fetching task by ID");
    }
  },

  /**
   * Update an existing task
   * @param {string} accessToken - JWT access token
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateTask: async (accessToken, taskId, taskData) => {
    try {
      console.log("Updating task:", taskId);
      const response = await axios.put(
        `${TASKS_API_BASE}/${taskId}`,
        taskData,
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Task update response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "updating task");
    }
  },

  /**
   * Delete a task
   * @param {string} accessToken - JWT access token
   * @param {string} taskId - Task ID
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  deleteTask: async (accessToken, taskId) => {
    try {
      console.log("Deleting task:", taskId);
      const response = await axios.delete(`${TASKS_API_BASE}/${taskId}`, {
        headers: getAuthHeaders(accessToken),
      });

      console.log("Task deletion response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "deleting task");
    }
  },

  /**
   * Update task status
   * @param {string} accessToken - JWT access token
   * @param {string} taskId - Task ID
   * @param {string} status - New status
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateTaskStatus: async (accessToken, taskId, status) => {
    try {
      console.log("Updating task status:", taskId, "to", status);
      const response = await axios.patch(
        `${TASKS_API_BASE}/${taskId}/status`,
        {
          status: status,
        },
        {
          headers: getAuthHeaders(accessToken),
        }
      );

      console.log("Task status update response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "updating task status");
    }
  },

  /**
   * Search for users to assign tasks
   * @param {string} accessToken - JWT access token
   * @param {string} query - Search query
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  searchAssignees: async (accessToken, query) => {
    try {
      console.log("Searching for assignees:", query);
      const response = await axios.get(`${TASKS_API_BASE}/assignees/search`, {
        params: { query },
        headers: getAuthHeaders(accessToken),
      });

      console.log("Assignee search response:", response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return handleApiError(error, "searching assignees");
    }
  },
};

export default tasksApi;
