import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, X, Loader2, Clock } from "lucide-react";
import StaffDashboardMainPage from "../StaffDashboardMainPage";

export default function CheckOut() {
  const navigate = useNavigate();

  // State management
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [dayReport, setDayReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOvertime, setIsOvertime] = useState(false);

  // This would come from user context/auth in a real app
  const [userProfileImage, setUserProfileImage] = useState("/assets/staff.png");

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
  const checkOutToAPI = async (workSummary) => {
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
        workSummary: workSummary || "No summary provided",
      };

      const response = await fetch(
        "https://www.api.vire.agency/api/v1/attendance/checkout",
        {
          method: "PATCH",
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

        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();

      // Check if the response indicates overtime
      if (data.overtimeHours && data.overtimeHours > 0) {
        setIsOvertime(true);
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle check out
  const handleCheckOut = async () => {
    if (!dayReport.trim()) {
      setError("Please provide a work summary before checking out.");
      setShowMainDialog(false);
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await checkOutToAPI(dayReport);

      setShowMainDialog(false);

      // Check if overtime was detected from API response or time-based logic
      const currentHour = new Date().getHours();
      const isLateCheckout = currentHour >= 18; // 6 PM or later

      if (
        isOvertime ||
        isLateCheckout ||
        (result.overtimeHours && result.overtimeHours > 0)
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
                  <AvatarImage src={userProfileImage} alt="User Profile" />
                  <AvatarFallback className="bg-gray-800 text-white">
                    👤
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Closing Time:
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {currentTime}
                  </div>
                </div>
              </div>

              {/* Day Report Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Tell us about your day. We would like to know what tasks you
                  completed.
                  <span className="text-red-500 ml-1">*</span>
                </div>
                <Textarea
                  placeholder="Write here ....."
                  value={dayReport}
                  onChange={(e) => setDayReport(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  required
                />
                {dayReport.length > 0 && (
                  <div className="text-xs text-gray-500 text-right">
                    {dayReport.length} characters
                  </div>
                )}
              </div>

              {/* Action Buttons Section */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  disabled={isLoading || !dayReport.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking Out...
                    </>
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
                <h3 className="text-xl font-semibold text-gray-900">
                  Overtime Warning
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You checked out at late hours. HR has been informed
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
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Check-out Failed
                </h3>
                <p className="text-gray-500 mt-1 text-sm">
                  {error || "Something went wrong. Please try again."}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTryAgain}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
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
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 transform transition-transform duration-300 ease-in-out">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">You've successfully checked out!</span>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="ml-2 hover:bg-green-700 rounded p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
