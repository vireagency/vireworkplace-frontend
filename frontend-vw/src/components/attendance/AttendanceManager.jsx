/**
 * Attendance Manager Component
 *
 * This component provides attendance management functionality for the admin dashboard
 * including check-in/check-out controls, status display, and attendance statistics.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/attendanceApi";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AttendanceManager = () => {
  const { user, accessToken } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [isCheckOutDialogOpen, setIsCheckOutDialogOpen] = useState(false);
  const [dailySummary, setDailySummary] = useState("");

  // Check-in form state
  const [workingLocation, setWorkingLocation] = useState("office");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Fetch attendance status on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAttendanceStatus();
    }
  }, [accessToken]);

  // Get current location for office check-in
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Fetch attendance status
  const fetchAttendanceStatus = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await attendanceApi.getStatus(accessToken);

      if (result.success) {
        setAttendanceStatus(result.data);
      } else {
        toast.error(result.error || "Failed to fetch attendance status");
      }
    } catch (error) {
      console.error("Error fetching attendance status:", error);
      toast.error("Failed to fetch attendance status");
    } finally {
      setLoading(false);
    }
  };

  // Handle check-in
  const handleCheckIn = async () => {
    if (!accessToken) return;

    try {
      setCheckInLoading(true);

      let checkInData = {
        workingLocation,
      };

      // If office location, get GPS coordinates
      if (workingLocation === "office") {
        try {
          const location = await getCurrentLocation();
          checkInData.latitude = location.latitude;
          checkInData.longitude = location.longitude;
        } catch (error) {
          toast.error(
            "Failed to get location. Please enable location services."
          );
          return;
        }
      }

      const result = await attendanceApi.checkIn(accessToken, checkInData);

      if (result.success) {
        toast.success(result.data.message);
        setAttendanceStatus(result.data);
        // Reset form
        setWorkingLocation("office");
        setLatitude("");
        setLongitude("");
      } else {
        toast.error(result.error || "Failed to check in");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("Failed to check in");
    } finally {
      setCheckInLoading(false);
    }
  };

  // Handle check-out
  const handleCheckOut = async () => {
    if (!accessToken) return;

    try {
      setCheckOutLoading(true);

      const checkOutData = {
        dailySummary: dailySummary.trim() || "Work completed for the day",
      };

      const result = await attendanceApi.checkOut(accessToken, checkOutData);

      if (result.success) {
        toast.success(result.data.message);
        setAttendanceStatus(result.data);
        setDailySummary("");
        setIsCheckOutDialogOpen(false);
      } else {
        toast.error(result.error || "Failed to check out");
      }
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("Failed to check out");
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "checked out":
        return "bg-blue-100 text-blue-800";
      case "late":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-slate-600">
              Loading attendance status...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Attendance Manager
        </CardTitle>
        <CardDescription>
          Manage your daily attendance and track your work hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Current Status</h3>
            <p className="text-sm text-gray-600">
              {attendanceStatus?.attendanceData?.status || "Not checked in"}
            </p>
          </div>
          <Badge
            className={getStatusBadgeColor(
              attendanceStatus?.attendanceData?.status
            )}
          >
            {attendanceStatus?.attendanceData?.status || "Inactive"}
          </Badge>
        </div>

        {/* Check-in Information */}
        {attendanceStatus?.attendanceData?.clockInTime && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Check-in Time</h4>
              <p className="text-sm text-gray-600">
                {attendanceStatus.attendanceData.clockInFormatted}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Working Location</h4>
              <p className="text-sm text-gray-600 capitalize">
                {attendanceStatus.attendanceData.workingLocation}
              </p>
            </div>
          </div>
        )}

        {/* Check-out Information */}
        {attendanceStatus?.attendanceData?.clockOutTime && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Check-out Time</h4>
              <p className="text-sm text-gray-600">
                {attendanceStatus.attendanceData.clockOutFormatted}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Work Duration</h4>
              <p className="text-sm text-gray-600">
                {attendanceStatus.attendanceData.workDuration}
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Overtime</h4>
              <p className="text-sm text-gray-600">
                {attendanceStatus.attendanceData.overtimeHours || 0}h
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!attendanceStatus?.attendanceData?.clockInTime ? (
            // Check-in Section
            <div className="flex-1 space-y-4">
              <div>
                <Label htmlFor="workingLocation">Working Location</Label>
                <select
                  id="workingLocation"
                  value={workingLocation}
                  onChange={(e) => setWorkingLocation(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="office">Office</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              {workingLocation === "office" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="Auto-detected"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="Auto-detected"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleCheckIn}
                disabled={checkInLoading}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              >
                {checkInLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking In...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            </div>
          ) : !attendanceStatus?.attendanceData?.clockOutTime ? (
            // Check-out Section
            <div className="flex-1">
              <Dialog
                open={isCheckOutDialogOpen}
                onOpenChange={setIsCheckOutDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                    Check Out
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Check Out</DialogTitle>
                    <DialogDescription>
                      Please provide a summary of your work for today.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="dailySummary">Daily Summary</Label>
                      <Textarea
                        id="dailySummary"
                        placeholder="Describe what you accomplished today..."
                        value={dailySummary}
                        onChange={(e) => setDailySummary(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCheckOutDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCheckOut}
                      disabled={checkOutLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {checkOutLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Checking Out...
                        </>
                      ) : (
                        "Check Out"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            // Already checked out
            <div className="flex-1">
              <Button disabled className="w-full sm:w-auto">
                Already Checked Out
              </Button>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={fetchAttendanceStatus}
            disabled={loading}
            className="text-sm"
          >
            Refresh Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceManager;
