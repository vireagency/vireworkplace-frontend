import { useState } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import {
  IconSettings,
  IconUser,
  IconBell,
  IconShield,
  IconPalette,
  IconDatabase,
  IconMail,
  IconClock,
} from "@tabler/icons-react";

export default function StaffSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: "team",
    dataSharing: true,
    analytics: false,
  });

  const [theme, setTheme] = useState("light");

  // Get sidebar counts
  const sidebarCounts = useSidebarCounts();

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
          <p className="text-zinc-500">
            Manage your account preferences and system configurations.
          </p>
        </div>

        <div className="ml-6 mr-6 space-y-6">
          {/* Profile Settings */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconUser className="w-6 h-6 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter first name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter last name" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          </Card>

          {/* Password Settings */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconShield className="w-6 h-6 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Password & Security
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Update Password
                </Button>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconBell className="w-6 h-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Preferences
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via email
                    </p>
                  </div>
                  <Checkbox
                    id="email-notifications"
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, email: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Checkbox
                    id="push-notifications"
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, push: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Checkbox
                    id="sms-notifications"
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sms: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconShield className="w-6 h-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Privacy & Security
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-visibility">Profile Visibility</Label>
                  <Select
                    value={privacy.profileVisibility}
                    onValueChange={(value) =>
                      setPrivacy({ ...privacy, profileVisibility: value })
                    }
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public" className="cursor-pointer">
                        Public
                      </SelectItem>
                      <SelectItem value="team" className="cursor-pointer">
                        Team Only
                      </SelectItem>
                      <SelectItem value="private" className="cursor-pointer">
                        Private
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-gray-500">
                      Allow data to be shared with team members
                    </p>
                  </div>
                  <Checkbox
                    id="data-sharing"
                    checked={privacy.dataSharing}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, dataSharing: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="analytics">Analytics Collection</Label>
                    <p className="text-sm text-gray-500">
                      Allow collection of usage analytics
                    </p>
                  </div>
                  <Checkbox
                    id="analytics"
                    checked={privacy.analytics}
                    onCheckedChange={(checked) =>
                      setPrivacy({ ...privacy, analytics: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconPalette className="w-6 h-6 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Appearance
                </h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light" className="cursor-pointer">
                        Light
                      </SelectItem>
                      <SelectItem value="dark" className="cursor-pointer">
                        Dark
                      </SelectItem>
                      <SelectItem value="auto" className="cursor-pointer">
                        Auto
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* System Settings */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <IconSettings className="w-6 h-6 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  System Settings
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en" className="cursor-pointer">
                        English
                      </SelectItem>
                      <SelectItem value="es" className="cursor-pointer">
                        Spanish
                      </SelectItem>
                      <SelectItem value="fr" className="cursor-pointer">
                        French
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select>
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc" className="cursor-pointer">
                        UTC
                      </SelectItem>
                      <SelectItem value="est" className="cursor-pointer">
                        Eastern Time
                      </SelectItem>
                      <SelectItem value="pst" className="cursor-pointer">
                        Pacific Time
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="mr-3">
                  Reset to Defaults
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save All Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
