import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
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
} from "@tabler/icons-react";

export default function StaffSettingsPage() {
  const { sidebarConfig } = useStandardizedSidebar();
  const { user } = useAuth();
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

  // Handle tab navigation - just change the active tab, no routing
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
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
                      {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
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
                            setProfileData({ ...profileData, department: value })
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
                    <Label htmlFor="showOnProfile" className="text-sm font-semibold text-gray-800">
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

                  <form className="space-y-6">
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
                          type="password"
                          className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                      </div>
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
                          type="password"
                          className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                      </div>
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
                          type="password"
                          className="pr-10 bg-white border-gray-300 rounded-md text-gray-600"
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors duration-200"
                      >
                        Update Password
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
                    {/* Performance Management */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            Performance Management
                          </span>
                          <span className="text-sm text-gray-500">
                            2/3 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Task Management */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            Task Management
                          </span>
                          <span className="text-sm text-gray-500">
                            1/2 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Employee Information */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            Employee Information
                          </span>
                          <span className="text-sm text-gray-500">
                            0/2 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* System Alerts */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            System Alerts
                          </span>
                          <span className="text-sm text-gray-500">
                            1/1 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Methods */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            Delivery Methods
                          </span>
                          <span className="text-sm text-gray-500">
                            2/3 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Global Settings */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-800">
                            Global Settings
                          </span>
                          <span className="text-sm text-gray-500">
                            1/2 enabled
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Enable All
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded cursor-pointer"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end">
                    <Button className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium transition-colors duration-200">
                      Save Preferences
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
