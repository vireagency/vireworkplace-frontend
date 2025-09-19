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
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { toast } from "sonner";

// Office location configuration
const OFFICE = {
  lat: 5.767477,
  lng: -0.180019,
  radius: 100, // meters
};

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

export default function CheckIn() {
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();
  const sidebarCounts = useSidebarCounts();

  // UI state
  const [workLocation, setWorkLocation] = useState("office");
  const [showDialog, setShowDialog] = useState(true);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [time, setTime] = useState("");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);

  // Error states
  const [error, setError] = useState("");
  const [locationError, setLocationError] = useState(null);

  // Location state
  const [location, setLocation] = useState({ lat: null, lng: null });
  const [locationValid, setLocationValid] = useState(false);
  const [atOffice, setAtOffice] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("prompt");

  // User data
  const [userData, setUserData] = useState(null);

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
      // Fallback to localStorage data
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

    // Try first and last name first
    if (firstName || lastName) {
      const first = firstName?.charAt(0)?.toUpperCase() || "";
      const last = lastName?.charAt(0)?.toUpperCase() || "";
      return first + last || first || "U";
    }

    // Fallback to email
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

  // Preload profile image to prevent loading delay
  useEffect(() => {
    const imageUrl = getProfileImageUrl();
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        console.log("Profile image preloaded successfully");
      };
      img.onerror = () => {
        console.log("Profile image failed to preload");
      };
    }
  }, [userData?.profileImage, userData?.profilePicture, userData?.avatar]);

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

  // Initialize user data and check attendance status
  useEffect(() => {
    const initializeComponent = async () => {
      if (user) {
        setUserData({
          firstName:
            user.firstName || (user.name ? user.name.split(" ")[0] : ""),
          lastName:
            user.lastName || (user.name ? user.name.split(" ")[1] || "" : ""),
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
        const statusData = await checkAttendanceStatus();
        if (statusData && statusData.data && statusData.data.hasCheckedIn) {
          console.log("User is already checked in, redirecting to dashboard");
          toast.info("You are already checked in for today!");
          setTimeout(() => {
            navigate("/staff/dashboard");
          }, 1000);
        }
      } catch (error) {
        console.warn("Could not check attendance status:", error);
        // Continue with normal flow
      }
    };

    initializeComponent();
  }, [user]);

  // Check location permission status
  const checkLocationPermission = async () => {
    if (!navigator.permissions) return "prompt";

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      setPermissionStatus(permission.state);
      return permission.state;
    } catch (error) {
      console.error("Permission check failed:", error);
      return "prompt";
    }
  };

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

          // Check if at office (with geofencing validation)
          if (workLocation === "office") {
            const withinRange = distance <= OFFICE.radius;
            setAtOffice(withinRange);

            // Debug logging
            console.log("Geofencing check:", {
              userLocation: { lat: latitude, lng: longitude },
              officeLocation: { lat: OFFICE.lat, lng: OFFICE.lng },
              distance: Math.round(distance),
              officeRadius: OFFICE.radius,
              withinRange,
            });

            if (!withinRange) {
              const errorMsg =
                "You must be at the office to check in. Please ensure you are within the office premises and try again.";
              setLocationError(errorMsg);
              toast.error("Please check in from the office");
              reject(new Error(errorMsg));
              return;
            } else {
              toast.success("Location verified - you're at the office!");
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
              // Show browser alert for location permission
              alert(
                "Location access is required for check-in. Please enable location permissions in your browser settings and refresh the page."
              );
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location unavailable. Please ensure GPS is enabled.";
              // Show browser alert for GPS
              alert(
                "GPS location is unavailable. Please ensure your device's location services are turned on and try again."
              );
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              // Show browser alert for timeout
              alert(
                "Location request timed out. Please check your internet connection and try again."
              );
              break;
            default:
              errorMessage = "Unknown location error occurred.";
              // Show browser alert for unknown error
              alert(
                "Unable to get your location. Please check your device settings and try again."
              );
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

    // Reset location when switching to remote
    if (locationType === "remote") {
      setLocation({ lat: null, lng: null });
      setLocationValid(false);
      setLocationError(null);
    }
  };

  // Check current attendance status
  const checkAttendanceStatus = async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again");
    }

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
        const data = await response.json();
        console.log("Attendance status:", data);
        return data;
      } else if (response.status === 401 || response.status === 403) {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      } else {
        console.warn("Could not fetch attendance status:", response.status);
        return null;
      }
    } catch (error) {
      console.warn("Error checking attendance status:", error);
      return null;
    }
  };

  // Submit check-in to API
  const submitCheckIn = async (workingLocation, lat = null, lng = null) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Please log in again");
    }

    const requestBody = { workingLocation };

    // Add coordinates for office check-in
    if (workingLocation === "office" && lat !== null && lng !== null) {
      requestBody.latitude = lat;
      requestBody.longitude = lng;
    }

    // Log the request for debugging
    console.log("Check-in request:", {
      workingLocation,
      latitude: lat,
      longitude: lng,
      requestBody,
    });

    const response = await fetch(
      "https://vireworkplace-backend-hpca.onrender.com/api/v1/attendance/checkin",
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
      if (response.status === 401 || response.status === 403) {
        clearTokens();
        throw new Error("Session expired. Please log in again.");
      }

      if (response.status === 400) {
        const errorData = await response.json();
        const errorMsg = errorData.message || "Invalid request";

        // Check for location-related errors
        if (
          errorMsg.toLowerCase().includes("location") ||
          errorMsg.toLowerCase().includes("office") ||
          errorMsg.toLowerCase().includes("geofence")
        ) {
          throw new Error(
            "Office check-in requires being at the office location. Please ensure you are within the office premises and try again."
          );
        }

        throw new Error(errorMsg);
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Request failed: ${response.status}`
      );
    }

    const data = await response.json();

    // Log the response for debugging
    console.log("Check-in response:", data);

    if (data.success !== true) {
      throw new Error("Unexpected response format");
    }

    // Store check-in info in localStorage for synchronization with checkout
    const today = new Date().toDateString();
    const todayKey = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    const now = new Date();

    const checkinInfo = {
      date: today,
      dateKey: todayKey,
      timestamp: now.toISOString(),
      timezoneOffset: now.getTimezoneOffset(),
      workingLocation: workingLocation,
      latitude: lat,
      longitude: lng,
      response: data,
      attendanceData: data.attendanceData,
      late: data.late || false,
      user: data.user,
      completed: true,
    };

    // Store with multiple keys for better compatibility with checkout
    localStorage.setItem(`checkin_${today}`, JSON.stringify(checkinInfo));
    localStorage.setItem(`checkin_${todayKey}`, JSON.stringify(checkinInfo));
    localStorage.setItem(`checkin_info_${today}`, JSON.stringify(checkinInfo));
    localStorage.setItem(
      `checkin_info_${todayKey}`,
      JSON.stringify(checkinInfo)
    );

    console.log("=== CHECKIN DEBUG INFO ===");
    console.log("Check-in date (toDateString):", today);
    console.log("Check-in date (YYYY-MM-DD):", todayKey);
    console.log("Check-in date (ISO):", now.toISOString());
    console.log("Check-in timezone offset:", now.getTimezoneOffset());
    console.log("Check-in info stored:", checkinInfo);
    console.log("=== END DEBUG INFO ===");

    return data;
  };

  // Handle check-in process
  const handleCheckIn = async () => {
    setLoading(true);
    setError("");

    try {
      // Proceed with check-in
      if (workLocation === "office") {
        // Get and validate location for office check-in
        const userLocation = await getCurrentLocation();
        await submitCheckIn("office", userLocation.lat, userLocation.lng);
      } else {
        // Remote check-in
        await submitCheckIn("remote");
      }

      // Success
      setShowDialog(false);
      setShowSuccess(true);
      toast.success("Successfully checked in!");

      // Navigate after delay
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/staff/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Check-in failed:", error);

      // Handle "already checked in" error specifically
      if (
        error.message &&
        error.message.toLowerCase().includes("already checked in")
      ) {
        toast.info("You are already checked in for today!");
        setShowDialog(false);
        setTimeout(() => {
          navigate("/staff/dashboard");
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

  const handleCancel = () => {
    setShowDialog(false);
    navigate("/staff");
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
    navigate("/staff");
  };

  if (loadingUser) {
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
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
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
                  <div className="text-sm font-medium text-slate-600">
                    Reporting Time:
                  </div>
                  <div className="text-lg font-bold text-slate-900">{time}</div>
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
                      workLocation === "office"
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4" />
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

              {/* Location Status */}
              {gettingLocation && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying your location...
                </div>
              )}

              {/* Location Success */}
              {workLocation === "office" && atOffice && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  Location verified - you're at the office!
                </div>
              )}

              {/* Location Error */}
              {workLocation === "office" && locationError && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium mb-1">Location Required</div>
                    <div>{locationError}</div>
                    {permissionStatus === "denied" && (
                      <div className="mt-2 text-xs text-red-500">
                        Please enable location permissions in your browser
                        settings
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Office Distance Info */}
              {workLocation === "office" &&
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
                  onClick={handleCheckIn}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium"
                  disabled={loading || gettingLocation}
                >
                  {loading ? (
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

      {/* Error Dialog */}
      {showError && (
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
                  Check-in Failed
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
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-white border border-slate-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transform transition-all duration-300 ease-in-out">
          <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-slate-900">
            You've successfully checked in!
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
