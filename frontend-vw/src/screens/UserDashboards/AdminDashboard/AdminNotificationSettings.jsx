import React, { useState, useEffect } from "react";
import AdminDashboardLayout from "@/components/dashboard/AdminDashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  IconBell,
  IconMail,
  IconPhone,
  IconMessage,
  IconShield,
  IconUsers,
  IconDatabase,
  IconAlertTriangle,
  IconCheck,
  IconSettings,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";

export default function AdminNotificationSettings() {
  const { user, accessToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    // Email Notifications
    emailNotifications: true,
    emailSystemAlerts: true,
    emailSecurityAlerts: true,
    emailPerformanceAlerts: true,
    emailUserActivity: false,
    emailReports: true,
    emailMaintenance: true,

    // Push Notifications
    pushNotifications: true,
    pushSystemAlerts: true,
    pushSecurityAlerts: true,
    pushPerformanceAlerts: false,
    pushUserActivity: false,
    pushReports: false,
    pushMaintenance: true,

    // SMS Notifications
    smsNotifications: false,
    smsSecurityAlerts: true,
    smsSystemAlerts: false,
    smsMaintenance: false,

    // In-App Notifications
    inAppNotifications: true,
    inAppSystemAlerts: true,
    inAppSecurityAlerts: true,
    inAppPerformanceAlerts: true,
    inAppUserActivity: true,
    inAppReports: true,
    inAppMaintenance: true,

    // Notification Frequency
    notificationFrequency: "immediate",
    quietHours: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    weekendNotifications: true,

    // Notification Channels
    channels: {
      email: true,
      push: true,
      sms: false,
      inApp: true,
    },
  });

  const [originalSettings, setOriginalSettings] = useState({});

  useEffect(() => {
    setOriginalSettings(notificationSettings);
  }, []);

  const handleSettingChange = (key, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleChannelChange = (channel, value) => {
    setNotificationSettings((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setOriginalSettings(notificationSettings);
      setHasChanges(false);
      toast.success("Notification settings saved successfully");
    } catch (error) {
      toast.error("Failed to save notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNotificationSettings(originalSettings);
    setHasChanges(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "email":
        return <IconMail className="w-5 h-5" />;
      case "push":
        return <IconBell className="w-5 h-5" />;
      case "sms":
        return <IconPhone className="w-5 h-5" />;
      case "inApp":
        return <IconMessage className="w-5 h-5" />;
      default:
        return <IconBell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "email":
        return "text-blue-600";
      case "push":
        return "text-green-600";
      case "sms":
        return "text-purple-600";
      case "inApp":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
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
              Notification Settings
            </h1>
            <p className="text-gray-600">
              Manage your notification preferences and alerts
            </p>
          </div>
          <div className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset}>
                Reset Changes
              </Button>
            )}
            <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Notification Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconSettings className="w-5 h-5 mr-2" />
              Notification Channels
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(notificationSettings.channels).map(
                ([channel, enabled]) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className={`mr-3 ${getNotificationColor(channel)}`}>
                        {getNotificationIcon(channel)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{channel}</p>
                        <p className="text-sm text-gray-500">
                          {channel === "email" && "Email notifications"}
                          {channel === "push" && "Push notifications"}
                          {channel === "sms" && "SMS notifications"}
                          {channel === "inApp" && "In-app notifications"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={(checked) =>
                        handleChannelChange(channel, checked)
                      }
                    />
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconMail className="w-5 h-5 mr-2" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enable all email notifications
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("emailNotifications", checked)
                  }
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailSystemAlerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">
                      System maintenance and updates
                    </p>
                  </div>
                  <Switch
                    id="emailSystemAlerts"
                    checked={notificationSettings.emailSystemAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailSystemAlerts", checked)
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailSecurityAlerts">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Security breaches and login attempts
                    </p>
                  </div>
                  <Switch
                    id="emailSecurityAlerts"
                    checked={notificationSettings.emailSecurityAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailSecurityAlerts", checked)
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailPerformanceAlerts">
                      Performance Alerts
                    </Label>
                    <p className="text-sm text-gray-500">
                      System performance and metrics
                    </p>
                  </div>
                  <Switch
                    id="emailPerformanceAlerts"
                    checked={notificationSettings.emailPerformanceAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailPerformanceAlerts", checked)
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailUserActivity">User Activity</Label>
                    <p className="text-sm text-gray-500">
                      User login and activity reports
                    </p>
                  </div>
                  <Switch
                    id="emailUserActivity"
                    checked={notificationSettings.emailUserActivity}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailUserActivity", checked)
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailReports">Reports</Label>
                    <p className="text-sm text-gray-500">
                      Automated reports and summaries
                    </p>
                  </div>
                  <Switch
                    id="emailReports"
                    checked={notificationSettings.emailReports}
                    onCheckedChange={(checked) =>
                      handleSettingChange("emailReports", checked)
                    }
                    disabled={!notificationSettings.emailNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconBell className="w-5 h-5 mr-2" />
                Push Notifications
              </CardTitle>
              <CardDescription>
                Configure push notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Enable all push notifications
                  </p>
                </div>
                <Switch
                  id="pushNotifications"
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("pushNotifications", checked)
                  }
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushSystemAlerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Critical system notifications
                    </p>
                  </div>
                  <Switch
                    id="pushSystemAlerts"
                    checked={notificationSettings.pushSystemAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushSystemAlerts", checked)
                    }
                    disabled={!notificationSettings.pushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushSecurityAlerts">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Immediate security notifications
                    </p>
                  </div>
                  <Switch
                    id="pushSecurityAlerts"
                    checked={notificationSettings.pushSecurityAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushSecurityAlerts", checked)
                    }
                    disabled={!notificationSettings.pushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushPerformanceAlerts">
                      Performance Alerts
                    </Label>
                    <p className="text-sm text-gray-500">
                      Performance threshold alerts
                    </p>
                  </div>
                  <Switch
                    id="pushPerformanceAlerts"
                    checked={notificationSettings.pushPerformanceAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushPerformanceAlerts", checked)
                    }
                    disabled={!notificationSettings.pushNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="pushUserActivity">User Activity</Label>
                    <p className="text-sm text-gray-500">
                      User login and activity alerts
                    </p>
                  </div>
                  <Switch
                    id="pushUserActivity"
                    checked={notificationSettings.pushUserActivity}
                    onCheckedChange={(checked) =>
                      handleSettingChange("pushUserActivity", checked)
                    }
                    disabled={!notificationSettings.pushNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconPhone className="w-5 h-5 mr-2" />
                SMS Notifications
              </CardTitle>
              <CardDescription>
                Configure SMS notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Enable SMS notifications
                  </p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("smsNotifications", checked)
                  }
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsSecurityAlerts">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Critical security notifications
                    </p>
                  </div>
                  <Switch
                    id="smsSecurityAlerts"
                    checked={notificationSettings.smsSecurityAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("smsSecurityAlerts", checked)
                    }
                    disabled={!notificationSettings.smsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsSystemAlerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Critical system notifications
                    </p>
                  </div>
                  <Switch
                    id="smsSystemAlerts"
                    checked={notificationSettings.smsSystemAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("smsSystemAlerts", checked)
                    }
                    disabled={!notificationSettings.smsNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="smsMaintenance">Maintenance Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Scheduled maintenance notifications
                    </p>
                  </div>
                  <Switch
                    id="smsMaintenance"
                    checked={notificationSettings.smsMaintenance}
                    onCheckedChange={(checked) =>
                      handleSettingChange("smsMaintenance", checked)
                    }
                    disabled={!notificationSettings.smsNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* In-App Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IconMessage className="w-5 h-5 mr-2" />
                In-App Notifications
              </CardTitle>
              <CardDescription>
                Configure in-app notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="inAppNotifications">
                    In-App Notifications
                  </Label>
                  <p className="text-sm text-gray-500">
                    Enable in-app notifications
                  </p>
                </div>
                <Switch
                  id="inAppNotifications"
                  checked={notificationSettings.inAppNotifications}
                  onCheckedChange={(checked) =>
                    handleSettingChange("inAppNotifications", checked)
                  }
                />
              </div>

              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inAppSystemAlerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">
                      System status and updates
                    </p>
                  </div>
                  <Switch
                    id="inAppSystemAlerts"
                    checked={notificationSettings.inAppSystemAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("inAppSystemAlerts", checked)
                    }
                    disabled={!notificationSettings.inAppNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inAppSecurityAlerts">Security Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Security notifications and alerts
                    </p>
                  </div>
                  <Switch
                    id="inAppSecurityAlerts"
                    checked={notificationSettings.inAppSecurityAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("inAppSecurityAlerts", checked)
                    }
                    disabled={!notificationSettings.inAppNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inAppPerformanceAlerts">
                      Performance Alerts
                    </Label>
                    <p className="text-sm text-gray-500">
                      Performance metrics and alerts
                    </p>
                  </div>
                  <Switch
                    id="inAppPerformanceAlerts"
                    checked={notificationSettings.inAppPerformanceAlerts}
                    onCheckedChange={(checked) =>
                      handleSettingChange("inAppPerformanceAlerts", checked)
                    }
                    disabled={!notificationSettings.inAppNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inAppUserActivity">User Activity</Label>
                    <p className="text-sm text-gray-500">
                      User activity and reports
                    </p>
                  </div>
                  <Switch
                    id="inAppUserActivity"
                    checked={notificationSettings.inAppUserActivity}
                    onCheckedChange={(checked) =>
                      handleSettingChange("inAppUserActivity", checked)
                    }
                    disabled={!notificationSettings.inAppNotifications}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <IconSettings className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Configure notification timing and frequency
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="quietHours">Quiet Hours</Label>
                    <p className="text-sm text-gray-500">
                      Disable notifications during specific hours
                    </p>
                  </div>
                  <Switch
                    id="quietHours"
                    checked={notificationSettings.quietHours}
                    onCheckedChange={(checked) =>
                      handleSettingChange("quietHours", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekendNotifications">
                      Weekend Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications on weekends
                    </p>
                  </div>
                  <Switch
                    id="weekendNotifications"
                    checked={notificationSettings.weekendNotifications}
                    onCheckedChange={(checked) =>
                      handleSettingChange("weekendNotifications", checked)
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="notificationFrequency">
                    Notification Frequency
                  </Label>
                  <select
                    id="notificationFrequency"
                    value={notificationSettings.notificationFrequency}
                    onChange={(e) =>
                      handleSettingChange(
                        "notificationFrequency",
                        e.target.value
                      )
                    }
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="immediate">Immediate</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminDashboardLayout>
  );
}
