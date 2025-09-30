import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// Authentication
import { useAuth } from "@/hooks/useAuth";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";

// API Configuration
import { getApiUrl } from "@/config/apiConfig";

import {
  Clock,
  LogIn,
  LogOut,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Bell,
  User,
  Menu,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Activity,
  MapPin,
  Home,
  Loader2,
  TrendingUp,
  Award,
  Target,
} from "lucide-react";
import { toast } from "sonner";

const AttendanceApp = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState("Inactive");
  const [attendanceData, setAttendanceData] = useState({
    workDuration: "0h 0m",
    activities: 0,
    issues: 0,
    checkInTime: null,
    checkOutTime: null,
  });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    totalOvertimeHours: 0,
    daysLate: 0,
    averageWorkHours: 8.0,
  });

  // Check-in form state
  const [workingLocation, setWorkingLocation] = useState("office");
  const [coordinates, setCoordinates] = useState({
    latitude: null,
    longitude: null,
  });
  const [dailySummary, setDailySummary] = useState("");
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [showCheckOutDialog, setShowCheckOutDialog] = useState(false);

  // API configuration
  const getAttendanceApiBaseUrl = () => {
    return "https://vireworkplace-backend-hpca.onrender.com";
  };

  // Create axios instance with correct base URL
  const apiClient = axios.create({
    baseURL: getAttendanceApiBaseUrl(),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use((config) => {
    const token =
      accessToken ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!accessToken || !user) {
      navigate("/login");
    }
  }, [accessToken, user, navigate]);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // Fetch attendance status
  const fetchAttendanceStatus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/api/v1/attendance/status");

      if (response.data && response.data.success) {
        const data = response.data;
        setAttendanceStatus(data.status || "Inactive");

        // Update attendance data with real API data
        setAttendanceData({
          workDuration: data.attendanceData?.workDuration || "0h 0m",
          activities: data.attendanceData?.activities || 0,
          issues: data.attendanceData?.issues || 0,
          checkInTime: data.attendanceData?.clockInTime || null,
          checkOutTime: data.attendanceData?.clockOutTime || null,
          clockInFormatted: data.attendanceData?.clockInFormatted || null,
          clockOutFormatted: data.attendanceData?.clockOutFormatted || null,
          workingLocation: data.attendanceData?.workingLocation || null,
          overtimeHours: data.attendanceData?.overtimeHours || 0,
          late: data.attendanceData?.late || false,
        });

        // Store in localStorage for persistence
        localStorage.setItem(
          "attendanceStatus",
          JSON.stringify({
            status: data.status,
            attendanceData: data.attendanceData,
            timestamp: Date.now(),
          })
        );
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);

      // Try to load from localStorage as fallback
      try {
        const cachedData = localStorage.getItem("attendanceStatus");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          // Only use cached data if it's less than 5 minutes old
          if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
            setAttendanceStatus(parsed.status || "Inactive");
            setAttendanceData({
              workDuration: parsed.attendanceData?.workDuration || "0h 0m",
              activities: parsed.attendanceData?.activities || 0,
              issues: parsed.attendanceData?.issues || 0,
              checkInTime: parsed.attendanceData?.clockInTime || null,
              checkOutTime: parsed.attendanceData?.clockOutTime || null,
              clockInFormatted: parsed.attendanceData?.clockInFormatted || null,
              clockOutFormatted:
                parsed.attendanceData?.clockOutFormatted || null,
              workingLocation: parsed.attendanceData?.workingLocation || null,
              overtimeHours: parsed.attendanceData?.overtimeHours || 0,
              late: parsed.attendanceData?.late || false,
            });
            return;
          }
        }
      } catch (cacheError) {
        console.error("Error loading cached attendance data:", cacheError);
      }

      // Set default data on error
      setAttendanceData({
        workDuration: "0h 0m",
        activities: 0,
        issues: 0,
        checkInTime: null,
        checkOutTime: null,
      });
      toast.error("Failed to load attendance status");
    } finally {
      setLoading(false);
    }
  };

  // Fetch attendance history
  const fetchAttendanceHistory = async () => {
    try {
      if (!user?.id) return;
      const response = await apiClient.get(
        `/api/v1/attendance/history/${user.id}?period=daily&limit=10`
      );

      if (response.data && response.data.success) {
        setAttendanceHistory(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching attendance history:", err);
    }
  };

  // Fetch attendance statistics
  const fetchAttendanceStats = async () => {
    try {
      if (!user?.id) return;
      const response = await apiClient.get(
        `/api/v1/attendance/stats/${user.id}`
      );

      if (response.data && response.data.success) {
        setAttendanceStats({
          totalDays: response.data.totalDays || 120,
          totalOvertimeHours: response.data.totalOvertimeHours || 25.5,
          daysLate: response.data.daysLate || 12,
          averageWorkHours: response.data.averageWorkHours || 8.0,
        });
      }
    } catch (err) {
      console.error("Error fetching attendance stats:", err);
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

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data fetch
  useEffect(() => {
    if (accessToken && user) {
      fetchAttendanceStatus();
      fetchAttendanceHistory();
      fetchAttendanceStats();
      fetchTasks();

      // Set up periodic refresh every 30 seconds to keep data fresh
      const refreshInterval = setInterval(() => {
        fetchAttendanceStatus();
      }, 30000);

      return () => clearInterval(refreshInterval);
    }
  }, [accessToken, user]);

  // Auto-refresh attendance data every 30 seconds
  useEffect(() => {
    if (!accessToken || !user) return;

    const interval = setInterval(() => {
      fetchAttendanceStatus();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [accessToken, user]);

  // Get coordinates when working location changes to office
  useEffect(() => {
    if (workingLocation === "office") {
      getCurrentLocation()
        .then((coords) => {
          setCoordinates(coords);
        })
        .catch((error) => {
          console.error("Error getting location:", error);
          toast.error(
            "Unable to get your location. Please enable location services."
          );
        });
    }
  }, [workingLocation]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const payload = {
        workingLocation,
      };

      // Add coordinates if working from office
      if (
        workingLocation === "office" &&
        coordinates.latitude &&
        coordinates.longitude
      ) {
        payload.latitude = coordinates.latitude;
        payload.longitude = coordinates.longitude;
      }

      const response = await apiClient.post(
        "/api/v1/attendance/checkin",
        payload
      );

      if (response.data && response.data.success) {
        setAttendanceStatus("Active");

        // Update attendance data with API response
        const data = response.data;
        setAttendanceData({
          workDuration: data.attendanceData?.workDuration || "0h 0m",
          activities: data.attendanceData?.activities || 0,
          issues: data.attendanceData?.issues || 0,
          checkInTime: data.attendanceData?.clockInTime || null,
          checkOutTime: data.attendanceData?.clockOutTime || null,
          clockInFormatted: data.attendanceData?.clockInFormatted || null,
          clockOutFormatted: data.attendanceData?.clockOutFormatted || null,
          workingLocation:
            data.attendanceData?.workingLocation || workingLocation,
          overtimeHours: data.attendanceData?.overtimeHours || 0,
          late: data.late || false,
        });

        // Show success message with late status if applicable
        const message = data.late
          ? "Successfully checked in (Late)"
          : "Successfully checked in!";
        toast.success(message);

        setShowCheckInDialog(false);

        // Refresh data
        await Promise.all([
          fetchAttendanceStatus(),
          fetchAttendanceHistory(),
          fetchAttendanceStats(),
        ]);
      } else {
        toast.error("Check-in failed. Please try again.");
      }
    } catch (error) {
      console.error("Check-in error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Check-in failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    console.log("handleCheckOut called with dailySummary:", dailySummary);

    if (!dailySummary.trim()) {
      toast.error("Please provide a daily summary before checking out.");
      return;
    }

    console.log("Starting checkout process...");
    setCheckingOut(true);

    try {
      const payload = {
        dailySummary: dailySummary.trim(),
      };

      const response = await apiClient.patch(
        "/api/v1/attendance/checkout",
        payload
      );

      if (response.data && response.data.success) {
        setAttendanceStatus("Inactive");

        // Update attendance data with API response
        const data = response.data;
        setAttendanceData({
          workDuration: data.attendanceData?.workDuration || "0h 0m",
          activities: data.attendanceData?.activities || 0,
          issues: data.attendanceData?.issues || 0,
          checkInTime: data.attendanceData?.clockInTime || null,
          checkOutTime: data.attendanceData?.clockOutTime || null,
          clockInFormatted: data.attendanceData?.clockInFormatted || null,
          clockOutFormatted: data.attendanceData?.clockOutFormatted || null,
          workingLocation: data.attendanceData?.workingLocation || null,
          overtimeHours: data.attendanceData?.overtimeHours || 0,
          late: data.attendanceData?.late || false,
        });

        // Store checkout status in localStorage for consistency with CheckOut.jsx
        const today = new Date().toISOString().split("T")[0];
        const todayDateString = new Date().toDateString();

        localStorage.setItem(`checkout_${today}`, "true");
        localStorage.setItem(`checkout_${todayDateString}`, "true");

        // Store detailed checkout info
        const checkoutInfo = {
          date: today,
          dateString: todayDateString,
          timestamp: new Date().toISOString(),
          dailySummary: dailySummary.trim(),
          completed: true,
          apiResponse: data,
        };

        localStorage.setItem(
          `checkout_info_${today}`,
          JSON.stringify(checkoutInfo)
        );
        localStorage.setItem(
          `checkout_info_${todayDateString}`,
          JSON.stringify(checkoutInfo)
        );

        console.log(
          "Checkout successful, stored in localStorage:",
          checkoutInfo
        );

        // Check for overtime and show appropriate message
        const hasOvertimeFromAPI =
          data.attendanceData &&
          data.attendanceData.overtimeHours &&
          data.attendanceData.overtimeHours > 0;

        const currentHour = new Date().getHours();
        const hasOvertimeFromTime = currentHour > 17; // After 5 PM

        console.log("Overtime check:", {
          hasOvertimeFromAPI,
          hasOvertimeFromTime,
          currentHour,
          overtimeHours: data.attendanceData?.overtimeHours,
        });

        if (hasOvertimeFromAPI || hasOvertimeFromTime) {
          console.log("Overtime detected, showing warning");
          toast.warning("You've worked overtime today. Great job!");
        } else {
          toast.success("Successfully checked out!");
        }

        // Clear daily summary
        setDailySummary("");
        setShowCheckOutDialog(false);

        // Refresh data
        await Promise.all([
          fetchAttendanceStatus(),
          fetchAttendanceHistory(),
          fetchAttendanceStats(),
        ]);
      } else {
        toast.error("Check-out failed. Please try again.");
      }
    } catch (error) {
      console.error("Check-out error:", error);

      // Handle specific error cases like CheckOut.jsx
      if (error.response?.data?.message === "ALREADY_CHECKED_OUT") {
        toast.error("You have already checked out for today.");
        setShowCheckOutDialog(false);
        return;
      }

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Check-out failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setCheckingOut(false);
    }
  };

  // Generate timeline from attendance history
  const generateTimeline = () => {
    if (!attendanceHistory.length) return [];

    const entries = [];

    attendanceHistory.slice(0, 5).forEach((record) => {
      // Add check-in entry
      if (record.clockInTime) {
        entries.push({
          type: "checkin",
          time: new Date(record.clockInTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(record.clockInTime).toLocaleDateString(),
          reason: record.late ? "Traffic delay" : null,
          status: record.late ? "late" : "normal",
          workingLocation: record.workingLocation,
          icon: (
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          ),
          label: "Checked In",
        });
      }

      // Add check-out entry
      if (record.clockOutTime) {
        entries.push({
          type: "checkout",
          time: new Date(record.clockOutTime).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date(record.clockOutTime).toLocaleDateString(),
          reason: null,
          status: "normal",
          workingLocation: record.workingLocation,
          icon: (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <LogOut className="h-4 w-4 text-green-600" />
            </div>
          ),
          label: "Checked Out",
        });
      }
    });

    return entries.sort(
      (a, b) =>
        new Date(b.date + " " + a.time) - new Date(a.date + " " + b.time)
    );
  };

  // Metric Card Component
  const MetricCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "blue",
  }) => {
    const colorClasses = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    return (
      <Card
        className={`border ${colorClasses[color]} hover:shadow-md transition-shadow`}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            {Icon && <Icon className={`w-8 h-8 ${colorClasses[color]}`} />}
          </div>
        </CardContent>
      </Card>
    );
  };

  const timelineData = generateTimeline();
  const currentHour = currentTime.getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

  // Show loading state while fetching attendance data
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Attendance Data
            </h3>
            <p className="text-gray-500">
              Please wait while we fetch your attendance information...
            </p>
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
      {/* Attendance Overview Section - Refined to match image */}
      <div className="px-4 lg:px-6 py-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Attendance Overview
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Track your attendance patterns and performance
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    attendanceStatus === "Active" ? "default" : "secondary"
                  }
                  className={`text-sm font-medium ${
                    attendanceStatus === "Active"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {attendanceStatus === "Active" ? "Active" : "Inactive"}
                </Badge>
                <Badge variant="outline" className="text-sm font-medium">
                  Today
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Summary Cards - Responsive design */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Work Time Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {attendanceData.workDuration || "3h 25m"}
                </div>
                <div className="text-sm text-gray-600">Work Time</div>
              </div>

              {/* Activities Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {attendanceData.activities || 3}
                </div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>

              {/* Issues Card */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {attendanceData.issues || 0}
                </div>
                <div className="text-sm text-gray-600">Issues</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {attendanceStatus === "Inactive" ? (
                <Button
                  onClick={() => setShowCheckInDialog(true)}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium"
                  disabled={checkingIn}
                >
                  {checkingIn ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking In...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Check In
                    </div>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowCheckOutDialog(true)}
                  className="bg-green-600 hover:bg-green-600-700 text-white font-medium"
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking Out...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Check Out
                    </div>
                  )}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => {
                  fetchAttendanceStatus();
                  fetchAttendanceHistory();
                  fetchAttendanceStats();
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Refreshing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Refresh
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 lg:px-6 space-y-6">
        {/* Today's Timeline Section - Enhanced UI */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Today's Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceData.checkInTime ? (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          Checked In at{" "}
                          {attendanceData.clockInFormatted ||
                            new Date(
                              attendanceData.checkInTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          Location:{" "}
                          {attendanceData.workingLocation === "office"
                            ? "Office"
                            : "Remote"}
                        </p>
                      </div>
                      {attendanceData.late && (
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Late
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No check-in recorded for today</p>
                </div>
              )}

              {attendanceData.checkOutTime && (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900">
                          Checked Out at{" "}
                          {attendanceData.clockOutFormatted ||
                            new Date(
                              attendanceData.checkOutTime
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                        </span>
                        {attendanceData.overtimeHours > 0 && (
                          <p className="text-sm text-orange-600 mt-1">
                            Overtime: {attendanceData.overtimeHours}h
                          </p>
                        )}
                      </div>
                      {attendanceData.overtimeHours > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overtime
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!attendanceData.checkInTime && !attendanceData.checkOutTime && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No attendance records for today</p>
                  <p className="text-sm mt-1">
                    Check in to start tracking your time
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Policies & Detection Rules Section - Enhanced UI */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Attendance Policies & Detection Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Working Hours Column */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Working Hours
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Check-in: 9:00 AM (10 min grace)
                  </div>
                  <div className="text-sm text-gray-600">
                    Check-out: 5:00 PM (10 min grace)
                  </div>
                </div>
              </div>

              {/* Smart Detection Column */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">
                  Smart Detection
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Late arrival after 9:10 AM.
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Early exit before 4:50 PM.
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    Missed check-in/check-out.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>
              Select your working location to check in for today.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="workingLocation">Working Location</Label>
              <Select
                value={workingLocation}
                onValueChange={setWorkingLocation}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select working location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Office
                    </div>
                  </SelectItem>
                  <SelectItem value="remote">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Remote
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {workingLocation === "office" && (
              <div className="text-sm text-green-600 flex items-center gap-1 bg-green-50 p-3 rounded-lg">
                <MapPin className="h-4 w-4" />
                Location will be verified for office check-in
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckInDialog(false)}
              disabled={checkingIn}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="bg-green-600 hover:bg-green-700"
            >
              {checkingIn ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking In...
                </div>
              ) : (
                "Check In"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Check-out Dialog */}
      <Dialog open={showCheckOutDialog} onOpenChange={setShowCheckOutDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Check Out</DialogTitle>
            <DialogDescription>
              Provide a summary of your day before checking out (optional).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dailySummary">Daily Summary (Optional)</Label>
              <Textarea
                id="dailySummary"
                value={dailySummary}
                onChange={(e) => setDailySummary(e.target.value)}
                placeholder="Describe what you accomplished today..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCheckOutDialog(false)}
              disabled={checkingOut}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckOut}
              disabled={checkingOut}
              className="bg-green-600 hover:green-700"
            >
              {checkingOut ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking Out...
                </div>
              ) : (
                "Check Out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StaffDashboardLayout>
  );
};

export default AttendanceApp;
