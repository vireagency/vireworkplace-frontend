import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  ChevronRight,
  Search,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import axios from "axios";

// shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

// Evaluation Status Badge Component
const EvaluationStatusBadge = ({ status }) => {
  const statusConfig = {
    completed: {
      variant: "default",
      className:
        "bg-green-50 text-green-700 border-green-200 hover:bg-green-50",
      icon: CheckCircle2,
      text: "Completed",
    },
    "in progress": {
      variant: "secondary",
      className: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50",
      icon: Clock,
      text: "In Progress",
    },
    pending: {
      variant: "outline",
      className:
        "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-50",
      icon: TrendingUp,
      text: "Pending",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig["pending"];
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      <IconComponent className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, changeType = "positive" }) => {
  const getChangeColor = () => {
    if (changeType === "positive") return "text-green-600";
    if (changeType === "negative") return "text-red-600";
    return "text-gray-600";
  };

  const getChangePrefix = () => {
    if (changeType === "positive") return "+ ";
    if (changeType === "negative") return "";
    return "";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6 text-center">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          {title}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {change && (
          <div className={`text-xs font-medium ${getChangeColor()}`}>
            {getChangePrefix()}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Evaluation Item Component
const EvaluationItem = ({ evaluation, onClick, loading = false }) => {
  return (
    <div
      className={`flex items-center justify-between p-4 transition-all border-b border-gray-100 last:border-b-0 ${
        loading
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-gray-50 cursor-pointer"
      }`}
      onClick={() => !loading && onClick(evaluation)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <FileText className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {evaluation.title}
          </h4>
          <p className="text-sm text-gray-500 mt-1">{evaluation.description}</p>
          {evaluation.dueDate && (
            <p className="text-xs text-blue-600 mt-1">
              Due: {new Date(evaluation.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <EvaluationStatusBadge status={evaluation.status} />
        {!loading && <ChevronRight className="w-5 h-5 text-gray-400" />}
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="w-16 h-16 mb-6 text-gray-300">
      <Search className="w-16 h-16" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
      {title}
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>
    {action && action}
  </div>
);

// Evaluation Detail Modal Component
const EvaluationModal = ({
  isOpen,
  onClose,
  evaluation,
  onStartEvaluation,
  showForm,
  onSubmitForm,
  formResponses,
  setFormResponses,
  formComments,
  setFormComments,
  submitting,
  loading,
}) => {
  if (!evaluation && !loading) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Evaluations Overview</span>
          </div>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading evaluation details...</span>
            </div>
          ) : (
            <div className="space-y-2">
              <DialogTitle className="text-xl font-semibold text-gray-900">
                {evaluation?.title}
              </DialogTitle>
              {evaluation?.dueDate && (
                <p className="text-sm text-blue-600">
                  Due by {new Date(evaluation.dueDate).toLocaleDateString()}
                </p>
              )}
              <EvaluationStatusBadge status={evaluation?.status} />
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading evaluation form...</p>
            </div>
          </div>
        ) : !showForm ? (
          <div className="space-y-6 py-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Instructions
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {evaluation?.instructions ||
                  evaluation?.description ||
                  "Please complete this evaluation to provide feedback on your performance and development."}
              </p>
            </div>

            {evaluation?.requirements && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Requirements
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {evaluation.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmitForm();
            }}
            className="space-y-6 py-4"
          >
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg mb-4">
              Please provide thoughtful responses to help with your performance
              review.
            </div>

            {Array.isArray(evaluation?.questions) &&
            evaluation.questions.length > 0 ? (
              evaluation.questions.map((q, idx) => (
                <div key={q.id || idx} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    {q.text || q.question}
                    {q.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {q.type === "textarea" || q.text?.length > 100 ? (
                    <textarea
                      value={formResponses[q.id] || ""}
                      onChange={(e) =>
                        setFormResponses({
                          ...formResponses,
                          [q.id]: e.target.value,
                        })
                      }
                      placeholder="Your response..."
                      className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                      required={q.required}
                    />
                  ) : (
                    <Input
                      type="text"
                      value={formResponses[q.id] || ""}
                      onChange={(e) =>
                        setFormResponses({
                          ...formResponses,
                          [q.id]: e.target.value,
                        })
                      }
                      placeholder="Your answer..."
                      required={q.required}
                    />
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 bg-gray-50 p-6 rounded-lg text-center">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No specific questions found for this evaluation.</p>
                <p className="text-sm mt-1">
                  Please provide your comments below.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-900">
                Additional Comments
              </label>
              <textarea
                value={formComments}
                onChange={(e) => setFormComments(e.target.value)}
                placeholder="Any additional feedback or comments..."
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
              />
            </div>

            <DialogFooter className="flex items-center space-x-3 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                className="px-6"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-6"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Evaluation"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {!showForm && !loading && (
          <DialogFooter className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Cancel
            </Button>
            <Button
              onClick={() => onStartEvaluation(evaluation)}
              className="bg-green-600 hover:bg-green-700 px-6"
              disabled={evaluation?.status === "completed"}
            >
              {evaluation?.status === "completed"
                ? "Completed"
                : "Start Evaluation"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Loading State Component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="w-8 h-8 animate-spin mb-4 text-green-500" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Loading evaluations...
    </h3>
    <p className="text-gray-500 text-center">
      Please wait while we fetch your evaluations.
    </p>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16">
    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Failed to Load Evaluations
    </h3>
    <p className="text-gray-500 text-center max-w-md mb-6">
      {error || "Something went wrong while loading your evaluations."}
    </p>
    <Button onClick={onRetry} className="bg-green-600 hover:bg-green-700">
      Try Again
    </Button>
  </div>
);

// Main Staff Evaluation Page Component
export default function Evaluation() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const sidebarCounts = useSidebarCounts();

  // State management
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formResponses, setFormResponses] = useState({});
  const [formComments, setFormComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    inProgress: 0,
    reviewsDue: 0,
    completedReviews: 0,
    averagePerformanceRating: 0,
  });
  const [tasks, setTasks] = useState([]);

  // API configuration
  const getEvaluationsApiBaseUrl = () => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "http://localhost:6000";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
    return `${noApiV1}`;
  };

  // Create axios instance with correct base URL
  const apiClient = axios.create({
    baseURL: getEvaluationsApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000, // 30 second timeout
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(
    (config) => {
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for better error handling
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        navigate("/login");
      }
      return Promise.reject(error);
    }
  );

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login");
    }
  }, [accessToken, user, navigate]);

  // Fetch evaluations assigned to staff
  const fetchEvaluations = async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error("No access token available. Please log in again.");
      }

      const response = await apiClient.get(
        "/api/v1/dashboard/staff/evaluations/reviews"
      );

      let evaluationsData = [];

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        evaluationsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        evaluationsData = response.data;
      } else {
        evaluationsData = [];
      }

      // Transform and enrich evaluation data
      const enrichedEvaluations = evaluationsData.map((evaluation) => ({
        ...evaluation,
        id: evaluation._id || evaluation.id,
        title: evaluation.title || "Evaluation",
        description: evaluation.description || "Performance evaluation",
        status: (evaluation.status || "pending").toLowerCase(),
        dueDate: evaluation.dueDate || null,
        questions: evaluation.questions || [],
        instructions: evaluation.instructions || evaluation.description,
      }));

      setEvaluations(enrichedEvaluations);

      // Calculate metrics
      setMetrics({
        inProgress: enrichedEvaluations.filter(
          (e) => e.status === "in progress"
        ).length,
        reviewsDue: enrichedEvaluations.filter((e) => e.status === "pending")
          .length,
        completedReviews: enrichedEvaluations.filter(
          (e) => e.status === "completed"
        ).length,
        averagePerformanceRating:
          enrichedEvaluations.length > 0
            ? (
                enrichedEvaluations.reduce(
                  (sum, e) => sum + (e.rating || 0),
                  0
                ) / enrichedEvaluations.length
              ).toFixed(1)
            : 0,
      });

      if (showToast && enrichedEvaluations.length > 0) {
        toast.success(`Loaded ${enrichedEvaluations.length} evaluations`);
      }
    } catch (err) {
      console.error("Error fetching evaluations:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch evaluations.";
      setError(errorMessage);
      setEvaluations([]);

      if (showToast) {
        toast.error("Failed to load evaluations");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch a specific evaluation form by ID
  const fetchEvaluationById = async (id) => {
    try {
      setEvaluationLoading(true);
      if (!accessToken) return null;

      const response = await apiClient.get(
        `/api/v1/dashboard/staff/evaluations/reviews/${id}`
      );

      if (response.data && response.data.success) {
        return response.data.data;
      } else if (response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching evaluation by ID:", err);
      toast.error("Failed to load evaluation details");
      return null;
    } finally {
      setEvaluationLoading(false);
    }
  };

  // Submit evaluation response
  const submitEvaluationResponse = async (id, responses, comments) => {
    try {
      if (!accessToken) throw new Error("No access token available.");

      const payload = {
        responses: responses || [],
        comments: comments || "",
      };

      const response = await apiClient.post(
        `/api/v1/dashboard/staff/evaluations/reviews/${id}/response`,
        payload
      );

      if (response.data && (response.data.success || response.status === 200)) {
        toast.success("Evaluation response submitted successfully!");
        return true;
      } else {
        toast.error("Failed to submit evaluation response.");
        return false;
      }
    } catch (err) {
      console.error("Error submitting evaluation:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit evaluation response.";
      toast.error(errorMessage);
      return false;
    }
  };

  // Fetch staff tasks for sidebar badge
  const fetchTasks = async () => {
    try {
      if (!accessToken) return;
      const response = await apiClient.get("/api/v1/tasks");
      if (response.data && response.data.success) {
        setTasks(response.data.data || response.data.tasks || []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setTasks([]);
    }
  };

  // Handle evaluation click: fetch full evaluation form
  const handleEvaluationClick = async (evaluation) => {
    setSelectedEvaluation(evaluation);
    setShowEvaluationModal(true);
    setShowForm(false);
    setFormResponses({});
    setFormComments("");

    // If the evaluation doesn't have detailed questions, try to fetch them
    if (!evaluation.questions || evaluation.questions.length === 0) {
      const fullEvaluation = await fetchEvaluationById(evaluation.id);
      if (fullEvaluation) {
        setSelectedEvaluation(fullEvaluation);
      }
    }
  };

  // Show the evaluation form
  const handleStartEvaluation = (evaluation) => {
    if (evaluation.status === "completed") {
      toast.info("This evaluation has already been completed.");
      return;
    }
    setShowForm(true);
    setFormResponses({});
    setFormComments("");
  };

  // Submit the evaluation form
  const handleSubmitForm = async () => {
    if (!selectedEvaluation) return;

    // Validate required fields
    const requiredQuestions =
      selectedEvaluation.questions?.filter((q) => q.required) || [];
    const missingResponses = requiredQuestions.filter(
      (q) => !formResponses[q.id]?.trim()
    );

    if (missingResponses.length > 0) {
      toast.error("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare responses array
      const responsesArr = Object.entries(formResponses)
        .map(([questionId, answer]) => ({ questionId, answer: answer?.trim() }))
        .filter((r) => r.answer); // Remove empty responses

      const success = await submitEvaluationResponse(
        selectedEvaluation.id,
        responsesArr,
        formComments.trim()
      );

      if (success) {
        setShowEvaluationModal(false);
        setShowForm(false);
        setFormResponses({});
        setFormComments("");
        setSelectedEvaluation(null);

        // Refresh evaluations to reflect the update
        await fetchEvaluations();
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowEvaluationModal(false);
    setShowForm(false);
    setFormResponses({});
    setFormComments("");
    setSelectedEvaluation(null);
  };

  // Initial fetch
  useEffect(() => {
    if (accessToken) {
      fetchEvaluations();
      fetchTasks();
    }
  }, [accessToken]);

  // Dynamically update the badges for sidebar items
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    analytics:
      staffDashboardConfig.analytics?.map((item) => {
        if (item.title === "Evaluations") {
          return { ...item, badge: sidebarCounts.evaluations };
        }
        return item;
      }) || [],
    productivity:
      staffDashboardConfig.productivity?.map((item) => {
        if (item.title === "Tasks") {
          return { ...item, badge: sidebarCounts.tasks };
        }
        if (item.title === "Attendance") {
          return { ...item, badge: sidebarCounts.attendance };
        }
        return item;
      }) || [],
    company:
      staffDashboardConfig.company?.map((item) => {
        if (item.title === "Messages") {
          return { ...item, badge: sidebarCounts.messages };
        }
        return item;
      }) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-medium text-gray-900">
                Evaluations Overview
              </h1>
              <p className="text-sm text-gray-500">
                Manage and track your performance evaluations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active
            </span>
            <Button
              onClick={() => fetchEvaluations(true)}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="IN PROGRESS"
            value={metrics.inProgress}
            change="Updated"
            changeType="neutral"
          />
          <MetricCard
            title="REVIEWS DUE"
            value={metrics.reviewsDue}
            change="Pending"
            changeType="negative"
          />
          <MetricCard
            title="COMPLETED REVIEWS"
            value={metrics.completedReviews}
            change="Done"
            changeType="positive"
          />
          <MetricCard
            title="TOTAL EVALUATIONS"
            value={evaluations.length}
            change="Available"
            changeType="neutral"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6">
        <Card className="shadow-sm">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error} onRetry={() => fetchEvaluations(true)} />
          ) : evaluations.length === 0 ? (
            <EmptyState
              title="No evaluations available"
              description="You don't have any evaluations assigned at the moment. Check back later or contact your HR department if you believe this is an error."
              action={
                <Button
                  onClick={() => fetchEvaluations(true)}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  Refresh Evaluations
                </Button>
              }
            />
          ) : (
            <div>
              {/* Self-Assessment Section */}
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Performance Evaluations
                    </h3>
                    <p className="text-sm text-blue-600">
                      Click on any evaluation to view details and submit your
                      responses
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                    {evaluations.length} evaluation
                    {evaluations.length !== 1 ? "s" : ""} available
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {evaluations.map((evaluation) => (
                    <EvaluationItem
                      key={evaluation.id}
                      evaluation={evaluation}
                      onClick={handleEvaluationClick}
                      loading={evaluationLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="p-4 sm:p-6 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      Evaluation Guidelines
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Complete all evaluations before their due dates</li>
                      <li>• Provide honest and thoughtful responses</li>
                      <li>• Use specific examples when possible</li>
                      <li>
                        • Contact HR if you need assistance or have questions
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Evaluation Detail Modal */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={handleCloseModal}
        evaluation={selectedEvaluation}
        onStartEvaluation={handleStartEvaluation}
        showForm={showForm}
        onSubmitForm={handleSubmitForm}
        formResponses={formResponses}
        setFormResponses={setFormResponses}
        formComments={formComments}
        setFormComments={setFormComments}
        submitting={submitting}
        loading={evaluationLoading}
      />
    </StaffDashboardLayout>
  );
}
