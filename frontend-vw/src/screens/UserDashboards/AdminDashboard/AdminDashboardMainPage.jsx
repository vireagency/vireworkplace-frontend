import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "@/config/apiConfig";
import { toast } from "sonner";
import { adminOverviewApi } from "@/services/adminOverviewApi";
import { hrOverviewApi } from "@/services/hrOverviewApi";
import { performanceTrendsApi } from "@/services/performanceTrendsApi";
import { attendanceApi } from "@/services/attendanceApi";
import AttendanceManager from "@/components/attendance/AttendanceManager";
import AttendanceStats from "@/components/attendance/AttendanceStats";
import AttendanceTest from "@/components/attendance/AttendanceTest";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
}

// StatusBadge component with fallback logic
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      dotColor: "bg-green-500",
      text: "Active",
    },
    "In-active": {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
      text: "In-active",
    },
    Closed: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      dotColor: "bg-red-500",
      text: "Closed",
    },
  };

  const config = statusConfig[status] || statusConfig["In-active"];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default function AdminDashboardMainPage() {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  // Get user's first name, fallback to "User" if not available
  const userName = user?.firstName || "User";

  // API configuration
  const API_URL = getApiUrl();

  // State for employee data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for admin overview data
  const [overviewData, setOverviewData] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState(null);

  // State for HR overview data (same APIs as HR dashboard)
  const [hrOverviewData, setHrOverviewData] = useState(null);
  const [loadingHrOverview, setLoadingHrOverview] = useState(true);
  const [hrOverviewError, setHrOverviewError] = useState(null);

  // State for performance trends data
  const [performanceTrends, setPerformanceTrends] = useState(null);
  const [loadingPerformanceTrends, setLoadingPerformanceTrends] =
    useState(true);
  const [performanceTrendsError, setPerformanceTrendsError] = useState(null);

  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  // State for real-time tracker data
  const [realtimeData, setRealtimeData] = useState(null);
  const [loadingRealtime, setLoadingRealtime] = useState(false);
  const [realtimeError, setRealtimeError] = useState(null);

  // State for attendance data
  const [attendanceData, setAttendanceData] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

        // Check authentication
        if (!accessToken) {
          console.log("❌ Admin Dashboard - No access token available");
          throw new Error("No access token available. Please log in again.");
        }

        console.log(
          "🚀 Admin Dashboard - Making API call to:",
          `${API_URL}/employees/list`
        );
        console.log("🚀 Admin Dashboard - User:", user);
        console.log("🚀 Admin Dashboard - User role:", user?.role);

        const response = await axios.get(`${API_URL}/employees/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          // Transform API data to match our component structure
          const transformedEmployees = response.data.data.map((emp) => ({
            id: emp._id,
            name: `${emp.firstName} ${emp.lastName}`,
            email: emp.email,
            role: emp.jobRole,
            department: emp.department,
            status: emp.attendanceStatus || "In-active", // Fallback to "In-active" if status is undefined/null
            location: emp.locationToday,
            checkIn: emp.checkInTime,
            avatar: emp.avatar || null,
          }));

          setEmployees(transformedEmployees);
          console.log("✅ Admin Dashboard - API Response:", response.data);
          console.log(
            "✅ Admin Dashboard - Transformed Employees:",
            transformedEmployees
          );
          console.log(
            "✅ Admin Dashboard - Employee statuses:",
            transformedEmployees.map((emp) => ({
              name: emp.name,
              status: emp.status,
              location: emp.location,
              checkIn: emp.checkIn,
            }))
          );
        } else {
          console.error(
            "❌ Admin Dashboard - Failed to fetch employees:",
            response.data
          );
          setError("Failed to fetch employees");
        }
      } catch (err) {
        console.error("❌ Admin Dashboard - Error fetching employees:", err);
        console.error(
          "❌ Admin Dashboard - Error response:",
          err.response?.data
        );
        console.error(
          "❌ Admin Dashboard - Error status:",
          err.response?.status
        );
        setError(`Error fetching employees: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [accessToken, API_URL, user]);

  // Fetch HR overview data (same API as HR dashboard)
  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken) return;

      try {
        setLoadingHrOverview(true);
        console.log("🚀 Admin Dashboard - Fetching HR overview data...");

        const result = await hrOverviewApi.getOverview(accessToken);

        if (result.success) {
          setHrOverviewData(result.data);
          console.log(
            "✅ Admin Dashboard - HR overview data loaded:",
            result.data
          );
        } else {
          console.error(
            "❌ Admin Dashboard - Failed to fetch HR overview:",
            result.error
          );
          setHrOverviewError(result.error || "Failed to load overview data");
          toast.error(result.error || "Failed to load overview data");
          // Fallback to static data (same as HR dashboard)
          setHrOverviewData(getStaticOverviewData());
        }
      } catch (error) {
        console.error(
          "❌ Admin Dashboard - Error fetching HR overview:",
          error
        );
        setHrOverviewError("Failed to load overview data");
        toast.error("Failed to load overview data");
        // Fallback to static data (same as HR dashboard)
        setHrOverviewData(getStaticOverviewData());
      } finally {
        setLoadingHrOverview(false);
      }
    };

    fetchOverview();
  }, [accessToken]);

  // Static overview data as fallback (same as HR dashboard)
  const getStaticOverviewData = () => ({
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

  // Fetch admin overview data
  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken) return;

      try {
        setLoadingOverview(true);
        console.log("Fetching admin overview data...");

        const result = await adminOverviewApi.getOverview(accessToken);

        if (result.success) {
          setOverviewData(result.data);
          console.log("✅ Admin overview data loaded:", result.data);
          console.log(
            "✅ Admin overview data structure:",
            JSON.stringify(result.data, null, 2)
          );
        } else {
          console.error("Failed to fetch admin overview:", result.error);
          setOverviewError(result.error);
          toast.error("Failed to load overview data");
          // Fallback to static data
          setOverviewData(getStaticOverviewData());
        }
      } catch (error) {
        console.error("Error fetching admin overview:", error);
        setOverviewError("Failed to load overview data");
        toast.error("Failed to load overview data");
        // Fallback to static data
        setOverviewData(getStaticOverviewData());
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverview();
  }, [accessToken]);

  // Fetch HR overview data (same API as HR dashboard)
  useEffect(() => {
    const fetchHrOverview = async () => {
      if (!accessToken) return;

      try {
        setLoadingHrOverview(true);
        console.log("Fetching HR overview data for admin...");

        const result = await hrOverviewApi.getOverview(accessToken);

        if (result.success) {
          setHrOverviewData(result.data);
          console.log("✅ HR overview data loaded for admin:", result.data);
          console.log(
            "✅ HR overview data structure:",
            JSON.stringify(result.data, null, 2)
          );
        } else {
          console.error("❌ Failed to fetch HR overview:", result.error);
          console.error("❌ HR API Response:", result);
          setHrOverviewError(result.error);
          toast.error("Failed to load HR overview data");
        }
      } catch (error) {
        console.error("❌ Error fetching HR overview:", error);
        console.error("❌ Error details:", error.response?.data);
        console.error("❌ Error status:", error.response?.status);
        setHrOverviewError(error.message);
        toast.error("Failed to load HR overview data");
      } finally {
        setLoadingHrOverview(false);
      }
    };

    fetchHrOverview();
  }, [accessToken]);

  // Fetch performance trends data (same API as HR dashboard)
  useEffect(() => {
    const fetchPerformanceTrends = async () => {
      if (!accessToken) return;

      try {
        setLoadingPerformanceTrends(true);
        console.log("Fetching performance trends for admin...");

        const result = await performanceTrendsApi.getPerformanceTrends(
          accessToken
        );

        if (result.success) {
          setPerformanceTrends(result.data);
          console.log("Performance trends loaded for admin:", result.data);
        } else {
          console.error("Failed to fetch performance trends:", result.error);
          setPerformanceTrendsError(result.error);
          toast.error("Failed to load performance trends");
        }
      } catch (error) {
        console.error("Error fetching performance trends:", error);
        setPerformanceTrendsError(error.message);
        toast.error("Failed to load performance trends");
      } finally {
        setLoadingPerformanceTrends(false);
      }
    };

    fetchPerformanceTrends();
  }, [accessToken]);

  // Fetch analytics data
  const fetchAnalytics = async (timeRange = "12months") => {
    if (!accessToken) return;

    try {
      setLoadingAnalytics(true);
      console.log("Fetching analytics data...", timeRange);

      const result = await adminOverviewApi.getAnalytics(
        accessToken,
        timeRange
      );

      if (result.success) {
        setAnalyticsData(result.data);
        console.log("Analytics data loaded:", result.data);
      } else {
        console.error("Failed to fetch analytics:", result.error);
        setAnalyticsError(result.error);
        toast.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsError("Failed to load analytics data");
      toast.error("Failed to load analytics data");
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Fetch real-time tracker data
  const fetchRealtimeData = async (timeRange = "7days") => {
    if (!accessToken) return;

    try {
      setLoadingRealtime(true);
      console.log("Fetching real-time data...", timeRange);

      const result = await adminOverviewApi.getRealtimeData(
        accessToken,
        timeRange
      );

      if (result.success) {
        setRealtimeData(result.data);
        console.log("Real-time data loaded:", result.data);
      } else {
        console.error("Failed to fetch real-time data:", result.error);
        setRealtimeError(result.error);
        toast.error("Failed to load real-time data");
      }
    } catch (error) {
      console.error("Error fetching real-time data:", error);
      setRealtimeError("Failed to load real-time data");
      toast.error("Failed to load real-time data");
    } finally {
      setLoadingRealtime(false);
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!accessToken) return;

    try {
      setLoadingAttendance(true);
      console.log("Fetching attendance data...");

      const result = await attendanceApi.getOverview(accessToken);

      if (result.success) {
        setAttendanceData(result.data);
        console.log("Attendance data loaded:", result.data);
      } else {
        console.error("Failed to fetch attendance data:", result.error);
        setAttendanceError(result.error);
        toast.error("Failed to load attendance data");
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceError("Failed to load attendance data");
      toast.error("Failed to load attendance data");
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Fetch all dashboard data on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAnalytics("12months");
      fetchRealtimeData("7days");
      fetchAttendanceData();
    }
  }, [accessToken]);

  // Function to handle navigation to Employees page
  const handleSeeAllEmployees = () => {
    navigate("/admin/employees");
  };

  // Handle time range changes for analytics
  const handleAnalyticsTimeRangeChange = (timeRange) => {
    fetchAnalytics(timeRange);
  };

  // Handle time range changes for real-time tracker
  const handleRealtimeTimeRangeChange = (timeRange) => {
    fetchRealtimeData(timeRange);
  };

  return (
    <AdminDashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Welcome Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-normal text-gray-900 mb-1">
              <span className="font-medium">
                {greeting}, {userName}
              </span>
              <span className="text-base font-light">
                {" "}
                – here's what's happening in Vire Agency today
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-green-600 px-3 py-1.5 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Section Cards */}
      <div className="px-4 lg:px-6">
        {loadingHrOverview ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-slate-600">
              Loading dashboard data...
            </span>
          </div>
        ) : hrOverviewData ? (
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            {/* Debug info */}
            {console.log(
              "🔍 Admin Dashboard - Rendering with HR overview data:",
              hrOverviewData
            )}
            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Active Employees</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {hrOverviewData.data?.activeEmployees || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  <IconTrendingUp className="text-green-600" />
                  +36%
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Total Remote Workers Today</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {hrOverviewData.data?.totalRemoteWorkersToday || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="text-red-600 bg-red-50">
                  <IconTrendingDown className="text-red-600" />
                  -14%
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>No Check-In Today</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {hrOverviewData.data?.noCheckInToday || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-orange-600 bg-orange-50"
                >
                  <IconTrendingDown className="text-orange-600" />
                  {overviewData?.data?.noCheckInToday > 0
                    ? "Needs Attention"
                    : "All Checked In"}
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Productivity Index</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {hrOverviewData.data?.productivityIndex || "0%"}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  <IconTrendingUp className="text-green-600" />
                  +5%
                </Badge>
              </div>
            </Card>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <svg
                className="w-12 h-12 mx-auto"
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
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No dashboard data available
            </h3>
            <p className="text-slate-600">
              Dashboard overview data could not be loaded.
            </p>
          </div>
        )}
      </div>

      {/* AI Work Log Analyzer and Real-Time Tracker Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Work Log Analyzer - Takes up 2/3 of the space */}
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            {/* Header Section with Time Range Selector and Export Button on same line */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  AI Work Log Analyzer
                </h3>
                <p className="text-sm text-gray-500">
                  Monthly Attendance & Productivity
                </p>
              </div>

              <div className="flex items-center space-x-24">
                <div className="flex space-x-1">
                  <button
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg"
                    onClick={() => handleAnalyticsTimeRangeChange("12months")}
                  >
                    12 Months
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => handleAnalyticsTimeRangeChange("6months")}
                  >
                    6 Months
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => handleAnalyticsTimeRangeChange("30days")}
                  >
                    30 Days
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    onClick={() => handleAnalyticsTimeRangeChange("7days")}
                  >
                    7 Days
                  </button>
                </div>
                <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Export PDF
                </button>
              </div>
            </div>

            {/* Chart Area */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 h-80">
              {/* Chart Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Attendance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-gray-600">Productivity</span>
                  </div>
                </div>
              </div>

              {/* Chart Content */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <svg
                    className="w-16 h-16 mx-auto mb-3 text-gray-300"
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
                  <p className="text-sm">
                    Chart visualization will be implemented here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Line chart with monthly data from Feb to Jan
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Tracker - Takes up 1/3 of the space */}
          <div className="lg:col-span-1 bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Real-Time Tracker
              </h3>
              <select
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white"
                onChange={(e) => handleRealtimeTimeRangeChange(e.target.value)}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
              </select>
            </div>

            {/* Metrics */}
            {loadingRealtime ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-slate-600">
                  Loading real-time data...
                </span>
              </div>
            ) : realtimeData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Active Employees
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {hrOverviewData.data?.activeEmployees || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          realtimeData?.data?.activeEmployeesPercent ||
                          realtimeData?.activeEmployeesPercent ||
                          "85%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Inactive for 60+mins
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.max(
                        0,
                        (hrOverviewData.data?.activeEmployees || 0) -
                          (hrOverviewData.data?.totalRemoteWorkersToday || 0)
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          realtimeData?.data?.inactive60PlusPercent ||
                          realtimeData?.inactive60PlusPercent ||
                          "65%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      No Check-In
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {hrOverviewData.data?.noCheckInToday || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          realtimeData?.data?.noCheckInPercent ||
                          realtimeData?.noCheckInPercent ||
                          "45%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Incomplete Tasks
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {hrOverviewData.data?.incompleteTasks || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          realtimeData?.data?.incompleteTasksPercent ||
                          realtimeData?.incompleteTasksPercent ||
                          "25%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">
                  <svg
                    className="w-8 h-8 mx-auto"
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
                </div>
                <p className="text-sm text-slate-600">
                  No real-time data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Employee Overview Table Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="bg-white rounded-lg border p-6">
          {/* Table Header */}
          <div className="mb-6">
            <div className="mb-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Employee Overview
              </h3>
              <div className="flex items-center gap-64">
                <p className="text-sm text-gray-500">
                  Monitor employee status, attendance, and task completion in
                  real-time
                </p>
                <div className="text-center">
                  <button
                    onClick={handleSeeAllEmployees}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                  >
                    See All Employees &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employees...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Error Loading Employees
                </h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Name
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      </div>
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Status
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      </div>
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Role
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Location Today
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      </div>
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Check-In Time
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      </div>
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      <div className="flex items-center gap-2 cursor-pointer">
                        Tasks Completed Today
                        <svg
                          className="w-4 h-4 text-gray-400"
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
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {employees.slice(0, 5).map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {employee.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {employee.department}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-gray-900">
                          {employee.location}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <span className="text-sm text-purple-600 font-medium">
                          {employee.checkIn}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">5</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            On Track
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
