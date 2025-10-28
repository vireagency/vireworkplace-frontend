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
import { hrOverviewApi } from "@/services/hrOverviewApi";

function getGreeting() {
  const currentHour = new Date().getHours();
  if (currentHour < 12) return "Good Morning";
  if (currentHour < 18) return "Good Afternoon";
  return "Good Evening";
}

export default function AdminDashboardMainPage() {
  const { user, accessToken } = useAuth();
  const [hrOverviewData, setHrOverviewData] = useState(null);
  const [loadingHrOverview, setLoadingHrOverview] = useState(true);
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState("12months");

  const greeting = getGreeting();
  const userName = user?.firstName || "Admin";

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

  // Handle time range changes for real-time tracker
  const handleRealtimeTimeRangeChange = (timeRange) => {
    setRealtimeTimeRange(timeRange);
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
    </AdminDashboardLayout>
  );
}
