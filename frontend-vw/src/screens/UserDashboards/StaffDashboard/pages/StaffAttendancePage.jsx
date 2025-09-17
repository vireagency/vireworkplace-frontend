import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Layout Components
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import {
  Clock,
  LogIn,
  LogOut,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Bell,
  User,
  Menu,
  BarChart3,
  Calendar,
  MessageSquare,
  FileText,
  Settings,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const AttendanceApp = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState("Inactive");
  const [attendanceData, setAttendanceData] = useState({
    workDuration: "3h 25m",
    activities: 3,
    issues: 2,
    checkInTime: null,
    checkOutTime: null,
  });
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [timeline, setTimeline] = useState([
    {
      type: "checkin",
      time: "09:05 AM",
      reason: "Traffic delay",
      status: "late",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    {
      type: "checkout",
      time: "12:30 PM",
      reason: null,
      status: "normal",
      icon: <LogOut className="h-4 w-4 text-blue-600" />,
    },
    {
      type: "checkin",
      time: "01:25 PM",
      reason: null,
      status: "normal",
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
  ]);
  const [tasks, setTasks] = useState([]);

  // Dynamically update the badge for the Tasks sidebar item
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    productivity: staffDashboardConfig.productivity.map((item) =>
      item.title === "Tasks" ? { ...item, badge: tasks.length } : item
    ),
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      // API call would go here
      // const response = await fetch('/api/v1/attendance/checkin', {...})

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAttendanceStatus("Active");
      toast.success("Successfully checked in!");
    } catch (error) {
      toast.error("Check-in failed. Please try again.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      // API call would go here
      // const response = await fetch('/api/v1/attendance/checkout', {...})

      // Simulate API call for demo
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setAttendanceStatus("Inactive");
      toast.success("Successfully checked out!");
    } catch (error) {
      toast.error("Check-out failed. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      {/* Header Section */}
      <div className="px-4 lg:px-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Attendance Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Track and manage your attendance.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-50 text-green-700 border border-green-100 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            {attendanceStatus}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="px-4 lg:px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {attendanceData.workDuration}
            </div>
            <div className="text-gray-500">Work Time</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {attendanceData.activities}
            </div>
            <div className="text-gray-500">Activities</div>
          </div>
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1 flex items-center justify-center gap-2">
              {attendanceData.issues}
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="text-gray-500">Issues</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6">
        {/* Today's Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Timeline
          </h2>
          <div className="space-y-4">
            {timeline.map((event, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {event.icon}
                  <span className="font-semibold text-green-600">
                    {event.type === "checkin" ? "Checked In" : "Checked Out"}
                  </span>
                </div>
                <span className="text-gray-700">at {event.time}</span>
                {event.reason && (
                  <span className="text-gray-500">Reason: {event.reason}</span>
                )}
                {event.status === "late" && (
                  <Badge className="bg-orange-100 text-orange-600">Late</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Policies & Detection Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Attendance Policies & Detection Rules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Working Hours
              </h3>
              <p className="text-gray-700">Check-in: 9:00 AM (10 min grace)</p>
              <p className="text-gray-700">Check-out: 5:00 PM (10 min grace)</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                Smart Detection
              </h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Late arrival after 9:10 AM
                </li>
                <li className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4" />
                  Early exit before 4:50 PM
                </li>
                <li className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  Missed check-in/check-out
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleCheckIn}
            disabled={checkingIn || attendanceStatus === "Active"}
            className="bg-green-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-green-700"
          >
            {checkingIn ? "Checking In..." : "Check-In"}
          </Button>
          <Button
            onClick={handleCheckOut}
            disabled={checkingOut || attendanceStatus !== "Active"}
            className="bg-gray-200 text-gray-700 font-semibold px-6 py-2 rounded-full hover:bg-gray-300"
          >
            {checkingOut ? "Checking Out..." : "Check-Out"}
          </Button>
        </div>
      </div>
    </StaffDashboardLayout>
  );
};

export default AttendanceApp;
