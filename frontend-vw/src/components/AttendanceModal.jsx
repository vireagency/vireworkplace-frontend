import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  X,
  MapPin,
  Loader2,
  Info,
  Clock,
  Home,
  Building,
  LogIn,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import axios from "axios";

// Office location configuration
const OFFICE = {
  lat: 5.767477,
  lng: -0.180019,
  radius: 50, // meters - stricter radius for better security
};

// API Configuration
const API_BASE_URL = "https://vireworkplace-backend-hpca.onrender.com/api/v1";

// Calculate distance between two points using Haversine formula
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Create axios instance with default config
const createApiClient = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 30000, // 30 seconds timeout
  });
};

export default function AttendanceModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // UI state
  const [workLocation, setWorkLocation] = useState("office");
  const [showDialog, setShowDialog] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [time, setTime] = useState("");
  const [dailySummary, setDailySummary] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Error states
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState(null);

  // Location state
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationValid, setLocationValid] = useState(false);
  const [atOffice, setAtOffice] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("prompt");

  // User data and attendance status
  const [userData, setUserData] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // CheckOut.jsx modal states
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [showAlreadyCheckedOutDialog, setShowAlreadyCheckedOutDialog] =
    useState(false);
  const [isOvertime, setIsOvertime] = useState(false);
  const [hasAlreadyCheckedOut, setHasAlreadyCheckedOut] = useState(false);
  const [showForceCheckoutDialog, setShowForceCheckoutDialog] = useState(false);
  const [backendSyncIssue, setBackendSyncIssue] = useState(false);

  // Get authentication token from various sources
  const getAuthToken = () => {
    return (
      accessToken ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("authToken") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("access_token")
    );
  };

  // Clear all stored tokens
  const clearTokens = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("access_token");
  };

  // Utility functions for date handling (from CheckOut.jsx)
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

  const getAllPossibleCheckinKeys = () => {
    const todayKey = getTodayKey();
    const todayDateString = getTodayDateString();
    const now = new Date();

    const isoDate = now.toISOString().split("T")[0];
    const localDateString = now.toLocaleDateString();

    return [
      `checkin_${todayKey}`,
      `checkin_${todayDateString}`,
      `checkin_${isoDate}`,
      `checkin_${localDateString}`,
      `checkin_info_${todayKey}`,
      `checkin_info_${todayDateString}`,
      `attendance_${todayKey}`,
      `attendance_${todayDateString}`,
    ];
  };

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

  const isCurrentTimeOvertime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return currentHour > 17 || (currentHour === 17 && currentMinute > 0);
  };

  const findCheckinData = () => {
    const allCheckinKeys = getAllPossibleCheckinKeys();

    for (const key of allCheckinKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsed = JSON.parse(data);
          return { key, data: parsed };
        } catch (e) {
          return { key, data: true };
        }
      }
    }
    return null;
  };

  const checkIfAlreadyCheckedOut = () => {
    const checkoutKeys = getAllPossibleCheckoutKeys();

    for (const key of checkoutKeys) {
      const hasCheckedOut = localStorage.getItem(key);
      if (hasCheckedOut === "true" || hasCheckedOut) {
        return true;
      }
    }

    for (const key of checkoutKeys) {
      const checkoutInfo = localStorage.getItem(key);
      if (checkoutInfo) {
        try {
          const parsed = JSON.parse(checkoutInfo);
          if (parsed && (parsed.completed || parsed.timestamp)) {
            return true;
          }
        } catch (e) {
          console.warn("Error parsing checkout info:", e);
        }
      }
    }

    return false;
  };

  // Fetch user profile data
  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("Please log in again");
      }

      const response = await fetch(
        "https://vireworkplace-backend-hpca.onrender.com/api/v1/user/me",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearTokens();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setUserData(result.data);
      } else {
        throw new Error("Invalid response");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setUserData({
        firstName:
          localStorage.getItem("signup_firstName") ||
          localStorage.getItem("firstName") ||
          "",
        lastName:
          localStorage.getItem("signup_lastName") ||
          localStorage.getItem("lastName") ||
          "",
        email:
          localStorage.getItem("signup_email") ||
          localStorage.getItem("email") ||
          "",
        profileImage: localStorage.getItem("profileImage") || null,
      });
    } finally {
      setLoadingUser(false);
    }
  };

  // Generate user initials for avatar
  const getUserInitials = () => {
    const { firstName, lastName, email } = userData || {};

    if (firstName || lastName) {
      const first = firstName?.charAt(0)?.toUpperCase() || "";
      const last = lastName?.charAt(0)?.toUpperCase() || "";
      return first + last || first || "U";
    }

    if (email) {
      const local = email.split("@")[0];
      const parts = local.split(/[._-]+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return local.slice(0, 2).toUpperCase() || "U";
    }

    return "U";
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    const url =
      userData?.profileImage || userData?.profilePicture || userData?.avatar;
    if (!url) return null;
    return url.startsWith("http")
      ? url
      : `https://vireworkplace-backend-hpca.onrender.com${url}`;
  };

  const handleImageError = (e) => {
    e.target.style.display = "none";
  };

  // Update time display
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
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

  // Check current attendance status
  const checkAttendanceStatus = async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again");
    }

    try {
      const apiClient = createApiClient(token);
      const response = await apiClient.get("/attendance/status");

      console.log("Attendance status:", response.data);
      setAttendanceStatus(response.data);

      // Check if user is already checked in
      const checkedIn =
        response.data?.data?.hasCheckedIn ||
        response.data?.data?.status === "Active" ||
        response.data?.data?.status === "Checked In";
      setIsCheckedIn(checkedIn);

      return response.data;
    } catch (error) {
      console.warn("Error checking attendance status:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      }
      return null;
    }
  };

  // Initialize user data and check attendance status when modal opens
  useEffect(() => {
    if (isOpen) {
      const initializeComponent = async () => {
        try {
          setCheckingStatus(true);

          if (user) {
            setUserData({
              firstName:
                user.firstName || (user.name ? user.name.split(" ")[0] : ""),
              lastName:
                user.lastName ||
                (user.name ? user.name.split(" ")[1] || "" : ""),
              email: user.email || "",
              profileImage:
                user.profileImage || user.avatar || user.photoUrl || null,
            });
            setLoadingUser(false);
          } else {
            await fetchUserData();
          }

          // Check attendance status after user data is loaded
          try {
            await checkAttendanceStatus();
          } catch (error) {
            console.warn("Could not check attendance status:", error);
            // Continue with normal flow
          }
        } catch (error) {
          console.error("Initialization error:", error);
          toast.error("Failed to initialize. Please refresh the page.");
        } finally {
          setCheckingStatus(false);
        }
      };

      initializeComponent();
    }
  }, [isOpen, user]);

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = "Geolocation not supported";
        setLocationError(error);
        reject(new Error(error));
        return;
      }

      setGettingLocation(true);
      setLocationError(null);
      setLocationValid(false);
      setAtOffice(false);
      setLocation({ lat: null, lng: null });

      const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      };

      toast.info("Getting your location...", { duration: 2000 });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const distance = getDistance(
            latitude,
            longitude,
            OFFICE.lat,
            OFFICE.lng
          );

          const locationData = {
            lat: latitude,
            lng: longitude,
            accuracy,
            distance,
          };

          setLocation(locationData);
          setGettingLocation(false);
          setLocationValid(true);
          setLocationError(null);

          if (workLocation === "office") {
            const withinRange = distance <= OFFICE.radius;
            setAtOffice(withinRange);

            if (!withinRange) {
              toast.error(
                `You are ${Math.round(
                  distance
                )}m from office. You must be within ${
                  OFFICE.radius
                }m to check in.`
              );
              setLocationError(
                `You are ${Math.round(
                  distance
                )}m from office. You must be within ${
                  OFFICE.radius
                }m to check in.`
              );
              reject(
                new Error(
                  `Location validation failed: You are ${Math.round(
                    distance
                  )}m from office. You must be within ${
                    OFFICE.radius
                  }m to check in.`
                )
              );
              return;
            } else {
              toast.success(
                `Location verified! You're ${Math.round(
                  distance
                )}m from office.`
              );
            }
          }

          resolve(locationData);
        },
        (error) => {
          setGettingLocation(false);
          setLocationValid(false);
          setAtOffice(false);

          let errorMessage = "Unable to get your location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              setPermissionStatus("denied");
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location unavailable. Please ensure GPS is enabled.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage = "Unknown location error occurred.";
              break;
          }

          setLocationError(errorMessage);
          toast.error(errorMessage);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Handle work location selection
  const handleLocationSelection = (locationType) => {
    if (loading || gettingLocation) return;

    setWorkLocation(locationType);
    setLocationError(null);
    setAtOffice(false);

    if (locationType === "remote") {
      setLocation({ lat: null, lng: null });
      setLocationValid(false);
      setLocationError(null);
    }
  };

  // Submit check-in to API
  const submitCheckIn = async (workingLocation, lat = null, lng = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again");
    }

    const requestBody = { workingLocation };

    if (workingLocation === "office" && lat !== null && lng !== null) {
      requestBody.latitude = lat;
      requestBody.longitude = lng;
    }

    try {
      const apiClient = createApiClient(token);
      const response = await apiClient.post("/attendance/checkin", requestBody);

      if (response.data.success !== true) {
        throw new Error("Unexpected response format");
      }

      // Store check-in info in localStorage
      const today = new Date().toDateString();
      const todayKey = new Date().toISOString().split("T")[0];
      const now = new Date();

      const checkinInfo = {
        date: today,
        dateKey: todayKey,
        timestamp: now.toISOString(),
        timezoneOffset: now.getTimezoneOffset(),
        workingLocation: workingLocation,
        latitude: lat,
        longitude: lng,
        response: response.data,
        attendanceData: response.data.attendanceData,
        late: response.data.late || false,
        user: response.data.user,
        completed: true,
      };

      localStorage.setItem(`checkin_${today}`, JSON.stringify(checkinInfo));
      localStorage.setItem(`checkin_${todayKey}`, JSON.stringify(checkinInfo));
      localStorage.setItem(
        `checkin_info_${today}`,
        JSON.stringify(checkinInfo)
      );
      localStorage.setItem(
        `checkin_info_${todayKey}`,
        JSON.stringify(checkinInfo)
      );

      return response.data;
    } catch (error) {
      console.error("Check-in API error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      }

      if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || "Invalid request";

        if (
          errorMsg.toLowerCase().includes("location") ||
          errorMsg.toLowerCase().includes("office") ||
          errorMsg.toLowerCase().includes("geofence")
        ) {
          throw new Error(
            "Office check-in requires being at the office location. Please ensure you are within the office premises and try again."
          );
        }

        if (errorMsg.toLowerCase().includes("already checked in")) {
          throw new Error("You have already checked in for today.");
        }

        throw new Error(errorMsg);
      }

      if (error.code === "ECONNABORTED") {
        throw new Error(
          "Request timed out. Please check your internet connection and try again."
        );
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Check-in failed. Please try again."
      );
    }
  };

  // Submit check-out to API (from CheckOut.jsx)
  const submitCheckOut = async (dailySummary) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again");
    }

    const requestBody = {
      dailySummary: dailySummary || "No summary provided",
    };

    try {
      const apiClient = createApiClient(token);
      const response = await apiClient.patch(
        "/attendance/checkout",
        requestBody
      );

      if (response.data.success !== true) {
        throw new Error("Unexpected response format");
      }

      // Store checkout status in localStorage
      const todayKey = getTodayKey();
      const todayDateString = getTodayDateString();

      localStorage.setItem(`checkout_${todayKey}`, "true");
      localStorage.setItem(`checkout_${todayDateString}`, "true");

      const checkoutInfo = {
        date: todayKey,
        dateString: todayDateString,
        timestamp: new Date().toISOString(),
        dailySummary: dailySummary,
        completed: true,
        apiResponse: response.data,
      };

      localStorage.setItem(
        `checkout_info_${todayKey}`,
        JSON.stringify(checkoutInfo)
      );
      localStorage.setItem(
        `checkout_info_${todayDateString}`,
        JSON.stringify(checkoutInfo)
      );

      return response.data;
    } catch (error) {
      console.error("Checkout API error:", error);

      if (error.response?.status === 401 || error.response?.status === 403) {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      }

      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (
          errorData.message &&
          errorData.message.toLowerCase().includes("already checked out")
        ) {
          throw new Error("ALREADY_CHECKED_OUT");
        }
        throw new Error(
          errorData.message ||
            "Already checked out or no check-in found for today."
        );
      }

      if (error.response?.status === 404) {
        const checkinData = findCheckinData();
        if (checkinData) {
          throw new Error(
            "Backend data sync issue detected. You appear to be checked in, but the system cannot find your check-in record. Please contact support or try again later."
          );
        } else {
          throw new Error(
            "No check-in found for today. Please check in first."
          );
        }
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Check-out failed. Please try again."
      );
    }
  };

  // Handle check-in process
  const handleCheckIn = async () => {
    setLoading(true);
    setError("");

    try {
      if (workLocation === "office") {
        try {
          const userLocation = await getCurrentLocation();
          await submitCheckIn("office", userLocation.lat, userLocation.lng);
        } catch (locationError) {
          console.error("Location validation failed:", locationError);
          throw new Error(
            locationError.message ||
              "Location validation failed. Please ensure you are at the office location."
          );
        }
      } else {
        await submitCheckIn("remote");
      }

      setShowDialog(false);
      setShowSuccess(true);
      toast.success("Successfully checked in!");
      setIsCheckedIn(true);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Check-in failed:", error);

      if (
        error.message &&
        error.message.toLowerCase().includes("already checked in")
      ) {
        toast.info("You are already checked in for today!");
        setShowDialog(false);
        setTimeout(() => {
          onClose();
        }, 1000);
        return;
      }

      setError(error.message);
      setShowDialog(false);
      setShowError(true);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle check-out process (from CheckOut.jsx)
  const handleCheckOut = async () => {
    if (!dailySummary.trim()) {
      setError("Please provide a daily summary before checking out.");
      setShowDialog(false);
      setShowError(true);
      return;
    }

    setLoading(true);
    setError("");

    const checkinData = findCheckinData();
    if (!checkinData) {
      setError("No check-in record found for today. Please check in first.");
      setLoading(false);
      setShowDialog(false);
      setShowError(true);
      return;
    }

    try {
      const result = await submitCheckOut(dailySummary);

      setShowDialog(false);

      // Check if overtime was detected
      const hasOvertimeFromAPI =
        result.attendanceData &&
        result.attendanceData.overtimeHours &&
        result.attendanceData.overtimeHours > 0;

      const hasOvertimeFromTime = isCurrentTimeOvertime();

      if (hasOvertimeFromAPI || hasOvertimeFromTime) {
        setShowOvertimeDialog(true);
      } else {
        setShowSuccess(true);
        toast.success("Successfully checked out!");
        setIsCheckedIn(false);

        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }

      setDailySummary("");
    } catch (error) {
      console.error("Check-out error:", error);

      if (error.message === "ALREADY_CHECKED_OUT") {
        setShowDialog(false);
        setShowAlreadyCheckedOutDialog(true);
        return;
      }

      if (error.message && error.message.includes("Backend data sync issue")) {
        setBackendSyncIssue(true);
        setShowDialog(false);
        setShowForceCheckoutDialog(true);
        return;
      }

      setError(error.message);
      setShowDialog(false);
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions (from CheckOut.jsx)
  const handleCancel = () => {
    setShowDialog(false);
    onClose();
  };

  const handleOvertimeClose = () => {
    setShowOvertimeDialog(false);
    setIsCheckedIn(false);
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  const handleTryAgain = () => {
    setShowError(false);
    setShowDialog(true);
    setError("");
    setLocationError(null);
    setLocationValid(false);
    setAtOffice(false);
  };

  const handleDiscard = () => {
    setShowError(false);
    onClose();
  };

  const handleAlreadyCheckedOutClose = () => {
    setShowAlreadyCheckedOutDialog(false);
    onClose();
  };

  const handleForceCheckout = () => {
    const todayKey = getTodayKey();
    const todayDateString = getTodayDateString();

    localStorage.setItem(`checkout_${todayKey}`, "true");
    localStorage.setItem(`checkout_${todayDateString}`, "true");

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

    setShowForceCheckoutDialog(false);

    const hasOvertimeFromTime = isCurrentTimeOvertime();

    if (hasOvertimeFromTime) {
      setShowOvertimeDialog(true);
    } else {
      setShowSuccess(true);
      toast.success("Successfully checked out!");
      setIsCheckedIn(false);

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    }
  };

  const handleForceCheckoutClose = () => {
    setShowForceCheckoutDialog(false);
    setBackendSyncIssue(false);
    onClose();
  };

  // Show dialog when modal is opened
  useEffect(() => {
    if (isOpen) {
      setShowDialog(true);
    } else {
      setShowDialog(false);
      setShowError(false);
      setShowSuccess(false);
      setShowOvertimeDialog(false);
      setShowAlreadyCheckedOutDialog(false);
      setShowForceCheckoutDialog(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loadingUser || checkingStatus) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">
            {checkingStatus ? "Checking attendance status..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      {/* Main Dialog */}
      {showDialog && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
          <div className="p-6 space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={getProfileImageUrl()}
                  alt={`${userData?.firstName || "User"} ${
                    userData?.lastName || ""
                  }`}
                  onError={handleImageError}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <div className="text-sm font-medium text-slate-600 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {isCheckedIn ? "Closing Time:" : "Reporting Time:"}
                </div>
                <div className="text-lg font-bold text-slate-900">{time}</div>
              </div>
            </div>

            {/* Check-out Summary Section */}
            {isCheckedIn && (
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
                  disabled={loading}
                  required
                />
                {dailySummary.length > 0 && (
                  <div className="text-xs text-slate-500 text-right">
                    {dailySummary.length} characters
                  </div>
                )}
              </div>
            )}

            {/* Location Options Section (only for check-in) */}
            {!isCheckedIn && (
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-700">
                  Choose your location for today
                </div>
                <div className="space-y-3">
                  <div
                    onClick={() => handleLocationSelection("office")}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      workLocation === "office"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Building
                        className={`w-5 h-5 ${
                          workLocation === "office"
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      />
                      <div>
                        <Label
                          className={`cursor-pointer font-medium ${
                            workLocation === "office"
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          Office (In-person)
                        </Label>
                        {workLocation === "office" && (
                          <div className="text-xs text-slate-500 mt-1">
                            Location will be verified on check-in
                          </div>
                        )}
                      </div>
                    </div>
                    {workLocation === "office" && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => handleLocationSelection("remote")}
                    className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      workLocation === "remote"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Home
                        className={`w-5 h-5 ${
                          workLocation === "remote"
                            ? "text-blue-600"
                            : "text-slate-500"
                        }`}
                      />
                      <div>
                        <Label
                          className={`cursor-pointer font-medium ${
                            workLocation === "remote"
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          Home (Remote)
                        </Label>
                        {workLocation === "remote" && (
                          <div className="text-xs text-slate-500 mt-1">
                            No location verification needed
                          </div>
                        )}
                      </div>
                    </div>
                    {workLocation === "remote" && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Location Status (only for check-in) */}
            {!isCheckedIn && gettingLocation && (
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying your location...
              </div>
            )}

            {!isCheckedIn && workLocation === "office" && atOffice && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4" />
                Location verified - you're at the office!
              </div>
            )}

            {!isCheckedIn &&
              workLocation === "office" &&
              locationError &&
              permissionStatus === "denied" && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">
                      Location Permission Required
                    </div>
                    <div>
                      Please enable location permissions in your browser
                      settings
                    </div>
                  </div>
                </div>
              )}

            {!isCheckedIn &&
              workLocation === "office" &&
              locationValid &&
              location.distance && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">
                  <Info className="w-3 h-3" />
                  Distance from office: {Math.round(location.distance)}m
                  {location.accuracy &&
                    ` (±${Math.round(location.accuracy)}m accuracy)`}
                </div>
              )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                disabled={loading || gettingLocation}
              >
                Cancel
              </Button>
              <Button
                onClick={isCheckedIn ? handleCheckOut : handleCheckIn}
                className={`flex-1 font-medium ${
                  isCheckedIn
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={loading || gettingLocation}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                      <span className="text-sm">
                        {isCheckedIn ? "Checking Out..." : "Checking In..."}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isCheckedIn ? (
                      <>
                        <LogOut className="w-4 h-4" />
                        Check Out
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Check In
                      </>
                    )}
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      {showError && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4">
          <div className="p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-900 mb-2">
                {isCheckedIn ? "Check-out Failed" : "Check-in Failed"}
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
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
      )}

      {/* Overtime Warning Dialog */}
      {showOvertimeDialog && (
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
                  <div className="font-medium">Check-out Time: {time}</div>
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
      )}

      {/* Already Checked Out Dialog */}
      {showAlreadyCheckedOutDialog && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
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
      )}

      {/* Force Checkout Dialog */}
      {showForceCheckoutDialog && (
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
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
                Your check-in record exists but the system cannot sync with the
                server. You can complete your checkout locally to maintain your
                work record.
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
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-900">
            You've successfully {isCheckedIn ? "checked out" : "checked in"}!
          </span>
          <button
            onClick={() => setShowSuccess(false)}
            className="ml-2 hover:bg-slate-100 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}
    </div>
  );
}
