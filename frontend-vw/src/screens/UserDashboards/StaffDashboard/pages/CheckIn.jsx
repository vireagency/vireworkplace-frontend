import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle, X } from "lucide-react";
import StaffDashboardPage from "../StaffDashboard";

export default function CheckIn() {
  const navigate = useNavigate();

  // State management
  const [selectedLocation, setSelectedLocation] = useState("office");
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

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

  // Handle location selection and check-in
  const handleCheckIn = () => {
    if (selectedLocation === "office") {
      setShowMainDialog(false);
      setShowErrorDialog(true);
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

  // Handle error dialog retry
  const handleTryAgain = () => {
    setShowErrorDialog(false);
    setShowMainDialog(true);
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
        <StaffDashboardPage />
      </div>

      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Main Check-In Dialog */}
      {showMainDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-6">
              {/* Header Section - Avatar and Time */}
              <div className="flex items-center justify-between">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-amber-600 text-white text-lg font-semibold">
                    👤
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-600">
                    Reporting Time:
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {currentTime}
                  </div>
                </div>
              </div>

              {/* Location Options Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  Choose your location for today
                </div>
                <RadioGroup
                  value={selectedLocation}
                  onValueChange={setSelectedLocation}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                    <RadioGroupItem
                      value="office"
                      id="office"
                      className="text-blue-600"
                    />
                    <Label
                      htmlFor="office"
                      className="flex-1 cursor-pointer font-medium text-gray-900"
                    >
                      Office (In-person)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg bg-white">
                    <RadioGroupItem value="remote" id="remote" />
                    <Label
                      htmlFor="remote"
                      className="flex-1 cursor-pointer font-medium text-gray-400"
                    >
                      Home (Remote)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons Section */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Check In
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
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Office check-in requires being on location.
                </h3>
                <p className="text-gray-500 mt-1">
                  Couldn't check in. Please try again.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Discard
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
          <span className="font-medium">You've successfully checked in!</span>
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
