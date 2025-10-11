import axios from "axios";
import { apiConfig } from "@/config/apiConfig";

// Helper function to get auth headers
const getAuthHeaders = (accessToken) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${accessToken}`,
});

// Helper function to get multipart headers (for file uploads)
const getMultipartHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`,
  // Don't set Content-Type for multipart, let browser set it with boundary
});

/**
 * Settings API Service
 * Handles all user settings operations
 */
export const settingsApi = {
  /**
   * Update user's profile image
   * @param {File} imageFile - Profile image file to upload
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateProfileImage: async (imageFile, accessToken) => {
    try {
      if (!imageFile) {
        return { success: false, error: "No file provided" };
      }

      const formData = new FormData();
      formData.append("file", imageFile);

      console.log("Uploading profile image:", imageFile.name);

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/profile-image`,
        formData,
        {
          headers: getMultipartHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Profile image update response:", response.data);
      return {
        success: true,
        data: response.data,
        message:
          response.data?.message || "Profile picture updated successfully",
      };
    } catch (error) {
      console.error("Error updating profile image:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 400:
            errorMessage = "No file uploaded or invalid file format";
            break;
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 404:
            errorMessage = "User not found";
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
   * Update user's profile and employee details
   * @param {Object} profileData - Profile data to update
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateProfile: async (profileData, accessToken) => {
    try {
      console.log("Updating user profile:", profileData);

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/profile`,
        profileData,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Profile update response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error updating profile:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 400:
            errorMessage =
              error.response.data?.message || "Invalid profile data provided";
            break;
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 404:
            errorMessage = "User not found";
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
   * Change user password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.oldPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  changePassword: async (passwordData, accessToken) => {
    try {
      console.log("Changing user password");

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/profile/password`,
        passwordData,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Password change response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Password updated successfully",
      };
    } catch (error) {
      console.error("Error changing password:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 400:
            errorMessage =
              error.response.data?.message ||
              "Validation error or password mismatch";
            break;
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 404:
            errorMessage = "User not found";
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
   * Delete (soft delete) user account
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  deleteAccount: async (accessToken) => {
    try {
      console.log("Deleting user account");

      const response = await axios.delete(
        `${apiConfig.baseURL}/settings/account/delete`,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Account deletion response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Account deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting account:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 404:
            errorMessage = "User not found";
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
   * Get user settings (notifications + preferences)
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  getSettings: async (accessToken) => {
    try {
      console.log("Fetching user settings");

      const response = await axios.get(`${apiConfig.baseURL}/settings`, {
        headers: getAuthHeaders(accessToken),
        timeout: 30000,
      });

      console.log("Settings fetch response:", response.data);
      return {
        success: true,
        data: response.data?.data || response.data,
        message: response.data?.message || "Settings fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching settings:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
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
   * Update notification settings
   * @param {Object} notificationSettings - Notification settings data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateNotifications: async (notificationSettings, accessToken) => {
    try {
      console.log("Updating notification settings:", notificationSettings);

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/notifications`,
        notificationSettings,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Notification settings update response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Notification settings updated",
      };
    } catch (error) {
      console.error("Error updating notification settings:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
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
   * Update user preferences
   * @param {Object} preferences - User preferences data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updatePreferences: async (preferences, accessToken) => {
    try {
      console.log("Updating user preferences:", preferences);

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/preferences`,
        preferences,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("Preferences update response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "Preferences updated",
      };
    } catch (error) {
      console.error("Error updating preferences:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
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
   * Admin/HR override user notification settings
   * @param {string} userId - Target user ID
   * @param {Object} notificationSettings - Notification settings data
   * @param {string} accessToken - JWT access token
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  updateUserNotifications: async (
    userId,
    notificationSettings,
    accessToken
  ) => {
    try {
      if (!userId) {
        return { success: false, error: "User ID is required" };
      }

      console.log(
        `Updating notification settings for user ${userId}:`,
        notificationSettings
      );

      const response = await axios.patch(
        `${apiConfig.baseURL}/settings/notifications/admin/${userId}`,
        notificationSettings,
        {
          headers: getAuthHeaders(accessToken),
          timeout: 30000,
        }
      );

      console.log("User notification settings update response:", response.data);
      return {
        success: true,
        data: response.data,
        message: response.data?.message || "User notification settings updated",
      };
    } catch (error) {
      console.error("Error updating user notification settings:", error);

      if (error.response) {
        const status = error.response.status;
        let errorMessage;

        switch (status) {
          case 401:
            errorMessage = "Unauthorized: Please log in again";
            break;
          case 403:
            errorMessage = "Forbidden: Admin/HR access required";
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
};

export default settingsApi;
