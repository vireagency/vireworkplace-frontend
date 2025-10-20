import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
import hrData from "./hrData.json";
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
} from "lucide-react";
import { GoalCreationModal } from "@/components/auth/GoalCreationModal";
import { useAuth } from "@/hooks/useAuth";
import { goalsApi } from "@/services/goalsApi";
import { performanceTrendsApi } from "@/services/performanceTrendsApi";
import { hrOverviewApi } from "@/services/hrOverviewApi";
import { staffOverviewApi } from "@/services/staffOverviewApi";
import { toast } from "sonner";

export default function HRPerformancePage() {
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
      const result = await goalsApi.getAllGoals(accessToken);
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
        const pendingGoals = goalsApi.getPendingGoals();
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
        const pendingGoals = goalsApi.getPendingGoals();
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
      const pendingGoals = goalsApi.getPendingGoals();
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
      const result = await performanceTrendsApi.getPerformanceTrends(
        accessToken
      );
      if (result.success) {
        setPerformanceTrends(result.data);
        console.log("Loaded performance trends:", result.data);
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
      const result = await hrOverviewApi.getOverview(accessToken);
      if (result.success) {
        setHrOverview(result.data);
        console.log("Loaded HR overview:", result.data);
      } else {
        console.error("Failed to load HR overview:", result.error);
        // Fallback to static data if API fails
        setHrOverview(getStaticOverview());
      }
    } catch (error) {
      console.error("Error loading HR overview:", error);
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
      const result = await staffOverviewApi.getStaffOverview(accessToken);
      if (result.success) {
        setStaffOverview(result.data);
        console.log("Staff Overview loaded:", result.data);
      } else {
        console.error("Failed to load staff overview:", result.error);
        // Fallback to static data if API fails
        setStaffOverview(getStaticStaffOverview());
      }
    } catch (error) {
      console.error("Error loading staff overview:", error);
      // Fallback to static data
      setStaffOverview(getStaticStaffOverview());
    } finally {
      setIsLoadingStaffOverview(false);
    }
  };

  // Static HR overview as fallback
  const getStaticOverview = () => ({
    success: true,
    message: "Dashboard overview fetched successfully",
    data: {
      activeEmployees: 22,
      totalRemoteWorkersToday: 5,
      noCheckInToday: 3,
      productivityIndex: "86.36%",
      departmentPerformance: {
        Engineering: {
          total: 10,
          checkedIn: 8,
          percent: "80.00%",
        },
        HR: {
          total: 5,
          checkedIn: 5,
          percent: "100.00%",
        },
        Finance: {
          total: 7,
          checkedIn: 6,
          percent: "85.71%",
        },
      },
      incompleteTasks: 14,
    },
  });

  // Static staff overview as fallback
  const getStaticStaffOverview = () => ({
    success: true,
    message: "Staff overview fetched successfully",
    overview: {
      myTasksToday: 5,
      completedTasks: 3,
      hoursWorked: 7.5,
      performanceScore: "86%",
    },
  });

  // Static performance trends as fallback
  const getStaticTrends = () => ({
    success: true,
    message: "Performance trends fetched successfully",
    period: "Q1-2024",
    TopPerformingDepartment: {
      department: "Engineering",
      avgScore: 4.7,
      totalEmployees: 12,
    },
    OverallPerformanceIndex: 4.2,
    OverallDepartmentPerformance: [
      {
        department: "Engineering",
        avgScore: 4.7,
        totalEmployees: 12,
      },
      {
        department: "HR",
        avgScore: 4.3,
        totalEmployees: 5,
      },
      {
        department: "Finance",
        avgScore: 3.9,
        totalEmployees: 7,
      },
    ],
    topPerformers: [
      {
        employeeId: "64efc8d1c5a2a12345f0d9a7",
        name: "Jane Smith",
        role: "Software Engineer",
        score: 4.9,
        department: "Engineering",
      },
      {
        employeeId: "64efc8d1c5a2a12345f0d9a8",
        name: "John Doe",
        role: "Product Manager",
        score: 4.8,
        department: "Product",
      },
    ],
    lowPerformers: [
      {
        employeeId: "64efc8d1c5a2a12345f0d9a9",
        name: "Alex Brown",
        role: "Junior Analyst",
        score: 2.5,
        department: "Finance",
      },
      {
        employeeId: "64efc8d1c5a2a12345f0d9a0",
        name: "Sarah Johnson",
        role: "HR Assistant",
        score: 2.8,
        department: "HR",
      },
    ],
  });

  // Static goals as fallback - removed dummy data
  const getStaticGoals = () => [];

  // Calculate performance distribution from performers data
  const calculatePerformanceDistribution = () => {
    if (
      !performanceTrends?.topPerformers &&
      !performanceTrends?.lowPerformers
    ) {
      return { outstanding: 15, exceeds: 35, meets: 40, below: 10 };
    }

    const allPerformers = [
      ...(performanceTrends.topPerformers || []),
      ...(performanceTrends.lowPerformers || []),
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

  const handleCreateGoal = async (data) => {
    console.log("Goal created/updated:", data);
    // Refresh goals list
    await loadGoals();
  };

  const handleEditGoal = (goal) => {
    console.log("Edit button clicked, goal data:", goal);
    console.log(
      "Goal title:",
      goal.title,
      "Goal description:",
      goal.description
    );
    console.log(
      "Goal goalTitle:",
      goal.goalTitle,
      "Goal goalDescription:",
      goal.goalDescription
    );
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    setIsDeletingGoal(goalId);
    try {
      // Check if it's a local goal (starts with "local_")
      if (goalId.startsWith("local_")) {
        console.log("Deleting local goal:", goalId);

        // Use the API function to delete local goal
        const success = goalsApi.deleteLocalGoal(goalId);
        if (success) {
          toast.success("Goal deleted successfully!");
          // Refresh the goals list
          await loadGoals();
        } else {
          toast.error("Failed to delete local goal");
        }
      } else {
        // Server goal deletion
        if (!accessToken) {
          toast.error("Authentication required");
          return;
        }

        const result = await goalsApi.deleteGoal(goalId, accessToken);
        if (result.success) {
          toast.success("Goal deleted successfully!");
          await loadGoals();
        } else {
          toast.error(result.error || "Failed to delete goal");
        }
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    } finally {
      setIsDeletingGoal(null);
    }
  };

  const openGoalModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  // Dynamic team goals - filter actual goals by goalType === "Team"
  const teamGoals = goals
    .filter((goal) => goal.goalType === "Team")
    .reduce((acc, goal) => {
      const teamName = goal.team || goal.department || "Unassigned Team";
      const existingTeam = acc.find((team) => team.team === teamName);

      if (existingTeam) {
        existingTeam.goals.push(goal);
      } else {
        acc.push({
          id: teamName.toLowerCase().replace(/\s+/g, "-"),
          team: teamName,
          goals: [goal],
        });
      }

      return acc;
    }, []);

  // Helper functions for team goals
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-700 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Performance":
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case "Development":
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
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
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={hrData}
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
            {isLoadingOverview ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-slate-600">
                  Loading overview data...
                </span>
              </div>
            ) : hrOverview ? (
              <>
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
                        {hrOverview.data?.activeEmployees || 0}
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
                        {hrOverview.data?.totalRemoteWorkersToday || 0}
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
                        {hrOverview.data?.noCheckInToday || 0}
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
                        {hrOverview.data?.productivityIndex || "0%"}
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
                        {hrOverview.data?.departmentPerformance &&
                          Object.entries(
                            hrOverview.data.departmentPerformance
                          ).map(([dept, data]) => (
                            <div key={dept}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">
                                  {dept}
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                  {data.checkedIn}/{data.total} ({data.percent})
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    parseFloat(data.percent) >= 90
                                      ? "bg-green-500"
                                      : parseFloat(data.percent) >= 70
                                      ? "bg-blue-500"
                                      : parseFloat(data.percent) >= 50
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                  style={{ width: data.percent }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Incomplete Tasks Card */}
                  <Card className="h-full">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-red-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                          />
                        </svg>
                        Incomplete Tasks
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                          {hrOverview.data?.incompleteTasks || 0}
                        </div>
                        <div className="text-sm text-slate-600 mb-4">
                          Tasks pending completion
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Staff Performance Overview */}
                {staffOverview && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      Staff Performance Overview
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* My Tasks Today */}
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-700">
                            My Tasks Today
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-slate-900">
                            {staffOverview.overview?.myTasksToday || 0}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Completed Tasks */}
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-700">
                            Completed Tasks
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-green-600">
                            {staffOverview.overview?.completedTasks || 0}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Hours Worked */}
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-700">
                            Hours Worked
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-blue-600">
                            {staffOverview.overview?.hoursWorked || 0}h
                          </div>
                        </CardContent>
                      </Card>

                      {/* Performance Score */}
                      <Card className="h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-slate-700">
                            Performance Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-xl font-bold text-purple-600">
                            {staffOverview.overview?.performanceScore || "0%"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No overview data available
                </h3>
                <p className="text-slate-600">
                  Overview data could not be loaded.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab Content */}
          <TabsContent value="performance" className="mt-8">
            {isLoadingTrends ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-slate-600">
                  Loading performance trends...
                </span>
              </div>
            ) : performanceTrends ? (
              <>
                {/* Department Performance Comparison Card */}
                <div className="mb-8">
                  <Card>
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
                      {/* Bar Chart */}
                      <div className="h-80 bg-slate-50 rounded-lg p-6 mb-6">
                        <div className="flex items-end justify-around gap-2 h-full px-4">
                          {performanceTrends?.OverallDepartmentPerformance?.map(
                            (dept) => {
                              // Convert score (0-5) to percentage for visualization
                              const performancePercent =
                                (dept.avgScore / 5) * 100;
                              // Generate realistic variations for other metrics based on performance score
                              const satisfactionPercent = Math.max(
                                60,
                                Math.min(
                                  95,
                                  performancePercent + (Math.random() * 10 - 5)
                                )
                              );
                              const productivityPercent = Math.max(
                                65,
                                Math.min(
                                  98,
                                  performancePercent + (Math.random() * 8 - 4)
                                )
                              );
                              const retentionPercent = Math.max(
                                70,
                                Math.min(
                                  95,
                                  performancePercent + (Math.random() * 6 - 3)
                                )
                              );

                              return (
                                <div
                                  key={dept.department}
                                  className="flex flex-col items-center h-full flex-1 max-w-[80px]"
                                >
                                  <div className="flex items-end gap-1 h-full mb-2">
                                    <div
                                      className="w-6 bg-blue-300 rounded-t transition-all hover:bg-blue-400"
                                      style={{
                                        height: `${satisfactionPercent}%`,
                                      }}
                                      title={`Employee Satisfaction: ${satisfactionPercent.toFixed(
                                        0
                                      )}%`}
                                    ></div>
                                    <div
                                      className="w-6 bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                                      style={{
                                        height: `${performancePercent}%`,
                                      }}
                                      title={`Performance Score: ${performancePercent.toFixed(
                                        0
                                      )}%`}
                                    ></div>
                                    <div
                                      className="w-6 bg-orange-500 rounded-t transition-all hover:bg-orange-600"
                                      style={{
                                        height: `${productivityPercent}%`,
                                      }}
                                      title={`Productivity Index: ${productivityPercent.toFixed(
                                        0
                                      )}%`}
                                    ></div>
                                    <div
                                      className="w-6 bg-green-500 rounded-t transition-all hover:bg-green-600"
                                      style={{ height: `${retentionPercent}%` }}
                                      title={`Retention Rate: ${retentionPercent.toFixed(
                                        0
                                      )}%`}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-slate-500 text-center mt-2 truncate w-full">
                                    {dept.department}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>

                      {/* Chart Legend */}
                      <div className="flex items-center justify-center gap-8 mb-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
                          <span className="text-slate-600">
                            Employee Satisfaction
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <span className="text-slate-600">
                            Performance Score
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <span className="text-slate-600">
                            Productivity Index
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-slate-600">Retention Rate</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Top Performer:</span>
                          <span className="font-semibold text-green-600">
                            {performanceTrends?.TopPerformingDepartment
                              ?.department || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Overall Index:</span>
                          <span className="font-semibold text-blue-600">
                            {performanceTrends?.OverallPerformanceIndex?.toFixed(
                              1
                            ) || "N/A"}
                            /5.0
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-600">Period:</span>
                          <span className="font-semibold text-purple-600">
                            {performanceTrends?.period || "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* First Row - Two Main Performance Cards */}
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
                          {performanceTrends.OverallPerformanceIndex?.toFixed(
                            1
                          ) || "N/A"}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>
                            Current Quarter ({performanceTrends.period})
                          </span>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>+0.2</span>
                          </div>
                        </div>
                      </div>

                      {/* Department Performance Breakdown */}
                      <div className="space-y-4">
                        {performanceTrends.OverallDepartmentPerformance?.map(
                          (dept, index) => (
                            <div key={dept.department}>
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-700">
                                  {dept.department}
                                </span>
                                <span className="text-sm font-semibold text-slate-900">
                                  {dept.avgScore?.toFixed(1)} (
                                  {dept.totalEmployees} employees)
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    dept.avgScore >= 4.5
                                      ? "bg-green-500"
                                      : dept.avgScore >= 4.0
                                      ? "bg-blue-500"
                                      : dept.avgScore >= 3.5
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                  }`}
                                  style={{
                                    width: `${(dept.avgScore / 5) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          )
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
                          {performanceTrends.TopPerformingDepartment
                            ?.department || "0"}
                        </div>
                        <div className="text-xl font-semibold text-slate-900 mb-1">
                          {performanceTrends.TopPerformingDepartment?.avgScore?.toFixed(
                            1
                          ) || "0.0"}
                        </div>
                        <div className="text-sm text-slate-600 mb-3">
                          Average Score
                        </div>
                        <div className="text-sm text-slate-500">
                          {performanceTrends.TopPerformingDepartment
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
                        {performanceTrends.topPerformers?.map(
                          (performer, index) => {
                            const initials = performer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase();
                            return (
                              <div
                                key={performer.employeeId}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {performer.name}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {performer.role} • {performer.department}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    {(performer.score * 20).toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Performance
                                  </div>
                                </div>
                              </div>
                            );
                          }
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
                        {performanceTrends.lowPerformers?.map(
                          (performer, index) => {
                            const initials = performer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase();
                            return (
                              <div
                                key={performer.employeeId}
                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                    {initials}
                                  </div>
                                  <div>
                                    <div className="font-medium text-slate-900">
                                      {performer.name}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {performer.role} • {performer.department}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-orange-600">
                                    {(performer.score * 20).toFixed(0)}%
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Performance
                                  </div>
                                </div>
                              </div>
                            );
                          }
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
              </>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No performance data available
                </h3>
                <p className="text-slate-600">
                  Performance trends data could not be loaded.
                </p>
              </div>
            )}

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

            {/* Third Row - Department Performance Comparison Card moved to top */}
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
                onClick={openGoalModal}
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
                    onClick={openGoalModal}
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
                          {/* Status Tags */}
                          <div className="flex flex-col gap-2 ml-4">
                            <Badge
                              variant="secondary"
                              className={`text-xs px-3 py-1 ${
                                goal.priority === "High"
                                  ? "bg-red-100 text-red-700"
                                  : goal.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
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
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Goal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-slate-500"
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
                            <span className="text-sm text-slate-600">
                              Deadline:{" "}
                              <span className="font-medium text-slate-900">
                                {goal.deadline === "Ongoing"
                                  ? "Ongoing"
                                  : new Date(
                                      goal.deadline
                                    ).toLocaleDateString()}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg
                              className="w-4 h-4 text-slate-500"
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
                            <span className="text-sm text-slate-600">
                              Owner:{" "}
                              <span className="font-medium text-slate-900">
                                {goal.owner}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-start gap-2 col-span-3">
                            <Target className="w-4 h-4 text-slate-500 mt-1" />
                            <div className="flex flex-col flex-1">
                              <span className="text-sm font-medium text-slate-700 mb-2">
                                Key Metrics
                              </span>
                              {goal.keyMetrics && goal.keyMetrics.length > 0 ? (
                                <div className="space-y-2">
                                  {goal.keyMetrics.map((metric, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-slate-50 p-2 rounded border border-slate-200"
                                    >
                                      <div className="text-xs font-medium text-slate-700">
                                        {metric.metric}
                                      </div>
                                      <div className="text-xs text-slate-600 mt-1">
                                        Target: {metric.target}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-500 italic">
                                  No metrics defined
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => handleEditGoal(goal)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            disabled={isDeletingGoal === goal.id}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            {isDeletingGoal === goal.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                            Delete
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>

            {/* Team Goals Section */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Team Goals
                </h2>
              </div>

              {/* Team Goals Data */}
              {teamGoals.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No team goals found
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Create team goals to track team-specific objectives and
                    performance.
                  </p>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={openGoalModal}
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
                    Create Team Goal
                  </Button>
                </div>
              ) : (
                teamGoals.map((teamData) => (
                  <div
                    key={teamData.id}
                    className="bg-white rounded-[12px] border border-gray-200 shadow-sm mb-6"
                  >
                    {/* Team Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-[12px] border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        {getTeamIcon(teamData.team)}
                        <h3 className="text-[16px] font-bold text-[#000000]">
                          {teamData.team}
                        </h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs font-medium text-gray-600">
                          {teamData.goals.length} Goals
                        </span>
                      </div>
                    </div>

                    {/* Team Goals */}
                    <div className="p-6 space-y-4">
                      {teamData.goals.map((goal, index) => (
                        <div
                          key={goal.id}
                          className={`pb-4 ${
                            index < teamData.goals.length - 1
                              ? "border-b border-gray-100"
                              : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="mt-1">
                                {getTypeIcon(goal.type)}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-[14px] font-bold text-[#000000] mb-1">
                                  {goal.title}
                                </h4>
                                <p className="text-[12px] text-[#000000] leading-normal mb-2">
                                  {goal.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPriorityColor(
                                  goal.priority
                                )}`}
                              >
                                {goal.priority}
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700">
                                Progress
                              </span>
                              <span className="text-xs font-bold text-gray-900">
                                {goal.progress}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  goal.progress >= 80
                                    ? "bg-green-500"
                                    : goal.progress >= 60
                                    ? "bg-blue-500"
                                    : goal.progress >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${goal.progress}%` }}
                              />
                            </div>
                          </div>

                          {/* Goal Details */}
                          <div className="grid grid-cols-3 gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-gray-500"
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
                              <div>
                                <p className="text-gray-500">Assignee</p>
                                <p className="font-medium text-gray-900">
                                  {goal.assignee}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3 h-3 text-gray-500"
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
                              <div>
                                <p className="text-gray-500">Deadline</p>
                                <p className="font-medium text-gray-900">
                                  {goal.deadline}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="w-3 h-3 text-gray-500" />
                              <div>
                                <p className="text-gray-500">Key Metrics</p>
                                <div className="flex flex-col gap-1">
                                  <p className="font-medium text-gray-900 text-xs">
                                    <span className="text-gray-500">
                                      Current:
                                    </span>{" "}
                                    {goal.currentMetric}
                                  </p>
                                  <p className="font-medium text-gray-900 text-xs">
                                    <span className="text-gray-500">
                                      Target:
                                    </span>{" "}
                                    {goal.targetMetric}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 mt-3">
                            <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer">
                              <svg
                                className="w-3 h-3"
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
                              Edit
                            </button>
                            <button className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Goal Button */}
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        onClick={openGoalModal}
                      >
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
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add New Goal for {teamData.team}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateGoal}
        initialData={editingGoal}
        isEditing={!!editingGoal}
      />

      {/* Top Performers Modal */}
      <Dialog
        open={showTopPerformersModal}
        onOpenChange={setShowTopPerformersModal}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <svg
                className="w-6 h-6"
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
            </DialogTitle>
            <DialogDescription>
              View all top-performing employees based on current quarter
              performance
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {performanceTrends?.topPerformers &&
            performanceTrends.topPerformers.length > 0 ? (
              <div className="space-y-4">
                {performanceTrends.topPerformers.map((performer, index) => {
                  const initials = performer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  const percentScore = (performer.score * 20).toFixed(0);

                  return (
                    <div
                      key={performer.employeeId}
                      className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {initials}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">
                            {performer.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {performer.role}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {performer.department}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>ID: {performer.employeeId.slice(-6)}</span>
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
                          <span>Score: {performer.score.toFixed(1)}/5.0</span>
                        </div>
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
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-orange-600 flex items-center gap-2">
              <svg
                className="w-6 h-6"
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
              Low Performers - Needs Attention
            </DialogTitle>
            <DialogDescription>
              Employees requiring performance improvement support
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6">
            {performanceTrends?.lowPerformers &&
            performanceTrends.lowPerformers.length > 0 ? (
              <div className="space-y-4">
                {performanceTrends.lowPerformers.map((performer, index) => {
                  const initials = performer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase();
                  const percentScore = (performer.score * 20).toFixed(0);

                  return (
                    <div
                      key={performer.employeeId}
                      className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              #{index + 1}
                            </span>
                          </div>
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {initials}
                          </div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-lg">
                            {performer.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            {performer.role}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              {performer.department}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span>ID: {performer.employeeId.slice(-6)}</span>
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
                          <span>Score: {performer.score.toFixed(1)}/5.0</span>
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
