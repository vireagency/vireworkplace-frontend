import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle, X, MapPin, Loader2 } from "lucide-react";
import StaffDashboardMainPage from "../StaffDashboardMainPage";

export default function CheckIn() {
  const navigate = useNavigate();

  // State management
  const [selectedLocation, setSelectedLocation] = useState("office");
  const [showMainDialog, setShowMainDialog] = useState(true);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState({ latitude: null, longitude: null });

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

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setIsGettingLocation(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setIsGettingLocation(false);
          resolve({ latitude, longitude });
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = "Unable to get your location";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage =
                "An unknown error occurred while retrieving location.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // API call to check in
  const checkInToAPI = async (
    workingLocation,
    latitude = null,
    longitude = null
  ) => {
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
        workingLocation: workingLocation,
      };

      // Add coordinates for office check-in
      if (
        workingLocation === "office" &&
        latitude !== null &&
        longitude !== null
      ) {
        requestBody.latitude = latitude;
        requestBody.longitude = longitude;
      }

      const response = await fetch(
        "https://www.api.vire.agency/api/v1/attendance/checkin",
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

        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Handle location selection and check-in
  const handleCheckIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      if (selectedLocation === "office") {
        // For office check-in, get location first
        const userLocation = await getCurrentLocation();
        await checkInToAPI(
          "office",
          userLocation.latitude,
          userLocation.longitude
        );
      } else {
        // For remote check-in, no location needed
        await checkInToAPI("remote");
      }

      // Success
      setShowMainDialog(false);
      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
        navigate("/staff/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Check-in error:", error);
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
                  disabled={isLoading || isGettingLocation}
                >
                  <div
                    className={`flex items-center space-x-3 p-4 border-2 rounded-lg transition-all ${
                      selectedLocation === "office"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <RadioGroupItem
                      value="office"
                      id="office"
                      className="text-blue-600"
                      disabled={isLoading || isGettingLocation}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="office"
                        className={`cursor-pointer font-medium flex items-center gap-2 ${
                          selectedLocation === "office"
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        <MapPin className="w-4 h-4" />
                        Office (In-person)
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Requires location verification
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex items-center space-x-3 p-4 border rounded-lg transition-all ${
                      selectedLocation === "remote"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <RadioGroupItem
                      value="remote"
                      id="remote"
                      disabled={isLoading || isGettingLocation}
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="remote"
                        className={`cursor-pointer font-medium ${
                          selectedLocation === "remote"
                            ? "text-gray-900"
                            : "text-gray-700"
                        }`}
                      >
                        Home (Remote)
                      </Label>
                      <p className="text-xs text-gray-500 mt-1">
                        Work from home option
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Location Status */}
              {isGettingLocation && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting your location...
                </div>
              )}

              {/* Action Buttons Section */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isLoading || isGettingLocation}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={isLoading || isGettingLocation}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking In...
                    </>
                  ) : (
                    "Check In"
                  )}
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
                  Check-in Failed
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
