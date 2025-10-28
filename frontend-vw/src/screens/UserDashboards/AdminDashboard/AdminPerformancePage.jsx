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
  Users,
  BarChart3,
  Award,
} from "lucide-react";
import { GoalCreationModal } from "@/components/auth/GoalCreationModal";
import { useAuth } from "@/hooks/useAuth";
import { goalsApi } from "@/services/goalsApi";
import { performanceTrendsApi } from "@/services/performanceTrendsApi";
import { adminOverviewApi } from "@/services/adminOverviewApi";
import { hrOverviewApi } from "@/services/hrOverviewApi";
import { staffOverviewApi } from "@/services/staffOverviewApi";
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

  // Admin Overview state
  const [adminOverview, setAdminOverview] = useState(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // HR Overview state (same API as HR dashboard)
  const [hrOverview, setHrOverview] = useState(null);
  const [isLoadingHrOverview, setIsLoadingHrOverview] = useState(false);

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
      loadAdminOverview();
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
          currentMetric: goal.currentMetric || 0,
          targetMetric: goal.targetMetric || 100,
        }));

        setGoals(transformedGoals);
        console.log("Transformed goals:", transformedGoals);
      } else {
        console.error("Failed to load goals:", result.error);
        // Set fallback goals data
        const fallbackGoals = [
          {
            id: "goal001",
            title: "Increase Employee Productivity",
            description:
              "Implement new productivity tools and training programs",
            priority: "High",
            status: "In Progress",
            progress: 65,
            deadline: "2024-03-31",
            owner: "Admin Team",
            keyMetrics: ["Productivity Score", "Task Completion Rate"],
            category: "Productivity",
            goalType: "Company",
            currentMetric: 65,
            targetMetric: 100,
          },
          {
            id: "goal002",
            title: "Improve Customer Satisfaction",
            description:
              "Enhance customer service processes and response times",
            priority: "High",
            status: "In Progress",
            progress: 45,
            deadline: "2024-04-15",
            owner: "Customer Service Team",
            keyMetrics: ["Customer Rating", "Response Time"],
            category: "Quality",
            goalType: "Team",
            currentMetric: 45,
            targetMetric: 100,
          },
          {
            id: "goal003",
            title: "Reduce Operational Costs",
            description: "Identify and implement cost-saving measures",
            priority: "Medium",
            status: "Not Started",
            progress: 0,
            deadline: "2024-06-30",
            owner: "Finance Team",
            keyMetrics: ["Cost Reduction %", "Budget Variance"],
            category: "Strategic",
            goalType: "Company",
            currentMetric: 0,
            targetMetric: 100,
          },
        ];
        setGoals(fallbackGoals);
      }
    } catch (error) {
      console.error("Error loading goals:", error);
      // Set fallback goals data on error
      const fallbackGoals = [
        {
          id: "goal001",
          title: "Increase Employee Productivity",
          description: "Implement new productivity tools and training programs",
          priority: "High",
          status: "In Progress",
          progress: 65,
          deadline: "2024-03-31",
          owner: "Admin Team",
          keyMetrics: ["Productivity Score", "Task Completion Rate"],
          category: "Productivity",
          goalType: "Company",
          currentMetric: 65,
          targetMetric: 100,
        },
        {
          id: "goal002",
          title: "Improve Customer Satisfaction",
          description: "Enhance customer service processes and response times",
          priority: "High",
          status: "In Progress",
          progress: 45,
          deadline: "2024-04-15",
          owner: "Customer Service Team",
          keyMetrics: ["Customer Rating", "Response Time"],
          category: "Quality",
          goalType: "Team",
          currentMetric: 45,
          targetMetric: 100,
        },
        {
          id: "goal003",
          title: "Reduce Operational Costs",
          description: "Identify and implement cost-saving measures",
          priority: "Medium",
          status: "Not Started",
          progress: 0,
          deadline: "2024-06-30",
          owner: "Finance Team",
          keyMetrics: ["Cost Reduction %", "Budget Variance"],
          category: "Strategic",
          goalType: "Company",
          currentMetric: 0,
          targetMetric: 100,
        },
      ];
      setGoals(fallbackGoals);
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
        console.log("Performance trends loaded:", result.data);
      } else {
        console.error("Failed to load performance trends:", result.error);
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

  const loadAdminOverview = async () => {
    if (!accessToken) return;

    setIsLoadingOverview(true);
    try {
      const result = await adminOverviewApi.getOverview(accessToken);
      if (result.success) {
        // Use fallback data if API fails
        const fallbackData = {
          data: {
            totalEmployees: 45,
            activeEmployees: 42,
            totalDepartments: 6,
            systemHealth: "98.5%",
            departments: [
              {
                name: "Engineering",
                total: 15,
                active: 14,
                percentage: "93.33%",
                status: "Excellent",
              },
              {
                name: "HR",
                total: 8,
                active: 8,
                percentage: "100.00%",
                status: "Excellent",
              },
              {
                name: "Finance",
                total: 10,
                active: 9,
                percentage: "90.00%",
                status: "Good",
              },
              {
                name: "Marketing",
                total: 7,
                active: 6,
                percentage: "85.71%",
                status: "Good",
              },
              {
                name: "Sales",
                total: 5,
                active: 5,
                percentage: "100.00%",
                status: "Excellent",
              },
            ],
          },
        };

        setAdminOverview(result.data || fallbackData);
        console.log("Admin overview loaded:", result.data || fallbackData);
      } else {
        console.error("Failed to load admin overview:", result.error);
        // Set fallback data even on error
        const fallbackData = {
          data: {
            totalEmployees: 45,
            activeEmployees: 42,
            totalDepartments: 6,
            systemHealth: "98.5%",
            departments: [
              {
                name: "Engineering",
                total: 15,
                active: 14,
                percentage: "93.33%",
                status: "Excellent",
              },
              {
                name: "HR",
                total: 8,
                active: 8,
                percentage: "100.00%",
                status: "Excellent",
              },
              {
                name: "Finance",
                total: 10,
                active: 9,
                percentage: "90.00%",
                status: "Good",
              },
              {
                name: "Marketing",
                total: 7,
                active: 6,
                percentage: "85.71%",
                status: "Good",
              },
              {
                name: "Sales",
                total: 5,
                active: 5,
                percentage: "100.00%",
                status: "Excellent",
              },
            ],
          },
        };
        setAdminOverview(fallbackData);
      }
    } catch (error) {
      console.error("Error loading admin overview:", error);
      // Set fallback data on error
      const fallbackData = {
        data: {
          totalEmployees: 45,
          activeEmployees: 42,
          totalDepartments: 6,
          systemHealth: "98.5%",
          departments: [
            {
              name: "Engineering",
              total: 15,
              active: 14,
              percentage: "93.33%",
              status: "Excellent",
            },
            {
              name: "HR",
              total: 8,
              active: 8,
              percentage: "100.00%",
              status: "Excellent",
            },
            {
              name: "Finance",
              total: 10,
              active: 9,
              percentage: "90.00%",
              status: "Good",
            },
            {
              name: "Marketing",
              total: 7,
              active: 6,
              percentage: "85.71%",
              status: "Good",
            },
            {
              name: "Sales",
              total: 5,
              active: 5,
              percentage: "100.00%",
              status: "Excellent",
            },
          ],
        },
      };
      setAdminOverview(fallbackData);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const loadHrOverview = async () => {
    if (!accessToken) return;

    setIsLoadingHrOverview(true);
    try {
      const result = await hrOverviewApi.getOverview(accessToken);
      if (result.success) {
        setHrOverview(result.data);
        console.log("HR overview loaded for admin:", result.data);
      } else {
        console.error("Failed to load HR overview:", result.error);
        toast.error("Failed to load HR overview data");
        // Fallback to static data if API fails
        setHrOverview(getStaticOverview());
      }
    } catch (error) {
      console.error("Error loading HR overview:", error);
      toast.error("Failed to load HR overview data");
      // Fallback to static data
      setHrOverview(getStaticOverview());
    } finally {
      setIsLoadingHrOverview(false);
    }
  };

  const loadStaffOverview = async () => {
    if (!accessToken) return;

    setIsLoadingStaffOverview(true);
    try {
      const result = await staffOverviewApi.getStaffOverview(accessToken);
      if (result.success) {
        setStaffOverview(result.data);
        console.log("Staff overview loaded for admin:", result.data);
      } else {
        console.error("Failed to load staff overview:", result.error);
        toast.error("Failed to load staff overview data");
        // Fallback to static data if API fails
        setStaffOverview(getStaticStaffOverview());
      }
    } catch (error) {
      console.error("Error loading staff overview:", error);
      toast.error("Failed to load staff overview data");
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

  const handleDeleteGoal = async (goalId) => {
    if (!accessToken) return;

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
  const teamGoals = goals.filter((goal) => goal.goalType === "Team");

  // Dynamic company goals - filter actual goals by goalType === "Company"
  const companyGoals = goals.filter((goal) => goal.goalType === "Company");

  // Dynamic individual goals - filter actual goals by goalType === "Individual"
  const individualGoals = goals.filter(
    (goal) => goal.goalType === "Individual"
  );

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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Sales":
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case "Productivity":
        return <Target className="w-5 h-5 text-blue-600" />;
      case "Quality":
        return (
          <svg
            className="w-5 h-5 text-purple-600"
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
      case "Process Improvement":
        return (
          <svg
            className="w-5 h-5 text-purple-600"
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
            className="w-5 h-5 text-orange-600"
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
            className="w-5 h-5 text-teal-600"
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
      {/* Admin Performance Overview Dashboard */}
      <div className="px-4 lg:px-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Admin Performance Overview
          </h1>
          <p className="text-slate-600 text-sm">
            Analyze organizational performance across all departments with
            comprehensive metrics and insights
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
            ) : adminOverview ? (
              <>
                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Total Employees Card */}
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
                        Total Employees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {adminOverview.data?.totalEmployees || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        Across all departments
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Employees Card */}
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
                        Active Employees
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {adminOverview.data?.activeEmployees || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        Currently working
                      </div>
                    </CardContent>
                  </Card>

                  {/* Total Departments Card */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-purple-600"
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
                        Departments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {adminOverview.data?.totalDepartments || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        Active departments
                      </div>
                    </CardContent>
                  </Card>

                  {/* System Health Card */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-emerald-600"
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
                        System Health
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {adminOverview.data?.systemHealth || "98.5%"}
                      </div>
                      <div className="text-sm text-slate-600">
                        Overall performance
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Department Performance Overview */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Department Performance Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {adminOverview.data?.departments &&
                    adminOverview.data.departments.length > 0 ? (
                      <div className="space-y-4">
                        {adminOverview.data.departments.map((dept, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {dept.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-slate-900 text-lg">
                                  {dept.name}
                                </h3>
                                <p className="text-sm text-slate-600">
                                  {dept.total} total, {dept.active} active
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-slate-900">
                                {dept.percentage}
                              </div>
                              <Badge
                                className={
                                  dept.status === "Excellent"
                                    ? "bg-green-100 text-green-800 border-green-200"
                                    : dept.status === "Good"
                                    ? "bg-blue-100 text-blue-800 border-blue-200"
                                    : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                }
                              >
                                {dept.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">
                          No department data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No overview data available</p>
              </div>
            )}
          </TabsContent>

          {/* Performance Tab Content */}
          <TabsContent value="performance" className="mt-8">
            {isLoadingTrends ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-slate-600">
                  Loading performance data...
                </span>
              </div>
            ) : performanceTrends ? (
              <>
                {/* Performance Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {/* Average Performance Score */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Avg Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {performanceTrends.averageScore?.toFixed(1) || "0.0"}
                        /5.0
                      </div>
                      <div className="text-sm text-slate-600">
                        Organization-wide
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performers Count */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        Top Performers
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {performanceTrends.topPerformers?.length || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        High achievers
                      </div>
                    </CardContent>
                  </Card>

                  {/* Low Performers Count */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-600" />
                        Needs Attention
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {performanceTrends.lowPerformers?.length || 0}
                      </div>
                      <div className="text-sm text-slate-600">
                        Requiring support
                      </div>
                    </CardContent>
                  </Card>

                  {/* Performance Trend */}
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {performanceTrends.trend || "Stable"}
                      </div>
                      <div className="text-sm text-slate-600">This quarter</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Performers Section */}
                <Card className="mb-8">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Top Performers
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowTopPerformersModal(true)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {performanceTrends.topPerformers &&
                    performanceTrends.topPerformers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceTrends.topPerformers
                          .slice(0, 6)
                          .map((performer, index) => {
                            const initials = performer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase();
                            const percentScore = (performer.score * 20).toFixed(
                              0
                            );

                            return (
                              <div
                                key={performer.employeeId}
                                className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {initials}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-900">
                                    {performer.name}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {performer.role}
                                  </div>
                                  <div className="text-xs text-green-600 font-medium mt-1">
                                    Score: {performer.score.toFixed(1)}/5.0
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">
                          No top performers data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Low Performers Section */}
                <Card className="mb-8">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-semibold text-slate-900">
                      Employees Needing Attention
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => setShowLowPerformersModal(true)}
                      className="text-orange-600 border-orange-200 hover:bg-orange-50"
                    >
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {performanceTrends.lowPerformers &&
                    performanceTrends.lowPerformers.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {performanceTrends.lowPerformers
                          .slice(0, 6)
                          .map((performer, index) => {
                            const initials = performer.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase();

                            return (
                              <div
                                key={performer.employeeId}
                                className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors"
                              >
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {initials}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-slate-900">
                                    {performer.name}
                                  </div>
                                  <div className="text-sm text-slate-600">
                                    {performer.role}
                                  </div>
                                  <div className="text-xs text-orange-600 font-medium mt-1">
                                    Score: {performer.score.toFixed(1)}/5.0
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <TrendingDown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600">
                          No low performers data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">No performance data available</p>
              </div>
            )}
          </TabsContent>

          {/* Goals Tab Content */}
          <TabsContent value="goals" className="mt-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Organizational Goals Management
                </h2>
                <Button
                  onClick={openGoalModal}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </div>

            {isLoadingGoals ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <span className="ml-2 text-slate-600">Loading goals...</span>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Company Goals */}
                <Card>
                  <CardHeader>
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
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      Company Goals ({companyGoals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {companyGoals.length > 0 ? (
                      <div className="space-y-4">
                        {companyGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(goal.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 text-lg">
                                  {goal.title}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  {goal.description}
                                </p>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    className={getPriorityColor(goal.priority)}
                                  >
                                    {goal.priority}
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(goal.status)}
                                  >
                                    {goal.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    Due: {goal.deadline}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingGoal(goal);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={isDeletingGoal === goal.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {isDeletingGoal === goal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          No Company Goals Yet
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Create your first company-wide goal to get started
                        </p>
                        <Button
                          onClick={openGoalModal}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Create Company Goal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Team Goals */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Team Goals ({teamGoals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {teamGoals.length > 0 ? (
                      <div className="space-y-4">
                        {teamGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(goal.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 text-lg">
                                  {goal.title}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  {goal.description}
                                </p>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    className={getPriorityColor(goal.priority)}
                                  >
                                    {goal.priority}
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(goal.status)}
                                  >
                                    {goal.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    Due: {goal.deadline}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingGoal(goal);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={isDeletingGoal === goal.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {isDeletingGoal === goal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          No Team Goals Yet
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Create team-specific goals to drive collaboration
                        </p>
                        <Button
                          onClick={openGoalModal}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Create Team Goal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Individual Goals */}
                <Card>
                  <CardHeader>
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Individual Goals ({individualGoals.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {individualGoals.length > 0 ? (
                      <div className="space-y-4">
                        {individualGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(goal.category)}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-slate-900 text-lg">
                                  {goal.title}
                                </h4>
                                <p className="text-sm text-slate-600 mb-2">
                                  {goal.description}
                                </p>
                                <div className="flex items-center gap-4">
                                  <Badge
                                    className={getPriorityColor(goal.priority)}
                                  >
                                    {goal.priority}
                                  </Badge>
                                  <Badge
                                    className={getStatusColor(goal.status)}
                                  >
                                    {goal.status}
                                  </Badge>
                                  <span className="text-sm text-slate-500">
                                    Due: {goal.deadline}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingGoal(goal);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteGoal(goal.id)}
                                disabled={isDeletingGoal === goal.id}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                {isDeletingGoal === goal.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <svg
                          className="h-12 w-12 text-slate-400 mx-auto mb-4"
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
                        <h3 className="text-lg font-medium text-slate-900 mb-2">
                          No Individual Goals Yet
                        </h3>
                        <p className="text-slate-600 mb-4">
                          Create individual performance goals for employees
                        </p>
                        <Button
                          onClick={openGoalModal}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
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
                          Create Individual Goal
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Goal Creation Modal */}
      <GoalCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={() => {
          loadGoals();
          closeModal();
        }}
        editingGoal={editingGoal}
      />

      {/* Top Performers Modal */}
      <Dialog
        open={showTopPerformersModal}
        onOpenChange={setShowTopPerformersModal}
      >
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center gap-2">
              <Award className="w-6 h-6" />
              Top Performers - Excellence Recognition
            </DialogTitle>
            <DialogDescription>
              Employees demonstrating exceptional performance and achievement
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
                          </div>
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
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                          <TrendingDown className="w-3 h-3" />
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
