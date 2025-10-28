import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import adminData from "./adminData.json";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  Loader2,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { GoalCreationModal } from "@/components/auth/GoalCreationModal";
import { useAuth } from "@/hooks/useAuth";
import { adminHrApi } from "@/services/adminHrApi";
import { toast } from "sonner";

export default function AdminPerformancePage() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [timeframe, setTimeframe] = useState("12-months");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goals, setGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isDeletingGoal, setIsDeletingGoal] = useState(null);

  // Performance trends state
  const [performanceTrends, setPerformanceTrends] = useState(null);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // HR Overview state
  const [hrOverview, setHrOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // Staff Overview state
  const [staffOverview, setStaffOverview] = useState(null);
  const [isLoadingStaffOverview, setIsLoadingStaffOverview] = useState(false);

  // Performers modal state
  const [showTopPerformersModal, setShowTopPerformersModal] = useState(false);
  const [showLowPerformersModal, setShowLowPerformersModal] = useState(false);

  // Load data from API on component mount
  useEffect(() => {
    if (accessToken) {
      loadGoals();
      loadPerformanceTrends();
      loadHrOverview();
      loadStaffOverview();
    }
  }, [accessToken]);

  const loadGoals = async () => {
    if (!accessToken) return;

    setIsLoadingGoals(true);
    try {
      console.log(
        "Loading goals with token:",
        accessToken.substring(0, 20) + "..."
      );
      const result = await adminHrApi.getAllGoals(accessToken);
      if (result.success) {
        const goalsData = result.data?.data || result.data || [];
        console.log("Loaded goals raw data:", goalsData);
        console.log("First goal structure:", goalsData[0]);
        console.log("First goal currentMetric:", goalsData[0]?.currentMetric);
        console.log("First goal targetMetric:", goalsData[0]?.targetMetric);
        console.log("Current metric type:", typeof goalsData[0]?.currentMetric);
        console.log("Target metric type:", typeof goalsData[0]?.targetMetric);

        // Transform API data to match goal card expectations
        const transformedGoals = goalsData.map((goal) => ({
          id: goal._id || goal.id,
          title: goal.goalTitle || goal.title,
          description: goal.goalDescription || goal.description,
          priority: goal.priority || "Medium",
          status: goal.status || "Not Started",
          progress: goal.progress || 0,
          deadline: goal.dueDate || goal.targetDeadline || goal.deadline,
          owner: goal.goalOwner || goal.owner,
          keyMetrics: goal.keyMetrics || [],
          category: goal.category || "General",
          goalType: goal.goalType || goal.type || "Company",
          team: goal.team || "",
          department: goal.department || "",
          successCriteria: goal.successCriteria || "",
          startDate: goal.startDate || "",
          createdBy: goal.createdBy || null,
          // Keep original data for editing
          ...goal,
        }));

        console.log("Transformed goals:", transformedGoals);
        console.log(
          "First transformed goal currentMetric:",
          transformedGoals[0]?.currentMetric
        );
        console.log(
          "First transformed goal targetMetric:",
          transformedGoals[0]?.targetMetric
        );

        // Add pending goals from local storage
        const pendingGoals = adminHrApi.getPendingGoals();
        console.log("Pending goals from localStorage:", pendingGoals);

        // Transform pending goals to match the same format
        const transformedPendingGoals = pendingGoals.map((goal) => ({
          id: goal.id,
          title: goal.goalTitle || goal.title,
          description: goal.goalDescription || goal.description,
          priority: goal.priority || "Medium",
          status: goal.status || "Pending Sync",
          progress: 0,
          deadline: goal.dueDate || goal.deadline,
          owner: goal.goalOwner || goal.owner,
          keyMetrics: goal.keyMetrics || [],
          category: goal.category || "General",
          goalType: goal.goalType || "Company",
          team: goal.team || "",
          department: goal.department || "",
          successCriteria: goal.successCriteria || "",
          startDate: goal.startDate || "",
          createdBy: goal.createdBy || null,
          isLocal: true, // Flag to indicate this is a local goal
          ...goal,
        }));

        // Combine server goals and pending goals
        const allGoals = [...transformedGoals, ...transformedPendingGoals];
        console.log("All goals (server + pending):", allGoals);

        setGoals(allGoals);
        toast.success(
          `Goals loaded successfully (${transformedGoals.length} from server, ${transformedPendingGoals.length} pending sync)`
        );
      } else {
        console.error("API returned error:", result.error);
        toast.error(result.error || "Failed to load goals");

        // Even if API fails, show pending goals from localStorage
        const pendingGoals = adminHrApi.getPendingGoals();
        const transformedPendingGoals = pendingGoals.map((goal) => ({
          id: goal.id,
          title: goal.goalTitle || goal.title,
          description: goal.goalDescription || goal.description,
          priority: goal.priority || "Medium",
          status: goal.status || "Pending Sync",
          progress: 0,
          deadline: goal.dueDate || goal.deadline,
          owner: goal.goalOwner || goal.owner,
          keyMetrics: goal.keyMetrics || [],
          category: goal.category || "General",
          goalType: goal.goalType || "Company",
          team: goal.team || "",
          department: goal.department || "",
          successCriteria: goal.successCriteria || "",
          startDate: goal.startDate || "",
          createdBy: goal.createdBy || null,
          isLocal: true,
          ...goal,
        }));

        setGoals(transformedPendingGoals);
        toast.info(
          `Showing ${transformedPendingGoals.length} pending goals (server unavailable)`
        );
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Failed to load goals - showing pending goals only");

      // Show pending goals even if there's an error
      const pendingGoals = adminHrApi.getPendingGoals();
      const transformedPendingGoals = pendingGoals.map((goal) => ({
        id: goal.id,
        title: goal.goalTitle || goal.title,
        description: goal.goalDescription || goal.description,
        priority: goal.priority || "Medium",
        status: goal.status || "Pending Sync",
        progress: 0,
        deadline: goal.dueDate || goal.deadline,
        owner: goal.goalOwner || goal.owner,
        keyMetrics: goal.keyMetrics || [],
        category: goal.category || "General",
        goalType: goal.goalType || "Company",
        team: goal.team || "",
        department: goal.department || "",
        successCriteria: goal.successCriteria || "",
        startDate: goal.startDate || "",
        createdBy: goal.createdBy || null,
        isLocal: true,
        ...goal,
      }));

      setGoals(transformedPendingGoals);
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const loadPerformanceTrends = async () => {
    if (!accessToken) return;

    setIsLoadingTrends(true);
    try {
      const result = await adminHrApi.getPerformanceTrends(accessToken);
      if (result.success) {
        setPerformanceTrends(result.data);
        console.log("Loaded performance trends:", result.data);

        // Show notification if using fallback data
        if (result.isFallback) {
          toast.warning(
            "Using fallback performance data - Backend permission issue needs to be resolved"
          );
        }
      } else {
        toast.error(result.error || "Failed to load performance trends");
        // Fallback to static data if API fails
        setPerformanceTrends(getStaticTrends());
      }
    } catch (error) {
      console.error("Error loading performance trends:", error);
      toast.error("Failed to load performance trends");
      // Fallback to static data
      setPerformanceTrends(getStaticTrends());
    } finally {
      setIsLoadingTrends(false);
    }
  };

  const loadHrOverview = async () => {
    if (!accessToken) return;

    setIsLoadingOverview(true);
    try {
      const result = await adminHrApi.getOverview(accessToken);
      if (result.success) {
        setHrOverview(result.data);
        console.log("Loaded HR overview:", result.data);

        // Show notification if using fallback data
        if (result.isFallback) {
          toast.warning(
            "Using fallback data - Backend permission issue needs to be resolved"
          );
        }
      } else {
        toast.error(result.error || "Failed to load HR overview");
        // Fallback to static data if API fails
        setHrOverview(getStaticOverview());
      }
    } catch (error) {
      console.error("Error loading HR overview:", error);
      toast.error("Failed to load HR overview");
      // Fallback to static data
      setHrOverview(getStaticOverview());
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const loadStaffOverview = async () => {
    if (!accessToken) return;

    setIsLoadingStaffOverview(true);
    try {
      const result = await adminHrApi.getStaffOverview(accessToken);
      if (result.success) {
        setStaffOverview(result.data);
        console.log("Loaded staff overview:", result.data);

        // Show notification if using fallback data
        if (result.isFallback) {
          toast.warning(
            "Using fallback staff data - Backend permission issue needs to be resolved"
          );
        }
      } else {
        toast.error(result.error || "Failed to load staff overview");
        // Fallback to static data if API fails
        setStaffOverview(getStaticStaffOverview());
      }
    } catch (error) {
      console.error("Error loading staff overview:", error);
      toast.error("Failed to load staff overview");
      // Fallback to static data
      setStaffOverview(getStaticStaffOverview());
    } finally {
      setIsLoadingStaffOverview(false);
    }
  };

  // Static fallback data functions
  const getStaticOverview = () => ({
    data: {
      activeEmployees: 42,
      totalRemoteWorkersToday: 15,
      noCheckInToday: 3,
      productivityIndex: "87%",
      departmentPerformance: {
        Engineering: { checkedIn: 12, total: 15, percent: "80%" },
        Sales: { checkedIn: 8, total: 10, percent: "80%" },
        Marketing: { checkedIn: 6, total: 8, percent: "75%" },
        HR: { checkedIn: 5, total: 6, percent: "83%" },
      },
      incompleteTasks: [
        { task: "Q4 Performance Review", count: 5 },
        { task: "Goal Setting Session", count: 3 },
        { task: "Training Completion", count: 2 },
      ],
    },
  });

  const getStaticStaffOverview = () => ({
    data: {
      topPerformers: [
        {
          employeeId: "EMP001",
          name: "John Doe",
          department: "Engineering",
          score: 4.8,
          avatar: null,
        },
        {
          employeeId: "EMP002",
          name: "Jane Smith",
          department: "Sales",
          score: 4.7,
          avatar: null,
        },
      ],
      lowPerformers: [
        {
          employeeId: "EMP003",
          name: "Mike Johnson",
          department: "Marketing",
          score: 2.1,
          avatar: null,
        },
      ],
    },
  });

  const getStaticTrends = () => ({
    data: {
      monthlyData: [
        { month: "Jan", performance: 85, satisfaction: 88, productivity: 82 },
        { month: "Feb", performance: 87, satisfaction: 90, productivity: 85 },
        { month: "Mar", performance: 89, satisfaction: 92, productivity: 87 },
        { month: "Apr", performance: 91, satisfaction: 94, productivity: 89 },
        { month: "May", performance: 88, satisfaction: 91, productivity: 86 },
        { month: "Jun", performance: 90, satisfaction: 93, productivity: 88 },
      ],
    },
  });

  const handleDeleteGoal = async (goalId) => {
    if (!accessToken) return;

    setIsDeletingGoal(goalId);
    try {
      const result = await adminHrApi.deleteGoal(goalId, accessToken);
      if (result.success) {
        toast.success("Goal deleted successfully");
        loadGoals(); // Reload goals
      } else {
        toast.error("Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Error deleting goal");
    } finally {
      setIsDeletingGoal(null);
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  // Calculate performance distribution from actual data
  const calculatePerformanceDistribution = () => {
    if (
      !performanceTrends?.topPerformers &&
      !performanceTrends?.lowPerformers
    ) {
      return { outstanding: 15, exceeds: 35, meets: 40, below: 10 };
    }

    const allPerformers = [
      ...(performanceTrends?.topPerformers || []),
      ...(performanceTrends?.lowPerformers || []),
    ];

    const total = allPerformers.length || 1;
    const outstanding = allPerformers.filter((p) => p.score >= 4.5).length;
    const exceeds = allPerformers.filter(
      (p) => p.score >= 4.0 && p.score < 4.5
    ).length;
    const meets = allPerformers.filter(
      (p) => p.score >= 3.0 && p.score < 4.0
    ).length;
    const below = allPerformers.filter((p) => p.score < 3.0).length;

    return {
      outstanding: Math.round((outstanding / total) * 100),
      exceeds: Math.round((exceeds / total) * 100),
      meets: Math.round((meets / total) * 100),
      below: Math.round((below / total) * 100),
    };
  };

  // Calculate goals achievement from actual goals
  const calculateGoalsAchievement = () => {
    if (!goals || goals.length === 0) {
      return {
        overall: 0,
        statusBreakdown: [],
      };
    }

    const totalProgress = goals.reduce(
      (sum, goal) => sum + (goal.progress || 0),
      0
    );
    const overall = Math.round(totalProgress / goals.length);

    // Get top goals by category
    const goalsByCategory = goals.reduce((acc, goal) => {
      const category = goal.category || "General";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(goal);
      return acc;
    }, {});

    const statusBreakdown = Object.entries(goalsByCategory)
      .slice(0, 4)
      .map(([category, categoryGoals]) => {
        const avgProgress = Math.round(
          categoryGoals.reduce((sum, g) => sum + (g.progress || 0), 0) /
            categoryGoals.length
        );
        return {
          category,
          progress: avgProgress,
          target: 100,
        };
      });

    return { overall, statusBreakdown };
  };

  const handleCreateGoal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  const handleGoalSaved = () => {
    loadGoals(); // Reload goals after saving
    handleModalClose();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Not Started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "On Hold":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Revenue":
        return (
          <svg
            className="w-4 h-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        );
      case "Process Improvement":
        return (
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "Strategic":
        return (
          <svg
            className="w-4 h-4 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case "Engagement":
        return (
          <svg
            className="w-4 h-4 text-teal-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-4 h-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  const getTeamIcon = (team) => {
    switch (team) {
      case "Sales Team":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        );
      case "Engineering Team":
        return (
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "Marketing Team":
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case "HR Team":
        return (
          <svg
            className="w-5 h-5 text-orange-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        );
    }
  };

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={adminData}
    >
      {/* Employee Performance Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Employee Performance Overview
          </h1>
          <p className="text-slate-600 text-sm">
            Analyze employee performance across the organization with key
            metrics and trends
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger
              value="overview"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Performance
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className={`data-[state=active]:bg-green-500 data-[state=active]:text-white cursor-pointer`}
            >
              Goals
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="mt-8">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Active Employees Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Active Employees
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    2
                  </div>
                  <div className="text-sm text-slate-600">
                    Currently working
                  </div>
                </CardContent>
              </Card>

              {/* Remote Workers Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Remote Workers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    1
                  </div>
                  <div className="text-sm text-slate-600">
                    Working remotely today
                  </div>
                </CardContent>
              </Card>

              {/* No Check-In Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    No Check-In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    13
                  </div>
                  <div className="text-sm text-slate-600">
                    Haven't checked in today
                  </div>
                </CardContent>
              </Card>

              {/* Productivity Index Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Productivity Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    18.75%
                  </div>
                  <div className="text-sm text-slate-600">
                    Overall productivity
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Performance and Incomplete Tasks */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Department Performance Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Department Performance
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Check-in rates by department
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Design Department */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Design
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          2/5 (40.00%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-500 transition-all duration-300"
                          style={{ width: "40%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Engineering Department */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Engineering
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          1/8 (12.50%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-red-500 transition-all duration-300"
                          style={{ width: "12.5%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Human Resources Department */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Human Resources
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          0/1 (0.00%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Social Media Department */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Social Media
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          0/1 (0.00%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                    </div>

                    {/* Production Department */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Production
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          0/1 (0.00%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-gray-400 transition-all duration-300"
                          style={{ width: "0%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Incomplete Tasks Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Incomplete Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
                    <div className="text-6xl font-bold text-red-600 mb-4">
                      2
                    </div>
                    <p className="text-sm text-slate-600 mb-6">
                      Tasks pending completion.
                    </p>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top and Low Performers */}
            {/* Staff Performance Overview */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Staff Performance Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* My Tasks Today Card */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      My Tasks Today
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-slate-900 mb-1">
                      5
                    </div>
                  </CardContent>
                </Card>

                {/* Completed Tasks Card */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Completed Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      3
                    </div>
                  </CardContent>
                </Card>

                {/* Hours Worked Card */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Hours Worked
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      7.5h
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Score Card */}
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      Performance Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      86%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Performance Tab Content */}
          <TabsContent value="performance" className="mt-8">
            {/* Department Performance Comparison Card */}
            <div className="mb-8">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Department Performance Comparison
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Comprehensive view of performance metrics across all
                    departments
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Chart Area */}
                  <div className="h-80 bg-white rounded-lg mb-6 border border-slate-100">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-slate-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-4 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <p className="text-slate-400 text-sm">
                          Performance comparison chart will be displayed here
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-8 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                      <span className="text-slate-600">
                        Employee Satisfaction
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-slate-600">Performance Score</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-slate-600">Productivity Index</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-600">Retention Rate</span>
                    </div>
                  </div>

                  {/* Summary Information */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Top Performer:</span>
                      <span className="font-semibold text-green-600">N/A</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Overall Index:</span>
                      <span className="font-semibold text-blue-600">
                        0.0/5.0
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Period:</span>
                      <span className="font-semibold text-purple-600">
                        Q4-2025
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Overall Performance Index Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Overall Performance Index
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-slate-900 mb-2">
                      {performanceTrends?.OverallPerformanceIndex?.toFixed(1) ||
                        "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span>
                        Current Quarter (
                        {performanceTrends?.period || "Q4-2025"})
                      </span>
                      <div className="flex items-center gap-1 text-green-600 font-medium">
                        <TrendingUp className="h-4 w-4" />
                        <span>+0.2</span>
                      </div>
                    </div>
                  </div>

                  {/* Department Performance Breakdown */}
                  <div className="space-y-4">
                    {Array.isArray(
                      performanceTrends?.OverallDepartmentPerformance
                    ) &&
                    performanceTrends?.OverallDepartmentPerformance.length >
                      0 ? (
                      performanceTrends?.OverallDepartmentPerformance.map(
                        (dept, index) => (
                          <div key={dept.department || index}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-slate-700">
                                {dept.department || "Unknown"}
                              </span>
                              <span className="text-sm font-semibold text-slate-900">
                                {dept.avgScore?.toFixed(1) || "0.0"} (
                                {dept.totalEmployees || 0} employees)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  (dept.avgScore || 0) >= 4.5
                                    ? "bg-green-500"
                                    : (dept.avgScore || 0) >= 4.0
                                    ? "bg-blue-500"
                                    : (dept.avgScore || 0) >= 3.5
                                    ? "bg-yellow-500"
                                    : "bg-orange-500"
                                }`}
                                style={{
                                  width: `${((dept.avgScore || 0) / 5) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <div className="text-center py-4 text-slate-500 text-sm">
                        No department data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performing Department Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Top Performing Department
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {performanceTrends?.TopPerformingDepartment?.department ||
                        "0"}
                    </div>
                    <div className="text-xl font-semibold text-slate-900 mb-1">
                      {performanceTrends?.TopPerformingDepartment?.avgScore?.toFixed(
                        1
                      ) || "0.0"}
                    </div>
                    <div className="text-sm text-slate-600 mb-3">
                      Average Score
                    </div>
                    <div className="text-sm text-slate-500">
                      {performanceTrends?.TopPerformingDepartment
                        ?.totalEmployees || 0}{" "}
                      employees
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row - Top Performers and Low Performers Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Top Performers Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(performanceTrends?.topPerformers) &&
                    performanceTrends?.topPerformers.length > 0 ? (
                      performanceTrends?.topPerformers.map(
                        (performer, index) => {
                          const initials =
                            performer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?";
                          return (
                            <div
                              key={
                                performer.employeeId || performer.name || index
                              }
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {performer.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {performer.role || "Unknown"} •{" "}
                                    {performer.department || "Unknown"}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  {((performer.score || 0) * 20).toFixed(0)}%
                                </div>
                                <div className="text-xs text-slate-500">
                                  Performance
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-sm text-slate-500">
                          No top performers data
                        </p>
                      </div>
                    )}

                    {/* View All Button */}
                    <button
                      onClick={() => setShowTopPerformersModal(true)}
                      className="w-full mt-4 text-sm text-green-600 hover:text-green-700 font-medium flex items-center justify-center gap-2 py-2 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      View All Top Performers
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Low Performers Card */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    Low Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.isArray(performanceTrends?.lowPerformers) &&
                    performanceTrends?.lowPerformers.length > 0 ? (
                      performanceTrends?.lowPerformers.map(
                        (performer, index) => {
                          const initials =
                            performer.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?";
                          return (
                            <div
                              key={
                                performer.employeeId || performer.name || index
                              }
                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {performer.name || "Unknown"}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {performer.role || "Unknown"} •{" "}
                                    {performer.department || "Unknown"}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-orange-600">
                                  {((performer.score || 0) * 20).toFixed(0)}%
                                </div>
                                <div className="text-xs text-slate-500">
                                  Performance
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <p className="text-sm text-slate-500">
                          No low performers data
                        </p>
                      </div>
                    )}

                    {/* View All Button */}
                    <button
                      onClick={() => setShowLowPerformersModal(true)}
                      className="w-full mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center justify-center gap-2 py-2 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      View All Low Performers
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row - Two Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Performance Distribution Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900">
                    Performance Distribution
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Current Quarter Ratings
                  </p>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const distribution = calculatePerformanceDistribution();
                    const outstandingPercent = distribution.outstanding / 100;
                    const exceedsPercent = distribution.exceeds / 100;
                    const meetsPercent = distribution.meets / 100;
                    const belowPercent = distribution.below / 100;

                    return (
                      <>
                        <div className="flex items-center justify-center mb-6">
                          {/* Donut Chart */}
                          <div className="relative w-32 h-32">
                            <svg
                              className="w-32 h-32 transform -rotate-90"
                              viewBox="0 0 32 32"
                            >
                              {/* Green segment - Outstanding */}
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="3"
                                strokeDasharray={`${
                                  2 * Math.PI * 14 * outstandingPercent
                                } ${2 * Math.PI * 14}`}
                                strokeDashoffset="0"
                              />
                              {/* Blue segment - Exceeds */}
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="3"
                                strokeDasharray={`${
                                  2 * Math.PI * 14 * exceedsPercent
                                } ${2 * Math.PI * 14}`}
                                strokeDashoffset={`-${
                                  2 * Math.PI * 14 * outstandingPercent
                                }`}
                              />
                              {/* Orange segment - Meets */}
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="3"
                                strokeDasharray={`${
                                  2 * Math.PI * 14 * meetsPercent
                                } ${2 * Math.PI * 14}`}
                                strokeDashoffset={`-${
                                  2 *
                                  Math.PI *
                                  14 *
                                  (outstandingPercent + exceedsPercent)
                                }`}
                              />
                              {/* Red segment - Below */}
                              <circle
                                cx="16"
                                cy="16"
                                r="14"
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="3"
                                strokeDasharray={`${
                                  2 * Math.PI * 14 * belowPercent
                                } ${2 * Math.PI * 14}`}
                                strokeDashoffset={`-${
                                  2 *
                                  Math.PI *
                                  14 *
                                  (outstandingPercent +
                                    exceedsPercent +
                                    meetsPercent)
                                }`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-16 h-16 bg-white rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        {/* Legend */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-slate-700">
                                Outstanding (≥4.5)
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {distribution.outstanding}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <span className="text-sm text-slate-700">
                                Exceeds (4.0-4.4)
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {distribution.exceeds}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-sm text-slate-700">
                                Meets (3.0-3.9)
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {distribution.meets}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm text-slate-700">
                                Below (&lt;3.0)
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {distribution.below}%
                            </span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Goals Achievement Card */}
              <Card className="h-full">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Goals Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const achievement = calculateGoalsAchievement();
                    return (
                      <>
                        <div className="mb-6">
                          <div className="text-4xl font-bold text-slate-900 mb-2">
                            {achievement.overall}%
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <span>{goals.length} total goals tracked</span>
                          </div>
                        </div>

                        {/* Goals Breakdown */}
                        <div className="space-y-4">
                          {achievement.statusBreakdown.length > 0 ? (
                            achievement.statusBreakdown.map((item, idx) => (
                              <div key={idx}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-medium text-slate-700 truncate">
                                    {item.category}
                                  </span>
                                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                                    {item.progress}% / {item.target}%
                                    {item.progress >= item.target && (
                                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    )}
                                  </span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                  <div
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                      item.progress >= item.target
                                        ? "bg-green-500"
                                        : item.progress >= 70
                                        ? "bg-blue-500"
                                        : "bg-orange-500"
                                    }`}
                                    style={{ width: `${item.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500 italic text-center py-4">
                              No goals available to display
                            </p>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals Tab Content */}
          <TabsContent value="goals" className="mt-8">
            {/* Company Goals Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Company Goals
                </h2>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleCreateGoal}
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Goal
              </Button>
            </div>

            {/* Goals Cards */}
            <div className="space-y-6">
              {isLoadingGoals ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <span className="ml-2 text-slate-600">Loading goals...</span>
                </div>
              ) : goals.filter((goal) => goal.goalType === "Company").length ===
                0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No goals found
                  </h3>
                  <p className="text-slate-600 mb-4">
                    Get started by creating your first performance goal.
                  </p>
                  <Button
                    onClick={handleCreateGoal}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Create First Goal
                  </Button>
                </div>
              ) : (
                goals
                  .filter((goal) => goal.goalType === "Company")
                  .map((goal) => (
                    <Card
                      key={goal.id}
                      className="border border-slate-200 shadow-sm"
                    >
                      <CardContent className="p-6">
                        {/* Goal Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                {goal.title}
                              </h3>
                              <p className="text-slate-600 text-sm leading-relaxed">
                                {goal.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-3 py-1 ${
                                goal.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : goal.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : goal.priority === "Low"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {goal.priority}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={`text-xs px-3 py-1 ${
                                goal.status === "On Track"
                                  ? "bg-blue-100 text-blue-700"
                                  : goal.status === "Not Started"
                                  ? "bg-gray-100 text-gray-700"
                                  : goal.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : goal.status === "On Hold"
                                  ? "bg-orange-100 text-orange-700"
                                  : goal.status === "Pending Sync"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {goal.status}
                            </Badge>
                            {/* Local goal indicator */}
                            {goal.isLocal && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-3 py-1 bg-purple-100 text-purple-700"
                              >
                                📱 Local
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">
                              Progress
                            </span>
                            <span className="text-sm font-semibold text-slate-900">
                              {goal.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-300 ${
                                goal.progress >= 80
                                  ? "bg-green-500"
                                  : goal.progress >= 60
                                  ? "bg-blue-500"
                                  : goal.progress >= 40
                                  ? "bg-yellow-500"
                                  : "bg-orange-500"
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Goal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Due: {goal.deadline}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            <span>Owner: {goal.owner}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span>Type: {goal.goalType}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span>Created {goal.createdAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditGoal(goal)}
                              className="text-slate-600 hover:text-slate-900"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              disabled={isDeletingGoal === goal.id}
                              className="text-red-600 hover:text-red-900 hover:bg-red-50"
                            >
                              {isDeletingGoal === goal.id ? (
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4 mr-1" />
                              )}
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* Team Goals Section */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-5 h-5 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-slate-900">
                  Team Goals
                </h3>
              </div>

              {/* Human Resources Subsection */}
              <div className="mb-6">
                <div className="bg-blue-50 px-4 py-3 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span className="font-medium text-slate-700">
                        Human Resources
                      </span>
                    </div>
                    <span className="text-sm text-slate-600">1 Goals</span>
                  </div>
                </div>

                {/* HR Goal Card */}
                <Card className="p-6 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <h4 className="text-base font-semibold text-slate-900">
                        test 1
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                        Medium
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">test 1</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-medium">0%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Assignee</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span>Deadline: 2025-10-21</span>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-slate-700 mb-2">
                      Key Metrics
                    </h5>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Current:</div>
                      <div>Target:</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4">
                    <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </Card>

                {/* Add Goal Button for HR */}
                <div className="text-center">
                  <Button
                    onClick={handleCreateGoal}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    + Add New Goal for Human Resources
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleGoalSaved}
        editingGoal={editingGoal}
      />

      {/* Top Performers Modal */}
      <Dialog
        open={showTopPerformersModal}
        onOpenChange={setShowTopPerformersModal}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Top Performers
            </DialogTitle>
            <DialogDescription>
              Employees who are exceeding performance expectations
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {Array.isArray(staffOverview?.data?.topPerformers) &&
            staffOverview.data.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {staffOverview.data.topPerformers.map((performer) => {
                  const percentScore = (performer.score / 5) * 100;
                  return (
                    <div
                      key={performer.employeeId || performer.name || index}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-green-600">
                            {performer.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-slate-900">
                            {performer.name || "Unknown"}
                          </div>
                          <div className="text-sm text-slate-600">
                            {performer.department || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            <span>
                              ID: {performer.employeeId?.slice(-6) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {percentScore}%
                        </div>
                        <div className="text-sm text-slate-500 mb-2">
                          Performance
                        </div>
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <TrendingUp className="w-3 h-3" />
                          <span>
                            Score: {performer.score?.toFixed(1) || "0.0"}/5.0
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs border-green-300 text-green-600 hover:bg-green-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-slate-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-slate-600">
                  No top performers data available
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Low Performers Modal */}
      <Dialog
        open={showLowPerformersModal}
        onOpenChange={setShowLowPerformersModal}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Low Performers
            </DialogTitle>
            <DialogDescription>
              Employees who need performance improvement
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {Array.isArray(staffOverview?.data?.lowPerformers) &&
            staffOverview.data.lowPerformers.length > 0 ? (
              <div className="space-y-4">
                {staffOverview.data.lowPerformers.map((performer) => {
                  const percentScore = (performer.score / 5) * 100;
                  return (
                    <div
                      key={performer.employeeId || performer.name || index}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-orange-600">
                            {performer.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-slate-900">
                            {performer.name || "Unknown"}
                          </div>
                          <div className="text-sm text-slate-600">
                            {performer.department || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-500">
                            <span>
                              ID: {performer.employeeId?.slice(-6) || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">
                          {percentScore}%
                        </div>
                        <div className="text-sm text-slate-500 mb-2">
                          Performance
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                          <TrendingDown className="w-3 h-3" />
                          <span>
                            Score: {performer.score?.toFixed(1) || "0.0"}/5.0
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 text-xs border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Create Improvement Plan
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-slate-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <p className="text-slate-600">
                  No low performers data available
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
