import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import {
  IconSettings,
  IconUser,
  IconBell,
  IconShield,
  IconPalette,
  IconDatabase,
  IconMail,
  IconClock,
  IconEdit,
  IconPlus,
  IconId,
  IconCertificate,
  IconFileText,
  IconSchool,
  IconBuilding,
  IconAward,
  IconBrain,
  IconChevronRight,
  IconChevronDown,
  IconTrash,
  IconX,
  IconMapPin,
} from "@tabler/icons-react";
import { Eye, EyeOff, Lock, Shield, Key } from "lucide-react";

// StatusBadge component moved outside to prevent recreation on every render
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

export default function StaffSettingsPage() {
  const { sidebarConfig } = useStandardizedSidebar();
  const { user, accessToken } = useAuth();
  const sidebarCounts = useSidebarCounts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "nanag@gmail.com",
    username: user?.username || "@NanaGyamfiAddae345",
    jobTitle: user?.jobTitle || "Creative Lead",
    department: user?.department || "Design",
    showOnProfile: true,
  });

  // Password state (from StaffPasswordSettings)
  const [passwordState, setPasswordState] = useState({
    isLoading: false,
    error: null,
    success: false,
    passwordVisibility: {
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    },
    formData: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification state (from StaffNotificationSettings)
  const [notificationState, setNotificationState] = useState({
    expandedCategories: {},
    isLoading: false,
    error: null,
    notificationSettings: {
      performanceManagement: {
        toggles: {
          reviewReminders: false,
          reviewDueDate: false,
          feedbackReceived: false,
          goalUpdates: false,
        },
        enabled: 0,
        total: 4,
      },
      taskManagement: {
        toggles: {
          taskAssignments: false,
          taskUpdates: false,
          taskDeadlines: false,
          taskCompletions: false,
        },
        enabled: 0,
        total: 4,
      },
      employeeInformation: {
        toggles: {
          profileUpdates: false,
          newEmployeeOnboarding: false,
          employeeStatusChanges: false,
        },
        enabled: 0,
        total: 3,
      },
      systemAlerts: {
        toggles: {
          systemMaintenance: true,
        },
        enabled: 1,
        total: 1,
      },
      deliveryMethods: {
        toggles: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
        },
        enabled: 2,
        total: 3,
      },
      globalSettings: {
        toggles: {
          allNotifications: false,
          quietHours: true,
        },
        enabled: 1,
        total: 2,
      },
    },
  });

  // Handle tab navigation - just change the active tab, no routing
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Password handlers (from StaffPasswordSettings)
  const togglePasswordVisibility = useCallback((field) => {
    setPasswordState((prev) => ({
      ...prev,
      passwordVisibility: {
        ...prev.passwordVisibility,
        [field]: !prev.passwordVisibility[field],
      },
    }));
  }, []);

  const handlePasswordInputChange = useCallback((field, value) => {
    setPasswordState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  }, []);

  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPasswordState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      success: false,
    }));

    try {
      // Validate passwords match
      if (passwordState.formData.newPassword !== passwordState.formData.confirmPassword) {
        throw new Error("New password and confirm password do not match");
      }

      // Validate password strength (basic validation)
      if (passwordState.formData.newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setPasswordState((prev) => ({
        ...prev,
        isLoading: false,
        success: true,
        formData: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
      }));
    } catch (error) {
      setPasswordState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  }, [passwordState.formData]);

  // Notification handlers (from StaffNotificationSettings)
  const toggleCategory = useCallback((category) => {
    setNotificationState((prev) => ({
      ...prev,
      expandedCategories: {
        ...prev.expandedCategories,
        [category]: !prev.expandedCategories[category],
      },
    }));
  }, []);

  const toggleIndividualSetting = useCallback((category, setting) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = {
        ...categorySettings.toggles,
        [setting]: !categorySettings.toggles[setting],
      };
      
      const enabledCount = Object.values(updatedToggles).filter(Boolean).length;
      
      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: enabledCount,
          },
        },
      };
    });
  }, []);

  const enableAll = useCallback((category) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = Object.keys(categorySettings.toggles).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {});
      
      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: categorySettings.total,
          },
        },
      };
    });
  }, []);

  const disableAll = useCallback((category) => {
    setNotificationState((prev) => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = Object.keys(categorySettings.toggles).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
      
      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: 0,
          },
        },
      };
    });
  }, []);

  const handleSavePreferences = useCallback(async () => {
    setNotificationState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Saving notification preferences:", notificationState.notificationSettings);
    } catch (error) {
      setNotificationState((prev) => ({ ...prev, error: error.message }));
    } finally {
      setNotificationState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [notificationState.notificationSettings]);

  // Memoized notification categories
  const notificationCategories = useMemo(
    () => [
      { key: "performanceManagement", name: "Performance Management" },
      { key: "taskManagement", name: "Task Management" },
      { key: "employeeInformation", name: "Employee Information" },
      { key: "systemAlerts", name: "System Alerts" },
      { key: "deliveryMethods", name: "Delivery Methods" },
      { key: "globalSettings", name: "Global Settings" },
    ],
    []
  );

  // Dynamically update the sidebar config with counts
  const dynamicSidebarConfig = {
    ...staffDashboardConfig,
    analytics:
      staffDashboardConfig.analytics?.map((item) => {
        if (item.title === "Evaluations") {
          return {
            ...item,
            badge:
              sidebarCounts.evaluations > 0
                ? sidebarCounts.evaluations
                : undefined,
          };
        }
        return item;
      }) || [],
    productivity:
      staffDashboardConfig.productivity?.map((item) => {
        if (item.title === "Tasks") {
          return {
            ...item,
            badge: sidebarCounts.tasks > 0 ? sidebarCounts.tasks : undefined,
          };
        }
        if (item.title === "Attendance") {
          return {
            ...item,
            badge:
              sidebarCounts.attendance > 0
                ? sidebarCounts.attendance
                : undefined,
          };
        }
        return item;
      }) || [],
    company:
      staffDashboardConfig.company?.map((item) => {
        if (item.title === "Messages") {
          return {
            ...item,
            badge:
              sidebarCounts.messages > 0 ? sidebarCounts.messages : undefined,
          };
        }
        return item;
      }) || [],
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={dynamicSidebarConfig}
      itemCounts={{
        tasks: sidebarCounts.tasks,
        evaluations: sidebarCounts.evaluations,
        attendance: sidebarCounts.attendance,
        messages: sidebarCounts.messages,
      }}
      isLoading={sidebarCounts.loading}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="mb-8 ml-6">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Settings</h1>
        </div>

        <div className="ml-6 mr-6">
          {/* Tabs Interface */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabClick("profile")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "profile"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => handleTabClick("password")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "password"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Password
              </button>
              <button
                onClick={() => handleTabClick("notification")}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
                  activeTab === "notification"
                    ? "border-green-500 text-green-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Notification
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "profile" && (
            <div className="bg-white">
              {/* Breadcrumb Navigation */}
              <div className="px-6 py-4">
                <p className="text-lg">
                  <span className="font-bold text-black">Account Settings</span>
                  <span className="text-gray-500"> / </span>
                  <span className="text-gray-500">Profile</span>
                </p>
              </div>

              {/* Profile Section */}
              <div className="px-6 py-6 bg-white border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  {/* Profile Picture Upload */}
                  <ProfileImageUpload
                    size="w-20 h-20"
                    currentImageUrl={user?.avatar}
                    userName={user ? `${user.firstName} ${user.lastName}` : ""}
                    showActions={true}
                    showSizeHint={true}
                  />

                  {/* Profile Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {user
                        ? `${user.firstName} ${user.lastName}`
                        : "Loading..."}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {user?.jobRole || user?.role || "Loading..."}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-700 text-sm">
                          Work ID: {user?.workId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="px-6 py-8 bg-white">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-6">
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-sm font-semibold text-gray-800"
                        >
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              firstName: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="username"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Username
                        </Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              username: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Email Address
                        </Label>
                        <div className="relative">
                          <Input
                            id="email"
                            type="email"
                            value={profileData.email}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                email: e.target.value,
                              })
                            }
                            className="bg-white border-gray-300 rounded-md text-gray-600 pr-10"
                          />
                          <IconEdit className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              lastName: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="jobTitle"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Job Title
                        </Label>
                        <Input
                          id="jobTitle"
                          value={profileData.jobTitle}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              jobTitle: e.target.value,
                            })
                          }
                          className="bg-white border-gray-300 rounded-md text-gray-600"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="department"
                          className="text-sm font-semibold text-gray-800"
                        >
                          Department
                        </Label>
                        <Select
                          value={profileData.department}
                          onValueChange={(value) =>
                            setProfileData({
                              ...profileData,
                              department: value,
                            })
                          }
                        >
                          <SelectTrigger className="bg-white border-gray-300 rounded-md text-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Design">Design</SelectItem>
                            <SelectItem value="Development">
                              Development
                            </SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Show on Profile Checkbox */}
                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="showOnProfile"
                      checked={profileData.showOnProfile}
                      onCheckedChange={(checked) =>
                        setProfileData({
                          ...profileData,
                          showOnProfile: checked,
                        })
                      }
                    />
                    <Label
                      htmlFor="showOnProfile"
                      className="text-sm font-semibold text-gray-800"
                    >
                      Show this on my profile
                    </Label>
                  </div>

                  {/* Update Button */}
                  <div className="mt-6 flex justify-end">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors duration-200">
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab Content */}
          {activeTab === "password" && (
            <div className="bg-white">
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
                <div className="flex items-start space-x-4">
                  {/* Profile Picture Upload */}
                  <ProfileImageUpload
                    size="w-20 h-20"
                    currentImageUrl={user?.avatar}
                    userName={user ? `${user.firstName} ${user.lastName}` : ""}
                    showActions={true}
                    showSizeHint={true}
                  />

                  {/* Profile Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {user?.jobRole || user?.role || "Loading..."}
                    </p>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={user?.attendanceStatus || "Active"} />
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-700 text-sm">
                          Work ID: {user?.workId || "N/A"}
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

                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
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
                            passwordState.passwordVisibility.currentPassword
                              ? "text"
                              : "password"
                          }
                          value={passwordState.formData.currentPassword}
                          onChange={(e) =>
                            handlePasswordInputChange("currentPassword", e.target.value)
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
                          {passwordState.passwordVisibility.currentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Match Indicator */}
                      {passwordState.formData.newPassword &&
                        passwordState.formData.confirmPassword && (
                          <div className="flex items-center space-x-2 mt-2">
                            {passwordState.formData.newPassword ===
                            passwordState.formData.confirmPassword ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">
                                  Passwords match
                                </span>
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-red-600">
                                  Passwords do not match
                                </span>
                              </>
                            )}
                          </div>
                        )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-sm font-semibold text-gray-800"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={
                            passwordState.passwordVisibility.newPassword
                              ? "text"
                              : "password"
                          }
                          value={passwordState.formData.newPassword}
                          onChange={(e) =>
                            handlePasswordInputChange("newPassword", e.target.value)
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
                          {passwordState.passwordVisibility.newPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {passwordState.formData.newPassword && (
                        <div className="mt-2">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-gray-600">
                              Password strength:
                            </span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`w-2 h-2 rounded-full ${
                                    passwordState.formData.newPassword.length >= level * 2
                                      ? "bg-green-500"
                                      : "bg-gray-200"
                                  }`}
                                ></div>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Use at least 8 characters with a mix of letters, numbers, and symbols
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
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={
                            passwordState.passwordVisibility.confirmPassword
                              ? "text"
                              : "password"
                          }
                          value={passwordState.formData.confirmPassword}
                          onChange={(e) =>
                            handlePasswordInputChange("confirmPassword", e.target.value)
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
                          {passwordState.passwordVisibility.confirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Error Message */}
                    {passwordState.error && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{passwordState.error}</p>
                      </div>
                    )}

                    {/* Success Message */}
                    {passwordState.success && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">
                          Password updated successfully!
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={passwordState.isLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                      >
                        {passwordState.isLoading ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Notification Tab Content */}
          {activeTab === "notification" && (
            <div className="bg-white">
              {/* Breadcrumb Navigation */}
              <div className="px-6 py-4">
                <p className="text-lg">
                  <span className="font-bold text-black">Account Settings</span>
                  <span className="text-gray-500"> / </span>
                  <span className="text-gray-500">Notifications</span>
                </p>
              </div>

              {/* Profile Section */}
              <div className="px-6 py-6 bg-white border-b border-gray-200">
                <div className="flex items-start space-x-4">
                  {/* Profile Picture Upload */}
                  <ProfileImageUpload
                    size="w-20 h-20"
                    currentImageUrl={user?.avatar}
                    userName={user ? `${user.firstName} ${user.lastName}` : ""}
                    showActions={true}
                    showSizeHint={true}
                  />

                  {/* Profile Details */}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {user?.jobRole || user?.role || "Loading..."}
                    </p>
                    <div className="flex items-center space-x-4">
                      <StatusBadge status={user?.attendanceStatus || "Active"} />
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-700 text-sm">
                          Work ID: {user?.workId || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content - Notification Settings */}
              <div className="px-6 py-8 bg-white">
                <div className="max-w-4xl">
                  {/* Header */}
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                      Notification Settings
                    </h1>
                    <p className="text-gray-600">
                      Manage your notification preferences for various events and
                      activities within the system.
                    </p>
                  </div>

                  {/* Notification Categories */}
                  <div className="space-y-4 mb-8">
                    {notificationCategories.map((category) => {
                      const isExpanded = notificationState.expandedCategories[category.key];
                      const settings = notificationState.notificationSettings[category.key];

                      return (
                        <div
                          key={category.key}
                          className="bg-white border border-gray-200 rounded-lg"
                        >
                          {/* Category Header */}
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => toggleCategory(category.key)}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                              >
                                {isExpanded ? (
                                  <IconChevronDown className="w-4 h-4" />
                                ) : (
                                  <IconChevronRight className="w-4 h-4" />
                                )}
                              </button>
                              <span className="font-medium text-gray-800">
                                {category.name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {settings.enabled}/{settings.total} enabled
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => enableAll(category.key)}
                                size="sm"
                                className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                              >
                                Enable All
                              </Button>
                              <Button
                                onClick={() => disableAll(category.key)}
                                size="sm"
                                variant="outline"
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                              >
                                Disable All
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-gray-100">
                              <div className="pt-4">
                                {/* Performance Management specific notifications */}
                                {category.key === "performanceManagement" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          New Review Assigned
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive notifications when a new performance
                                          review is assigned to you.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .performanceManagement.toggles
                                              .reviewReminders
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "performanceManagement",
                                              "reviewReminders"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Review Due Date
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Get reminded when your performance review is due.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .performanceManagement.toggles
                                              .reviewDueDate
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "performanceManagement",
                                              "reviewDueDate"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Feedback Received
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Be notified when you receive new feedback.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .performanceManagement.toggles
                                              .feedbackReceived
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "performanceManagement",
                                              "feedbackReceived"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Goal Updates
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Stay informed about goal progress and updates.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .performanceManagement.toggles
                                              .goalUpdates
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "performanceManagement",
                                              "goalUpdates"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Task Management specific notifications */}
                                {category.key === "taskManagement" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Task Assignments
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Get notified when new tasks are assigned to you.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .taskManagement.toggles
                                              .taskAssignments
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "taskManagement",
                                              "taskAssignments"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Task Updates
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive updates when tasks are modified.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .taskManagement.toggles
                                              .taskUpdates
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "taskManagement",
                                              "taskUpdates"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Task Deadlines
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Get reminded about upcoming task deadlines.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .taskManagement.toggles
                                              .taskDeadlines
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "taskManagement",
                                              "taskDeadlines"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Task Completions
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Be notified when tasks are completed.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .taskManagement.toggles
                                              .taskCompletions
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "taskManagement",
                                              "taskCompletions"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Employee Information specific notifications */}
                                {category.key === "employeeInformation" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Profile Updates
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Get notified when your profile information is updated.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .employeeInformation.toggles
                                              .profileUpdates
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "employeeInformation",
                                              "profileUpdates"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          New Employee Onboarding
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Be informed about new team members joining.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .employeeInformation.toggles
                                              .newEmployeeOnboarding
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "employeeInformation",
                                              "newEmployeeOnboarding"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Employee Status Changes
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Stay updated on employee status changes.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .employeeInformation.toggles
                                              .employeeStatusChanges
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "employeeInformation",
                                              "employeeStatusChanges"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* System Alerts specific notifications */}
                                {category.key === "systemAlerts" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          System Maintenance
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive notifications about scheduled system maintenance.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .systemAlerts.toggles
                                              .systemMaintenance
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "systemAlerts",
                                              "systemMaintenance"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Delivery Methods specific notifications */}
                                {category.key === "deliveryMethods" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Email Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive notifications via email.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .deliveryMethods.toggles
                                              .emailNotifications
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "deliveryMethods",
                                              "emailNotifications"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Push Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive push notifications in your browser.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .deliveryMethods.toggles
                                              .pushNotifications
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "deliveryMethods",
                                              "pushNotifications"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          SMS Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Receive notifications via SMS.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .deliveryMethods.toggles
                                              .smsNotifications
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "deliveryMethods",
                                              "smsNotifications"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Global Settings specific notifications */}
                                {category.key === "globalSettings" && (
                                  <div className="space-y-3">
                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          All Notifications
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Enable or disable all notifications at once.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .globalSettings.toggles
                                              .allNotifications
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "globalSettings",
                                              "allNotifications"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 mb-1">
                                          Quiet Hours
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          Enable quiet hours to reduce notifications during specific times.
                                        </p>
                                      </div>
                                      <div className="ml-4">
                                        <Switch
                                          checked={
                                            notificationState.notificationSettings
                                              .globalSettings.toggles
                                              .quietHours
                                          }
                                          onCheckedChange={() =>
                                            toggleIndividualSetting(
                                              "globalSettings",
                                              "quietHours"
                                            )
                                          }
                                          className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Error Message */}
                  {notificationState.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                      <p className="text-sm text-red-600">{notificationState.error}</p>
                    </div>
                  )}

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSavePreferences}
                      disabled={notificationState.isLoading}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {notificationState.isLoading ? "Saving..." : "Save Preferences"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
