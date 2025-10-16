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
    reports: 0,
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
      console.log("🔍 Fetching REMAINING evaluations count for sidebar...");

      // Debug localStorage first
      const completedEvaluations = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log(
        "🔍 Current completed evaluations in localStorage:",
        completedEvaluations
      );

      // Try to fetch only pending evaluations first
      let response;
      try {
        response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews",
          {
            params: {
              status: "pending",
            },
          }
        );
        console.log(
          "✅ Successfully fetched pending evaluations directly from API"
        );
      } catch (error) {
        console.log(
          "⚠️ API doesn't support status filter, fetching all evaluations"
        );
        // Fallback to fetching all evaluations if status filter is not supported
        response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews"
        );
      }
      if (response.data && response.data.success) {
        const evaluationsData =
          response.data.data || response.data.evaluations || [];

        if (Array.isArray(evaluationsData)) {
          console.log("📊 Sidebar REMAINING count calculation:", {
            totalEvaluations: evaluationsData.length,
            apiResponseContainsOnlyPending:
              response.config?.params?.status === "pending",
          });

          // If API returned only pending evaluations, use them directly
          let remainingEvaluations;
          if (response.config?.params?.status === "pending") {
            console.log(
              "✅ API returned only pending evaluations - using directly"
            );
            remainingEvaluations = evaluationsData;
          } else {
            console.log(
              "🔄 API returned all evaluations - filtering for remaining"
            );
            remainingEvaluations = evaluationsData.filter((evaluation) => {
              const evaluationId = evaluation.id || evaluation._id;

              // Check multiple completion indicators for robust detection
              const isCompleted =
                staffEvaluationsApi.isEvaluationCompleted(evaluationId);
              const isApiCompleted =
                evaluation.status === "completed" ||
                evaluation.status === "submitted";
              const hasSubmittedResponse =
                evaluation.responseId || evaluation.submittedAt;

              // Check if there's a submission record in localStorage
              let hasSubmissionRecord = false;
              try {
                const submissionHistory = JSON.parse(
                  localStorage.getItem("evaluationSubmissions") || "[]"
                );
                hasSubmissionRecord = submissionHistory.some(
                  (submission) => submission.evaluationId === evaluationId
                );
              } catch (error) {
                console.warn("Error checking submission history:", error);
              }

              // If ANY indicator shows completion, don't count it as pending
              const isActuallyCompleted =
                isCompleted ||
                isApiCompleted ||
                hasSubmittedResponse ||
                hasSubmissionRecord;

              console.log(
                `📋 Evaluation ${evaluationId}: completed=${isCompleted}, apiCompleted=${isApiCompleted}, hasResponse=${hasSubmittedResponse}, hasSubmissionRecord=${hasSubmissionRecord}, status=${
                  evaluation.status
                }, title=${evaluation.title || evaluation.formName}`
              );
              console.log(`   → Full evaluation object:`, evaluation);

              // Only count evaluations that are NOT completed in any way (REMAINING)
              const isRemaining = !isActuallyCompleted;
              console.log(`   → Is remaining: ${isRemaining}`);

              // Log why it's being excluded from remaining count
              if (isCompleted) {
                console.log(
                  `   → Excluded from remaining count - localStorage says it's completed`
                );
              }
              if (isApiCompleted) {
                console.log(
                  `   → Excluded from remaining count - API says it's completed/submitted`
                );
              }
              if (hasSubmittedResponse) {
                console.log(
                  `   → Excluded from remaining count - has a submitted response`
                );
              }
              if (hasSubmissionRecord) {
                console.log(
                  `   → Excluded from remaining count - has a submission record in localStorage`
                );
              }

              return isRemaining;
            });
          }

          console.log("📊 Sidebar REMAINING count calculation results:", {
            totalEvaluations: evaluationsData.length,
            remainingEvaluations: remainingEvaluations.length,
            completedEvaluations:
              evaluationsData.length - remainingEvaluations.length,
            remainingEvaluationIds: remainingEvaluations.map(
              (e) => e.id || e._id
            ),
            allEvaluationIds: evaluationsData.map((e) => e.id || e._id),
            allEvaluationStatuses: evaluationsData.map((e) => ({
              id: e.id || e._id,
              status: e.status,
              title: e.title || e.formName,
            })),
          });

          console.log(
            `✅ Sidebar REMAINING evaluations count: ${remainingEvaluations.length} remaining out of ${evaluationsData.length} total`
          );
          return remainingEvaluations.length;
        }
      }
      console.log("⚠️ No evaluations data or API failed, returning 0");
      return 0;
    } catch (error) {
      console.error("❌ Error fetching remaining evaluations count:", error);

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

  const fetchReportsCount = useCallback(async (apiClient) => {
    try {
      const response = await apiClient.get("/api/v1/dashboard/reports");
      if (response.data && response.data.success) {
        const reportsData = response.data.data || [];
        // Count all reports for now
        const totalCount = reportsData.length;
        console.log("📊 Reports count fetched:", totalCount);
        return totalCount;
      }
      console.log("📊 Reports API returned no data, returning 0");
      return 0;
    } catch (error) {
      // Silently fail if reports endpoint doesn't exist or has issues
      if (error.response?.status === 404 || error.response?.status === 403) {
        console.log("📊 Reports endpoint not available, returning 0");
      } else {
        console.error("Error fetching reports count:", error.message);
      }
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
          reports: reportsCount,
          completedEvaluations: completedEvaluations.length,
          originalEvaluationsCount: evaluationsCount,
        });

        setCounts((prev) => ({
          tasks: tasksCount,
          evaluations: finalEvaluationsCount,
          attendance: attendanceCount,
          messages: messagesCount,
          reports: reportsCount,
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
      fetchReportsCount,
    ]
  );

  // Initial fetch
  useEffect(() => {
    console.log("🔍 Initial sidebar load - fetching counts from API");
    fetchAllCounts(true);
  }, [fetchAllCounts]);

  // Listen for evaluation completion and deletion events to refresh counts
  useEffect(() => {
    const handleEvaluationCompleted = (event) => {
      console.log(
        "🔄 Evaluation completed event received, refreshing counts...",
        event.detail
      );

      // Immediately decrement the count for instant feedback
      setCounts((prev) => ({
        ...prev,
        evaluations: Math.max(0, prev.evaluations - 1), // Prevent negative counts
      }));

      console.log(
        "✅ Decremented evaluation count by 1 for instant UI feedback"
      );

      // Also refresh all counts in background to sync with API
      setTimeout(() => {
        console.log("🔄 Background refresh after evaluation completion...");
        fetchAllCounts(true);
      }, 1000); // Reduced to 1 second for faster sync
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

    // Listen for direct count updates from the Evaluations Overview page
    // This ensures the sidebar count matches exactly what's shown on the page
    const handleEvaluationsCountUpdate = (event) => {
      const { total, completed, pending, source, action } = event.detail;
      console.log(`📥 Received evaluations count update from ${source}:`, {
        total,
        completed,
        pending,
        action,
      });

      // Update the sidebar count to match the page's calculation
      setCounts((prev) => ({
        ...prev,
        evaluations: pending, // Use the exact pending count from the page
      }));

      console.log(
        `✅ Sidebar count updated to ${pending} (${completed} completed out of ${total} total)`
      );

      // If this is a completion action, also refresh counts after a short delay
      if (action === "completed") {
        setTimeout(() => {
          console.log(
            "🔄 Additional refresh after evaluationsCountUpdate completion..."
          );
          fetchAllCounts(true);
        }, 500);
      }
    };

    // Listen for reports count updates from the Reports page
    const handleReportsCountUpdate = (event) => {
      const { count } = event.detail;
      console.log(`📥 Received reports count update:`, count);

      setCounts((prev) => ({
        ...prev,
        reports: count,
      }));

      console.log(`✅ Sidebar reports count updated to ${count}`);
    };

    window.addEventListener("evaluationCompleted", handleEvaluationCompleted);
    window.addEventListener("evaluationDeleted", handleEvaluationDeleted);
    window.addEventListener(
      "evaluationsCountUpdate",
      handleEvaluationsCountUpdate
    );
    window.addEventListener("reportsCountUpdate", handleReportsCountUpdate);

    return () => {
      window.removeEventListener(
        "evaluationCompleted",
        handleEvaluationCompleted
      );
      window.removeEventListener("evaluationDeleted", handleEvaluationDeleted);
      window.removeEventListener(
        "evaluationsCountUpdate",
        handleEvaluationsCountUpdate
      );
      window.removeEventListener(
        "reportsCountUpdate",
        handleReportsCountUpdate
      );
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

    // Quick fix for current issue - manually set count based on completed reviews
    window.fixEvaluationsCountNow = () => {
      console.log(
        "🔧 QUICK FIX: Setting evaluations count to 0 based on completed reviews..."
      );
      setCounts((prev) => ({ ...prev, evaluations: 0 }));
      console.log("✅ Sidebar count set to 0 (all evaluations are completed)");
    };

    // Emergency fix - force set to 0 and clear localStorage
    window.emergencyFixEvaluations = () => {
      console.log(
        "🚨 EMERGENCY FIX: Setting evaluations to 0 and clearing localStorage..."
      );
      localStorage.setItem("completedEvaluations", "[]");
      setCounts((prev) => ({ ...prev, evaluations: 0 }));
      console.log("✅ Emergency fix applied - evaluations count set to 0");
    };

    window.clearCompletedEvaluations = () => {
      console.log("🧹 Clearing completed evaluations from localStorage...");
      localStorage.removeItem("completedEvaluations");
      localStorage.removeItem("evaluationSubmissions");
      console.log("✅ Cleared all evaluation data, refreshing counts...");
      refreshEvaluationsCount();
    };

    // Smart fix - check if all evaluations are completed and set to 0
    window.smartFixEvaluations = async () => {
      console.log("🧠 SMART FIX: Checking if all evaluations are completed...");

      if (!accessToken) {
        console.log("❌ No access token available");
        return;
      }

      try {
        const apiClient = createApiClient();
        let response;
        try {
          response = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews",
            {
              params: {
                status: "pending",
              },
            }
          );
          console.log("✅ Smart fix: Fetched pending evaluations from API");
        } catch (error) {
          console.log(
            "⚠️ Smart fix: API doesn't support status filter, fetching all evaluations"
          );
          response = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews"
          );
        }

        if (response.data && response.data.success) {
          const evaluationsData =
            response.data.data || response.data.evaluations || [];

          if (evaluationsData.length === 0) {
            console.log("✅ No pending evaluations found - setting count to 0");
            setCounts((prev) => ({ ...prev, evaluations: 0 }));
            return;
          }

          // If API returned only pending evaluations, we know they're all remaining
          if (response.config?.params?.status === "pending") {
            console.log(
              "✅ API returned only pending evaluations - setting count to actual pending count"
            );
            setCounts((prev) => ({
              ...prev,
              evaluations: evaluationsData.length,
            }));
            return;
          }

          // Check if all evaluations are completed
          const completedEvaluations = JSON.parse(
            localStorage.getItem("completedEvaluations") || "[]"
          );
          const submissionHistory = JSON.parse(
            localStorage.getItem("evaluationSubmissions") || "[]"
          );

          const allCompleted = evaluationsData.every((evaluation) => {
            const evaluationId = evaluation.id || evaluation._id;
            const isCompleted =
              staffEvaluationsApi.isEvaluationCompleted(evaluationId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";
            const hasSubmittedResponse =
              evaluation.responseId || evaluation.submittedAt;
            const hasSubmissionRecord = submissionHistory.some(
              (submission) => submission.evaluationId === evaluationId
            );
            return (
              isCompleted ||
              isApiCompleted ||
              hasSubmittedResponse ||
              hasSubmissionRecord
            );
          });

          if (allCompleted) {
            console.log(
              "✅ All evaluations are completed - setting count to 0"
            );
            setCounts((prev) => ({ ...prev, evaluations: 0 }));
          } else {
            console.log(
              "⚠️ Some evaluations are still pending - refreshing count normally"
            );
            refreshEvaluationsCount();
          }
        }
      } catch (error) {
        console.error("❌ Error in smart fix:", error);
      }
    };

    window.debugEvaluationCount = () => {
      console.log("🔍 Debug REMAINING evaluation count calculation...");
      if (accessToken) {
        const apiClient = createApiClient();
        fetchEvaluationsCount(apiClient).then((count) => {
          console.log(`🔍 Manual REMAINING evaluation count debug: ${count}`);
        });
      }
    };

    // New comprehensive debug function
    window.debugEvaluationData = async () => {
      console.log("🔍 COMPREHENSIVE EVALUATION DEBUG...");

      if (!accessToken) {
        console.log("❌ No access token available");
        return;
      }

      const apiClient = createApiClient();

      try {
        // 1. Check localStorage data
        const completedEvaluations = JSON.parse(
          localStorage.getItem("completedEvaluations") || "[]"
        );
        const submissionHistory = JSON.parse(
          localStorage.getItem("evaluationSubmissions") || "[]"
        );

        console.log("📊 LOCAL STORAGE DATA:");
        console.log("  - Completed evaluations:", completedEvaluations);
        console.log("  - Submission history:", submissionHistory);

        // 2. Fetch API data
        console.log("📊 FETCHING API DATA...");
        let response;
        try {
          response = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews",
            {
              params: {
                status: "pending",
              },
            }
          );
          console.log("✅ Debug: Fetched pending evaluations from API");
        } catch (error) {
          console.log(
            "⚠️ Debug: API doesn't support status filter, fetching all evaluations"
          );
          response = await apiClient.get(
            "/api/v1/dashboard/staff/evaluations/reviews"
          );
        }

        if (response.data && response.data.success) {
          const evaluationsData =
            response.data.data || response.data.evaluations || [];

          console.log("📊 API RESPONSE DATA:");
          console.log(
            "  - Total evaluations from API:",
            evaluationsData.length
          );
          console.log("  - Full API response:", response.data);

          // 3. Analyze each evaluation
          evaluationsData.forEach((evaluation, index) => {
            const evaluationId = evaluation.id || evaluation._id;
            console.log(`📋 EVALUATION ${index + 1} (${evaluationId}):`);
            console.log("  - Full object:", evaluation);
            console.log("  - Status:", evaluation.status);
            console.log("  - Response ID:", evaluation.responseId);
            console.log("  - Submitted At:", evaluation.submittedAt);
            console.log("  - Title:", evaluation.title || evaluation.formName);

            // Check completion indicators
            const isCompleted =
              staffEvaluationsApi.isEvaluationCompleted(evaluationId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";
            const hasSubmittedResponse =
              evaluation.responseId || evaluation.submittedAt;
            const hasSubmissionRecord = submissionHistory.some(
              (submission) => submission.evaluationId === evaluationId
            );

            console.log("  - Completion checks:");
            console.log("    * localStorage completed:", isCompleted);
            console.log("    * API completed:", isApiCompleted);
            console.log("    * Has response:", hasSubmittedResponse);
            console.log("    * Has submission record:", hasSubmissionRecord);

            const isActuallyCompleted =
              isCompleted ||
              isApiCompleted ||
              hasSubmittedResponse ||
              hasSubmissionRecord;
            console.log(
              "  - FINAL RESULT - Is completed:",
              isActuallyCompleted
            );
            console.log(
              "  - Should be counted as remaining:",
              !isActuallyCompleted
            );
          });

          // 4. Calculate final count
          const remainingCount = evaluationsData.filter((evaluation) => {
            const evaluationId = evaluation.id || evaluation._id;
            const isCompleted =
              staffEvaluationsApi.isEvaluationCompleted(evaluationId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";
            const hasSubmittedResponse =
              evaluation.responseId || evaluation.submittedAt;
            const hasSubmissionRecord = submissionHistory.some(
              (submission) => submission.evaluationId === evaluationId
            );
            const isActuallyCompleted =
              isCompleted ||
              isApiCompleted ||
              hasSubmittedResponse ||
              hasSubmissionRecord;
            return !isActuallyCompleted;
          }).length;

          console.log("📊 FINAL CALCULATION:");
          console.log(`  - Total evaluations: ${evaluationsData.length}`);
          console.log(`  - Remaining evaluations: ${remainingCount}`);
          console.log(
            `  - Completed evaluations: ${
              evaluationsData.length - remainingCount
            }`
          );
        } else {
          console.log("❌ API response failed:", response.data);
        }
      } catch (error) {
        console.error("❌ Error in debug:", error);
      }
    };

    // Reset all evaluations data for testing
    window.resetAllEvaluations = () => {
      console.log("🔄 RESETTING ALL EVALUATIONS DATA...");

      // Clear all localStorage data
      localStorage.removeItem("completedEvaluations");
      localStorage.removeItem("submittedEvaluations");
      localStorage.removeItem("pendingEvaluationSubmissions");
      localStorage.setItem("completedEvaluations", JSON.stringify([]));
      localStorage.setItem("submittedEvaluations", JSON.stringify([]));
      localStorage.setItem("pendingEvaluationSubmissions", JSON.stringify([]));

      // Reset sidebar count
      setCounts((prev) => ({ ...prev, evaluations: 0 }));

      // Dispatch reset event
      try {
        window.dispatchEvent(
          new CustomEvent("evaluationsReset", {
            detail: { timestamp: new Date().toISOString() },
          })
        );
      } catch (error) {
        console.warn("Failed to dispatch reset event:", error);
      }

      console.log("✅ All evaluations data reset successfully!");
      console.log("🔄 Refreshing page in 2 seconds...");

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    };

    window.testSidebarSync = async () => {
      console.log("🧪 Testing sidebar synchronization...");
      const completed = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log("📱 Completed in localStorage:", completed.length);

      // Fetch from API
      try {
        const apiClient = createApiClient();
        const response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews"
        );
        if (response.data && response.data.success) {
          const evaluationsData =
            response.data.data || response.data.evaluations || [];
          console.log("🌐 Total from API:", evaluationsData.length);

          const pending = evaluationsData.filter((evaluation) => {
            const evalId = evaluation.id || evaluation._id;
            const isCompleted = completed.includes(evalId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";
            return !isCompleted && !isApiCompleted;
          });

          console.log(
            "✅ Pending evaluations (should match sidebar):",
            pending.length
          );
          console.log(
            "📊 Calculation: " +
              evaluationsData.length +
              " total - " +
              completed.length +
              " completed = " +
              pending.length +
              " pending"
          );
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
            inSync: pending.length === counts.evaluations,
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
      console.log(
        "📱 Completed evaluations in localStorage:",
        completed.length
      );

      // Fetch from API to get accurate count
      try {
        const apiClient = createApiClient();
        const response = await apiClient.get(
          "/api/v1/dashboard/staff/evaluations/reviews"
        );
        if (response.data && response.data.success) {
          const evaluationsData =
            response.data.data || response.data.evaluations || [];
          console.log("🌐 Total evaluations from API:", evaluationsData.length);

          // Filter out completed ones
          const pending = evaluationsData.filter((evaluation) => {
            const evalId = evaluation.id || evaluation._id;
            const isCompleted = completed.includes(evalId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";
            return !isCompleted && !isApiCompleted;
          });

          console.log("✅ Pending evaluations calculated:", pending.length);
          console.log("🔧 Setting sidebar count to:", pending.length);

          setCounts((prev) => ({ ...prev, evaluations: pending.length }));

          return {
            totalFromAPI: evaluationsData.length,
            completedLocal: completed.length,
            newSidebarCount: pending.length,
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
