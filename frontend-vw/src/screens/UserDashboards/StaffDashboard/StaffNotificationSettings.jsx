import React, { useState, useCallback, useMemo } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IconPlus, IconChevronRight, IconChevronDown } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { staffDashboardConfig } from "@/config/dashboardConfigs";

// StatusBadge component moved outside to prevent recreation on every render
const StatusBadge = React.memo(({ status }) => {
    const statusConfig = {
      "Active": { 
        bgColor: "bg-green-50", 
        borderColor: "border-green-200", 
        textColor: "text-green-700",
        dotColor: "bg-green-500",
        text: "Active" 
      },
      "In-active": { 
        bgColor: "bg-orange-50", 
        borderColor: "border-orange-200", 
        textColor: "text-orange-700",
        dotColor: "bg-orange-500",
        text: "In-active" 
      },
      "Closed": { 
        bgColor: "bg-red-50", 
        borderColor: "border-red-200", 
        textColor: "text-red-700",
        dotColor: "bg-red-500",
        text: "Closed" 
      }
    }
    
    const config = statusConfig[status] || statusConfig["Active"]
    
    return (
      <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
        <div className={`w-2 h-2 ${config.dotColor} rounded-full`}></div>
        <span className={`text-sm font-medium ${config.textColor}`}>{config.text}</span>
      </div>
    )
});

