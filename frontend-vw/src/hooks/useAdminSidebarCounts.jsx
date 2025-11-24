import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";
import { tasksApi } from "@/services/tasksApi";

/**
 * Custom hook for managing Admin sidebar counts
 * Provides consistent badge counts for Admin dashboard navigation
 */
export const useAdminSidebarCounts = () => {
  const { accessToken } = useAuth();
  const [counts, setCounts] = useState({
    tasks: 0,
    employees: 0,
    messages: 0,
    reports: 0,
    loading: true,
    error: null,
  });

  // Use ref to prevent unnecessary re-renders
  const lastFetchTime = useRef(0);
  const FETCH_INTERVAL = 30000; // 30 seconds - more frequent updates
  const isInitialized = useRef(false);

  // Fetch tasks count
  const fetchTasksCount = useCallback(async () => {
    try {
      if (!accessToken) return 0;
      
      console.log("🔍 Fetching Admin tasks count...");
      const result = await tasksApi.getAllTasks(accessToken, {});
      
      if (result.success) {
        const tasksData = result.data.data || result.data.tasks || result.data || [];
        const pendingTasks = Array.isArray(tasksData)
          ? tasksData.filter(
              (task) =>
                task.status?.toLowerCase() !== "completed"
            ).length
          : 0;
        console.log(`📊 Admin tasks count: ${pendingTasks} pending/incomplete`);
        return pendingTasks;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching Admin tasks count:", error);
      return 0;
    }
  }, [accessToken]);

  // Fetch employees count (placeholder - can be implemented later)
  const fetchEmployeesCount = useCallback(async () => {
    try {
      console.log("🔍 Fetching Admin employees count...");
      // TODO: Implement employees count fetch
      return 0;
    } catch (error) {
      console.error("Error fetching Admin employees count:", error);
      return 0;
    }
  }, []);

  // Fetch messages count (placeholder - can be implemented later)
  const fetchMessagesCount = useCallback(async () => {
    try {
      console.log("🔍 Fetching Admin messages count...");
      // TODO: Implement messages count fetch
      return 0;
    } catch (error) {
      console.error("Error fetching Admin messages count:", error);
      return 0;
    }
  }, []);

  // Fetch reports count (placeholder - can be implemented later)
  const fetchReportsCount = useCallback(async () => {
    try {
      console.log("🔍 Fetching Admin reports count...");
      // TODO: Implement reports count fetch
      return 0;
    } catch (error) {
      console.error("Error fetching Admin reports count:", error);
      return 0;
    }
  }, []);

  // Fetch all counts
  const fetchCounts = useCallback(async () => {
    if (!accessToken) {
      setCounts((prev) => ({ ...prev, loading: false }));
      return;
    }

    const now = Date.now();
    if (now - lastFetchTime.current < FETCH_INTERVAL && isInitialized.current) {
      return;
    }

    try {
      // Fetch all counts in parallel
      const [tasksCount, employeesCount, messagesCount, reportsCount] =
        await Promise.all([
          fetchTasksCount(),
          fetchEmployeesCount(),
          fetchMessagesCount(),
          fetchReportsCount(),
        ]);

      setCounts({
        tasks: tasksCount,
        employees: employeesCount,
        messages: messagesCount,
        reports: reportsCount,
        loading: false,
        error: null,
      });

      lastFetchTime.current = now;
      isInitialized.current = true;
    } catch (error) {
      console.error("Error fetching Admin sidebar counts:", error);
      setCounts((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [
    accessToken,
    fetchTasksCount,
    fetchEmployeesCount,
    fetchMessagesCount,
    fetchReportsCount,
  ]);

  // Initial fetch and periodic updates
  useEffect(() => {
    console.log("🔍 Initial Admin sidebar load - fetching counts from API");
    fetchCounts();

    // Set up periodic refresh
    const interval = setInterval(fetchCounts, FETCH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchCounts]);

  // Manual refresh function
  const refreshCounts = useCallback(() => {
    lastFetchTime.current = 0; // Force refresh
    fetchCounts();
  }, [fetchCounts]);

  // Force immediate refresh function
  const forceRefreshCounts = useCallback(() => {
    lastFetchTime.current = 0;
    isInitialized.current = false;
    fetchCounts();
  }, [fetchCounts]);

  // Listen for task-related events to refresh counts
  useEffect(() => {
    const handleTaskCreated = (event) => {
      console.log(
        "🔄 Admin task created event received, refreshing counts...",
        event.detail
      );
      // Immediate count update
      setCounts((prev) => ({
        ...prev,
        tasks: prev.tasks + 1,
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleTaskDeleted = (event) => {
      console.log(
        "🔄 Admin task deleted event received, refreshing counts...",
        event.detail
      );
      // Immediate count decrease
      setCounts((prev) => ({
        ...prev,
        tasks: Math.max(0, prev.tasks - 1),
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleTaskStatusChanged = (event) => {
      console.log(
        "🔄 Admin task status changed event received, refreshing counts...",
        event.detail
      );
      const { newStatus, oldStatus } = event.detail || {};
      
      // If task was completed, decrease count
      // If task was uncompleted (from completed to pending/in progress), increase count
      if (oldStatus?.toLowerCase() === "completed" && newStatus?.toLowerCase() !== "completed") {
        setCounts((prev) => ({
          ...prev,
          tasks: prev.tasks + 1,
        }));
      } else if (oldStatus?.toLowerCase() !== "completed" && newStatus?.toLowerCase() === "completed") {
        setCounts((prev) => ({
          ...prev,
          tasks: Math.max(0, prev.tasks - 1),
        }));
      }
      
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleTaskUpdated = (event) => {
      console.log(
        "🔄 Admin task updated event received, refreshing counts...",
        event.detail
      );
      // Refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    // Listen for Admin-specific events
    window.addEventListener("adminTaskCreated", handleTaskCreated);
    window.addEventListener("adminTaskDeleted", handleTaskDeleted);
    window.addEventListener("adminTaskStatusChanged", handleTaskStatusChanged);
    window.addEventListener("adminTaskUpdated", handleTaskUpdated);

    return () => {
      window.removeEventListener("adminTaskCreated", handleTaskCreated);
      window.removeEventListener("adminTaskDeleted", handleTaskDeleted);
      window.removeEventListener("adminTaskStatusChanged", handleTaskStatusChanged);
      window.removeEventListener("adminTaskUpdated", handleTaskUpdated);
    };
  }, [fetchCounts, forceRefreshCounts]);

  return {
    counts,
    refreshCounts,
    forceRefreshCounts,
    loading: counts.loading,
  };
};

