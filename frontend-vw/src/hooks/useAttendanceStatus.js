import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getApiUrl } from "@/config/apiConfig";
import axios from "axios";

/**
 * Custom hook for managing attendance status (check-in/check-out)
 * Provides current attendance status and functions to check in/out
 */
export const useAttendanceStatus = () => {
  const { accessToken, user } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    loading: true,
    error: null,
  });

  // Create API client
  const createApiClient = useCallback(() => {
    const baseUrl = getApiUrl();
    const cleanBaseUrl = baseUrl
      ? baseUrl.replace(/\/+$/, "")
      : "https://vireworkplace-backend-hpca.onrender.com";
    const noApiV1 = cleanBaseUrl.replace(/\/api\/v1$/, "");

    return axios.create({
      baseURL: noApiV1,
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      timeout: 10000,
    });
  }, [accessToken]);

  // Check current attendance status
  const checkAttendanceStatus = useCallback(async () => {
    if (!accessToken || !user?._id) {
      setAttendanceStatus((prev) => ({ ...prev, loading: false }));
      return;
    }

    try {
      setAttendanceStatus((prev) => ({ ...prev, loading: true, error: null }));

      const apiClient = createApiClient();

      // Use the attendance status endpoint for more reliable data
      const response = await apiClient.get("/api/v1/attendance/status");

      if (response.data && response.data.success) {
        const data = response.data;
        setAttendanceStatus({
          isCheckedIn: data.status === "Active" || data.status === "Checked In",
          checkInTime:
            data.attendanceData?.clockInTime ||
            data.attendanceData?.checkInTime,
          checkOutTime:
            data.attendanceData?.clockOutTime ||
            data.attendanceData?.checkOutTime,
          loading: false,
          error: null,
        });
      } else {
        // Fallback to date-based query
        const today = new Date().toISOString().split("T")[0];
        const fallbackResponse = await apiClient.get(
          `/api/v1/attendance?date=${today}`
        );

        if (fallbackResponse.data && fallbackResponse.data.success) {
          const attendanceData =
            fallbackResponse.data.data ||
            fallbackResponse.data.attendance ||
            [];
          const todayRecord = attendanceData.find(
            (record) => record.userId === user._id && record.date === today
          );

          if (todayRecord) {
            setAttendanceStatus({
              isCheckedIn: todayRecord.checkInTime && !todayRecord.checkOutTime,
              checkInTime: todayRecord.checkInTime,
              checkOutTime: todayRecord.checkOutTime,
              loading: false,
              error: null,
            });
          } else {
            setAttendanceStatus({
              isCheckedIn: false,
              checkInTime: null,
              checkOutTime: null,
              loading: false,
              error: null,
            });
          }
        } else {
          setAttendanceStatus({
            isCheckedIn: false,
            checkInTime: null,
            checkOutTime: null,
            loading: false,
            error: null,
          });
        }
      }
    } catch (error) {
      console.error("Error checking attendance status:", error);
      setAttendanceStatus((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [accessToken, user?._id, createApiClient]);

  // Check in function
  const checkIn = useCallback(
    async (location = "office", latitude = null, longitude = null) => {
      if (!accessToken || !user?._id) {
        throw new Error("No access token or user ID available");
      }

      try {
        const apiClient = createApiClient();
        const checkInData = {
          workingLocation: location,
          ...(latitude && longitude && { latitude, longitude }),
        };

        const response = await apiClient.post(
          "/api/v1/attendance/checkin",
          checkInData
        );

        if (response.data && response.data.success) {
          // Update local state immediately for better UX
          setAttendanceStatus((prev) => ({
            ...prev,
            isCheckedIn: true,
            checkInTime:
              response.data.attendanceData?.clockInTime ||
              response.data.attendanceData?.checkInTime,
            loading: false,
            error: null,
          }));

          // Then refresh from server to ensure consistency
          setTimeout(() => checkAttendanceStatus(), 1000);

          return response.data;
        } else {
          throw new Error(response.data?.message || "Check-in failed");
        }
      } catch (error) {
        console.error("Error checking in:", error);
        throw error;
      }
    },
    [accessToken, user?._id, createApiClient, checkAttendanceStatus]
  );

  // Check out function
  const checkOut = useCallback(async () => {
    if (!accessToken || !user?._id) {
      throw new Error("No access token or user ID available");
    }

    try {
      const apiClient = createApiClient();
      const checkOutData = {
        // Remove userId as it should be handled by the backend
      };

      const response = await apiClient.post(
        "/api/v1/attendance/checkout",
        checkOutData
      );

      if (response.data && response.data.success) {
        // Update local state immediately for better UX
        setAttendanceStatus((prev) => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime:
            response.data.attendanceData?.clockOutTime ||
            response.data.attendanceData?.checkOutTime,
          loading: false,
          error: null,
        }));

        // Then refresh from server to ensure consistency
        setTimeout(() => checkAttendanceStatus(), 1000);

        return response.data;
      } else {
        throw new Error(response.data?.message || "Check-out failed");
      }
    } catch (error) {
      console.error("Error checking out:", error);
      throw error;
    }
  }, [accessToken, user?._id, createApiClient, checkAttendanceStatus]);

  // Initial status check
  useEffect(() => {
    checkAttendanceStatus();
  }, [checkAttendanceStatus]);

  return {
    ...attendanceStatus,
    checkIn,
    checkOut,
    refreshStatus: checkAttendanceStatus,
  };
};
