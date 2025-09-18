import { useState, useCallback } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Lock, Shield, Key } from "lucide-react";
import { IconPlus } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// StatusBadge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Active: {
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700",
      dotColor: "bg-green-500",
      text: "Active",
    },
    "In-active": {
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700",
      dotColor: "bg-orange-500",
      text: "In-active",
    },
    Closed: {
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      dotColor: "bg-red-500",
      text: "Closed",
    },
  };

  const config = statusConfig[status] || statusConfig["Active"];

  return (
    <div
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
    >
      <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.text}
      </span>
    </div>
  );
};

export default function StaffPasswordSettings() {
  const { user } = useAuth();

  // Consolidated state object following React best practices
  const [state, setState] = useState({
    // UI state
    isLoading: false,
    error: null,
    success: false,

    // Password visibility states
    passwordVisibility: {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    },

    // Form data
    formData: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Memoized event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        success: false,
      }));

      try {
        // Validate passwords match
        if (state.formData.newPassword !== state.formData.confirmPassword) {
          throw new Error("New password and confirm password do not match");
        }

        // Validate password strength (basic validation)
        if (state.formData.newPassword.length < 8) {
          throw new Error("New password must be at least 8 characters long");
        }

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Password change submitted:", state.formData);

        // Clear form and show success
        setState((prev) => ({
          ...prev,
          formData: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          },
          success: true,
          isLoading: false,
        }));
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error.message,
          isLoading: false,
        }));
      }
    },
    [state.formData]
  );

  const handleInputChange = useCallback((field, value) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setState((prev) => ({
      ...prev,
      passwordVisibility: {
        ...prev.passwordVisibility,
        [field]: !prev.passwordVisibility[field],
      },
    }));
  }, []);

  // Get sidebar counts
  const sidebarCounts = useSidebarCounts();

  // Dynamically update the badges for sidebar items
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    analytics:
      staffDashboardConfig.analytics?.map((item) => {
        if (item.title === "Evaluations") {
          return { ...item, badge: sidebarCounts.evaluations };
        }
        return item;
      }) || [],
    productivity:
      staffDashboardConfig.productivity?.map((item) => {
        if (item.title === "Tasks") {
          return { ...item, badge: sidebarCounts.tasks };
        }
        if (item.title === "Attendance") {
          return { ...item, badge: sidebarCounts.attendance };
        }
        return item;
      }) || [],
    company:
      staffDashboardConfig.company?.map((item) => {
        if (item.title === "Messages") {
          return { ...item, badge: sidebarCounts.messages };
        }
        return item;
      }) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb Navigation */}
        <div className="px-6 py-4">
          <p className="text-lg">
            <span className="font-bold text-black">Account Settings</span>
            <span className="text-gray-500"> / </span>
            <span className="text-gray-500">Password</span>
          </p>
        </div>

        {/* Profile Section */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar
                className="w-24 h-24"
                key={user?.avatarUpdatedAt || user?.avatar}
              >
                <AvatarImage
                  src={user?.avatar}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <AvatarFallback className="text-lg bg-gray-200 text-gray-600">
                  {user
                    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {/* Blue plus icon overlay */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <IconPlus className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <button className="text-red-500 text-sm hover:underline cursor-pointer">
                  Remove
                </button>
                <button className="text-blue-500 text-sm hover:underline cursor-pointer">
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-2">
                Recommended size: 400X400px
              </p>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
              </h3>
              <p className="text-gray-600 mb-3">
                {user?.jobRole || user?.role || "Loading..."}
              </p>
              <div className="flex items-center space-x-6">
                <StatusBadge status={user?.attendanceStatus || "Active"} />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">
                    Employee ID: {user?.workId || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">
                    Arrival: {user?.isLate ? "Late" : "On Time"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Password Change Form */}
        <div className="px-6 py-8 bg-white">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Change password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-semibold text-gray-800"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={
                      state.passwordVisibility.currentPassword
                        ? "text"
                        : "password"
                    }
                    value={state.formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("currentPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {state.passwordVisibility.currentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="text-sm font-semibold text-gray-800"
                >
                  New password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={
                      state.passwordVisibility.newPassword ? "text" : "password"
                    }
                    value={state.formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                    placeholder="Enter your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("newPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {state.passwordVisibility.newPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {state.formData.newPassword && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs text-gray-500">
                        Password strength:
                      </span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1 w-8 rounded ${
                              level <=
                              Math.min(
                                4,
                                Math.max(
                                  1,
                                  Math.floor(
                                    state.formData.newPassword.length / 2
                                  )
                                )
                              )
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      {state.formData.newPassword.length < 8
                        ? "Password must be at least 8 characters long"
                        : state.formData.newPassword.length >= 12
                        ? "Strong password"
                        : "Good password"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-800"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={
                      state.passwordVisibility.confirmPassword
                        ? "text"
                        : "password"
                    }
                    value={state.formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirmPassword")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {state.passwordVisibility.confirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {state.formData.newPassword &&
                  state.formData.confirmPassword && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        {state.formData.newPassword ===
                        state.formData.confirmPassword ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">
                              Passwords match
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-xs text-red-600">
                              Passwords do not match
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
              </div>

              {/* Error Display */}
              {state.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              )}

              {/* Success Display */}
              {state.success && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">
                    Password changed successfully!
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={state.isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {state.isLoading ? "Changing..." : "Change"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
