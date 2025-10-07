/**
 * Authentication Hook and Context
 *
 * Provides authentication state management and API integration for the Vire Workplace HR Application.
 * This hook manages user authentication, profile data, and provides authentication methods
 * throughout the application.
 *
 * Features:
 * - User authentication state management
 * - Access token management with localStorage persistence
 * - User profile fetching and caching
 * - Login, signup, and logout functionality
 * - Profile update capabilities
 * - Automatic token validation and cleanup
 * - Loading state management
 *
 * API Endpoints:
 * - POST /auth/login - User login
 * - POST /auth/signup - User registration
 * - GET /status/profile - Fetch user profile
 * - PUT /status/profile - Update user profile
 *
 * State Management:
 * - user: Current user data
 * - accessToken: JWT access token
 * - loading: Loading state for authentication operations
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// API base URL for authentication endpoints
const API_URL = "https://vireworkplace-backend-hpca.onrender.com/api/v1";

// Create authentication context
const AuthContext = createContext();

/**
 * AuthProvider Component
 *
 * Provides authentication context to the entire application.
 * Manages user state, access tokens, and authentication operations.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap with auth context
 */
export const AuthProvider = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Initialize user state from localStorage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Initialize access token from localStorage
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token") || null
  );

  // Loading state for authentication operations
  const [loading, setLoading] = useState(true);

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

  // Setup axios interceptor for automatic logout on 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.log("401 error detected, but not logging out automatically");
          console.log("Error URL:", error.config?.url);
          console.log("Error details:", error.response?.data);

          // Only logout on specific 401 errors, not all of them
          const url = error.config?.url || "";
          const shouldLogout = url.includes("/auth/") || url.includes("/login");

          if (shouldLogout) {
            console.log("Token expired or invalid, logging out user");
            console.log("But temporarily disabled for debugging");
            // toast.error("Session expired. Please log in again.");
            // signOut();
            // // Redirect to landing page
            // window.location.href = "/";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check token expiration on mount and set up periodic checks
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (accessToken && isTokenExpired(accessToken)) {
        console.log("Token expired, logging out user");
        console.log("Access token:", accessToken.substring(0, 20) + "...");
        console.log("Token expiration check triggered");
        console.log("But temporarily disabled for debugging");
        // toast.error("Session expired. Please log in again.");
        // signOut();
        // window.location.href = "/";
      }
    };

    // Don't check immediately on mount to prevent logout during navigation
    // Only check on initial load or accessToken change
    if (!accessToken) {
      return;
    }

    // Check every 5 minutes
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken]);

  // Do not fetch on mount. Keep loading false after initial render.
  useEffect(() => {
    setLoading(false);
  }, []);

  // Fetch fresh profile data on app mount to ensure we have latest data
  // DISABLED: This was causing black screen on first login because it was fetching
  // profile immediately after login, which set loading state and interfered with navigation
  // The profile data from login response is sufficient for initial authentication
  // useEffect(() => {
  //   if (accessToken && user) {
  //     console.log(
  //       "App mounted with user data, fetching fresh profile to ensure latest data..."
  //     );
  //     fetchUserProfile();
  //   }
  // }, [accessToken]); // Only run when accessToken changes (on login)

  // Fix missing workId by fetching fresh profile data
  // Only fetch if workId is missing AND we haven't recently updated the profile
  useEffect(() => {
    if (user && !user.workId && accessToken) {
      // Check if we recently updated the profile (within last 30 seconds)
      const recentlyUpdated =
        user.avatarUpdatedAt &&
        Date.now() - new Date(user.avatarUpdatedAt).getTime() < 30000;

      if (!recentlyUpdated) {
        console.log("User data missing workId, fetching fresh profile...");
        fetchUserProfile();
      } else {
        console.log("Skipping profile fetch - recently updated profile image");
      }
    }
  }, [user, accessToken]);

  /**
   * Sign in user with work ID and password
   *
   * @param {string} workId - User's work ID
   * @param {string} password - User's password
   * @returns {Object} Result object with success status and error message if applicable
   */
  const signIn = async (workId, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        workId,
        password,
      });

      if (response.status === 200) {
        const { accessToken: tokenFromLogin, data: userData } = response.data;

        // Update state and localStorage
        setAccessToken(tokenFromLogin);
        setUser(userData);
        localStorage.setItem("access_token", tokenFromLogin);
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Don't fetch profile immediately after login - use the userData from login response
        // This prevents the black screen issue caused by setting loading state during navigation
        // The profile will be fetched later if needed (e.g., if workId is missing)
        
        return { success: true };
      }
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  /**
   * Sign up new user with form data
   *
   * @param {Object} formData - User registration data
   * @returns {Object} Result object with success status and error message if applicable
   */
  const signUp = async (formData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, formData);
      return { success: true };
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  /**
   * Sign out user and clear authentication data
   *
   * Clears the user state, access token, and removes stored data from localStorage.
   * Use this to explicitly end a user session (e.g., from a logout button).
   *
   * @returns {void}
   */
  const signOut = () => {
    console.log("=== SIGNOUT TRIGGERED ===");
    console.log("SignOut called at:", new Date().toISOString());
    console.log("Current URL:", window.location.href);
    console.log("Current path:", window.location.pathname);
    console.log("Stack trace:", new Error().stack);
    console.log("=== SIGNOUT TRIGGERED END ===");

    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  };

  /**
   * Check if current token is valid and not expired
   *
   * @returns {boolean} True if token is valid and not expired
   */
  const isTokenValid = () => {
    return accessToken && !isTokenExpired(accessToken);
  };

  /**
   * Get token expiration time (for debugging)
   *
   * @returns {Date | null} Expiration date or null if invalid token
   */
  const getTokenExpiration = () => {
    if (!accessToken) return null;

    try {
      const payload = JSON.parse(atob(accessToken.split(".")[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  };

  /**
   * Fetch the current user's profile
   *
   * Makes an authenticated GET request to `${API_URL}/status/profile` using
   * the access token stored in state. On success, updates the `user` state and
   * returns the fetched data. If no token is available, returns an error.
   *
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const fetchUserProfile = async (overrideToken) => {
    const tokenToUse = overrideToken ?? accessToken;
    if (!tokenToUse) {
      return { success: false, error: "No access token available" };
    }

    try {
      const response = await axios.get(`${API_URL}/status/profile`, {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data.data);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  /**
   * Update the current user's profile
   *
   * Sends a PUT request to `${API_URL}/status/profile` with the provided
   * fields. Requires a valid access token. On success, persists the updated
   * user in state and returns it.
   *
   * @param {Object} updates - Partial user fields to update
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const updateProfile = async (updates) => {
    if (!accessToken) {
      return { success: false, error: "No access token available" };
    }

    try {
      const response = await axios.put(`${API_URL}/status/profile`, updates, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 200) {
        setUser(response.data.data);
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  /**
   * Change the current user's password
   *
   * Sends a PUT request to `${API_URL}/auth/change-password` with the current
   * and new password. Requires a valid access token.
   *
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const changePassword = async (passwordData) => {
    if (!accessToken) {
      return { success: false, error: "No access token available" };
    }

    try {
      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        passwordData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: "Password changed successfully",
        };
      }
    } catch (err) {
      console.error(
        "Password change error:",
        err.response?.data || err.message
      );
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  /**
   * Update the current user's notification preferences
   *
   * Sends a PUT request to `${API_URL}/settings/notifications` with the notification
   * preferences. Requires a valid access token.
   *
   * @param {Object} notificationSettings - Notification preferences data
   * @returns {Promise<{success: boolean, data?: any, error?: string}>}
   */
  const updateNotificationPreferences = async (notificationSettings) => {
    if (!accessToken) {
      return { success: false, error: "No access token available" };
    }

    try {
      const response = await axios.put(
        `${API_URL}/settings/notifications`,
        notificationSettings,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: "Notification preferences updated successfully",
        };
      }
    } catch (err) {
      console.error(
        "Notification preferences update error:",
        err.response?.data || err.message
      );
      return {
        success: false,
        error: err.response?.data?.message || err.message,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        signIn,
        signUp,
        signOut,
        fetchUserProfile,
        updateProfile,
        changePassword,
        updateNotificationPreferences,
        setUser,
        isTokenValid,
        isTokenExpired,
        getTokenExpiration,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  /**
   * useAuth hook
   *
   * Convenience hook to access the authentication context. Throws an error if
   * used outside of an `AuthProvider`.
   *
   * @returns {{
   *   user: any,
   *   accessToken: string | null,
   *   loading: boolean,
   *   signIn: (workId: string, password: string) => Promise<{success: boolean, error?: string}>,
   *   signUp: (formData: Object) => Promise<{success: boolean, error?: string}>,
   *   signOut: () => void,
   *   fetchUserProfile: () => Promise<{success: boolean, data?: any, error?: string}>,
   *   updateProfile: (updates: Object) => Promise<{success: boolean, data?: any, error?: string}>
   * }} Auth context value
   */
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default useAuth;
