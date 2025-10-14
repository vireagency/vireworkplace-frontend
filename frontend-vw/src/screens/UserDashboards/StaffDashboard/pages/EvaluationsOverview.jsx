import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2,
} from "lucide-react";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Layout and Auth
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Services
import { staffEvaluationsApi } from "@/services/staffEvaluations";
import { toast } from "sonner";

const EvaluationsOverview = () => {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    inProgress: 0,
    reviewsDue: 0,
    completedReviews: 0,
    averageRating: 0,
  });

  // Fetch evaluations data
  const fetchEvaluations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log(
        "Fetching evaluations with token:",
        accessToken ? "present" : "missing"
      );

      console.log(
        "Calling staffEvaluationsApi.getAssignedEvaluations with token:",
        accessToken ? "present" : "missing"
      );
      const result = await staffEvaluationsApi.getAssignedEvaluations(
        accessToken
      );

      console.log("API Result:", result);
      console.log("API Result success:", result.success);
      console.log("API Result data:", result.data);
      console.log("API Result error:", result.error);

      if (result.success) {
        // Handle different possible response structures
        let evaluationsData = [];

        if (result.data) {
          // Check if data is nested in a 'data' property
          if (result.data.data && Array.isArray(result.data.data)) {
            evaluationsData = result.data.data;
          }
          // Check if data is directly an array
          else if (Array.isArray(result.data)) {
            evaluationsData = result.data;
          }
          // Check if data has an 'evaluations' property
          else if (
            result.data.evaluations &&
            Array.isArray(result.data.evaluations)
          ) {
            evaluationsData = result.data.evaluations;
          }
          // Check if data has a 'reviews' property
          else if (result.data.reviews && Array.isArray(result.data.reviews)) {
            evaluationsData = result.data.reviews;
          }
          // If data is an object but not an array, try to extract array from common properties
          else if (typeof result.data === "object") {
            const possibleArrayKeys = ["items", "list", "results", "content"];
            for (const key of possibleArrayKeys) {
              if (result.data[key] && Array.isArray(result.data[key])) {
                evaluationsData = result.data[key];
                break;
              }
            }
          }
        }

        console.log("Processed evaluationsData:", evaluationsData);
        console.log("EvaluationsData length:", evaluationsData.length);

        // If no evaluations found, try to use fallback data for testing
        if (evaluationsData.length === 0) {
          console.log("No evaluations from API, checking for fallback data...");

          // Check if we have any completed evaluations in localStorage
          const completedEvaluations = JSON.parse(
            localStorage.getItem("completedEvaluations") || "[]"
          );

          if (completedEvaluations.length > 0) {
            console.log(
              "Found completed evaluations in localStorage:",
              completedEvaluations
            );
            // Create a basic evaluation structure from completed IDs
            evaluationsData = completedEvaluations.map((id, index) => ({
              id: id,
              _id: id,
              formName: `Performance Review ${index + 1}`,
              title: `Performance Review ${index + 1}`,
              description: "Complete your performance evaluation",
              formType: "Performance Review",
              reviewPeriod: "Q1 2024",
              status: "completed",
              reviewDeadline: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toISOString(), // 30 days from now
              createdAt: new Date().toISOString(),
              sections: [],
              questions: [],
            }));
            console.log("Created fallback evaluations:", evaluationsData);
          }
        }

        // If no evaluations found and this is a refresh, show a warning but don't fail
        if (evaluationsData.length === 0 && isRefresh) {
          console.warn(
            "No evaluations found during refresh - this might be normal if no evaluations are assigned"
          );
        }

        // Standardize evaluation data structure from HR
        const standardizedEvaluations = evaluationsData.map((evaluation) => ({
          id: evaluation.id || evaluation._id,
          evaluationId: evaluation.id || evaluation._id,
          title:
            evaluation.formName || evaluation.title || "Performance Evaluation",
          formName: evaluation.formName || evaluation.title,
          description:
            evaluation.description ||
            "Evaluate overall performance and contributions",
          formType: evaluation.formType || "Performance Review",
          reviewPeriod: evaluation.reviewPeriod || "Annual",
          dueDate: evaluation.reviewDeadline || evaluation.dueDate,
          status: evaluation.status || "pending",
          sections: evaluation.sections || [],
          questions: evaluation.questions || [],
          instructions: evaluation.instructions,
          createdAt: evaluation.createdAt,
          updatedAt: evaluation.updatedAt,
        }));

        // Filter out submitted/completed evaluations
        const pendingEvaluations = standardizedEvaluations.filter(
          (evaluation) => {
            const evaluationId =
              evaluation.id || evaluation._id || evaluation.evaluationId;
            const isCompleted =
              staffEvaluationsApi.isEvaluationCompleted(evaluationId);
            const isApiCompleted =
              evaluation.status === "completed" ||
              evaluation.status === "submitted";

            // Only show evaluations that are NOT completed or submitted
            return !isCompleted && !isApiCompleted;
          }
        );

        console.log(
          `Filtered evaluations: ${pendingEvaluations.length} pending out of ${standardizedEvaluations.length} total`
        );

        // Sort evaluations by creation date (newest first)
        const sortedEvaluations = pendingEvaluations.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.assignedAt || 0);
          const dateB = new Date(b.createdAt || b.assignedAt || 0);
          return dateB - dateA; // Newest first
        });

        console.log(
          "Standardized evaluations data (sorted by date):",
          sortedEvaluations
        );
        setEvaluations(sortedEvaluations);

        // Calculate stats - use pending evaluations (submitted ones are already filtered out)
        const inProgress = pendingEvaluations.filter((e) => {
          const isPending =
            e.status === "in_progress" ||
            e.status === "pending" ||
            e.status === "assigned";
          return isPending;
        }).length;

        const reviewsDue = pendingEvaluations.filter((e) => {
          const isDue =
            e.status === "pending" ||
            e.status === "due" ||
            e.status === "assigned" ||
            (e.dueDate && new Date(e.dueDate) <= new Date());
          return isDue;
        }).length;

        // For completed count, use the original standardized list to count all completed
        const completed = standardizedEvaluations.filter((e) => {
          const isCompleted = staffEvaluationsApi.isEvaluationCompleted(e.id);
          const isApiCompleted =
            e.status === "completed" || e.status === "submitted";
          return isCompleted || isApiCompleted;
        }).length;

        const avgRating =
          standardizedEvaluations.length > 0
            ? standardizedEvaluations
                .filter((e) => e.rating || e.score)
                .reduce((sum, e) => sum + (e.rating || e.score || 0), 0) /
                standardizedEvaluations.filter((e) => e.rating || e.score)
                  .length || 0
            : 0;

        setStats({
          inProgress,
          reviewsDue,
          completedReviews: completed,
          averageRating: avgRating.toFixed(1),
        });

        console.log("Evaluations stats:", {
          inProgress,
          reviewsDue,
          completed,
          avgRating,
          totalEvaluations: standardizedEvaluations.length,
          pendingForSidebar: pendingEvaluations.length,
        });

        // Broadcast the accurate pending count to the sidebar
        // This ensures sidebar count matches what we show on the page
        try {
          window.dispatchEvent(
            new CustomEvent("evaluationsCountUpdate", {
              detail: {
                total: standardizedEvaluations.length,
                completed: completed,
                pending: pendingEvaluations.length,
                source: "EvaluationsOverview",
              },
            })
          );
          console.log(
            `📢 Broadcasted sidebar count update: ${pendingEvaluations.length} pending (${completed} completed out of ${standardizedEvaluations.length} total)`
          );

          // Also try the direct sidebar update function if it exists
          if (window.fixEvaluationsCount) {
            console.log(
              "🔧 Also calling fixEvaluationsCount for immediate update..."
            );
            setTimeout(() => {
              window.fixEvaluationsCount();
            }, 500);
          }

          // Force sidebar refresh using the hook's refresh function
          if (window.forceRefreshSidebarCount) {
            console.log(
              "🔄 Also calling forceRefreshSidebarCount for immediate update..."
            );
            setTimeout(() => {
              window.forceRefreshSidebarCount();
            }, 1000);
          }
        } catch (eventError) {
          console.warn("Failed to broadcast count update:", eventError);
        }

        // Only log for auto-refresh, don't show toast
        if (isRefresh && !document.hidden) {
          console.log(
            "Staff evaluations refreshed successfully (silent auto-refresh)"
          );
        }
      } else {
        console.error("API returned error:", result.error);

        // Check if it's a 403 permission error
        if (
          result.error &&
          (result.error.includes("Access denied") ||
            result.error.includes("permission") ||
            result.error.includes("403"))
        ) {
          console.error(
            "⚠️ BACKEND PERMISSION ERROR: Staff user doesn't have permission to access evaluations API"
          );
          console.error(
            "⚠️ This needs to be fixed on the backend by granting staff users access to /api/v1/dashboard/staff/evaluations/reviews"
          );

          // Check localStorage for submitted evaluations
          const submittedEvaluations = JSON.parse(
            localStorage.getItem("submittedEvaluations") || "[]"
          );

          if (submittedEvaluations.length > 0) {
            console.log(
              "📋 Found submitted evaluations in localStorage:",
              submittedEvaluations
            );
            if (!isRefresh) {
              toast.warning(
                "Backend permission issue. Contact your administrator."
              );
            }
          }
        }

        if (isRefresh) {
          // Only show error toast for refresh if it's a real error (not just no evaluations)
          if (result.error && !result.error.includes("No evaluations")) {
            // Don't show toast for permission errors on auto-refresh
            if (
              !result.error.includes("Access denied") &&
              !result.error.includes("permission")
            ) {
              toast.error("Failed to refresh evaluations");
            }
          }
        } else {
          // Don't show error toast for permission errors (already handled above)
          if (
            !result.error ||
            (!result.error.includes("Access denied") &&
              !result.error.includes("permission"))
          ) {
            toast.error(result.error || "Failed to fetch evaluations");
          }
        }
        setEvaluations([]);
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      if (isRefresh) {
        // Only show error for refresh if it's a network/server error
        if (error.code === "NETWORK_ERROR" || error.response?.status >= 500) {
          toast.error("Network error refreshing evaluations");
        } else {
          console.log(
            "Refresh failed silently (might be normal):",
            error.message
          );
        }
      } else {
        toast.error("Failed to load evaluations");
      }
      setEvaluations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and auto-refresh setup
  useEffect(() => {
    if (accessToken) {
      // Check localStorage first for any existing evaluations
      const completedEvaluations = JSON.parse(
        localStorage.getItem("completedEvaluations") || "[]"
      );
      console.log(
        "Found completed evaluations in localStorage:",
        completedEvaluations
      );

      fetchEvaluations();

      // Set up auto-refresh every 10 seconds for real-time updates
      const interval = setInterval(() => {
        console.log("Auto-refreshing staff evaluations...");
        fetchEvaluations(true);
      }, 10000); // 10 seconds for more frequent updates

      // Listen for evaluation completion events to refresh immediately
      const handleEvaluationCompleted = () => {
        console.log("🔄 Evaluation completed - refreshing evaluations list...");
        fetchEvaluations(true);
      };

      // Listen for evaluation reset events
      const handleEvaluationsReset = () => {
        console.log("🔄 Evaluations reset - refreshing evaluations list...");
        fetchEvaluations(true);
      };

      window.addEventListener("evaluationCompleted", handleEvaluationCompleted);
      window.addEventListener("evaluationsReset", handleEvaluationsReset);

      return () => {
        clearInterval(interval);
        window.removeEventListener(
          "evaluationCompleted",
          handleEvaluationCompleted
        );
        window.removeEventListener("evaluationsReset", handleEvaluationsReset);
      };
    }
  }, [accessToken]);

  // Manual refresh function
  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    await fetchEvaluations(true);
    toast.success("Evaluations refreshed successfully!");
  };

  // Handle evaluation click
  const handleEvaluationClick = (evaluationId) => {
    if (!evaluationId) {
      console.error("No evaluation ID provided");
      toast.error("Evaluation ID is missing");
      return;
    }
    navigate(`/staff/evaluations/${evaluationId}`);
  };

  // Handle evaluation deletion
  const handleDeleteEvaluation = async (evaluation) => {
    const evaluationId =
      evaluation.id || evaluation._id || evaluation.evaluationId;

    if (!evaluationId) {
      toast.error("Evaluation ID is missing");
      return;
    }

    // Check if evaluation is completed/submitted
    const isCompleted = staffEvaluationsApi.isEvaluationCompleted(evaluationId);

    // Show confirmation dialog with appropriate message
    const message = isCompleted
      ? `Are you sure you want to remove "${
          evaluation.title || evaluation.formName
        }" from your list? This evaluation has already been submitted to HR and cannot be modified.`
      : `Are you sure you want to delete "${
          evaluation.title || evaluation.formName
        }"? This action cannot be undone.`;

    const confirmed = window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      console.log("Deleting evaluation:", evaluationId);

      const result = await staffEvaluationsApi.deleteEvaluation(
        evaluationId,
        accessToken
      );

      if (result.success) {
        toast.success(result.message || "Evaluation deleted successfully");

        // Refresh the evaluations list
        await fetchEvaluations(true);
      } else {
        // Check if it's a 404 error (evaluation already submitted)
        if (result.error && result.error.includes("not found")) {
          toast.warning(
            "Evaluation not found - it may have already been submitted to HR. Removing from your list."
          );

          // Still refresh the list to remove it from the UI
          await fetchEvaluations(true);
        } else {
          toast.error(result.error || "Failed to delete evaluation");
        }
      }
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      toast.error("Failed to delete evaluation. Please try again.");
    }
  };

  // Get status badge color
  // Get status color and text for evaluation
  const getStatusInfo = (evaluation) => {
    const status = evaluation.status;
    const dueDate = evaluation.dueDate;
    const isOverdue = dueDate && new Date(dueDate) < new Date();

    switch (status) {
      case "completed":
      case "submitted":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          text: "Completed",
          icon: "✓",
        };
      case "in_progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          text: "In Progress",
          icon: "⏳",
        };
      case "pending":
      case "assigned":
        if (isOverdue) {
          return {
            color: "bg-red-100 text-red-800 border-red-200",
            text: "Overdue",
            icon: "⚠️",
          };
        }
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: "Pending",
          icon: "📋",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          text: "Unknown",
          icon: "❓",
        };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <StaffDashboardLayout
        sidebarConfig={sidebarConfig}
        showSectionCards={false}
        showChart={false}
        showDataTable={false}
      >
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading evaluations...</p>
          </div>
        </div>
      </StaffDashboardLayout>
    );
  }

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 py-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Evaluations Overview
            </h1>
            <p className="text-gray-600 mt-1">Manage and track evaluations.</p>
          </div>

          {/* Status Indicator and Refresh Button */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </Button>
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card key="in-progress">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.inProgress}
              </div>
              <div className="text-sm text-gray-600">IN PROGRESS</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+36% ↑</span>
              </div>
            </CardContent>
          </Card>

          <Card key="reviews-due">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.reviewsDue}
              </div>
              <div className="text-sm text-gray-600">REVIEWS DUE</div>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">+14% ↓</span>
              </div>
            </CardContent>
          </Card>

          <Card key="completed-reviews">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.completedReviews}
              </div>
              <div className="text-sm text-gray-600">COMPLETED REVIEWS</div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-600">+36% ↑</span>
              </div>
            </CardContent>
          </Card>

          <Card key="average-rating">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {stats.averageRating}
              </div>
              <div className="text-sm text-gray-600">
                AVERAGE PERFORMANCE RATING
              </div>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-sm text-red-600">+36% ↓</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Show evaluations or empty state */}
        {evaluations.length > 0 ? (
          /* Self-Assessment Evaluation Section */
          <div className="mb-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Self-Assessment Evaluation
              </h2>
              <p className="text-gray-600 text-sm">
                Please click to access the review form, make any necessary
                modifications, and submit
              </p>
            </div>

            <div className="space-y-4">
              {evaluations.map((evaluation) => {
                const statusInfo = getStatusInfo(evaluation);
                const isOverdue =
                  evaluation.dueDate &&
                  new Date(evaluation.dueDate) < new Date();
                const isCompleted = staffEvaluationsApi.isEvaluationCompleted(
                  evaluation.id || evaluation._id || evaluation.evaluationId
                );

                return (
                  <div
                    key={
                      evaluation.id || evaluation._id || evaluation.evaluationId
                    }
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isOverdue
                        ? "bg-red-50 border-red-200 hover:bg-red-100"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      const evaluationId =
                        evaluation.id ||
                        evaluation._id ||
                        evaluation.evaluationId;

                      if (isCompleted) {
                        // If completed, go to summary
                        navigate(`/staff/evaluations/${evaluationId}/summary`);
                      } else {
                        // If not completed, go to detail page
                        handleEvaluationClick(evaluationId);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          isOverdue ? "bg-red-100" : "bg-gray-100"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-sm flex items-center justify-center text-sm ${
                            isOverdue
                              ? "bg-red-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {statusInfo.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 text-base">
                            {evaluation.title ||
                              evaluation.formName ||
                              "Annual Performance Evaluation Form"}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              isCompleted
                                ? "bg-green-100 text-green-800 border-green-200"
                                : statusInfo.color
                            }`}
                          >
                            {isCompleted ? "Completed" : statusInfo.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {evaluation.description ||
                            evaluation.formType ||
                            "Assess overall performance and contributions"}
                        </p>
                        <div className="flex items-center gap-4 text-xs">
                          {evaluation.dueDate && (
                            <p
                              className={`${
                                isOverdue
                                  ? "text-red-600 font-medium"
                                  : "text-blue-600"
                              }`}
                            >
                              Due: {formatDate(evaluation.dueDate)}
                              {isOverdue && " (Overdue)"}
                            </p>
                          )}
                          {evaluation.reviewPeriod && (
                            <p className="text-gray-500">
                              Period: {evaluation.reviewPeriod}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteEvaluation(evaluation);
                        }}
                        title={
                          isCompleted ? "Remove from list" : "Delete evaluation"
                        }
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                      <ArrowRight
                        className={`w-5 h-5 ${
                          isOverdue ? "text-red-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty State - No Active Evaluations */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No active evaluations
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              All evaluations assigned or provided to you will appear here.
            </p>
          </div>
        )}
      </div>
    </StaffDashboardLayout>
  );
};

export default EvaluationsOverview;
