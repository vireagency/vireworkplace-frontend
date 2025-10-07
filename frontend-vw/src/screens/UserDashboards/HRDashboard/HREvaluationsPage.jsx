import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import hrData from "./hrData.json";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import evaluationsApi from "@/services/evaluations";
import { toast } from "sonner";
import {
  Download,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Eye,
  Target,
  Building2,
  Star,
  ScrollText,
  HeartPulse,
  Users,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";
import EvaluationCreator from "./EvaluationCreator";

// Loading State Component
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Preparing Evaluation...</p>
    </div>
  </div>
);

export default function HREvaluationsPage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEvaluationCreator, setShowEvaluationCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // API State
  const [evaluations, setEvaluations] = useState([]);
  const [evaluationsLoading, setEvaluationsLoading] = useState(true);
  const [evaluationsError, setEvaluationsError] = useState(null);
  const [statistics, setStatistics] = useState({
    reviewsInProgress: 0,
    reviewsCompleted: 0,
    reviewsOverdue: 0,
    averageScore: 0,
  });

  // Fetch evaluations from API
  useEffect(() => {
    const fetchEvaluations = async () => {
      if (!accessToken) {
        console.log("No access token available");
        setEvaluationsLoading(false);
        return;
      }

      try {
        setEvaluationsLoading(true);
        console.log("Fetching evaluations from API...");

        const result = await evaluationsApi.getAllEvaluations(accessToken);

        if (result.success) {
          console.log("Evaluations fetched successfully:", result.data);
          const evalData = Array.isArray(result.data)
            ? result.data
            : result.data?.data || [];
          setEvaluations(evalData);

          // Calculate statistics from the data
          calculateStatistics(evalData);

          setEvaluationsError(null);
        } else {
          console.error("Failed to fetch evaluations:", result.error);
          setEvaluationsError(result.error);
          // Don't show toast, just log the error
          console.log("Using fallback to show UI without data");
          setEvaluations([]);
        }
      } catch (error) {
        console.error("Error fetching evaluations:", error);
        setEvaluationsError("API currently unavailable");
        console.log("Using fallback to show UI without data");
        setEvaluations([]);
      } finally {
        setEvaluationsLoading(false);
      }
    };

    fetchEvaluations();
  }, [accessToken]);

  // Calculate statistics from evaluations data
  const calculateStatistics = (evals) => {
    if (!Array.isArray(evals) || evals.length === 0) {
      return;
    }

    const inProgress = evals.filter(
      (e) => e.status === "in_progress" || e.status === "pending"
    ).length;
    const completed = evals.filter(
      (e) => e.status === "completed" || e.status === "submitted"
    ).length;
    const overdue = evals.filter((e) => e.status === "overdue").length;

    // Calculate average score for completed evaluations
    const completedWithScores = evals.filter(
      (e) => (e.status === "completed" || e.status === "submitted") && e.score
    );
    const avgScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce((sum, e) => sum + (e.score || 0), 0) /
              completedWithScores.length
          )
        : 0;

    setStatistics({
      reviewsInProgress: inProgress,
      reviewsCompleted: completed,
      reviewsOverdue: overdue,
      averageScore: avgScore,
    });
  };

  const handleNewEvaluation = () => {
    setIsLoading(true);
    // Simulate a brief loading state to show the loading UI
    setTimeout(() => {
      setShowEvaluationCreator(true);
      setIsLoading(false);
    }, 1000); // 1 second loading state
  };

  const handleBackToEvaluations = () => {
    setShowEvaluationCreator(false);
    // Refresh evaluations when returning from creator
    if (accessToken) {
      setEvaluationsLoading(true);
      evaluationsApi
        .getAllEvaluations(accessToken)
        .then((result) => {
          if (result.success) {
            const evalData = Array.isArray(result.data)
              ? result.data
              : result.data?.data || [];
            setEvaluations(evalData);
            calculateStatistics(evalData);
          } else {
            setEvaluations([]);
          }
        })
        .catch((error) => {
          console.error("Error refreshing evaluations:", error);
          setEvaluations([]);
        })
        .finally(() => {
          setEvaluationsLoading(false);
        });
    }
  };

  // Helper functions to filter and format evaluations
  const getRecentSubmissions = () => {
    return evaluations
      .filter((e) => e.status === "submitted" || e.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.submittedAt || b.createdAt) -
          new Date(a.submittedAt || a.createdAt)
      )
      .slice(0, 5);
  };

  const getUpcomingDeadlines = () => {
    return evaluations
      .filter(
        (e) =>
          e.status !== "completed" &&
          e.status !== "submitted" &&
          e.reviewDeadline
      )
      .sort((a, b) => new Date(a.reviewDeadline) - new Date(b.reviewDeadline))
      .slice(0, 10);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      submitted: { class: "bg-green-100 text-green-800", text: "Submitted" },
      completed: { class: "bg-green-100 text-green-800", text: "Completed" },
      pending: { class: "bg-yellow-100 text-yellow-800", text: "Pending" },
      in_progress: { class: "bg-blue-100 text-blue-800", text: "In Progress" },
      overdue: { class: "bg-red-100 text-red-800", text: "Overdue" },
    };
    return (
      statusMap[status] || { class: "bg-gray-100 text-gray-800", text: status }
    );
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    const parts = name.split(" ");
    return parts
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  // If loading, show loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // If evaluation creator is active, show it instead of the evaluations overview
  if (showEvaluationCreator) {
    return <EvaluationCreator onBack={handleBackToEvaluations} />;
  }

  return (
    <DashboardLayout
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={hrData}
    >
      {/* Evaluations Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Evaluations Overview
              </h1>
              <p className="text-slate-600">
                Manage and track employee performance evaluations
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleNewEvaluation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Preparing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>New Evaluation</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        {evaluationsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-slate-600">
              Loading evaluation metrics...
            </span>
          </div>
        ) : (
          <>
            {evaluationsError && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-600">⚠️</span>
                  <p className="text-sm text-yellow-800">
                    Unable to load evaluation data from server. Showing page
                    without live data.
                  </p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Reviews in Progress */}
              <Card className="@container/card relative">
                <CardHeader>
                  <CardDescription>Reviews in Progress</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.reviewsInProgress}
                  </CardTitle>
                </CardHeader>
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-50"
                  >
                    <IconTrendingUp className="text-green-600" />
                    +56%
                  </Badge>
                </div>
              </Card>

              {/* Reviews Completed */}
              <Card className="@container/card relative">
                <CardHeader>
                  <CardDescription>Reviews Completed</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.reviewsCompleted}
                  </CardTitle>
                </CardHeader>
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-50"
                  >
                    <IconTrendingUp className="text-green-600" />
                    +56%
                  </Badge>
                </div>
              </Card>

              {/* Reviews Overdue */}
              <Card className="@container/card relative">
                <CardHeader>
                  <CardDescription>Reviews Overdue</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.reviewsOverdue}
                  </CardTitle>
                </CardHeader>
                <div className="absolute bottom-3 right-3">
                  <Badge variant="secondary" className="text-red-600 bg-red-50">
                    <IconTrendingDown className="text-red-600" />
                    {statistics.reviewsOverdue > 0
                      ? "Needs Attention"
                      : "On Track"}
                  </Badge>
                </div>
              </Card>

              {/* Average Score */}
              <Card className="@container/card relative">
                <CardHeader>
                  <CardDescription>Average Score</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {statistics.averageScore}
                  </CardTitle>
                </CardHeader>
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant="secondary"
                    className="text-green-600 bg-green-50"
                  >
                    <IconTrendingUp className="text-green-600" />
                    +3.2%
                  </Badge>
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="overview"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="recent"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Recent Submissions
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Upcoming Deadlines
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Recent Submissions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Recent Submissions
                  </CardTitle>
                  <Button variant="link" className="text-sm p-0 h-auto">
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {evaluationsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    </div>
                  ) : getRecentSubmissions().length > 0 ? (
                    <div className="space-y-3">
                      {getRecentSubmissions()
                        .slice(0, 3)
                        .map((evaluation, index) => {
                          const statusBadge = getStatusBadge(evaluation.status);
                          return (
                            <div
                              key={evaluation._id || index}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-slate-900">
                                  {evaluation.employeeName ||
                                    evaluation.formName ||
                                    "N/A"}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {evaluation.formType ||
                                    evaluation.evaluationType ||
                                    "Evaluation"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatDate(
                                    evaluation.submittedAt ||
                                      evaluation.createdAt
                                  )}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={statusBadge.class}
                              >
                                {statusBadge.text}
                              </Badge>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-500">
                      <p className="text-sm">No recent submissions</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Middle Column: Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <Star className="h-4 w-4" />
                    Schedule Team Reviews
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <ScrollText className="h-4 w-4" />
                    Generate Performance Reports
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <HeartPulse className="h-4 w-4" />
                    Send Feedback Requests
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 h-auto py-3"
                  >
                    <Users className="h-4 w-4" />
                    View Team Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Right Column: Department Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Department Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">
                          Engineering
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">2 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">
                          Avg Score: 75
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">
                          Marketing
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">
                          Avg Score: 92
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">
                          Design
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">
                          Avg Score: 78
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">
                          Sales
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">1 evaluations</p>
                        <p className="text-sm font-medium text-slate-900">
                          Avg Score: 88
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row: Upcoming Deadlines */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Upcoming Deadlines
                </h3>
                <Button
                  variant="link"
                  className="flex items-center gap-2 text-sm p-0 h-auto"
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
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  View Calendar
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Jerry John Rothman
                        </p>
                        <p className="text-sm text-slate-600">
                          Annual Performance Review
                        </p>
                        <p className="text-xs text-slate-500">2024-08-15</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Jackson Cole
                        </p>
                        <p className="text-sm text-slate-600">
                          360-Degree Review
                        </p>
                        <p className="text-xs text-slate-500">2024-08-01</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Middle Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Daniel Obeng
                        </p>
                        <p className="text-sm text-slate-600">
                          Mid-Year Check-in
                        </p>
                        <p className="text-xs text-slate-500">2024-08-10</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Isabella Wright
                        </p>
                        <p className="text-sm text-slate-600">
                          Performance Improvement Plan
                        </p>
                        <p className="text-xs text-slate-500">2024-07-28</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Right Column */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          Sophia Hayes
                        </p>
                        <p className="text-sm text-slate-600">
                          Project Feedback
                        </p>
                        <p className="text-xs text-slate-500">2024-08-05</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-6">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search submissions..."
                    className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <select className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Status</option>
                </select>
                <select className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Departments</option>
                </select>
                <Button variant="outline" className="flex items-center gap-2">
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
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L6.293 13H1a1 1 0 01-1-1V4z"
                    />
                  </svg>
                  More Filters
                </Button>
              </div>
            </div>

            {/* Recent Submissions Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold">
                  Recent Submissions ({getRecentSubmissions().length})
                </CardTitle>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-slate-600 cursor-pointer"
                >
                  Sort by Score
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
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {evaluationsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      <span className="ml-2 text-slate-600">
                        Loading submissions...
                      </span>
                    </div>
                  ) : getRecentSubmissions().length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-slate-500">No submissions found</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-slate-200">
                          <TableHead className="text-left py-3 px-4">
                            <input
                              type="checkbox"
                              className="rounded border-slate-300"
                            />
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Employee
                            <svg
                              className="inline ml-1 h-4 w-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Evaluation Type
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Date
                            <svg
                              className="inline ml-1 h-4 w-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Score
                            <svg
                              className="inline ml-1 h-4 w-4 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                              />
                            </svg>
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Status
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Department
                          </TableHead>
                          <TableHead className="text-left py-3 px-4 font-medium text-slate-600">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="divide-y divide-slate-100">
                        {getRecentSubmissions().map((evaluation) => {
                          const statusBadge = getStatusBadge(evaluation.status);
                          const initials = getInitials(
                            evaluation.employeeName || evaluation.formName
                          );
                          const score = evaluation.score || 0;

                          return (
                            <TableRow
                              key={evaluation._id}
                              className="hover:bg-slate-50"
                            >
                              <TableCell className="py-3 px-4">
                                <input
                                  type="checkbox"
                                  className="rounded border-slate-300"
                                />
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {evaluation.employeeName ||
                                        evaluation.formName ||
                                        "N/A"}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      {evaluation.department || "N/A"}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-slate-900">
                                {evaluation.formType ||
                                  evaluation.evaluationType ||
                                  "N/A"}
                              </TableCell>
                              <TableCell className="py-3 px-4 text-slate-900">
                                {formatDate(
                                  evaluation.submittedAt || evaluation.createdAt
                                )}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                {score > 0 ? (
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-slate-900">
                                      {score}
                                    </span>
                                    <div className="w-16 bg-slate-200 rounded-full h-2">
                                      <div
                                        className="bg-purple-500 h-2 rounded-full"
                                        style={{ width: `${score}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <Badge
                                  variant="secondary"
                                  className={statusBadge.class}
                                >
                                  {statusBadge.text}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 px-4 text-slate-600">
                                {evaluation.department || "N/A"}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 cursor-pointer"
                                    title="View"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="Edit"
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
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">
                Upcoming Deadlines
              </h3>
              <Button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700">
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
                    d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  />
                </svg>
                Send Reminders
              </Button>
            </div>

            {/* Upcoming Deadlines Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <p className="text-center py-12 text-slate-500">
                    No upcoming deadlines at this time
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
