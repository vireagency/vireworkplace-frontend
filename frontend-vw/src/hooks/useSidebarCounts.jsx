import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";
import { staffEvaluationsApi } from "@/services/staffEvaluations";

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
  const FETCH_INTERVAL = 300000; // 5 minutes - much longer cache to prevent disappearing
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
      console.log("🔍 Fetching evaluations count for sidebar...");
      const response = await apiClient.get(
        "/api/v1/dashboard/staff/evaluations/reviews"
      );
      if (response.data && response.data.success) {
        const evaluationsData =
          response.data.data || response.data.evaluations || [];

        if (Array.isArray(evaluationsData)) {
          console.log("📊 Sidebar count calculation:", {
            totalEvaluations: evaluationsData.length,
          });

          const pendingEvaluations = evaluationsData.filter((evaluation) => {
            const evaluationId = evaluation.id || evaluation._id;
            // Use the EXACT same logic as EvaluationsOverview page
            const isCompleted =
              staffEvaluationsApi.isEvaluationCompleted(evaluationId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";

            console.log(
              `📋 Evaluation ${evaluationId}: completed=${isCompleted}, apiCompleted=${isApiCompleted}, status=${
                evaluation.status
              }, title=${evaluation.title || evaluation.formName}`
            );

            // Only show evaluations that are NOT completed or submitted
            const shouldShow = !isCompleted && !isApiCompleted;
            console.log(`   → Should show: ${shouldShow}`);
            return shouldShow;
          });

          console.log(
            `✅ Sidebar evaluations count: ${pendingEvaluations.length} pending out of ${evaluationsData.length} total`
          );
          return pendingEvaluations.length;
        }
      }
      console.log("⚠️ No evaluations data or API failed, returning 0");
      return 0;
    } catch (error) {
      console.error("❌ Error fetching evaluations count:", error);

      // On 403 error, also check localStorage for completed evaluations
      if (error.response?.status === 403) {
        console.log("🔒 403 error - cannot fetch evaluations from API");
        console.log(
          "🔒 Since we can't fetch from API, assuming 0 pending evaluations"
        );

        // Since we can't fetch from API, assume 0 pending (all are completed)
        return 0;
      }

      return 0;
    }
  }, []);

  const fetchAttendanceCount = useCallback(async (apiClient) => {
    try {
      // Check attendance status to see if user has checked in today
      const response = await apiClient.get("/api/v1/attendance/status");
      if (response.data && response.data.success) {
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
      // Try to get notifications count - if endpoint doesn't exist, return 0
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
      if (
        !force &&
        now - lastFetchTime.current < FETCH_INTERVAL &&
        isInitialized.current
      ) {
        return; // Skip if fetched recently and already initialized
      }

      try {
        // Only show loading on initial load, not on refreshes
        if (!isInitialized.current) {
          setCounts((prev) => ({ ...prev, loading: true, error: null }));
        }
        lastFetchTime.current = now;

        const apiClient = createApiClient();

        const [tasksCount, evaluationsCount, attendanceCount, messagesCount] =
          await Promise.all([
            fetchTasksCount(apiClient),
            fetchEvaluationsCount(apiClient),
            fetchAttendanceCount(apiClient),
            fetchMessagesCount(apiClient),
          ]);

        // Check if there are completed evaluations and adjust count accordingly
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );

        // Don't force to 0 - use the actual filtered count from the API
        const finalEvaluationsCount = evaluationsCount;

        console.log("📊 Final sidebar counts:", {
          tasks: tasksCount,
          evaluations: finalEvaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
          completedEvaluations: completedEvaluations.length,
          originalEvaluationsCount: evaluationsCount,
        });

        setCounts((prev) => ({
          tasks: tasksCount,
          evaluations: finalEvaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
          loading: false,
          error: null,
        }));

        isInitialized.current = true;
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
    console.log("🔍 Initial sidebar load - fetching counts from API");
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  // Listen for evaluation completion and deletion events to refresh counts
  useEffect(() => {
    const handleEvaluationCompleted = () => {
      console.log(
        "🔄 Evaluation completed event received, refreshing counts..."
      );

      // Immediately decrement the count for instant feedback
      setCounts((prev) => ({
        ...prev,
        evaluations: Math.max(0, prev.evaluations - 1), // Prevent negative counts
      }));
      
      console.log("✅ Decremented evaluation count by 1 for instant UI feedback");

      // Also refresh all counts in background to sync with API
      setTimeout(() => {
        fetchAllCounts(true);
      }, 2000); // Wait 2 seconds for backend to process
    };

    const handleEvaluationDeleted = () => {
      console.log("🔄 Evaluation deleted event received, refreshing counts...");
      // Immediately decrement the count for instant feedback
      setCounts((prev) => ({
        ...prev,
        evaluations: Math.max(0, prev.evaluations - 1), // Prevent negative counts
      }));
      
      console.log("✅ Decremented evaluation count by 1 after deletion");
      
      // Also refresh all counts in background to sync with API
      setTimeout(() => {
        fetchAllCounts(true);
      }, 2000); // Wait 2 seconds for backend to process
    };

    window.addEventListener("evaluationCompleted", handleEvaluationCompleted);
    window.addEventListener("evaluationDeleted", handleEvaluationDeleted);

    return () => {
      window.removeEventListener(
        "evaluationCompleted",
        handleEvaluationCompleted
      );
      window.removeEventListener("evaluationDeleted", handleEvaluationDeleted);
    };
  }, [fetchAllCounts]);

  // Refresh function for manual updates
  const refreshCounts = useCallback(() => {
    console.log("🔄 Manually refreshing sidebar counts...");
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  // Force refresh evaluations count specifically
  const refreshEvaluationsCount = useCallback(() => {
    console.log("🔄 Force refreshing evaluations count...");
    if (accessToken) {
      const apiClient = createApiClient();
      fetchEvaluationsCount(apiClient).then((count) => {
        console.log(`🔄 Manual evaluations count refresh: ${count}`);
        setCounts((prev) => ({ ...prev, evaluations: count }));
      });
    } else {
      console.log("🔄 No access token, setting evaluations count to 0");
      setCounts((prev) => ({ ...prev, evaluations: 0 }));
    }
  }, [accessToken, createApiClient, fetchEvaluationsCount]);

  // Add global function for debugging
  useEffect(() => {
    window.forceRefreshSidebarCount = () => {
      console.log("🔄 Force refreshing sidebar count from console...");
      refreshEvaluationsCount();
    };

    window.checkSidebarData = () => {
      const completed = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log("📊 Current sidebar data:", {
        completedEvaluations: completed,
        currentCount: counts.evaluations,
        loading: counts.loading,
      });
    };

    window.forceSetEvaluationsZero = () => {
      console.log("🔄 Force setting evaluations count to 0...");
      setCounts((prev) => ({ ...prev, evaluations: 0 }));
    };

    window.testSidebarSync = async () => {
      console.log("🧪 Testing sidebar synchronization...");
      const completed = JSON.parse(localStorage.getItem("completedEvaluations") || "[]");
      console.log("📱 Completed in localStorage:", completed.length);
      
      // Fetch from API
      try {
        const apiClient = createApiClient();
        const response = await apiClient.get("/api/v1/dashboard/staff/evaluations/reviews");
        if (response.data && response.data.success) {
          const evaluationsData = response.data.data || response.data.evaluations || [];
          console.log("🌐 Total from API:", evaluationsData.length);
          
          const pending = evaluationsData.filter(evaluation => {
            const evalId = evaluation.id || evaluation._id;
            const isCompleted = completed.includes(evalId);
            const isApiCompleted = evaluation.status === "completed" || evaluation.status === "submitted";
            return !isCompleted && !isApiCompleted;
          });
          
          console.log("✅ Pending evaluations (should match sidebar):", pending.length);
          console.log("📊 Calculation: " + evaluationsData.length + " total - " + completed.length + " completed = " + pending.length + " pending");
          console.log("🎯 Current sidebar showing:", counts.evaluations);
          
          if (pending.length !== counts.evaluations) {
            console.warn("⚠️ MISMATCH DETECTED! Forcing refresh...");
            fetchAllCounts(true);
          } else {
            console.log("✅ Sidebar is in sync!");
          }
          
          return {
            totalFromAPI: evaluationsData.length,
            completedLocal: completed.length,
            pendingCalculated: pending.length,
            currentSidebarCount: counts.evaluations,
            inSync: pending.length === counts.evaluations
          };
        }
      } catch (error) {
        console.error("❌ Error testing sync:", error);
      }
    };

    window.fixEvaluationsCount = async () => {
      console.log("🔧 Fixing evaluations count...");
      const completed = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log("📱 Completed evaluations in localStorage:", completed.length);
      
      // Fetch from API to get accurate count
      try {
        const apiClient = createApiClient();
        const response = await apiClient.get("/api/v1/dashboard/staff/evaluations/reviews");
        if (response.data && response.data.success) {
          const evaluationsData = response.data.data || response.data.evaluations || [];
          console.log("🌐 Total evaluations from API:", evaluationsData.length);
          
          // Filter out completed ones
          const pending = evaluationsData.filter(evaluation => {
            const evalId = evaluation.id || evaluation._id;
            const isCompleted = completed.includes(evalId);
            const isApiCompleted = evaluation.status === "completed" || evaluation.status === "submitted";
            return !isCompleted && !isApiCompleted;
          });
          
          console.log("✅ Pending evaluations calculated:", pending.length);
          console.log("🔧 Setting sidebar count to:", pending.length);
          
          setCounts((prev) => ({ ...prev, evaluations: pending.length }));
          
          return {
            totalFromAPI: evaluationsData.length,
            completedLocal: completed.length,
            newSidebarCount: pending.length
          };
        }
      } catch (error) {
        console.error("❌ Error fixing count:", error);
        // Fallback: just refresh
        fetchAllCounts(true);
      }
    };

    window.debugEvaluationsMismatch = async () => {
      console.log("🔍 Debugging evaluations count mismatch...");

      // Check localStorage
      const completed = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log("📱 localStorage completed evaluations:", completed);

      // Check API data
      if (accessToken) {
        try {
          const apiClient = createApiClient();
          const response = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews"
          );
          if (response.data && response.data.success) {
            const evaluationsData =
              response.data.data || response.data.evaluations || [];
            console.log("🌐 API evaluations data:", evaluationsData);

            // Check each evaluation
            evaluationsData.forEach((evaluation) => {
              const evaluationId = evaluation.id || evaluation._id;
              const isInLocalStorage = completed.includes(evaluationId);
              const isApiCompleted =
                evaluation.status === "completed" ||
                evaluation.status === "submitted";

              console.log(
                `📋 ${
                  evaluation.title || evaluation.formName
                } (${evaluationId}):`,
                {
                  inLocalStorage: isInLocalStorage,
                  apiStatus: evaluation.status,
                  isApiCompleted: isApiCompleted,
                  shouldShow: !isInLocalStorage && !isApiCompleted,
                }
              );
            });
          }
        } catch (error) {
          console.error("❌ Error fetching API data for debug:", error);
        }
      }
    };
  }, [refreshEvaluationsCount, counts]);

  return {
    ...counts,
    refreshCounts,
    refreshEvaluationsCount,
  };
};
