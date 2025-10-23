import { useState, useEffect, useCallback, useMemo } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import ProfileImageUpload from "@/components/ProfileImageUpload";
import {
  IconPlus,
  IconUser,
  IconMail,
  IconId,
  IconCertificate,
  IconFileText,
  IconShield,
  IconSchool,
  IconBuilding,
  IconAward,
  IconBrain,
  IconChevronRight,
  IconChevronDown,
  IconEdit,
  IconTrash,
  IconX,
  IconMapPin,
  IconSettings,
  IconDatabase,
  IconServer,
  IconLock,
  IconBell,
  IconUsers,
  IconKey,
} from "@tabler/icons-react";
import { Eye, EyeOff } from "lucide-react";

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
    Pending: {
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-700",
      dotColor: "bg-yellow-500",
      text: "Pending",
    },
  };

  const config = statusConfig[status] || statusConfig["In-active"];

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

export default function AdminSettingsPage() {
  const { user, accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState("system-settings");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    systemName: "Vire Agency",
    systemVersion: "2.1.0",
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    maxFileSize: "100",
    sessionTimeout: "30",
    twoFactorAuth: true,
    emailNotifications: true,
    systemLogs: true,
  });

  // User Management State
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      email: "john.doe@vireagency.com",
      role: "Admin",
      status: "Active",
      lastLogin: "2024-01-15",
      avatar: null,
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@vireagency.com",
      role: "HR Manager",
      status: "Active",
      lastLogin: "2024-01-14",
      avatar: null,
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@vireagency.com",
      role: "Finance Manager",
      status: "In-active",
      lastLogin: "2024-01-10",
      avatar: null,
    },
  ]);

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    department: "",
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    systemAlerts: true,
    securityAlerts: true,
    performanceAlerts: true,
    maintenanceAlerts: true,
    userActivityAlerts: false,
    reportGenerationAlerts: true,
  });

  const handleSystemSettingChange = (key, value) => {
    setSystemSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNotificationSettingChange = (key, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAddUser = () => {
    if (
      newUser.firstName &&
      newUser.lastName &&
      newUser.email &&
      newUser.role
    ) {
      const user = {
        id: users.length + 1,
        name: `${newUser.firstName} ${newUser.lastName}`,
        email: newUser.email,
        role: newUser.role,
        status: "Pending",
        lastLogin: "Never",
        avatar: null,
      };
      setUsers((prev) => [...prev, user]);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: "",
        department: "",
      });
      setIsUserModalOpen(false);
    }
  };

  const handleDeleteUser = (userId) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const handleToggleUserStatus = (userId) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "Active" ? "In-active" : "Active",
            }
          : user
      )
    );
  };

  return (
    <AdminDashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              System Settings
            </h1>
            <p className="text-gray-600">
              Manage system configuration and user permissions
            </p>
          </div>
        </div>

        {/* Settings Tabs */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab("system-settings")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "system-settings"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconSettings className="w-4 h-4 mr-2 inline" />
              System Settings
            </button>
            <button
              onClick={() => setActiveTab("user-management")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "user-management"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconUsers className="w-4 h-4 mr-2 inline" />
              User Management
            </button>
            <button
              onClick={() => setActiveTab("security-settings")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "security-settings"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconShield className="w-4 h-4 mr-2 inline" />
              Security
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <IconBell className="w-4 h-4 mr-2 inline" />
              Notifications
            </button>
          </div>

          {/* System Settings Tab */}
          {activeTab === "system-settings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Settings */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconSettings className="w-5 h-5 mr-2" />
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="systemName">System Name</Label>
                      <Input
                        id="systemName"
                        value={systemSettings.systemName}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "systemName",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="systemVersion">System Version</Label>
                      <Input
                        id="systemVersion"
                        value={systemSettings.systemVersion}
                        disabled
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">
                          Maintenance Mode
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enable maintenance mode
                        </p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange("maintenanceMode", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Backup Settings */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconDatabase className="w-5 h-5 mr-2" />
                    Backup Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoBackup">Automatic Backup</Label>
                        <p className="text-sm text-gray-500">
                          Enable automatic backups
                        </p>
                      </div>
                      <Switch
                        id="autoBackup"
                        checked={systemSettings.autoBackup}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange("autoBackup", checked)
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select
                        value={systemSettings.backupFrequency}
                        onValueChange={(value) =>
                          handleSystemSettingChange("backupFrequency", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={systemSettings.maxFileSize}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "maxFileSize",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Session Settings */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconServer className="w-5 h-5 mr-2" />
                    Session Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="sessionTimeout">
                        Session Timeout (minutes)
                      </Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={systemSettings.sessionTimeout}
                        onChange={(e) =>
                          handleSystemSettingChange(
                            "sessionTimeout",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all users
                        </p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={systemSettings.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange("twoFactorAuth", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Logging Settings */}
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconFileText className="w-5 h-5 mr-2" />
                    Logging Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="systemLogs">System Logs</Label>
                        <p className="text-sm text-gray-500">
                          Enable system logging
                        </p>
                      </div>
                      <Switch
                        id="systemLogs"
                        checked={systemSettings.systemLogs}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange("systemLogs", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-gray-500">
                          Send email notifications
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={systemSettings.emailNotifications}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange(
                            "emailNotifications",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === "user-management" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">User Management</h3>
                <Dialog
                  open={isUserModalOpen}
                  onOpenChange={setIsUserModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <IconPlus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) =>
                              setNewUser((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) =>
                              setNewUser((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(value) =>
                            setNewUser((prev) => ({ ...prev, role: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="HR Manager">
                              HR Manager
                            </SelectItem>
                            <SelectItem value="Finance Manager">
                              Finance Manager
                            </SelectItem>
                            <SelectItem value="Employee">Employee</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <Select
                          value={newUser.department}
                          onValueChange={(value) =>
                            setNewUser((prev) => ({
                              ...prev,
                              department: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Engineering">
                              Engineering
                            </SelectItem>
                            <SelectItem value="HR">HR</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsUserModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="bg-white rounded-lg border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{user.role}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={user.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleUserStatus(user.id)}
                              >
                                <IconEdit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <IconTrash className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings Tab */}
          {activeTab === "security-settings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconLock className="w-5 h-5 mr-2" />
                    Authentication
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="twoFactorAuth">
                          Two-Factor Authentication
                        </Label>
                        <p className="text-sm text-gray-500">
                          Require 2FA for all users
                        </p>
                      </div>
                      <Switch
                        id="twoFactorAuth"
                        checked={systemSettings.twoFactorAuth}
                        onCheckedChange={(checked) =>
                          handleSystemSettingChange("twoFactorAuth", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="passwordPolicy">
                          Strong Password Policy
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enforce strong passwords
                        </p>
                      </div>
                      <Switch
                        id="passwordPolicy"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <IconShield className="w-5 h-5 mr-2" />
                    Access Control
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ipWhitelist">IP Whitelist</Label>
                        <p className="text-sm text-gray-500">
                          Restrict access by IP
                        </p>
                      </div>
                      <Switch
                        id="ipWhitelist"
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="sessionSecurity">
                          Session Security
                        </Label>
                        <p className="text-sm text-gray-500">
                          Enhanced session security
                        </p>
                      </div>
                      <Switch
                        id="sessionSecurity"
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <IconBell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationSettingChange(
                          "emailNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications
                      </p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationSettingChange(
                          "pushNotifications",
                          checked
                        )
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="systemAlerts">System Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Receive system alerts
                      </p>
                    </div>
                    <Switch
                      id="systemAlerts"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) =>
                        handleNotificationSettingChange("systemAlerts", checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="securityAlerts">Security Alerts</Label>
                      <p className="text-sm text-gray-500">
                        Receive security alerts
                      </p>
                    </div>
                    <Switch
                      id="securityAlerts"
                      checked={notificationSettings.securityAlerts}
                      onCheckedChange={(checked) =>
                        handleNotificationSettingChange(
                          "securityAlerts",
                          checked
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg">Save Settings</Button>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
