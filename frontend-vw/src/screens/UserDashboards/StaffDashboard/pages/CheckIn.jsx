import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertTriangle,
  CheckCircle,
  X,
  MapPin,
  Loader2,
  Info,
} from "lucide-react";
import StaffDashboardMainPage from "@/screens/UserDashboards/StaffDashboard/StaffDashboardMainPage";
import { useAuth } from "@/hooks/useAuth";

export default function CheckIn() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

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

  // Get user's current location with improved accuracy
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      setIsGettingLocation(true);

      // Clear previous location data for fresh reading
      setLocation({ latitude: null, longitude: null });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          console.log("Location acquired:", {
            latitude,
            longitude,
            accuracy,
          });

          setLocation({ latitude, longitude });
          setIsGettingLocation(false);
          resolve({ latitude, longitude, accuracy });
        },
        (error) => {
          setIsGettingLocation(false);
          console.error("Geolocation error:", error);

          let errorMessage = "Office check-in requires being on location.";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information is unavailable. Please try again.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
            default:
              errorMessage =
                "An unknown error occurred while getting your location.";
              break;
          }

          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0, // Force fresh location reading
        }
      );
    });
  };

  // Handle location selection change
  const handleLocationSelection = async (locationType) => {
    if (isLoading || isGettingLocation) return;

    setSelectedLocation(locationType);

    // If user selects office, immediately request location permission
    if (locationType === "office") {
      try {
        await getCurrentLocation();
      } catch (error) {
        console.log("Location permission denied or failed:", error.message);
        // Don't show error here, let user proceed and handle it during check-in
      }
    }
  };

  // API call to check in - Updated to properly consume the API
  const checkInToAPI = async (
    workingLocation,
    latitude = null,
    longitude = null
  ) => {
    try {
      // Get auth token from multiple possible sources
      let token =
        accessToken ||
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

      // Add coordinates for office check-in as required by API
      if (
        workingLocation === "office" &&
        latitude !== null &&
        longitude !== null
      ) {
        requestBody.latitude = latitude;
        requestBody.longitude = longitude;
      }

      console.log("Check-in request body:", requestBody);

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

      // Handle the response according to API specification
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

        // Handle 400 Bad Request (location/validation errors)
        if (response.status === 400) {
          const errorData = await response.json();
          console.error("Check-in 400 error:", errorData);

          // Check if it's a location-related error
          const errorMsg = errorData.message || "Invalid request";
          if (
            errorMsg.toLowerCase().includes("location") ||
            errorMsg.toLowerCase().includes("office") ||
            errorMsg.toLowerCase().includes("geofence") ||
            errorMsg.toLowerCase().includes("coordinates")
          ) {
            throw new Error(
              "Office check-in requires being on location. Couldn't check in. Please try again."
            );
          }

          throw new Error(errorMsg);
        }

        // Handle other error status codes
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      // Parse successful response (201 Created)
      const data = await response.json();

      // Log the successful response for debugging
      console.log("Check-in successful response:", data);

      // Verify response format matches API specification
      if (data.success !== true) {
        throw new Error("Unexpected response format from server");
      }

      return data;
    } catch (error) {
      console.error("Check-in API error:", error);
      throw error;
    }
  };

  // Handle location selection and check-in
  const handleCheckIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      let checkInResult;

      if (selectedLocation === "office") {
        // For office check-in, get fresh location
        console.log("Starting office check-in process...");
        const userLocation = await getCurrentLocation();

        console.log("Using location for check-in:", {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        });

        checkInResult = await checkInToAPI(
          "office",
          userLocation.latitude,
          userLocation.longitude
        );
      } else {
        // For remote check-in, no location needed
        checkInResult = await checkInToAPI("remote");
      }

      // Log successful check-in data
      console.log("Check-in completed successfully:", checkInResult);

      // Success - show success toast with API response data
      setShowMainDialog(false);
      setShowSuccessToast(true);

      // Navigate after showing success message
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

  // Handle cancel action - Navigate to staff landing page
  const handleCancel = () => {
    setShowMainDialog(false);
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
                    onClick={() => handleLocationSelection("office")}
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
                    onClick={() => handleLocationSelection("remote")}
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

              {/* Location Status and Debug Info */}
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium relative overflow-hidden"
                  disabled={isLoading || isGettingLocation}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        </div>
                        <span className="text-sm">Checking In...</span>
                      </div>
                    </div>
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
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
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
                    : error.includes("already checked in")
                    ? "Already Checked In"
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
