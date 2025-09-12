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
  const [currentTime, setCurrentTime] = useState("");
  const [dailySummary, setDailySummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);

      // Get auth token from multiple possible sources
      let token =
        accessToken ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("access_token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(
        "https://www.api.vire.agency/api/v1/user/me",
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
          // Clear invalid token and redirect to login
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("access_token");
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
      // Use fallback data for demo purposes
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

  // Get user initials for avatar fallback with proper fallback logic
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

    // If the URL is already complete, return it
    if (url.startsWith("http")) {
      return url;
    }

    // If it's a relative URL, construct the full URL
    return `https://www.api.vire.agency${url}`;
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
      return;
    }
    fetchUserData();
  }, [user]);

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
      // Get auth token from multiple possible sources
      let token =
        localStorage.getItem("authToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("authToken") ||
        sessionStorage.getItem("token") ||
        sessionStorage.getItem("access_token");

      // If no token found, throw an error
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const requestBody = {
        dailySummary: dailySummary || "No summary provided",
      };

      const response = await fetch(
        "https://www.api.vire.agency/api/v1/attendance/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401 || response.status === 403) {
          // Clear invalid token and redirect to login
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("authToken");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("access_token");
          throw new Error("Session expired. Please log in again.");
        }

        if (response.status === 400) {
          throw new Error(
            "Already checked out or no check-in found for today."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "No check-in found for today. Please check in first."
          );
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

      // Check if the response indicates overtime
      if (
        data.attendanceData &&
        data.attendanceData.overtimeHours &&
        data.attendanceData.overtimeHours > 0
      ) {
        setIsOvertime(true);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle check out
  const handleCheckOut = async () => {
    if (!dailySummary.trim()) {
      setError("Please provide a daily summary before checking out.");
      setShowMainDialog(false);
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await checkOutToAPI(dailySummary);

      setShowMainDialog(false);

      // Check if overtime was detected from API response
      if (
        result.attendanceData &&
        result.attendanceData.overtimeHours &&
        result.attendanceData.overtimeHours > 0
      ) {
        setShowOvertimeDialog(true);
      } else {
        setShowSuccessToast(true);
        setTimeout(() => {
          setShowSuccessToast(false);
          navigate("/staff/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Check-out error:", error);
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
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      navigate("/staff/dashboard");
    }, 2000);
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

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading...</p>
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

      {/* Overtime Warning Dialog - Matching Figma Design */}
      {showOvertimeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
            <div className="p-8 space-y-6 text-center">
              {/* Warning Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900">
                  Overtime Detected
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  You have worked overtime today. HR has been notified.
                </p>
              </div>

              {/* Close Button */}
              <div className="pt-2">
                <Button
                  onClick={handleOvertimeClose}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 font-medium"
                >
                  Close
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
