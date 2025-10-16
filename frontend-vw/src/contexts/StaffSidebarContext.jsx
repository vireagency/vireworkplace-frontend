import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";
import { staffEvaluationsApi } from "@/services/staffEvaluations";

// Action types
const SIDEBAR_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_COUNTS: "SET_COUNTS",
  SET_ERROR: "SET_ERROR",
  UPDATE_COUNT: "UPDATE_COUNT",
  REFRESH_COUNTS: "REFRESH_COUNTS",
  SET_INITIALIZED: "SET_INITIALIZED",
  SET_INITIAL_LOAD: "SET_INITIAL_LOAD",
};

// Initial state
const initialState = {
  counts: {
    tasks: 0,
    evaluations: 0,
    attendance: 0,
    messages: 0,
    reports: 0,
  },
  loading: true,
  error: null,
  initialized: false,
  lastFetchTime: 0,
  // Add flag to prevent showing incorrect counts during initial load
  isInitialLoad: true,
};

// Reducer
const sidebarReducer = (state, action) => {
  switch (action.type) {
    case SIDEBAR_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null,
      };

    case SIDEBAR_ACTIONS.SET_COUNTS:
      return {
        ...state,
        counts: action.payload,
        loading: false,
        error: null,
        initialized: true,
        lastFetchTime: Date.now(),
      };

    case SIDEBAR_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case SIDEBAR_ACTIONS.UPDATE_COUNT:
      return {
        ...state,
        counts: {
          ...state.counts,
          [action.payload.key]: action.payload.value,
        },
      };

    case SIDEBAR_ACTIONS.REFRESH_COUNTS:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case SIDEBAR_ACTIONS.SET_INITIALIZED:
      return {
        ...state,
        initialized: action.payload,
      };

    case SIDEBAR_ACTIONS.SET_INITIAL_LOAD:
      return {
        ...state,
        isInitialLoad: action.payload,
      };

    default:
      return state;
  }
};

// Context
const StaffSidebarContext = createContext(null);