export default function StaffNotificationSettings() {
  const { user } = useAuth();
  
  // Consolidated state object following React best practices
  const [state, setState] = useState({
    // UI state
    expandedCategories: {},
    isLoading: false,
    error: null,
    
    // Notification settings state
    notificationSettings: {
      taskManagement: {
        toggles: {
          taskAssignments: false,
          taskUpdates: false,
          taskDeadlines: false,
          taskCompletions: false
        },
        enabled: 0,
        total: 4
      },
      performanceManagement: {
        toggles: {
          reviewReminders: false,
          reviewDueDate: false,
          feedbackReceived: false,
          goalUpdates: false
        },
        enabled: 0,
        total: 4
      },
      attendanceTracking: {
        toggles: {
          checkInReminders: false,
          checkOutReminders: false,
          attendanceAlerts: false,
          overtimeNotifications: false
        },
        enabled: 0,
        total: 4
      },
      teamCommunication: {
        toggles: {
          teamMessages: false,
          teamUpdates: false,
          meetingReminders: false,
          announcementNotifications: false
        },
        enabled: 0,
        total: 4
      },
      systemAlerts: {
        toggles: {
          systemMaintenance: false,
          systemUpdates: false,
          applicationAnnouncements: false
        },
        enabled: 0,
        total: 3
      },
      deliveryMethods: {
        toggles: {
          inAppNotifications: false,
          emailNotifications: false,
          desktopNotifications: false,
          platformIntegrations: false
        },
        enabled: 0,
        total: 4
      },
      globalSettings: {
        toggles: {
          masterNotificationToggle: false
        },
        enabled: 0,
        total: 1
      }
    }
  });

  // Memoized event handlers to prevent unnecessary re-renders
  const toggleCategory = useCallback((category) => {
    setState(prev => ({
      ...prev,
      expandedCategories: {
        ...prev.expandedCategories,
        [category]: !prev.expandedCategories[category]
      }
    }));
  }, []);

  const enableAll = useCallback((category) => {
    setState(prev => {
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
            enabled: categorySettings.total
          }
        }
      };
    });
  }, []);

  const disableAll = useCallback((category) => {
    setState(prev => {
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
            enabled: 0
          }
        }
      };
    });
  }, []);

  const toggleIndividualSetting = useCallback((category, setting) => {
    setState(prev => {
      const categorySettings = prev.notificationSettings[category];
      const updatedToggles = {
        ...categorySettings.toggles,
        [setting]: !categorySettings.toggles[setting]
      };
      
      // Calculate enabled count
      const enabledCount = Object.values(updatedToggles).filter(Boolean).length;
      
      return {
        ...prev,
        notificationSettings: {
          ...prev.notificationSettings,
          [category]: {
            ...categorySettings,
            toggles: updatedToggles,
            enabled: enabledCount
          }
        }
      };
    });
  }, []);

  const handleSavePreferences = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: null 
      }));
      
      // Show success message (you can replace with toast notification)
      console.log("Notification preferences saved successfully!");
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: error.message 
      }));
    }
  }, []);

  // Memoized notification categories configuration
  const notificationCategories = useMemo(() => [
    {
      key: "taskManagement",
      title: "Task Management",
      description: "Notifications related to your assigned tasks and project updates",
      icon: "📋"
    },
    {
      key: "performanceManagement",
      title: "Performance Management",
      description: "Notifications about performance reviews, goals, and feedback",
      icon: "📊"
    },
    {
      key: "attendanceTracking",
      title: "Attendance Tracking",
      description: "Notifications about check-in/out reminders and attendance alerts",
      icon: "⏰"
    },
    {
      key: "teamCommunication",
      title: "Team Communication",
      description: "Notifications about team messages, meetings, and announcements",
      icon: "👥"
    },
    {
      key: "systemAlerts",
      title: "System Alerts",
      description: "System maintenance, updates, and application announcements",
      icon: "🔧"
    },
    {
      key: "deliveryMethods",
      title: "Delivery Methods",
      description: "Choose how you want to receive notifications",
      icon: "📱"
    }
  ], []);

  // Memoized individual notification settings
  const individualSettings = useMemo(() => ({
    taskManagement: [
      { key: "taskAssignments", label: "New Task Assignments", description: "Get notified when new tasks are assigned to you" },
      { key: "taskUpdates", label: "Task Updates", description: "Receive updates when task details change" },
      { key: "taskDeadlines", label: "Task Deadlines", description: "Reminders about upcoming task deadlines" },
      { key: "taskCompletions", label: "Task Completions", description: "Notifications when tasks are completed" }
    ],
    performanceManagement: [
      { key: "reviewReminders", label: "Review Reminders", description: "Reminders about upcoming performance reviews" },
      { key: "reviewDueDate", label: "Review Due Dates", description: "Alerts when review deadlines are approaching" },
      { key: "feedbackReceived", label: "Feedback Received", description: "Notifications when you receive new feedback" },
      { key: "goalUpdates", label: "Goal Updates", description: "Updates about your performance goals" }
    ],
    attendanceTracking: [
      { key: "checkInReminders", label: "Check-In Reminders", description: "Reminders to check in for work" },
      { key: "checkOutReminders", label: "Check-Out Reminders", description: "Reminders to check out at end of day" },
      { key: "attendanceAlerts", label: "Attendance Alerts", description: "Alerts about attendance issues" },
      { key: "overtimeNotifications", label: "Overtime Notifications", description: "Notifications about overtime hours" }
    ],
    teamCommunication: [
      { key: "teamMessages", label: "Team Messages", description: "Notifications about new team messages" },
      { key: "teamUpdates", label: "Team Updates", description: "Updates about team changes and news" },
      { key: "meetingReminders", label: "Meeting Reminders", description: "Reminders about upcoming meetings" },
      { key: "announcementNotifications", label: "Announcements", description: "Company and team announcements" }
    ],
    systemAlerts: [
      { key: "systemMaintenance", label: "System Maintenance", description: "Notifications about scheduled maintenance" },
      { key: "systemUpdates", label: "System Updates", description: "Information about system updates" },
      { key: "applicationAnnouncements", label: "App Announcements", description: "Important application announcements" }
    ],
    deliveryMethods: [
      { key: "inAppNotifications", label: "In-App Notifications", description: "Notifications within the application" },
      { key: "emailNotifications", label: "Email Notifications", description: "Notifications sent to your email" },
      { key: "desktopNotifications", label: "Desktop Notifications", description: "Desktop push notifications" },
      { key: "platformIntegrations", label: "Platform Integrations", description: "Notifications through integrated platforms" }
    ]
  }), []);

  return (
    <StaffDashboardLayout 
      sidebarConfig={staffDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="mb-8 ml-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 mb-2">Notification Settings</h1>
              <p className="text-zinc-500">Customize your notification preferences to stay informed about important updates.</p>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar} alt={user?.firstName} />
                <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500">Staff Member</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ml-6 mr-6 space-y-6">
          {/* Global Settings */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Master Notification Control</h2>
                <p className="text-sm text-gray-500">Enable or disable all notifications at once</p>
              </div>
              <Switch
                checked={state.notificationSettings.globalSettings.toggles.masterNotificationToggle}
                onCheckedChange={(checked) => toggleIndividualSetting("globalSettings", "masterNotificationToggle")}
              />
            </div>
          </div>

          {/* Notification Categories */}
          {notificationCategories.map((category) => {
            const categorySettings = state.notificationSettings[category.key];
            const isExpanded = state.expandedCategories[category.key];
            const settings = individualSettings[category.key] || [];

            return (
              <div key={category.key} className="bg-white border border-gray-200 shadow-sm rounded-lg">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.key)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-sm text-gray-500">
                        {categorySettings.enabled} of {categorySettings.total} enabled
                      </div>
                      {isExpanded ? <IconChevronDown className="w-5 h-5" /> : <IconChevronRight className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Individual Settings</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => enableAll(category.key)}
                        >
                          Enable All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disableAll(category.key)}
                        >
                          Disable All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {settings.map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <Label htmlFor={setting.key} className="text-sm font-medium text-gray-900">
                              {setting.label}
                            </Label>
                            <p className="text-xs text-gray-500">{setting.description}</p>
                          </div>
                          <Switch
                            id={setting.key}
                            checked={categorySettings.toggles[setting.key]}
                            onCheckedChange={() => toggleIndividualSetting(category.key, setting.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSavePreferences}
              disabled={state.isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {state.isLoading ? "Saving..." : "Save Preferences"}
            </Button>
          </div>

          {/* Error Message */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
