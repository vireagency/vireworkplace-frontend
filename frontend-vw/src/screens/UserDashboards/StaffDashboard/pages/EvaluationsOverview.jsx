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
  const [stats, setStats] = useState({
    inProgress: 0,
    reviewsDue: 0,
    completedReviews: 0,
    averageRating: 0,
  });

  // Fetch evaluations data
  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      console.log(
        "Fetching evaluations with token:",
        accessToken ? "present" : "missing"
      );

      const result = await staffEvaluationsApi.getAssignedEvaluations(
        accessToken
      );

      console.log("API Result:", result);

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

        console.log("Standardized evaluations data:", standardizedEvaluations);
        setEvaluations(standardizedEvaluations);

        // Calculate stats with better status mapping using standardized data
        const inProgress = standardizedEvaluations.filter(
          (e) =>
            e.status === "in_progress" ||
            e.status === "pending" ||
            e.status === "assigned"
        ).length;

        const reviewsDue = standardizedEvaluations.filter(
          (e) =>
            e.status === "pending" ||
            e.status === "due" ||
            e.status === "assigned" ||
            (e.dueDate && new Date(e.dueDate) <= new Date())
        ).length;

        const completed = standardizedEvaluations.filter(
          (e) => e.status === "completed" || e.status === "submitted"
        ).length;

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
        });
      } else {
        console.error("API returned error:", result.error);
        toast.error(result.error || "Failed to fetch evaluations");
        setEvaluations([]);
      }
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      toast.error("Failed to load evaluations");
      setEvaluations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchEvaluations();
    }
  }, [accessToken]);

  // Handle evaluation click
  const handleEvaluationClick = (evaluationId) => {
    if (!evaluationId) {
      console.error("No evaluation ID provided");
      toast.error("Evaluation ID is missing");
      return;
    }
    navigate(`/staff/evaluations/${evaluationId}`);
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

          {/* Status Indicator */}
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Active</span>
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

                    <ArrowRight
                      className={`w-5 h-5 ${
                        isOverdue ? "text-red-600" : "text-gray-600"
                      }`}
                    />
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
