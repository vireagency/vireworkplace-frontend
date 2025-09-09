import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import StaffDashboardPage from "../StaffDashboard";

export default function CheckOut() {
  const navigate = useNavigate();

  // State management
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [dayReport, setDayReport] = useState("");

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

  // Handle check out
  const handleCheckOut = () => {
    // Simulate overtime check - if current hour is after 6 PM, show overtime warning
    const currentHour = new Date().getHours();
    if (currentHour >= 18) {
      // 6 PM or later
      setShowMainDialog(false);
      setShowOvertimeDialog(true);
    } else {
      setShowMainDialog(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/staff/dashboard");
      }, 2000);
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

  return (
    <div className="relative min-h-screen">
      {/* Blurred Dashboard Background */}
      <div className="absolute inset-0 blur-sm opacity-60">
        <StaffDashboardPage />
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
                  <div className="text-sm font-medium text-gray-600">
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
                  Tell us about your day. We will like to know what tasks you
                  did.
                </div>
                <Textarea
                  placeholder="Write here ....."
                  value={dayReport}
                  onChange={(e) => setDayReport(e.target.value)}
                  className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons Section */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckOut}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Check Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overtime Warning Dialog */}
      {showOvertimeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Overtime Warning
                </h3>
                <p className="text-gray-500 text-sm">
                  You checked out at late hours. HR has been informed
                </p>
              </div>
              <div className="pt-2">
                <Button
                  onClick={handleOvertimeClose}
                  className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  Close
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