// Provider component
export const StaffSidebarProvider = ({ children }) => {
  const [state, dispatch] = useReducer(sidebarReducer, initialState);
  const { accessToken } = useAuth();

  // Create API client
  const createApiClient = useCallback(() => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "https://www.api.vire.agency";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");

    return axios.create({
      baseURL: noApiV1,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      timeout: 10000,
    });
  }, [accessToken]);

  // Fetch individual count functions
  const fetchTasksCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/tasks");
      if (response.data && response.data.success) {
        const tasks = response.data.data || response.data.tasks || [];
        return Array.isArray(tasks) ? tasks.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching tasks count:", error);
      return 0;
    }
  }, []);

  const fetchEvaluationsCount = useCallback(async (apiClient) => {
    try {
      console.log(
        "🔍 StaffSidebarContext: Fetching REMAINING evaluations count..."
      );

      // Debug localStorage first
      const completedEvaluations = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log(
        "🔍 StaffSidebarContext: Current completed evaluations in localStorage:",
        completedEvaluations
      );

      // Try to fetch only pending evaluations first
      let response;
      try {
        response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews",
          {
            params: { status: "pending" },
          }
        );
        console.log(
          "✅ StaffSidebarContext: Successfully fetched pending evaluations directly from API"
        );
      } catch (error) {
        console.log(
          "⚠️ StaffSidebarContext: API doesn't support status filter, fetching all evaluations"
        );
        response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews"
        );
      }

      // Handle different response structures
      let evaluationsData = [];
      if (response.data) {
        if (
          response.data.success &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          evaluationsData = response.data.data;
        } else if (
          response.data.success &&
          response.data.evaluations &&
          Array.isArray(response.data.evaluations)
        ) {
          evaluationsData = response.data.evaluations;
        } else if (Array.isArray(response.data)) {
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

      console.log(
        "🔍 StaffSidebarContext: Extracted evaluations data:",
        evaluationsData
      );

      if (!Array.isArray(evaluationsData)) {
        console.log(
          "⚠️ StaffSidebarContext: No evaluations data or API failed, returning 0"
        );
        return 0;
      }

      console.log("📊 StaffSidebarContext: REMAINING count calculation:", {
        totalEvaluations: evaluationsData.length,
        apiResponseContainsOnlyPending:
          response.config?.params?.status === "pending",
      });

      // If no evaluations at all, return 0 immediately
      if (evaluationsData.length === 0) {
        console.log(
          "✅ StaffSidebarContext: No evaluations found - returning 0"
        );
        return 0;
      }

      // If API returned only pending evaluations, use them directly
      let remainingEvaluations;
      if (response.config?.params?.status === "pending") {
        console.log(
          "✅ StaffSidebarContext: API returned only pending evaluations - using directly"
        );
        remainingEvaluations = evaluationsData;
      } else {
        console.log(
          "🔄 StaffSidebarContext: API returned all evaluations - filtering for remaining"
        );
        remainingEvaluations = evaluationsData.filter((evaluation) => {
          const evaluationId = evaluation.id || evaluation._id;

          // Use the same completion detection logic as the main page
          const isCompleted =
            staffEvaluationsApi.isEvaluationCompleted(evaluationId);
          const isApiCompleted =
            evaluation.status === "completed" ||
            evaluation.status === "submitted";

          // Only show evaluations that are NOT completed or submitted
          const isRemaining = !isCompleted && !isApiCompleted;

          console.log(
            `📋 StaffSidebarContext: Evaluation ${evaluationId}: completed=${isCompleted}, apiCompleted=${isApiCompleted}, status=${
              evaluation.status
            }, title=${evaluation.title || evaluation.formName}`
          );
          console.log(`   → Is remaining: ${isRemaining}`);

          return isRemaining;
        });
      }

      console.log(
        "📊 StaffSidebarContext: REMAINING count calculation results:",
        {
          totalEvaluations: evaluationsData.length,
          remainingEvaluations: remainingEvaluations.length,
          completedEvaluations:
            evaluationsData.length - remainingEvaluations.length,
        }
      );

      console.log(
        `✅ StaffSidebarContext: REMAINING evaluations count: ${remainingEvaluations.length} remaining out of ${evaluationsData.length} total`
      );
      return remainingEvaluations.length;
    } catch (error) {
      console.error(
        "❌ StaffSidebarContext: Error fetching remaining evaluations count:",
        error
      );
      return 0;
    }
  }, []);

  const fetchAttendanceCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/attendance/status");
      if (response.data && response.data.success) {
        // Check if user has checked in today
        const data = response.data.data || response.data;
        if (data.hasCheckedIn && !data.hasCheckedOut) {
          return 1; // Show badge if checked in but not checked out
        }
      }
      return 0;
    } catch (error) {
      console.error("Error fetching attendance count:", error);
      return 0;
    }
  }, []);

  const fetchMessagesCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/notifications");
      if (response.data && response.data.success) {
        const notifications = response.data.data || [];
        const unreadCount = Array.isArray(notifications)
          ? notifications.filter((n) => !n.isRead).length
          : 0;
        return unreadCount;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching messages count:", error);
      return 0;
    }
  }, []);

  const fetchReportsCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/dashboard/reports");
      if (response.data && response.data.success) {
        const reports = response.data.data || [];
        // Count all reports for now
        const totalCount = Array.isArray(reports) ? reports.length : 0;
        console.log("📊 Reports count fetched (context):", totalCount);
        return totalCount;
      }
      console.log("📊 Reports API returned no data (context), returning 0");
      return 0;
    } catch (error) {
      // Silently fail if reports endpoint doesn't exist or has issues
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log("📊 Reports endpoint not available (context), returning 0");
      } else {
        console.error("Error fetching reports count (context):", error.message);
      }
      return 0;
    }
  }, []);

  // Fetch all counts
  const fetchAllCounts = useCallback(
    async (force = false) => {
      if (!accessToken) {
        dispatch({ type: SIDEBAR_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      const now = Date.now();
      const FETCH_INTERVAL = 300000; // 5 minutes

      // Don't fetch if we've fetched recently and not forcing
      if (
        !force &&
        now - state.lastFetchTime < FETCH_INTERVAL &&
        state.initialized
      ) {
        return;
      }

      try {
        dispatch({ type: SIDEBAR_ACTIONS.REFRESH_COUNTS });

        const apiClient = createApiClient();

        const [
          tasksCount,
          evaluationsCount,
          attendanceCount,
          messagesCount,
          reportsCount,
        ] = await Promise.all([
          fetchTasksCount(apiClient),
          fetchEvaluationsCount(apiClient),
          fetchAttendanceCount(apiClient),
          fetchMessagesCount(apiClient),
          fetchReportsCount(apiClient),
        ]);

        // Debug logging
        console.log("Sidebar counts fetched:", {
          tasks: tasksCount,
          evaluations: evaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
          reports: reportsCount,
        });

        dispatch({
          type: SIDEBAR_ACTIONS.SET_COUNTS,
          payload: {
            tasks: tasksCount,
            evaluations: 0, // Always start with 0 for evaluations until main page broadcasts correct count
            attendance: attendanceCount,
            messages: messagesCount,
            reports: reportsCount,
          },
        });

        // Mark initial load as complete
        dispatch({
          type: SIDEBAR_ACTIONS.SET_INITIAL_LOAD,
          payload: false,
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
        dispatch({ type: SIDEBAR_ACTIONS.SET_ERROR, payload: error.message });

        // Even on error, mark initial load as complete to prevent infinite loading
        dispatch({
          type: SIDEBAR_ACTIONS.SET_INITIAL_LOAD,
          payload: false,
        });
      }
    },
    [
      accessToken,
      createApiClient,
      fetchTasksCount,
      fetchEvaluationsCount,
      fetchAttendanceCount,
      fetchMessagesCount,
      fetchReportsCount,
      state.lastFetchTime,
      state.initialized,
    ]
  );

  // Update individual count
  const updateCount = useCallback((key, value) => {
    dispatch({
      type: SIDEBAR_ACTIONS.UPDATE_COUNT,
      payload: { key, value },
    });
  }, []);

  // Refresh counts manually
  const refreshCounts = useCallback(() => {
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  // Initialize counts on mount
  useEffect(() => {
    if (accessToken && !state.initialized) {
      fetchAllCounts(true);
    }
  }, [accessToken, state.initialized, fetchAllCounts]);

  // Set up periodic refresh
  useEffect(() => {
    if (!accessToken || !state.initialized) return;

    const interval = setInterval(() => {
      fetchAllCounts(false);
    }, 300000); // Refresh every 5 minutes

    return () => clearInterval(interval);
  }, [accessToken, state.initialized, fetchAllCounts]);

  // Listen for evaluation completion events to refresh counts
  useEffect(() => {
    const handleEvaluationCompleted = (event) => {
      console.log(
        "🔄 StaffSidebarContext: Evaluation completed event received, refreshing counts...",
        event.detail
      );

      // Immediately decrement the count for instant feedback
      dispatch({
        type: SIDEBAR_ACTIONS.UPDATE_COUNT,
        payload: {
          key: "evaluations",
          value: Math.max(0, state.counts.evaluations - 1),
        },
      });

      console.log(
        "✅ StaffSidebarContext: Decremented evaluation count by 1 for instant UI feedback"
      );

      // Also refresh all counts in background to sync with API
      setTimeout(() => {
        console.log(
          "🔄 StaffSidebarContext: Background refresh after evaluation completion..."
        );
        fetchAllCounts(true);
      }, 1000); // Wait 1 second for backend to process
    };

    const handleEvaluationsCountUpdate = (event) => {
      const { total, completed, pending, source, action } = event.detail;
      console.log(
        `📥 StaffSidebarContext: Received evaluations count update from ${source}:`,
        {
          total,
          completed,
          pending,
          action,
        }
      );

      // Mark that we've received an evaluation count update
      localStorage.setItem("evaluationsCountUpdated", "true");

      // Update the sidebar count to match the page's calculation
      dispatch({
        type: SIDEBAR_ACTIONS.UPDATE_COUNT,
        payload: { key: "evaluations", value: pending || 0 },
      });

      console.log(
        `✅ StaffSidebarContext: Sidebar count updated to ${pending} (${completed} completed out of ${total} total)`
      );

      // If this is a completion action, also refresh counts after a short delay
      if (action === "completed") {
        setTimeout(() => {
          console.log(
            "🔄 StaffSidebarContext: Additional refresh after evaluationsCountUpdate completion..."
          );
          fetchAllCounts(true);
        }, 500);
      }
    };

    window.addEventListener("evaluationCompleted", handleEvaluationCompleted);
    window.addEventListener(
      "evaluationsCountUpdate",
      handleEvaluationsCountUpdate
    );

    return () => {
      window.removeEventListener(
        "evaluationCompleted",
        handleEvaluationCompleted
      );
      window.removeEventListener(
        "evaluationsCountUpdate",
        handleEvaluationsCountUpdate
      );
    };
  }, [fetchAllCounts, state.counts.evaluations]);

  // Add debug function to window for troubleshooting
  useEffect(() => {
    window.debugStaffSidebarCounts = async () => {
      console.log("🔍 DEBUGGING STAFF SIDEBAR COUNTS...");
      console.log("Current state:", {
        counts: state.counts,
        loading: state.loading,
        initialized: state.initialized,
        isInitialLoad: state.isInitialLoad,
        error: state.error,
      });

      if (!accessToken) {
        console.log("❌ No access token available");
        return;
      }

      try {
        const apiClient = createApiClient();

        // Test the API call directly
        console.log("🔍 Testing API call directly...");
        const response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews"
        );
        console.log("📊 Raw API response:", response.data);

        // Test with status filter
        try {
          console.log("🔍 Testing API call with status=pending filter...");
          const filteredResponse = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews",
            {
              params: { status: "pending" },
            }
          );
          console.log("📊 Filtered API response:", filteredResponse.data);
        } catch (error) {
          console.log("⚠️ Status filter not supported:", error.message);
        }

        // Test the actual fetchEvaluationsCount function
        console.log("🔍 Testing fetchEvaluationsCount function...");
        const count = await fetchEvaluationsCount(apiClient);
        console.log("📊 Final count returned:", count);

        // Check localStorage
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );
        const submissionHistory = JSON.parse(
          localStorage.getItem("evaluationSubmissions") || "[]"
        );
        console.log("📊 LocalStorage data:", {
          completedEvaluations,
          submissionHistory,
        });
      } catch (error) {
        console.error("❌ Debug error:", error);
      }
    };

    // Force set evaluations to 0
    window.forceStaffEvaluationsZero = () => {
      console.log("🔧 Force setting staff sidebar evaluations count to 0...");
      dispatch({
        type: SIDEBAR_ACTIONS.UPDATE_COUNT,
        payload: { key: "evaluations", value: 0 },
      });
      console.log("✅ Staff sidebar evaluations count set to 0");
    };

    // Clear all evaluation data and refresh
    window.clearStaffEvaluationData = () => {
      console.log("🧹 Clearing all staff evaluation data...");
      localStorage.removeItem("completedEvaluations");
      localStorage.removeItem("evaluationSubmissions");
      localStorage.removeItem("evaluationsCountUpdated");
      console.log("✅ Cleared evaluation data, refreshing counts...");
      fetchAllCounts(true);
    };

    // Reset evaluation count update flag
    window.resetEvaluationCountFlag = () => {
      console.log("🔄 Resetting evaluation count update flag...");
      localStorage.removeItem("evaluationsCountUpdated");
      console.log(
        "✅ Evaluation count update flag reset - sidebar will be conservative again"
      );
    };
  }, [
    accessToken,
    createApiClient,
    fetchEvaluationsCount,
    state,
    fetchAllCounts,
  ]);

  const contextValue = {
    counts: state.counts,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
    isInitialLoad: state.isInitialLoad,
    updateCount,
    refreshCounts,
    fetchAllCounts,
  };

  return (
    <StaffSidebarContext.Provider value={contextValue}>
      {children}
    </StaffSidebarContext.Provider>
  );
};

// Hook to use the context
export const useStaffSidebar = () => {
  const context = useContext(StaffSidebarContext);
  if (!context) {
    throw new Error(
      "useStaffSidebar must be used within a StaffSidebarProvider"
    );
  }
  return context;
};

export default StaffSidebarContext;
