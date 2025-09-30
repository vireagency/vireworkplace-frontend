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

// Action types
const SIDEBAR_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_COUNTS: "SET_COUNTS",
  SET_ERROR: "SET_ERROR",
  UPDATE_COUNT: "UPDATE_COUNT",
  REFRESH_COUNTS: "REFRESH_COUNTS",
  SET_INITIALIZED: "SET_INITIALIZED",
};

// Initial state
const initialState = {
  counts: {
    tasks: 0,
    evaluations: 0,
    attendance: 0,
    messages: 0,
  },
  loading: true,
  error: null,
  initialized: false,
  lastFetchTime: 0,
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
      const response = await apiClient.get(
        "/api/v1/dashboard/staff/evaluations/reviews"
      );
      if (response.data && response.data.success) {
        const evaluations = response.data.data || [];
        return Array.isArray(evaluations) ? evaluations.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching evaluations count:", error);
      return 0;
    }
  }, []);

  const fetchAttendanceCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/attendance/status");
      if (response.data && response.data.success) {
        // For attendance, we might want to show pending approvals or notifications
        // For now, return 0 as attendance doesn't typically have a "count" like tasks
        return 0;
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

        const [tasksCount, evaluationsCount, attendanceCount, messagesCount] =
          await Promise.all([
            fetchTasksCount(apiClient),
            fetchEvaluationsCount(apiClient),
            fetchAttendanceCount(apiClient),
            fetchMessagesCount(apiClient),
          ]);

        // Debug logging
        console.log("Sidebar counts fetched:", {
          tasks: tasksCount,
          evaluations: evaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
        });

        dispatch({
          type: SIDEBAR_ACTIONS.SET_COUNTS,
          payload: {
            tasks: tasksCount,
            evaluations: evaluationsCount,
            attendance: attendanceCount,
            messages: messagesCount,
          },
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
        dispatch({ type: SIDEBAR_ACTIONS.SET_ERROR, payload: error.message });
      }
    },
    [
      accessToken,
      createApiClient,
      fetchTasksCount,
      fetchEvaluationsCount,
      fetchAttendanceCount,
      fetchMessagesCount,
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

  const contextValue = {
    counts: state.counts,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,
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
