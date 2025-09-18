/**
 * Geofencing Utility Functions
 *
 * This file contains the geofencing technique implemented for location validation.
 * You can copy and use these functions in other parts of your application.
 */

// Office location configuration
export const OFFICE_CONFIG = {
  lat: 5.767477,
  lng: -0.180019,
  radius: 100, // meters
};

/**
 * Calculate distance between two geographical points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
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

/**
 * Check if a location is within the office geofence
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @param {Object} officeConfig - Office configuration object
 * @returns {Object} Result object with isWithinRange, distance, and message
 */
export const checkGeofence = (
  userLat,
  userLng,
  officeConfig = OFFICE_CONFIG
) => {
  const distance = calculateDistance(
    userLat,
    userLng,
    officeConfig.lat,
    officeConfig.lng
  );

  const isWithinRange = distance <= officeConfig.radius;

  return {
    isWithinRange,
    distance: Math.round(distance),
    message: isWithinRange
      ? "Location verified - you're at the office!"
      : `You are ${Math.round(
          distance
        )}m away from the office. You must be within ${
          officeConfig.radius
        }m to check in.`,
  };
};

/**
 * Get current user location using browser's geolocation API
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} Promise that resolves with location data
 */
export const getCurrentLocation = (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  };

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        resolve({
          lat: latitude,
          lng: longitude,
          accuracy,
          timestamp: new Date().toISOString(),
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions.";
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

        reject(new Error(errorMessage));
      },
      { ...defaultOptions, ...options }
    );
  });
};

/**
 * Complete geofencing validation workflow
 * @param {string} workLocation - Type of work location ("office" or "remote")
 * @param {Object} officeConfig - Office configuration (optional)
 * @returns {Promise<Object>} Promise that resolves with validation result
 */
export const validateLocation = async (
  workLocation,
  officeConfig = OFFICE_CONFIG
) => {
  try {
    // Get current location
    const location = await getCurrentLocation();

    if (workLocation === "office") {
      // Perform geofencing validation
      const geofenceResult = checkGeofence(
        location.lat,
        location.lng,
        officeConfig
      );

      return {
        success: geofenceResult.isWithinRange,
        location,
        distance: geofenceResult.distance,
        message: geofenceResult.message,
        isWithinOffice: geofenceResult.isWithinRange,
      };
    } else {
      // For remote work, just return location without validation
      return {
        success: true,
        location,
        message: "Location captured for remote work",
        isWithinOffice: false,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: error.message,
    };
  }
};

/**
 * Check location permission status
 * @returns {Promise<string>} Promise that resolves with permission status
 */
export const checkLocationPermission = async () => {
  if (!navigator.permissions) {
    return "prompt";
  }

  try {
    const permission = await navigator.permissions.query({
      name: "geolocation",
    });
    return permission.state;
  } catch (error) {
    console.error("Permission check failed:", error);
    return "prompt";
  }
};

/**
 * Example usage in a React component:
 *
 * import { validateLocation, checkLocationPermission } from '@/utils/geofencing';
 *
 * const handleCheckIn = async () => {
 *   try {
 *     const result = await validateLocation("office");
 *
 *     if (result.success) {
 *       // Proceed with check-in
 *       console.log("Location validated:", result.location);
 *       console.log("Distance from office:", result.distance, "meters");
 *     } else {
 *       // Show error message
 *       console.error("Location validation failed:", result.message);
 *     }
 *   } catch (error) {
 *     console.error("Error:", error.message);
 *   }
 * };
 */
