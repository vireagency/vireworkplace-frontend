import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, X, Loader2, Clock } from "lucide-react";
import StaffDashboardMainPage from "../StaffDashboardMainPage";
import { useAuth } from "@/hooks/useAuth";

export default function CheckOut() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  // State management
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showAlreadyCheckedOutDialog, setShowAlreadyCheckedOutDialog] =
    useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [dailySummary, setDailySummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [hasAlreadyCheckedOut, setHasAlreadyCheckedOut] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [showForceCheckoutDialog, setShowForceCheckoutDialog] = useState(false);
  const [backendSyncIssue, setBackendSyncIssue] = useState(false);

  // FIXED: Utility functions for consistent date handling that match check-in component
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

  // FIXED: Get all possible localStorage keys that check-in might have used
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

  // FIXED: Get all possible checkout keys
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

  // Check if current time is after 5:00 PM (17:00) for overtime
  const isCurrentTimeOvertime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return currentHour > 17 || (currentHour === 17 && currentMinute > 0);
  };

  // Calculate overtime hours based on check-in time
  const calculateOvertimeHours = (checkinTime) => {
    if (!checkinTime) return 0;
    
    const now = new Date();
    const checkin = new Date(checkinTime);
    const workStartTime = new Date(checkin);
    workStartTime.setHours(9, 0, 0, 0); // 9:00 AM
    
    const workEndTime = new Date(checkin);
    workEndTime.setHours(17, 0, 0, 0); // 5:00 PM
    
    // If current time is after 5:00 PM, calculate overtime
    if (now > workEndTime) {
      const overtimeMs = now.getTime() - workEndTime.getTime();
      const overtimeHours = overtimeMs / (1000 * 60 * 60); // Convert to hours
      return Math.round(overtimeHours * 10) / 10; // Round to 1 decimal place
    }
    
    return 0;
  };

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

  // FIXED: Enhanced function to find check-in data with better logging
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

  // Check if user has already checked out today
  const checkAttendanceStatus = async () => {
    try {
      setIsCheckingStatus(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // FIXED: Check for checkout status with all possible keys
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
          setHasAlreadyCheckedOut(true);
          setShowMainDialog(false);
          setShowAlreadyCheckedOutDialog(true);
          setIsCheckingStatus(false);
          return;
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
              setHasAlreadyCheckedOut(true);
              setShowMainDialog(false);
              setShowAlreadyCheckedOutDialog(true);
              setIsCheckingStatus(false);
              return;
            }
          } catch (e) {
            console.warn("Error parsing checkout info:", e);
          }
        }
      }

      // FIXED: Use enhanced check-in finder
      const checkinData = findCheckinData();

      if (!checkinData) {
        console.log("No check-in info found in localStorage");
        setError("No check-in record found for today. Please check in first.");
        setShowMainDialog(false);
        setShowErrorDialog(true);
        setIsCheckingStatus(false);
        return;
      }

      console.log("✅ Check-in data found, user can proceed with checkout");

      // Try to check with API if available
      try {
        const response = await fetch(
          "https://vireworkplace-backend-hpca.onrender.com/api/v1/attendance/status",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          console.log("Attendance status API response:", result);

          if (result.data) {
            // Check if user has already checked out
            if (result.data.hasCheckedOut) {
              setHasAlreadyCheckedOut(true);
              setShowMainDialog(false);
              setShowAlreadyCheckedOutDialog(true);
              // Store in localStorage to prevent future API calls
              const todayKey = getTodayKey();
              const todayDateString = getTodayDateString();
              localStorage.setItem(`checkout_${todayKey}`, "true");
              localStorage.setItem(`checkout_${todayDateString}`, "true");
              setIsCheckingStatus(false);
              return;
            }

            // Check if user has checked in
            if (result.data.hasCheckedIn) {
              console.log("✅ User has checked in, can proceed with checkout");
              // Update localStorage with API check-in data if available
              if (result.data.checkInTime) {
                const todayKey = getTodayKey();
                const todayDateString = getTodayDateString();
                const checkinInfo = {
                  date: todayDateString,
                  dateKey: todayKey,
                  timestamp: result.data.checkInTime,
                  workingLocation: result.data.workingLocation || "unknown",
                  apiData: result.data,
                  completed: true
                };
                localStorage.setItem(`checkin_${todayDateString}`, JSON.stringify(checkinInfo));
                localStorage.setItem(`checkin_${todayKey}`, JSON.stringify(checkinInfo));
              }
            } else {
              console.log("❌ User has not checked in today");
              setError("No check-in record found for today. Please check in first.");
              setShowMainDialog(false);
              setShowErrorDialog(true);
              setIsCheckingStatus(false);
              return;
            }
          }
        } else if (response.status === 401 || response.status === 403) {
          clearTokens();
          throw new Error("Session expired. Please log in again.");
        } else {
          console.warn("Attendance status API returned:", response.status);
          // Continue with normal flow - the checkout API will handle validation
        }
      } catch (apiError) {
        console.warn("Attendance status API not available:", apiError);
        // Continue with normal flow
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      // Continue with normal flow if status check fails
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        "https://vireworkplace-backend-hpca.onrender.com/api/v1/user/me",
        {
          method: "GET",
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setUserData(result.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Use fallback data
      const lsFirst =
        localStorage.getItem("signup_firstName") ||
        localStorage.getItem("firstName") ||
        "";
      const lsLast =
        localStorage.getItem("signup_lastName") ||
        localStorage.getItem("lastName") ||
        "";
      const lsEmail =
        localStorage.getItem("signup_email") ||
        localStorage.getItem("email") ||
        "";
      const lsImage = localStorage.getItem("profileImage") || null;
      setUserData({
        firstName: lsFirst,
        lastName: lsLast,
        email: lsEmail,
        profileImage: lsImage,
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const safe = (s) => (typeof s === "string" ? s : "");
    const email = safe(userData?.email);

    const initialsFromEmail = () => {
      if (!email) return "U";
      const local = email.split("@")[0];
      const parts = local.split(/[._-]+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return local.slice(0, 2).toUpperCase() || "U";
    };

    const firstName = safe(userData?.firstName);
    const lastName = safe(userData?.lastName);
    if (firstName || lastName) {
      const fi = firstName ? firstName.trim().charAt(0).toUpperCase() : "";
      const li = lastName ? lastName.trim().charAt(0).toUpperCase() : "";
      return fi + li || fi || initialsFromEmail();
    }

    const name = safe(userData?.name || userData?.fullName);
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2)
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      if (parts[0]?.length >= 2) return parts[0].slice(0, 2).toUpperCase();
    }

    const lsFirst =
      localStorage.getItem("signup_firstName") ||
      localStorage.getItem("firstName") ||
      "";
    const lsLast =
      localStorage.getItem("signup_lastName") ||
      localStorage.getItem("lastName") ||
      "";
    if (lsFirst || lsLast) {
      const fi = lsFirst ? lsFirst.trim().charAt(0).toUpperCase() : "";
      const li = lsLast ? lsLast.trim().charAt(0).toUpperCase() : "";
      return fi + li || fi;
    }

    return initialsFromEmail();
  };

  // Get profile image URL with proper fallback
  const getProfileImageUrl = () => {
    const url =
      userData?.profileImage ||
      userData?.profilePicture ||
      userData?.avatar ||
      userData?.avatarUrl ||
      userData?.photoUrl ||
      userData?.image ||
      userData?.picture ||
      null;

    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `https://vireworkplace-backend-hpca.onrender.com${url}`;
  };

  // Handle profile image load error
  const handleImageError = (e) => {
    console.log("Profile image failed to load, using fallback");
    e.target.style.display = "none";
  };

  // Fetch user data on component mount
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || (user.name ? user.name.split(" ")[0] : ""),
        lastName:
          user.lastName || (user.name ? user.name.split(" ")[1] || "" : ""),
        email: user.email || "",
        profileImage:
          user.profileImage ||
          user.avatar ||
          user.photoUrl ||
          user.image ||
          user.picture ||
          null,
      });
      setIsLoadingUser(false);
      checkAttendanceStatus();
      return;
    }
    fetchUserData();
  }, [user]);

  // Check attendance status when user data is loaded
  useEffect(() => {
    if (userData && !isLoadingUser) {
      checkAttendanceStatus();
    }
  }, [userData, isLoadingUser]);

  // Update time every second
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

  // API call to check out
  const checkOutToAPI = async (dailySummary) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const requestBody = {
        dailySummary: dailySummary || "No summary provided",
      };

      // FIXED: Use enhanced check-in finder for debugging
      const checkinData = findCheckinData();

      console.log("=== CHECKOUT DEBUG INFO ===");
      console.log("Today key (YYYY-MM-DD):", getTodayKey());
      console.log("Today date string:", getTodayDateString());
      console.log("Current timezone offset:", new Date().getTimezoneOffset());
      console.log("Found check-in data:", checkinData);
      console.log("=== END DEBUG INFO ===");

      console.log("Making checkout API call:", {
        url: "https://vireworkplace-backend-hpca.onrender.com/api/v1/attendance/checkout",
        method: "PATCH",
        body: requestBody,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 20)}...` : "No token",
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log("API call timed out after 30 seconds");
        controller.abort();
      }, 30000);

      const response = await fetch(
        "https://vireworkplace-backend-hpca.onrender.com/api/v1/attendance/checkout",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      console.log("Checkout API response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          clearTokens();
          throw new Error("Session expired. Please log in again.");
        }

        if (response.status === 400) {
          const errorData = await response.json();
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

        if (response.status === 404) {
          // FIXED: Better handling of 404 error with check-in info
          if (checkinData) {
            console.log(
              "404 error but check-in found in localStorage, backend sync issue"
            );
            throw new Error(
              "Backend data sync issue detected. You appear to be checked in, but the system cannot find your check-in record. Please contact support or try again later."
            );
          } else {
            throw new Error(
              "No check-in found for today. Please check in first."
            );
          }
        }

        if (response.status === 500) {
          throw new Error("Internal server error. Please try again later.");
        }

        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Checkout API response data:", data);

      if (data.success !== true) {
        throw new Error("Unexpected response format");
      }

      // Check if the response indicates overtime
      if (
        data.attendanceData &&
        data.attendanceData.overtimeHours &&
        data.attendanceData.overtimeHours > 0
      ) {
        setIsOvertime(true);
        console.log("Overtime detected from API:", data.attendanceData.overtimeHours, "hours");
      }

      // Also check current time for overtime
      const currentTimeOvertime = isCurrentTimeOvertime();
      if (currentTimeOvertime) {
        setIsOvertime(true);
        console.log("Overtime detected from current time");
      }

      return data;
    } catch (error) {
      console.error("Checkout API error:", error);

      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout. Please check your internet connection and try again."
        );
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }

      throw error;
    }
  };

  // Handle check out
  const handleCheckOut = async () => {
    console.log("handleCheckOut called with dailySummary:", dailySummary);

    if (!dailySummary.trim()) {
      setError("Please provide a daily summary before checking out.");
      setShowMainDialog(false);
      setShowErrorDialog(true);
      return;
    }

    console.log("Starting checkout process...");
    setIsLoading(true);
    setError("");

    // FIXED: Use enhanced check-in finder
    const checkinData = findCheckinData();

    if (!checkinData) {
      console.log("No check-in info found in localStorage");
      setError("No check-in record found for today. Please check in first.");
      setIsLoading(false);
      setShowMainDialog(false);
      setShowErrorDialog(true);
      return;
    }

    console.log("Check-in info found, proceeding with checkout");

    try {
      console.log("Calling checkOutToAPI...");
      const result = await checkOutToAPI(dailySummary);
      console.log("checkOutToAPI completed successfully:", result);

      // FIXED: Store checkout status with all possible keys for consistency
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
        dailySummary: dailySummary,
        completed: true,
        apiResponse: result,
      };

      localStorage.setItem(
        `checkout_info_${todayKey}`,
        JSON.stringify(checkoutInfo)
      );
      localStorage.setItem(
        `checkout_info_${todayDateString}`,
        JSON.stringify(checkoutInfo)
      );

      console.log("Checkout successful, stored in localStorage:", checkoutInfo);

      setShowMainDialog(false);

      // Check if overtime was detected
      const hasOvertimeFromAPI =
        result.attendanceData &&
        result.attendanceData.overtimeHours &&
        result.attendanceData.overtimeHours > 0;

      const hasOvertimeFromTime = isCurrentTimeOvertime();

      console.log("Overtime check:", {
        hasOvertimeFromAPI,
        hasOvertimeFromTime,
        currentTime: new Date().toLocaleTimeString(),
        overtimeHours: result.attendanceData?.overtimeHours,
      });

      if (hasOvertimeFromAPI || hasOvertimeFromTime) {
        console.log("Showing overtime warning dialog");
        setShowOvertimeDialog(true);
      } else {
        console.log("Normal checkout, showing success toast");
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate("/staff/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Check-out error:", error);

      // Handle already checked out scenario
      if (error.message === "ALREADY_CHECKED_OUT") {
        console.log("User has already checked out (from API error)");
        setShowMainDialog(false);
        setShowAlreadyCheckedOutDialog(true);
        return;
      }

      // Handle backend sync issue
      if (error.message && error.message.includes("Backend data sync issue")) {
        console.log("Backend sync issue detected");
        setBackendSyncIssue(true);
        setShowMainDialog(false);
        setShowForceCheckoutDialog(true);
        return;
      }

      setError(error.message);
      setShowMainDialog(false);
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel action
  const handleCancel = () => {
    navigate("/staff");
  };

  // Handle overtime dialog close
  const handleOvertimeClose = () => {
    setShowOvertimeDialog(false);
    navigate("/staff");
  };

  // Handle error dialog retry
  const handleTryAgain = () => {
    setShowErrorDialog(false);
    setShowMainDialog(true);
    setError("");
  };

  // Handle error dialog discard
  const handleDiscard = () => {
    setShowErrorDialog(false);
    navigate("/staff");
  };

  // Handle already checked out dialog close
  const handleAlreadyCheckedOutClose = () => {
    setShowAlreadyCheckedOutDialog(false);
    navigate("/staff/dashboard");
  };

  // Handle force checkout (when backend sync fails)
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
        navigate("/staff/dashboard");
      }, 2000);
    }
  };

  // Handle force checkout dialog close
  const handleForceCheckoutClose = () => {
    setShowForceCheckoutDialog(false);
    setBackendSyncIssue(false);
    navigate("/staff");
  };

  if (isLoadingUser || isCheckingStatus) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">
            {isLoadingUser ? "Loading..." : "Checking attendance status..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Blurred Dashboard Background */}
      <div className="absolute inset-0 blur-sm opacity-60">
        <StaffDashboardMainPage />
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main Check-Out Dialog */}
      {showMainDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-6">
              {/* Header Section - Avatar and Time */}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium relative overflow-hidden"
                  disabled={isLoading || !dailySummary.trim()}
                >
                  {isLoading ? (
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
                  You checked out after 5:00 PM. Your overtime has been recorded and HR has been notified.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                  <div className="text-sm text-yellow-800">
                    <div className="font-medium">Check-out Time: {currentTime}</div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
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
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
    </div>
  );
}
