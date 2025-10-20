import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";

/**
 * Custom hook for managing HR sidebar counts
 * Provides consistent badge counts for HR dashboard navigation
 */
export const useHRSidebarCounts = () => {
  const { accessToken } = useAuth();
  const [counts, setCounts] = useState({
    evaluations: 0,
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

  // Fetch evaluations count
  const fetchEvaluationsCount = useCallback(async (apiClient) => {
    try {
      console.log("🔍 Fetching HR evaluations count...");
      // Use the correct endpoint for performance trends which includes evaluations
      const response = await apiClient.get(
        "/api/v1/dashboard/hr/performance/trends"
      );
      if (response.data && response.data.success) {
        // Count evaluations from performance trends data
        const evaluationsData = response.data.data || [];
        const pendingCount = Array.isArray(evaluationsData)
          ? evaluationsData.filter(
              (evaluation) =>
                evaluation.status === "pending" ||
                evaluation.status === "active" ||
                evaluation.status === "in_progress" ||
                evaluation.status === "submitted"
            ).length
          : 0;
        console.log(`📊 HR evaluations count: ${pendingCount} pending/active`);
        return pendingCount;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching HR evaluations count:", error);
      return 0;
    }
  }, []);

  // Fetch employees count
  const fetchEmployeesCount = useCallback(async (apiClient) => {
    try {
      console.log("🔍 Fetching HR employees count...");
      // Use the HR overview endpoint which includes employee data
      const response = await apiClient.get("/api/v1/dashboard/hr/overview");
      if (response.data && response.data.success) {
        const activeEmployees = response.data.data?.activeEmployees || 0;
        console.log(
          `📊 HR employees count: ${activeEmployees} active employees`
        );
        return activeEmployees;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching HR employees count:", error);
      return 0;
    }
  }, []);

  // Fetch messages count
  const fetchMessagesCount = useCallback(async (apiClient) => {
    try {
      console.log("🔍 Fetching HR messages count...");
      // Use a fallback approach since messages endpoint might not exist
      // For now, return 0 or use a different approach
      console.log(`📊 HR messages count: 0 (messages endpoint not available)`);
      return 0;
    } catch (error) {
      console.error("Error fetching HR messages count:", error);
      return 0;
    }
  }, []);

  // Fetch reports count
  const fetchReportsCount = useCallback(async (apiClient) => {
    try {
      console.log("🔍 Fetching HR reports count...");
      // Use HR overview endpoint to get incomplete tasks as reports
      const response = await apiClient.get("/api/v1/dashboard/hr/overview");
      if (response.data && response.data.success) {
        const incompleteTasks = response.data.data?.incompleteTasks || 0;
        console.log(
          `📊 HR reports count: ${incompleteTasks} incomplete tasks (as reports)`
        );
        return incompleteTasks;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching HR reports count:", error);
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
      const apiClient = createApiClient();

      // Fetch all counts in parallel
      const [evaluationsCount, employeesCount, messagesCount, reportsCount] =
        await Promise.all([
          fetchEvaluationsCount(apiClient),
          fetchEmployeesCount(apiClient),
          fetchMessagesCount(apiClient),
          fetchReportsCount(apiClient),
        ]);

      setCounts({
        evaluations: evaluationsCount,
        employees: employeesCount,
        messages: messagesCount,
        reports: reportsCount,
        loading: false,
        error: null,
      });

      lastFetchTime.current = now;
      isInitialized.current = true;
    } catch (error) {
      console.error("Error fetching HR sidebar counts:", error);
      setCounts((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [
    accessToken,
    createApiClient,
    fetchEvaluationsCount,
    fetchEmployeesCount,
    fetchMessagesCount,
    fetchReportsCount,
  ]);

  // Initial fetch and periodic updates
  useEffect(() => {
    console.log("🔍 Initial HR sidebar load - fetching counts from API");
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

  // Listen for HR-specific events to refresh counts
  useEffect(() => {
    const handleEvaluationCreated = (event) => {
      console.log(
        "🔄 HR evaluation created event received, refreshing counts...",
        event.detail
      );
      // Immediate count update
      setCounts((prev) => ({
        ...prev,
        evaluations: prev.evaluations + 1,
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleEmployeeAdded = (event) => {
      console.log(
        "🔄 Employee added event received, refreshing counts...",
        event.detail
      );
      // Immediate count update
      setCounts((prev) => ({
        ...prev,
        employees: prev.employees + 1,
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleMessageReceived = (event) => {
      console.log(
        "🔄 New message received event, refreshing counts...",
        event.detail
      );
      // Immediate count update
      setCounts((prev) => ({
        ...prev,
        messages: prev.messages + 1,
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleReportGenerated = (event) => {
      console.log(
        "🔄 Report generated event received, refreshing counts...",
        event.detail
      );
      // Immediate count update
      setCounts((prev) => ({
        ...prev,
        reports: prev.reports + 1,
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    const handleEvaluationCompleted = (event) => {
      console.log(
        "🔄 Evaluation completed event received, updating counts...",
        event.detail
      );
      // Immediate count decrease
      setCounts((prev) => ({
        ...prev,
        evaluations: Math.max(0, prev.evaluations - 1),
      }));
      // Also refresh from API after a short delay
      setTimeout(() => {
        forceRefreshCounts();
      }, 500);
    };

    // Listen for HR-specific events
    window.addEventListener("hrEvaluationCreated", handleEvaluationCreated);
    window.addEventListener("employeeAdded", handleEmployeeAdded);
    window.addEventListener("messageReceived", handleMessageReceived);
    window.addEventListener("reportGenerated", handleReportGenerated);
    window.addEventListener("evaluationCompleted", handleEvaluationCompleted);

    return () => {
      window.removeEventListener(
        "hrEvaluationCreated",
        handleEvaluationCreated
      );
      window.removeEventListener("employeeAdded", handleEmployeeAdded);
      window.removeEventListener("messageReceived", handleMessageReceived);
      window.removeEventListener("reportGenerated", handleReportGenerated);
      window.removeEventListener(
        "evaluationCompleted",
        handleEvaluationCompleted
      );
    };
  }, [fetchCounts, forceRefreshCounts]);

  // Add global debugging functions for HR sidebar
  useEffect(() => {
    window.forceRefreshHRSidebarCounts = () => {
      console.log("🔄 Force refreshing HR sidebar counts from console...");
      refreshCounts();
    };

    window.debugHRSidebarCounts = () => {
      console.log("📊 Current HR sidebar counts:", {
        evaluations: counts.evaluations,
        employees: counts.employees,
        messages: counts.messages,
        reports: counts.reports,
        loading: counts.loading,
        error: counts.error,
      });
    };

    window.testHRSidebarSync = async () => {
      console.log("🧪 Testing HR sidebar synchronization...");
      try {
        const apiClient = createApiClient();

        const [evaluationsCount, employeesCount, messagesCount, reportsCount] =
          await Promise.all([
            fetchEvaluationsCount(apiClient),
            fetchEmployeesCount(apiClient),
            fetchMessagesCount(apiClient),
            fetchReportsCount(apiClient),
          ]);

        console.log("📊 HR Sidebar sync test results:", {
          evaluations: {
            current: counts.evaluations,
            api: evaluationsCount,
            match: counts.evaluations === evaluationsCount,
          },
          employees: {
            current: counts.employees,
            api: employeesCount,
            match: counts.employees === employeesCount,
          },
          messages: {
            current: counts.messages,
            api: messagesCount,
            match: counts.messages === messagesCount,
          },
          reports: {
            current: counts.reports,
            api: reportsCount,
            match: counts.reports === reportsCount,
          },
        });

        return {
          evaluations: { current: counts.evaluations, api: evaluationsCount },
          employees: { current: counts.employees, api: employeesCount },
          messages: { current: counts.messages, api: messagesCount },
          reports: { current: counts.reports, api: reportsCount },
        };
      } catch (error) {
        console.error("❌ Error testing HR sidebar sync:", error);
      }
    };
  }, [
    counts,
    refreshCounts,
    createApiClient,
    fetchEvaluationsCount,
    fetchEmployeesCount,
    fetchMessagesCount,
    fetchReportsCount,
  ]);

  return {
    counts,
    refreshCounts,
    forceRefreshCounts,
    loading: counts.loading,
  };
};
