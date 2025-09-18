import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";

/**
 * Custom hook for managing sidebar counts across staff pages
 * Provides consistent badge counts and prevents unnecessary re-renders
 */
export const useSidebarCounts = () => {
  const { accessToken } = useAuth();
  const [counts, setCounts] = useState({
    tasks: 0,
    evaluations: 0,
    attendance: 0,
    messages: 0,
    loading: true,
    error: null,
  });

  // Use ref to prevent unnecessary re-renders
  const lastFetchTime = useRef(0);
  const FETCH_INTERVAL = 60000; // 60 seconds - longer cache to prevent disappearing

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

  // Fetch individual counts
  const fetchTasksCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/tasks");
      if (response.data && response.data.success) {
        const tasksData = response.data.data || response.data.tasks || [];
        return Array.isArray(tasksData) ? tasksData.length : 0;
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
        const evaluationsData =
          response.data.data || response.data.evaluations || [];
        return Array.isArray(evaluationsData) ? evaluationsData.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching evaluations count:", error);
      return 0;
    }
  }, []);

  const fetchAttendanceCount = useCallback(async (apiClient) => {
    try {
      // Try to get attendance records - if successful, user has attendance data
      const response = await apiClient.get("/api/v1/attendance");
      if (response.data && response.data.success) {
        const attendanceData =
          response.data.data || response.data.attendance || [];
        // Return count of attendance records
        return Array.isArray(attendanceData) ? attendanceData.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching attendance count:", error);
      return 0;
    }
  }, []);

  const fetchMessagesCount = useCallback(async (apiClient) => {
    try {
      // Use notifications endpoint instead of messages/unread since messages endpoint doesn't exist
      const response = await apiClient.get("/api/v1/notifications");
      if (response.data && response.data.success) {
        const notifications =
          response.data.data || response.data.notifications || [];
        // Count unread notifications as messages
        const unreadCount = notifications.filter((n) => !n.isRead).length;
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
        setCounts((prev) => ({ ...prev, loading: false }));
        return;
      }

      const now = Date.now();
      if (!force && now - lastFetchTime.current < FETCH_INTERVAL) {
        return; // Skip if fetched recently
      }

      try {
        setCounts((prev) => ({ ...prev, loading: true, error: null }));
        lastFetchTime.current = now;

        const apiClient = createApiClient();

        const [tasksCount, evaluationsCount, attendanceCount, messagesCount] =
          await Promise.all([
            fetchTasksCount(apiClient),
            fetchEvaluationsCount(apiClient),
            fetchAttendanceCount(apiClient),
            fetchMessagesCount(apiClient),
          ]);

        setCounts({
          tasks: tasksCount,
          evaluations: evaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
        // Keep existing counts if there's an error to prevent disappearing
        setCounts((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    },
    [
      accessToken,
      createApiClient,
      fetchTasksCount,
      fetchEvaluationsCount,
      fetchAttendanceCount,
      fetchMessagesCount,
    ]
  );

  // Initial fetch
  useEffect(() => {
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  // Refresh function for manual updates
  const refreshCounts = useCallback(() => {
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  return {
    ...counts,
    refreshCounts,
  };
};
