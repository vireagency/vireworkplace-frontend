import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, CheckCircle, X, MapPin, Loader2 } from "lucide-react";
import StaffDashboardMainPage from "@/screens/UserDashboards/StaffDashboard/StaffDashboardMainPage";

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
  const [userData, setUserData] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setIsLoadingUser(true);

      // Get auth token from multiple possible sources
      let token =
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
      setUserData({
        firstName: "User",
        lastName: "",
        email: "user@example.com",
        profileImage: null,
      });
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Get user initials for avatar fallback with proper fallback logic
  const getUserInitials = () => {
    if (!userData) return "U";

    // Try to get from firstName and lastName
    if (userData.firstName) {
      const firstInitial = userData.firstName.charAt(0).toUpperCase();
      const lastInitial = userData.lastName
        ? userData.lastName.charAt(0).toUpperCase()
        : "";
      return firstInitial + lastInitial;
    }

    // Fallback to email initials
    if (userData.email) {
      const emailPart = userData.email.split("@")[0];
      return emailPart.substring(0, 2).toUpperCase();
    }

    return "U";
  };

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

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
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
          let errorMessage = "Office check-in requires being on location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Office check-in requires being on location.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Office check-in requires being on location.";
              break;
            case error.TIMEOUT:
              errorMessage = "Office check-in requires being on location.";
              break;
            default:
              errorMessage = "Office check-in requires being on location.";
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
    setShowMainDialog(false);
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

      {/* Main Check-In Dialog */}
      {showMainDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 space-y-6">
              {/* Header Section - Avatar and Time */}
              <div className="flex items-center justify-between">
                <Avatar className="h-12 w-12">
                  {userData?.profileImage && (
                    <AvatarImage
                      src={userData.profileImage}
                      alt={`${userData.firstName} ${userData.lastName}`}
                    />
                  )}
                  <AvatarFallback className="bg-orange-500 text-white text-lg font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">
                    Reporting Time:
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {currentTime}
                  </div>
                </div>
              </div>

              {/* Location Options Section */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-slate-700">
                  Choose your location for today
                </div>
                <div className="space-y-3">
                  <div
                    onClick={() =>
                      !isLoading &&
                      !isGettingLocation &&
                      setSelectedLocation("office")
                    }
                    className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedLocation === "office"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <Label
                          className={`cursor-pointer font-medium ${
                            selectedLocation === "office"
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          Office (In-person)
                        </Label>
                      </div>
                    </div>
                    {selectedLocation === "office" && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>

                  <div
                    onClick={() =>
                      !isLoading &&
                      !isGettingLocation &&
                      setSelectedLocation("remote")
                    }
                    className={`flex items-center justify-between p-4 border-2 rounded-lg transition-all cursor-pointer ${
                      selectedLocation === "remote"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <Label
                          className={`cursor-pointer font-medium ${
                            selectedLocation === "remote"
                              ? "text-slate-900"
                              : "text-slate-700"
                          }`}
                        >
                          Home (Remote)
                        </Label>
                      </div>
                    </div>
                    {selectedLocation === "remote" && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
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
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                  disabled={isLoading || isGettingLocation}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="p-6 space-y-4 text-center">
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {error.includes("location")
                    ? "Office check-in requires being on location."
                    : "Check-in Failed"}
                </h3>
                <p className="text-slate-500 text-sm">
                  {error.includes("location")
                    ? "Couldn't check in. Please try again."
                    : error || "Something went wrong. Please try again."}
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
            You've successfully checked in!
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
