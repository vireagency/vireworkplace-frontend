import React, { useState, useCallback, useMemo } from "react";
import { HRDashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { IconPlus, IconChevronRight, IconChevronDown } from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { hrDashboardConfig } from "@/config/dashboardConfigs";

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

export default function HRNotificationSettings() {
  const { user } = useAuth();
  
  // Consolidated state object following React best practices
  const [state, setState] = useState({
    // UI state
    expandedCategories: {},
    isLoading: false,
    error: null,
    
    // Notification settings state
    notificationSettings: {
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
      employeeInformation: {
        toggles: {
          profileUpdates: false,
          newEmployeeOnboarding: false,
          employeeStatusChanges: false
        },
        enabled: 0,
        total: 3
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
      console.log('Saving notification preferences:', state.notificationSettings);
      // Handle save logic here
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [state.notificationSettings]);

  // Memoized notification categories to prevent recreation
  const notificationCategories = useMemo(() => [
    { key: 'performanceManagement', name: 'Performance Management' },
    { key: 'taskManagement', name: 'Task Management' },
    { key: 'employeeInformation', name: 'Employee Information' },
    { key: 'systemAlerts', name: 'System Alerts' },
    { key: 'deliveryMethods', name: 'Delivery Methods' },
    { key: 'globalSettings', name: 'Global Settings' }
  ], []);

  return (
    <HRDashboardLayout 
      sidebarConfig={hrDashboardConfig}
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
            <span className="text-gray-500">Notifications</span>
          </p>
        </div>

        {/* Profile Section */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-24 h-24 rounded-full overflow-hidden" key={user?.avatarUpdatedAt || user?.avatar}>
                <AvatarImage 
                  src={user?.avatar} 
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <AvatarFallback className="text-lg bg-gray-200 text-gray-600 rounded-full">
                  {user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'}
                </AvatarFallback>
              </Avatar>
              {/* Green plus icon overlay */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <IconPlus className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* Profile Details */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <button className="text-red-500 text-sm hover:underline cursor-pointer">Remove</button>
                <button className="text-green-500 text-sm hover:underline cursor-pointer">Update</button>
              </div>
              <p className="text-sm text-gray-400 mb-2">Recommended size: 400X400px</p>
              <h3 className="text-lg font-bold text-gray-800 mb-1">
                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
              </h3>
              <p className="text-gray-600 mb-3">{user?.jobRole || user?.role || 'Loading...'}</p>
              <div className="flex items-center space-x-6">
                <StatusBadge status={user?.attendanceStatus || "Active"} />
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">Work ID: {user?.workId || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 text-sm">Arrival: {user?.isLate ? 'Late' : 'On Time'}</span>
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Notification Settings</h1>
              <p className="text-gray-600">
                Manage your notification preferences for various events and activities within the system.
              </p>
            </div>

            {/* Notification Categories */}
            <div className="space-y-4 mb-8">
              {notificationCategories.map((category) => {
                const isExpanded = state.expandedCategories[category.key];
                const settings = state.notificationSettings[category.key];
                
                return (
                  <div key={category.key} className="bg-white border border-gray-200 rounded-lg">
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
                        <span className="font-medium text-gray-800">{category.name}</span>
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
                          {category.key === 'performanceManagement' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">New Review Assigned</h4>
                                  <p className="text-sm text-gray-600">Receive notifications when a new performance review is assigned to you.</p>
                                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.performanceManagement.toggles.reviewReminders}
                                    onCheckedChange={() => toggleIndividualSetting('performanceManagement', 'reviewReminders')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                </div>
              </div>
              
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Review Due Date Approaching</h4>
                                  <p className="text-sm text-gray-600">Get reminders as the due date for a performance review approaches.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.performanceManagement.toggles.reviewDueDate}
                                    onCheckedChange={() => toggleIndividualSetting('performanceManagement', 'reviewDueDate')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
              
                              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Feedback Received</h4>
                                  <p className="text-sm text-gray-600">Be notified when feedback is received on your performance.</p>
                </div>
                                                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.performanceManagement.toggles.feedbackReceived}
                                    onCheckedChange={() => toggleIndividualSetting('performanceManagement', 'feedbackReceived')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
              </div>
            </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Performance Deadlines</h4>
                                  <p className="text-sm text-gray-600">Receive alerts for upcoming performance-related deadlines.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.performanceManagement.toggles.goalUpdates}
                                    onCheckedChange={() => toggleIndividualSetting('performanceManagement', 'goalUpdates')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
            </div>
          </div>
          )}

                          {/* Task Management specific notifications */}
                          {category.key === 'taskManagement' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Task Assignments</h4>
                                  <p className="text-sm text-gray-600">Get notified when a new task is assigned to you.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.taskManagement.toggles.taskAssignments}
                                    onCheckedChange={() => toggleIndividualSetting('taskManagement', 'taskAssignments')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
                  </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Task Updates</h4>
                                  <p className="text-sm text-gray-600">Receive updates on the progress of tasks you're involved in.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.taskManagement.toggles.taskUpdates}
                                    onCheckedChange={() => toggleIndividualSetting('taskManagement', 'taskUpdates')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
                </div>
                
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Task Deadlines</h4>
                                  <p className="text-sm text-gray-600">Get reminders for approaching task deadlines.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.taskManagement.toggles.taskDeadlines}
                                    onCheckedChange={() => toggleIndividualSetting('taskManagement', 'taskDeadlines')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
              </div>
            </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Task Completions</h4>
                                  <p className="text-sm text-gray-600">Be notified when a task you're involved in is completed.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.taskManagement.toggles.taskCompletions}
                                    onCheckedChange={() => toggleIndividualSetting('taskManagement', 'taskCompletions')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
            </div>
          </div>
        )}

                          {/* Employee Information specific notifications */}
                          {category.key === 'employeeInformation' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Profile Updates</h4>
                                  <p className="text-sm text-gray-600">Receive notifications for updates to employee profiles.</p>
                                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.employeeInformation.toggles.profileUpdates}
                                    onCheckedChange={() => toggleIndividualSetting('employeeInformation', 'profileUpdates')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
                </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">New Employee Onboarding</h4>
                                  <p className="text-sm text-gray-600">Get notified when a new employee is onboarded into the system.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.employeeInformation.toggles.newEmployeeOnboarding}
                                    onCheckedChange={() => toggleIndividualSetting('employeeInformation', 'newEmployeeOnboarding')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                  />
                </div>
              </div>
              
                              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Employee Status Changes</h4>
                                  <p className="text-sm text-gray-600">Receive alerts for changes in employee status.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.employeeInformation.toggles.employeeStatusChanges}
                                    onCheckedChange={() => toggleIndividualSetting('employeeInformation', 'employeeStatusChanges')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
                              </div>
                </div>
                          )}

                          {/* System Alerts specific notifications */}
                          {category.key === 'systemAlerts' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">System Maintenance</h4>
                                  <p className="text-sm text-gray-600">Receive notifications for system maintenance activities.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.systemAlerts.toggles.systemMaintenance}
                                    onCheckedChange={() => toggleIndividualSetting('systemAlerts', 'systemMaintenance')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
                </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">System Updates</h4>
                                  <p className="text-sm text-gray-600">Get alerts for system updates and new features.</p>
                                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.systemAlerts.toggles.systemUpdates}
                                    onCheckedChange={() => toggleIndividualSetting('systemAlerts', 'systemUpdates')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
              </div>
            </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Application Announcements</h4>
                                  <p className="text-sm text-gray-600">Receive important announcements from the application provider.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.systemAlerts.toggles.applicationAnnouncements}
                                    onCheckedChange={() => toggleIndividualSetting('systemAlerts', 'applicationAnnouncements')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
            </div>
          </div>
        )}

                          {/* Delivery Methods specific notifications */}
                          {category.key === 'deliveryMethods' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">In-App Notifications</h4>
                                  <p className="text-sm text-gray-600">Receive notifications within the web application.</p>
                                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.deliveryMethods.toggles.inAppNotifications}
                                    onCheckedChange={() => toggleIndividualSetting('deliveryMethods', 'inAppNotifications')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                </div>
              </div>
              
                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Email Notifications</h4>
                                  <p className="text-sm text-gray-600">Receive notifications via email.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.deliveryMethods.toggles.emailNotifications}
                                    onCheckedChange={() => toggleIndividualSetting('deliveryMethods', 'emailNotifications')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                </div>
              </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Desktop Notifications</h4>
                                  <p className="text-sm text-gray-600">Receive notifications as desktop pop-ups.</p>
                                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.deliveryMethods.toggles.desktopNotifications}
                                    onCheckedChange={() => toggleIndividualSetting('deliveryMethods', 'desktopNotifications')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                </div>
                </div>

                                                            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Platform Integrations</h4>
                                  <p className="text-sm text-gray-600">Receive notifications via Slack or Microsoft Teams.</p>
                </div>
                                                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.deliveryMethods.toggles.platformIntegrations}
                                    onCheckedChange={() => toggleIndividualSetting('deliveryMethods', 'platformIntegrations')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                </div>
              </div>
            </div>
                          )}

                          {/* Global Settings specific notifications */}
                          {category.key === 'globalSettings' && (
                            <div className="space-y-3">
                                                            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-800 mb-1">Master Notification Toggle</h4>
                                  <p className="text-sm text-gray-600">Enable or disable all notifications across all categories.</p>
                                </div>
                                <div className="ml-4">
                                  <Switch
                                    checked={state.notificationSettings.globalSettings.toggles.masterNotificationToggle}
                                    onCheckedChange={() => toggleIndividualSetting('globalSettings', 'masterNotificationToggle')}
                                    className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-200"
                                  />
                                </div>
            </div>
          </div>
        )}

                          {/* Other categories can be added here with similar structure */}
                          {category.key !== 'performanceManagement' && category.key !== 'taskManagement' && category.key !== 'employeeInformation' && category.key !== 'systemAlerts' && category.key !== 'deliveryMethods' && category.key !== 'globalSettings' && (
                            <div className="space-y-3">
                              <p className="text-sm text-gray-600 mb-4">
                                Configure specific notification settings for {category.name.toLowerCase()}.
                              </p>
                              {Array.from({ length: settings.total }, (_, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">
                                    Notification {index + 1} for {category.name}
                                  </span>
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer"
                                  />
              </div>
                              ))}
            </div>
                          )}
              </div>
            </div>
                    )}
              </div>
                );
              })}
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">Error: {state.error}</p>
              </div>
            )}

            {/* Save Preferences Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleSavePreferences}
                disabled={state.isLoading}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-medium text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.isLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </HRDashboardLayout>
  );
}