import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { useState, useEffect } from "react";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiUrl } from "@/config/apiConfig";
import { hrOverviewApi } from "@/services/hrOverviewApi";
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
  const { user, accessToken, loading } = useAuth();
  const navigate = useNavigate();
  const greeting = getGreeting();

  // Show loading state if auth context is still loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Get user's first name, fallback to "Admin" if not available
  const userName = user?.firstName || "Admin";

  // API configuration
  const API_URL = getApiUrl();

  // State for employee data
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for HR overview data
  const [hrOverviewData, setHrOverviewData] = useState(null);
  const [loadingHrOverview, setLoadingHrOverview] = useState(true);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("12months");

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setEmployeesLoading(true);

        // Check authentication
        if (!accessToken) {
          console.log("No access token available");
          throw new Error("No access token available. Please log in again.");
        }

        console.log("Making API call to:", `${API_URL}/employees/list`);
        console.log("User:", user);
        console.log("User role:", user?.role);

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
          console.log("API Response:", response.data);
          console.log("Transformed Employees:", transformedEmployees);
          console.log(
            "Employee statuses:",
            transformedEmployees.map((emp) => ({
              name: emp.name,
              status: emp.status,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setError("Failed to load employees");
      } finally {
        setEmployeesLoading(false);
      }
    };

    if (accessToken) {
      fetchEmployees();
    }
  }, [accessToken, API_URL]);

  // Static overview data as fallback
  const getStaticOverviewData = () => ({
    success: true,
    message: "Dashboard overview fetched successfully",
    data: {
      activeEmployees: 22,
      totalRemoteWorkersToday: 5,
      noCheckInToday: 3,
      productivityIndex: "86.36%",
      incompleteTasks: 14,
    },
  });

  // Fetch HR overview data
  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken) {
        setHrOverviewData(getStaticOverviewData());
        setLoadingHrOverview(false);
        return;
      }

      try {
        setLoadingHrOverview(true);
        const result = await hrOverviewApi.getOverview(accessToken);

        if (result.success) {
          setHrOverviewData(result.data);
        } else {
          setHrOverviewData(getStaticOverviewData());
        }
      } catch (error) {
        setHrOverviewData(getStaticOverviewData());
      } finally {
        setLoadingHrOverview(false);
      }
    };

    fetchOverview();
  }, [accessToken]);

  // Handle time range changes for analytics
  const handleAnalyticsTimeRangeChange = (timeRange) => {
    setAnalyticsTimeRange(timeRange);
  };

  // Function to handle navigation to Employees page
  const handleSeeAllEmployees = () => {
    navigate("/admin/employees");
  };

  // Sample data for recent activities
  const recentActivities = [
    {
      id: 1,
      type: "user_login",
      description: "John Doe logged in",
      timestamp: "2024-01-15 10:30",
      severity: "info",
    },
    {
      id: 2,
      type: "system_alert",
      description: "High CPU usage detected",
      timestamp: "2024-01-15 09:45",
      severity: "warning",
    },
    {
      id: 3,
      type: "security_alert",
      description: "Failed login attempt from unknown IP",
      timestamp: "2024-01-15 09:20",
      severity: "critical",
    },
    {
      id: 4,
      type: "user_activity",
      description: "Jane Smith updated profile",
      timestamp: "2024-01-15 08:15",
      severity: "info",
    },
    {
      id: 5,
      type: "system_maintenance",
      description: "Scheduled maintenance completed",
      timestamp: "2024-01-15 07:30",
      severity: "info",
    },
  ];

  // Sample data for system alerts
  const alerts = [
    {
      id: 1,
      type: "security",
      title: "Unusual Login Activity",
      description: "Multiple failed login attempts detected",
      severity: "high",
      timestamp: "2024-01-15 09:20",
      status: "active",
    },
    {
      id: 2,
      type: "performance",
      title: "High Memory Usage",
      description: "Server memory usage above 85%",
      severity: "medium",
      timestamp: "2024-01-15 08:45",
      status: "active",
    },
    {
      id: 3,
      type: "maintenance",
      title: "Scheduled Maintenance",
      description: "System maintenance scheduled for tonight",
      severity: "low",
      timestamp: "2024-01-15 07:00",
      status: "pending",
    },
  ];

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
                  Needs Attention
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
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>

      {/* Department Performance Overview Section */}
      {hrOverviewData?.data?.departmentPerformance && (
        <div className="px-4 lg:px-6 mt-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Department Performance Overview
              </h3>
              <p className="text-sm text-gray-500">
                Check-in rates and attendance by department
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(hrOverviewData.data.departmentPerformance).map(
                ([department, data]) => (
                  <div key={department} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {department}
                      </h4>
                      <span className="text-sm font-semibold text-gray-700">
                        {data.percent}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>
                        {data.checkedIn} of {data.total} checked in
                      </span>
                      <span>{data.total - data.checkedIn} remaining</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
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
                        style={{
                          width: `${data.percent}`,
                        }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

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
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      analyticsTimeRange === "12months"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    }`}
                    onClick={() => handleAnalyticsTimeRangeChange("12months")}
                  >
                    12 Months
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      analyticsTimeRange === "6months"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    }`}
                    onClick={() => handleAnalyticsTimeRangeChange("6months")}
                  >
                    6 Months
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      analyticsTimeRange === "30days"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    }`}
                    onClick={() => handleAnalyticsTimeRangeChange("30days")}
                  >
                    30 Days
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      analyticsTimeRange === "7days"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    }`}
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
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p>Chart will be displayed here</p>
              </div>
            </div>
          </div>

          {/* Real-Time Tracker - Takes up 1/3 of the space */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Real-Time Tracker
              </h3>
              <p className="text-sm text-gray-500">
                Live employee activity monitoring
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Active Employees
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {hrOverviewData?.data?.activeEmployees || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((hrOverviewData?.data?.activeEmployees || 0) / 50) *
                        100
                      }%`,
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
                      (hrOverviewData?.data?.activeEmployees || 0) -
                        (hrOverviewData?.data?.totalRemoteWorkersToday || 0)
                    )}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        (Math.max(
                          0,
                          (hrOverviewData?.data?.activeEmployees || 0) -
                            (hrOverviewData?.data?.totalRemoteWorkersToday || 0)
                        ) /
                          50) *
                        100
                      }%`,
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
                    {hrOverviewData?.data?.noCheckInToday || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((hrOverviewData?.data?.noCheckInToday || 0) / 50) * 100
                      }%`,
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
                    {hrOverviewData?.data?.incompleteTasks || 0}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((hrOverviewData?.data?.incompleteTasks || 0) / 50) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
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
            {employeesLoading ? (
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
            ) : employees.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Employees Found
                </h3>
                <p className="text-gray-500">
                  There are no employees to display at the moment.
                </p>
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-gray-200">
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Employee
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Department
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Role
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Location
                    </TableHead>
                    <TableHead className="text-left py-3 px-4 font-medium text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {employees.slice(0, 5).map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50">
                      <TableCell className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {employee.name.charAt(0)}
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
                        {employee.department}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {employee.role}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {employee.location || "Not specified"}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          View Details
                        </button>
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
