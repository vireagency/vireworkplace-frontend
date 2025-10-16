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
  const FETCH_INTERVAL = 300000; // 5 minutes
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
      const response = await apiClient.get(
        "/api/v1/dashboard/hr/evaluations/reviews"
      );
      if (response.data && response.data.success) {
        const evaluationsData = response.data.data || [];
        // Count pending/active evaluations
        const pendingCount = Array.isArray(evaluationsData)
          ? evaluationsData.filter(
              (evaluation) =>
                evaluation.status === "pending" ||
                evaluation.status === "active" ||
                evaluation.status === "in_progress"
            ).length
          : 0;
        return pendingCount;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching evaluations count:", error);
      return 0;
    }
  }, []);

  // Fetch employees count
  const fetchEmployeesCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/employees/list");
      if (response.data && response.data.success) {
        const employeesData = response.data.data || [];
        return Array.isArray(employeesData) ? employeesData.length : 0;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching employees count:", error);
      return 0;
    }
  }, []);

  // Fetch messages count
  const fetchMessagesCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/messages");
      if (response.data && response.data.success) {
        const messagesData = response.data.data || [];
        // Count unread messages
        const unreadCount = Array.isArray(messagesData)
          ? messagesData.filter(
              (message) => !message.read || message.status === "unread"
            ).length
          : 0;
        return unreadCount;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching messages count:", error);
      return 0;
    }
  }, []);

  // Fetch reports count
  const fetchReportsCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/dashboard/reports");
      if (response.data && response.data.success) {
        const reportsData = response.data.data || [];
        // Count pending/in-progress reports
        const pendingCount = Array.isArray(reportsData)
          ? reportsData.filter(
              (report) =>
                report.status === "pending" ||
                report.status === "in progress" ||
                report.status === "draft"
            ).length
          : 0;
        return pendingCount;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching reports count:", error);
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

  return {
    counts,
    refreshCounts,
    loading: counts.loading,
  };
};

