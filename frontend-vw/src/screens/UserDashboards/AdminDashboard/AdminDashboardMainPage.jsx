import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import adminData from "./adminData.json";
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

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);

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
        } else {
          setError("Failed to fetch employees");
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
        setError(`Error fetching employees: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [accessToken, API_URL, user]);

  // Fetch admin overview data
  useEffect(() => {
    const fetchOverview = async () => {
      if (!accessToken) return;

      try {
        setLoadingOverview(true);
        console.log("Fetching admin overview data...");

        // For now, use static data - can be replaced with actual API call
        setOverviewData(getStaticOverviewData());
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

  // Static overview data as fallback
  const getStaticOverviewData = () => ({
    success: true,
    message: "Dashboard overview fetched successfully",
    data: {
      totalEmployees: 45,
      activeEmployees: 42,
      totalDepartments: 6,
      systemHealth: "98.5%",
      departmentPerformance: {
        Engineering: {
          total: 15,
          checkedIn: 14,
          percent: "93.33%",
        },
        HR: {
          total: 8,
          checkedIn: 8,
          percent: "100.00%",
        },
        Finance: {
          total: 10,
          checkedIn: 9,
          percent: "90.00%",
        },
        Marketing: {
          total: 7,
          checkedIn: 6,
          percent: "85.71%",
        },
        Sales: {
          total: 5,
          checkedIn: 5,
          percent: "100.00%",
        },
      },
      pendingApprovals: 8,
    },
  });

  // Function to handle navigation to Employees page
  const handleSeeAllEmployees = () => {
    navigate("/admin/employees");
  };

  return (
    <AdminDashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
      dataTableData={adminData}
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
                – here's the complete overview of Vire Agency
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-sm text-green-600 px-3 py-1.5 border border-gray-200 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              System Active
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Section Cards */}
      <div className="px-4 lg:px-6">
        {loadingOverview ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-slate-600">
              Loading dashboard data...
            </span>
          </div>
        ) : overviewData ? (
          <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Total Employees</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {overviewData.data?.totalEmployees || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  <IconTrendingUp className="text-green-600" />
                  +12%
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Active Employees</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {overviewData.data?.activeEmployees || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  <IconTrendingUp className="text-green-600" />
                  +8%
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>Total Departments</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {overviewData.data?.totalDepartments || 0}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge variant="secondary" className="text-blue-600 bg-blue-50">
                  <IconTrendingUp className="text-blue-600" />
                  +2
                </Badge>
              </div>
            </Card>

            <Card className="@container/card relative">
              <CardHeader>
                <CardDescription>System Health</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {overviewData.data?.systemHealth || "0%"}
                </CardTitle>
              </CardHeader>
              <div className="absolute bottom-3 right-3">
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  <IconTrendingUp className="text-green-600" />
                  +2.1%
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

      {/* Department Performance Overview Section */}
      {overviewData?.data?.departmentPerformance && (
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
              {Object.entries(overviewData.data.departmentPerformance).map(
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
                        style={{ width: data.percent }}
                      ></div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* System Analytics and Real-Time Tracker Section */}
      <div className="px-4 lg:px-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Analytics - Takes up 2/3 of the space */}
          <div className="lg:col-span-2 bg-white rounded-lg border p-6">
            {/* Header Section with Time Range Selector and Export Button on same line */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  System Analytics
                </h3>
                <p className="text-sm text-gray-500">
                  Monthly Performance & System Metrics
                </p>
              </div>

              <div className="flex items-center space-x-24">
                <div className="flex space-x-1">
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg">
                    12 Months
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    6 Months
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    30 Days
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
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
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      System Performance
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">
                      Employee Activity
                    </span>
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
                    System analytics chart will be implemented here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Line chart with monthly system performance data
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time System Tracker - Takes up 1/3 of the space */}
          <div className="lg:col-span-1 bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Tracker
              </h3>
              <select className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
              </select>
            </div>

            {/* Metrics */}
            {loadingOverview ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="ml-2 text-sm text-slate-600">
                  Loading tracker data...
                </span>
              </div>
            ) : overviewData ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Total Employees
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overviewData.data?.totalEmployees?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: overviewData.data?.totalEmployees
                          ? `${Math.min(
                              (overviewData.data.totalEmployees / 100) * 100,
                              100
                            )}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Active Employees
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overviewData.data?.activeEmployees?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: overviewData.data?.activeEmployees
                          ? `${Math.min(
                              (overviewData.data.activeEmployees / 50) * 100,
                              100
                            )}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      System Health
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overviewData.data?.systemHealth || "0%"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: overviewData.data?.systemHealth || "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Pending Approvals
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {overviewData.data?.pendingApprovals?.toLocaleString() ||
                        "0"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        overviewData.data?.pendingApprovals > 10
                          ? "bg-red-500"
                          : overviewData.data?.pendingApprovals > 5
                          ? "bg-orange-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: overviewData.data?.pendingApprovals
                          ? `${Math.min(
                              (overviewData.data.pendingApprovals / 20) * 100,
                              100
                            )}%`
                          : "0%",
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
                  No tracker data available
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
                  Monitor employee status, attendance, and system access in
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
                        Department
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
