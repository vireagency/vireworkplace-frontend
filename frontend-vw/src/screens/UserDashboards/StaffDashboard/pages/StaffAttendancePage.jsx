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
  const [loading, setLoading] = useState(false);
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
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "http://localhost:6000";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");
    return `${noApiV1}`;
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
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
        setAttendanceStatus(response.data.status || "Inactive");
        setAttendanceData(
          response.data.attendanceData || {
            workDuration: "0h 0m",
            activities: 0,
            issues: 0,
            checkInTime: null,
            checkOutTime: null,
          }
        );
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);
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
          totalDays: response.data.totalDays || 0,
          totalOvertimeHours: response.data.totalOvertimeHours || 0,
          daysLate: response.data.daysLate || 0,
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
    }
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
        setAttendanceData(response.data.attendanceData || {});

        // Show success message with late status if applicable
        const message = response.data.late
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
    setCheckingOut(true);
    try {
      const payload = {};

      // Add daily summary if provided
      if (dailySummary.trim()) {
        payload.dailySummary = dailySummary;
      }

      const response = await apiClient.patch(
        "/api/v1/attendance/checkout",
        payload
      );

      if (response.data && response.data.success) {
        setAttendanceStatus("Inactive");
        setAttendanceData(response.data.attendanceData || {});

        // Show success message with overtime info if applicable
        const message =
          response.data.attendanceData?.overtimeHours > 0
            ? `Successfully checked out! Overtime: ${response.data.attendanceData.overtimeHours}h`
            : "Successfully checked out!";
        toast.success(message);

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
              <LogOut className="h-4 w-4 text-blue-600" />
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

  // Dynamically update the badge for the Tasks sidebar item
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity: staffDashboardConfig.productivity.map((item) =>
      item.title === "Tasks" ? { ...item, badge: tasks.length } : item
    ),
  };

  const timelineData = generateTimeline();
  const currentHour = currentTime.getHours();
  const greeting =
    currentHour < 12
      ? "Good Morning"
      : currentHour < 17
      ? "Good Afternoon"
      : "Good Evening";

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <Button
                  onClick={() =>
                    attendanceStatus === "Active"
                      ? setShowCheckOutDialog(true)
                      : setShowCheckInDialog(true)
                  }
                  disabled={checkingIn || checkingOut || loading}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
                >
                  {checkingIn || checkingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : attendanceStatus === "Active" ? (
                    <LogOut className="h-4 w-4" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  {attendanceStatus === "Active" ? "Check-out" : "Check-in"}
                </Button>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      attendanceStatus === "Active"
                        ? "bg-green-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-green-600">
                    {attendanceStatus}
                  </span>
                </div>
              </div>

              <div>
                <h1 className="text-xl font-medium text-gray-900">
                  {greeting},{" "}
                  {user?.firstName ||
                    user?.name?.split(" ")[0] ||
                    "Team Member"}
                  !
                </h1>
                <p className="text-sm text-gray-500">
                  Track your attendance patterns and performance
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium text-gray-600">
              Current Time
            </div>
            <div className="text-lg font-bold text-gray-900">
              {currentTime.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </div>
            <div className="text-sm text-gray-500">
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">
            Today's Overview
          </h2>
          <Badge variant="outline" className="text-sm">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </Badge>
        </div>

        {/* Today's Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Work Time"
            value={attendanceData.workDuration || "0h 0m"}
            subtitle="Hours today"
            icon={Clock}
            color="blue"
          />
          <MetricCard
            title="Activities"
            value={attendanceData.activities || 0}
            subtitle="Tasks completed"
            icon={Activity}
            color="green"
          />
          <MetricCard
            title="Issues"
            value={attendanceData.issues || 0}
            subtitle="Attention needed"
            icon={AlertTriangle}
            color="orange"
          />
          <MetricCard
            title="Performance"
            value={`${Math.round(attendanceStats.averageWorkHours)}h`}
            subtitle="Daily average"
            icon={TrendingUp}
            color="purple"
          />
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 lg:px-6 space-y-6">
        {/* Timeline and Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Timeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {timelineData.length > 0 ? (
                  timelineData.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4">
                      {event.icon}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {event.label}
                          </span>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>{event.time}</span>
                            <span>•</span>
                            <span>{event.date}</span>
                            {event.workingLocation && (
                              <>
                                <span>•</span>
                                <Badge variant="outline" className="text-xs">
                                  {event.workingLocation === "office" ? (
                                    <>
                                      <MapPin className="w-3 h-3 mr-1" />
                                      Office
                                    </>
                                  ) : (
                                    <>
                                      <Home className="w-3 h-3 mr-1" />
                                      Remote
                                    </>
                                  )}
                                </Badge>
                              </>
                            )}
                          </div>
                        </div>
                        {event.reason && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              Reason: {event.reason}
                            </span>
                          </div>
                        )}
                        {event.status === "late" && (
                          <Badge className="bg-orange-100 text-orange-600 border-orange-200 mt-2">
                            Late
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity recorded</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Your attendance timeline will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Monthly Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Days</span>
                    <span className="font-medium">
                      {attendanceStats.totalDays}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Overtime Hours
                    </span>
                    <span className="font-medium text-blue-600">
                      {attendanceStats.totalOvertimeHours}h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Days Late</span>
                    <span className="font-medium text-orange-600">
                      {attendanceStats.daysLate}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Avg. Work Hours
                    </span>
                    <span className="font-medium text-green-600">
                      {attendanceStats.averageWorkHours}h
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      Attendance Rate
                    </span>
                    <span className="font-medium">
                      {Math.round(
                        (1 -
                          attendanceStats.daysLate /
                            Math.max(attendanceStats.totalDays, 1)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.round(
                      (1 -
                        attendanceStats.daysLate /
                          Math.max(attendanceStats.totalDays, 1)) *
                        100
                    )}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => navigate("/staff/check-in")}
                  variant="outline"
                  className="w-full justify-start"
                  disabled={attendanceStatus === "Active"}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Dedicated Check-in
                </Button>
                <Button
                  onClick={() => navigate("/staff/tasks")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Tasks ({tasks.length})
                </Button>
                <Button
                  onClick={() => navigate("/staff/reports")}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Attendance Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Attendance Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Attendance Policies & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  Working Hours
                </h3>
                <div className="space-y-2">
                  <p className="text-gray-700 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Check-in:</span> 9:00 AM (10
                    min grace)
                  </p>
                  <p className="text-gray-700 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Check-out:</span> 5:00 PM (10
                    min grace)
                  </p>
                  <p className="text-gray-700 text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Lunch break:</span> 1 hour
                    (12-1 PM)
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-3">
                  Smart Detection
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-orange-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Late arrival after 9:10 AM
                  </li>
                  <li className="flex items-center gap-2 text-orange-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Early exit before 4:50 PM
                  </li>
                  <li className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Missed check-in/check-out
                  </li>
                  <li className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Overtime automatically tracked
                  </li>
                </ul>
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
              <div className="text-sm text-blue-600 flex items-center gap-1 bg-blue-50 p-3 rounded-lg">
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
              className="bg-blue-600 hover:bg-blue-700"
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
