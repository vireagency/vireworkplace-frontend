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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  X,
} from "lucide-react";
import { toast } from "sonner";

const StaffAttendancePage = () => {
  const { user, accessToken } = useAuth();
  const navigate = useNavigate();
  const { sidebarConfig } = useStandardizedSidebar();

  // State management
  const [currentTime, setCurrentTime] = useState("");
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

  // CheckOut.jsx modal states
  const [showMainDialog, setShowMainDialog] = useState(false);
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showAlreadyCheckedOutDialog, setShowAlreadyCheckedOutDialog] =
    useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [hasAlreadyCheckedOut, setHasAlreadyCheckedOut] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [showForceCheckoutDialog, setShowForceCheckoutDialog] = useState(false);
  const [backendSyncIssue, setBackendSyncIssue] = useState(false);

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

  // Utility functions for consistent date handling (from CheckOut.jsx)
  const getTodayKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getTodayDateString = () => {
    return new Date().toDateString();
  };

  // Get all possible localStorage keys that check-in might have used (from CheckOut.jsx)
  const getAllPossibleCheckinKeys = () => {
    const todayKey = getTodayKey();
    const todayDateString = getTodayDateString();
    const now = new Date();

    // Additional date formats for better compatibility
    const isoDate = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const localDateString = now.toLocaleDateString(); // MM/DD/YYYY or DD/MM/YYYY

    return [
      `checkin_${todayKey}`, // YYYY-MM-DD format
      `checkin_${todayDateString}`, // Full date string format (primary one used by check-in)
      `checkin_${isoDate}`, // ISO date format
      `checkin_${localDateString}`, // Local date format
      // Additional fallback keys
      `checkin_info_${todayKey}`,
      `checkin_info_${todayDateString}`,
      `attendance_${todayKey}`,
      `attendance_${todayDateString}`,
    ];
  };

  // Enhanced function to find check-in data with better logging (from CheckOut.jsx)
  const findCheckinData = () => {
    const allCheckinKeys = getAllPossibleCheckinKeys();

    console.log("=== SEARCHING FOR CHECKIN DATA ===");
    console.log("Today YYYY-MM-DD:", getTodayKey());
    console.log("Today DateString:", getTodayDateString());
    console.log("All possible keys:", allCheckinKeys);

    // Check all possible keys
    for (const key of allCheckinKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        console.log(`✅ Found check-in data with key: ${key}`);
        try {
          const parsed = JSON.parse(data);
          console.log("Check-in data:", parsed);
          return { key, data: parsed };
        } catch (e) {
          console.log(`❌ Failed to parse check-in data for key ${key}:`, e);
          // If it's not JSON, treat as simple string
          console.log(`✅ Found simple check-in flag with key: ${key}`);
          return { key, data: true };
        }
      }
    }

    console.log("❌ No check-in data found with any key");
    console.log("=== END CHECKIN SEARCH ===");
    return null;
  };

  // Check if current time is after 5:00 PM (17:00) for overtime (from CheckOut.jsx)
  const isCurrentTimeOvertime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return currentHour > 17 || (currentHour === 17 && currentMinute > 0);
  };

  // Get all possible checkout keys (from CheckOut.jsx)
  const getAllPossibleCheckoutKeys = () => {
    const todayKey = getTodayKey();
    const todayDateString = getTodayDateString();

    return [
      `checkout_${todayKey}`,
      `checkout_${todayDateString}`,
      `checkout_${todayKey}_completed`,
      `checkout_${todayDateString}_completed`,
      `checkout_info_${todayKey}`,
      `checkout_info_${todayDateString}`,
    ];
  };

  // Check if user has already checked out today (from CheckOut.jsx)
  const checkIfAlreadyCheckedOut = () => {
    const checkoutKeys = getAllPossibleCheckoutKeys();

    console.log("=== CHECKING CHECKOUT STATUS ===");
    console.log(
      "Checking localStorage for checkout status with keys:",
      checkoutKeys
    );

    for (const key of checkoutKeys) {
      const hasCheckedOut = localStorage.getItem(key);
      if (hasCheckedOut === "true" || hasCheckedOut) {
        console.log(`User has already checked out today (found key: ${key})`);
        return true;
      }
    }

    // Also check for any checkout info stored as JSON
    for (const key of checkoutKeys) {
      const checkoutInfo = localStorage.getItem(key);
      if (checkoutInfo) {
        try {
          const parsed = JSON.parse(checkoutInfo);
          if (parsed && (parsed.completed || parsed.timestamp)) {
            console.log(
              `User has already checked out today (found info: ${key})`
            );
            return true;
          }
        } catch (e) {
          console.warn("Error parsing checkout info:", e);
        }
      }
    }

    return false;
  };

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

  // Update time display for CheckOut modal (from CheckOut.jsx)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }) + " GMT"
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Get user initials for avatar fallback (from CheckOut.jsx)
  const getUserInitials = () => {
    const safe = (s) => (typeof s === "string" ? s : "");
    const email = safe(user?.email);

    const initialsFromEmail = () => {
      if (!email) return "U";
      const local = email.split("@")[0];
      const parts = local.split(/[._-]+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return local.slice(0, 2).toUpperCase() || "U";
    };

    const firstName = safe(user?.firstName);
    const lastName = safe(user?.lastName);
    if (firstName || lastName) {
      const fi = firstName ? firstName.trim().charAt(0).toUpperCase() : "";
      const li = lastName ? lastName.trim().charAt(0).toUpperCase() : "";
      return fi + li || fi || initialsFromEmail();
    }

    const name = safe(user?.name || user?.fullName);
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
    }

    return initialsFromEmail();
  };

  // Get profile image URL with proper fallback (from CheckOut.jsx)
  const getProfileImageUrl = () => {
    const url =
      user?.profileImage ||
      user?.profilePicture ||
      user?.avatar ||
      user?.avatarUrl ||
      user?.photoUrl ||
      user?.image ||
      user?.picture ||
      null;

    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://vireworkplace-backend-hpca.onrender.com${url}`;
  };

  // Handle profile image load error (from CheckOut.jsx)
  const handleImageError = (e) => {
    console.log("Profile image failed to load, using fallback");
    e.target.style.display = "none";
  };

  // Initial data fetch
  useEffect(() => {
    if (accessToken && user) {
      // Check if user has already checked out today before showing checkout button
      const alreadyCheckedOut = checkIfAlreadyCheckedOut();
      if (alreadyCheckedOut) {
        console.log(
          "User has already checked out today, updating attendance status"
        );
        setAttendanceStatus("Inactive");
      }

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

  // CheckOut.jsx handler functions
  const handleCancel = () => {
    setShowMainDialog(false);
  };

  const handleOvertimeClose = () => {
    setShowOvertimeDialog(false);
    // Navigate back to dashboard after overtime acknowledgment
    navigate("/staff/dashboard");
  };

  const handleTryAgain = () => {
    setShowErrorDialog(false);
    setShowMainDialog(true);
  };

  const handleDiscard = () => {
    setShowErrorDialog(false);
  };

  const handleAlreadyCheckedOutClose = () => {
    setShowAlreadyCheckedOutDialog(false);
    // Navigate back to dashboard
    navigate("/staff/dashboard");
  };

  const handleForceCheckout = () => {
    console.log("Force checkout initiated");

    const todayKey = getTodayKey();
    const todayDateString = getTodayDateString();

    // Store checkout status in localStorage with multiple keys
    localStorage.setItem(`checkout_${todayKey}`, "true");
    localStorage.setItem(`checkout_${todayDateString}`, "true");

    // Store detailed checkout info
    const checkoutInfo = {
      date: todayKey,
      dateString: todayDateString,
      timestamp: new Date().toISOString(),
      dailySummary: dailySummary,
      forceCheckout: true,
      completed: true,
      reason: "Backend sync issue - checkout completed locally",
    };

    localStorage.setItem(
      `checkout_info_${todayKey}`,
      JSON.stringify(checkoutInfo)
    );
    localStorage.setItem(
      `checkout_info_${todayDateString}`,
      JSON.stringify(checkoutInfo)
    );

    console.log(
      "Force checkout completed, stored in localStorage:",
      checkoutInfo
    );

    setShowForceCheckoutDialog(false);

    // Check for overtime and show appropriate dialog
    const hasOvertimeFromTime = isCurrentTimeOvertime();

    if (hasOvertimeFromTime) {
      console.log("Showing overtime warning dialog (force checkout)");
      setShowOvertimeDialog(true);
    } else {
      console.log("Normal checkout, showing success toast (force checkout)");
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        // Navigate back to dashboard after success toast
        navigate("/staff/dashboard");
      }, 2000);
    }
  };

  const handleForceCheckoutClose = () => {
    setShowForceCheckoutDialog(false);
    setBackendSyncIssue(false);
  };

  const handleCheckOut = async () => {
    console.log("handleCheckOut called with dailySummary:", dailySummary);

    if (!dailySummary.trim()) {
      toast.error("Please provide a daily summary before checking out.");
      return;
    }

    console.log("Starting checkout process...");
    setCheckingOut(true);

    // Enhanced check-in finder (from CheckOut.jsx)
    const checkinData = findCheckinData();

    if (!checkinData) {
      console.log("No check-in info found in localStorage");
      toast.error("No check-in record found for today. Please check in first.");
      setCheckingOut(false);
      setShowCheckOutDialog(false);
      return;
    }

    console.log("Check-in info found, proceeding with checkout");

    try {
      const payload = {
        dailySummary: dailySummary.trim(),
      };

      console.log("Making checkout API call:", {
        url: "/api/v1/attendance/checkout",
        method: "PATCH",
        body: payload,
      });

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

        // Store checkout status with all possible keys for consistency (from CheckOut.jsx)
        const todayKey = getTodayKey();
        const todayDateString = getTodayDateString();

        // Store with multiple keys for better compatibility
        localStorage.setItem(`checkout_${todayKey}`, "true");
        localStorage.setItem(`checkout_${todayDateString}`, "true");

        // Store detailed checkout info
        const checkoutInfo = {
          date: todayKey,
          dateString: todayDateString,
          timestamp: new Date().toISOString(),
          dailySummary: dailySummary.trim(),
          completed: true,
          apiResponse: data,
        };

        localStorage.setItem(
          `checkout_info_${todayKey}`,
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

        // Check for overtime and show appropriate message (from CheckOut.jsx)
        const hasOvertimeFromAPI =
          data.attendanceData &&
          data.attendanceData.overtimeHours &&
          data.attendanceData.overtimeHours > 0;

        const hasOvertimeFromTime = isCurrentTimeOvertime();

        console.log("Overtime check:", {
          hasOvertimeFromAPI,
          hasOvertimeFromTime,
          currentTime: new Date().toLocaleTimeString(),
          overtimeHours: data.attendanceData?.overtimeHours,
        });

        setShowMainDialog(false);

        // Check for overtime and show appropriate dialog (from CheckOut.jsx)
        if (hasOvertimeFromAPI || hasOvertimeFromTime) {
          console.log("Showing overtime warning dialog");
          setShowOvertimeDialog(true);
        } else {
          console.log("Normal checkout, showing success toast");
          setShowSuccessToast(true);
          setTimeout(() => {
            setShowSuccessToast(false);
            // Navigate back to dashboard after success toast
            navigate("/staff/dashboard");
          }, 2000);
        }

        // Clear daily summary
        setDailySummary("");

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
        console.log("User has already checked out (from API error)");
        setShowMainDialog(false);
        setShowAlreadyCheckedOutDialog(true);
        return;
      }

      // Handle backend sync issue (from CheckOut.jsx)
      if (error.response?.status === 404 && checkinData) {
        console.log("Backend sync issue detected");
        setBackendSyncIssue(true);
        setShowMainDialog(false);
        setShowForceCheckoutDialog(true);
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Check-out failed. Please try again."
      );
      setShowMainDialog(false);
      setShowErrorDialog(true);
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
  const currentHour = new Date().getHours();
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
                  onClick={() => {
                    // Check if user has already checked out today
                    if (checkIfAlreadyCheckedOut()) {
                      setShowMainDialog(false);
                      setShowAlreadyCheckedOutDialog(true);
                      return;
                    }
                    setShowMainDialog(true);
                  }}
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

      {/* CheckOut.jsx Modal Components */}

      {/* Main Check-Out Dialog */}
      {showMainDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-6">
              {/* Header Section - Avatar and Time */}
              <div className="flex items-center justify-between">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={getProfileImageUrl()}
                    alt={`${user?.firstName || "User"} ${user?.lastName || ""}`}
                    onError={handleImageError}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Closing Time:
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {currentTime}
                  </div>
                </div>
              </div>

              {/* Day Report Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-700">
                  Provide your daily summary. What tasks did you complete today?
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Textarea
                  placeholder="Write your daily summary here..."
                  value={dailySummary}
                  onChange={(e) => setDailySummary(e.target.value)}
                  className="min-h-[120px] resize-none border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={checkingOut}
                  required
                />
                {dailySummary.length > 0 && (
                  <div className="text-xs text-slate-500 text-right">
                    {dailySummary.length} characters
                  </div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  disabled={checkingOut}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium relative overflow-hidden"
                  disabled={checkingOut || !dailySummary.trim()}
                >
                  {checkingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span className="text-sm">Checking Out...</span>
                      </div>
                    </div>
                  ) : (
                    "Check Out"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overtime Warning Dialog */}
      {showOvertimeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-500 bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <div className="p-8 space-y-6 text-center">
              <div className="flex justify-center">
                <AlertTriangle className="w-10 h-10 text-yellow-500 stroke-2 stroke-black" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-black">
                  Overtime Detected
                </h3>
                <p className="text-black text-sm leading-relaxed">
                  You checked out after 5:00 PM. Your overtime has been recorded
                  and HR has been notified.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">
                      Check-out Time: {currentTime}
                    </div>
                    <div className="text-xs mt-1">
                      Standard work hours: 9:00 AM - 5:00 PM
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleOvertimeClose}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg py-2 font-medium"
                >
                  Acknowledged
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog Section */}
      {showErrorDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Check-out Failed
                </h3>
                <p className="text-slate-500 mt-1 text-sm">
                  {error || "Something went wrong. Please try again."}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Discard
                </Button>
                <Button
                  onClick={handleTryAgain}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Already Checked Out Dialog Section */}
      {showAlreadyCheckedOutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Already Checked Out
                </h3>
                <p className="text-slate-500 mt-1 text-sm">
                  You have already checked out for today. You can only check out
                  once per day.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleAlreadyCheckedOutClose}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Force Checkout Dialog - For Backend Sync Issues */}
      {showForceCheckoutDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  Backend Sync Issue Detected
                </h3>
                <p className="text-slate-500 mt-1 text-sm">
                  Your check-in record exists but the system cannot sync with
                  the server. You can complete your checkout locally to maintain
                  your work record.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleForceCheckoutClose}
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForceCheckout}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                >
                  Force Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Section */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-900">
            You've successfully checked out!
          </span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-2 hover:bg-slate-100 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}
    </StaffDashboardLayout>
  );
};

export default StaffAttendancePage;
