/**
 * Attendance Statistics Component
 *
 * This component displays attendance statistics and analytics for the admin dashboard
 * including employee attendance overview, trends, and key metrics.
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

const AttendanceStats = () => {
  const { accessToken } = useAuth();
  const [attendanceOverview, setAttendanceOverview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch attendance overview on component mount
  useEffect(() => {
    if (accessToken) {
      fetchAttendanceOverview();
    }
  }, [accessToken]);

  // Fetch attendance overview
  const fetchAttendanceOverview = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      const result = await attendanceApi.getOverview(accessToken);

      if (result.success) {
        setAttendanceOverview(result.data);
      } else {
        toast.error(result.error || "Failed to fetch attendance overview");
      }
    } catch (error) {
      console.error("Error fetching attendance overview:", error);
      toast.error("Failed to fetch attendance overview");
    } finally {
      setLoading(false);
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
      case "absent":
        return "bg-red-100 text-red-800";
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
              Loading attendance statistics...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attendance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Employees</CardDescription>
            <CardTitle className="text-2xl">
              {attendanceOverview?.totalEmployees || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Checked In Today</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {attendanceOverview?.checkedInToday || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Late Arrivals</CardDescription>
            <CardTitle className="text-2xl text-orange-600">
              {attendanceOverview?.lateArrivals || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Absent Today</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {attendanceOverview?.absentToday || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Attendance Rate */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Rate</CardTitle>
          <CardDescription>
            Overall attendance statistics for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Today's Attendance Rate
              </span>
              <span className="text-2xl font-bold text-green-600">
                {attendanceOverview?.attendanceRate || 0}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    attendanceOverview?.attendanceRate || 0,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance Status</CardTitle>
          <CardDescription>
            Current attendance status of all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Late</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceOverview?.employees?.slice(0, 10).map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {employee.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(employee.status)}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900">
                        {employee.checkInTime || "Not checked in"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-900 capitalize">
                        {employee.workingLocation || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {employee.isLate ? (
                        <Badge className="bg-orange-100 text-orange-800">
                          Late
                        </Badge>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Department-wise Attendance */}
      {attendanceOverview?.departmentStats && (
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Attendance</CardTitle>
            <CardDescription>
              Attendance breakdown by department
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(attendanceOverview.departmentStats).map(
                ([department, stats]) => (
                  <div key={department} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {department}
                      </h4>
                      <span className="text-sm font-semibold text-gray-700">
                        {stats.attendanceRate}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Present: {stats.present}</span>
                        <span>Total: {stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            stats.attendanceRate >= 90
                              ? "bg-green-500"
                              : stats.attendanceRate >= 70
                              ? "bg-blue-500"
                              : stats.attendanceRate >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${stats.attendanceRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceStats;
