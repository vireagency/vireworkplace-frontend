import { useState, useEffect } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Filter, Clock, Settings, Trash2, Check, Loader2 } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationProvider";
import { useSidebarCounts } from "@/hooks/useSidebarCounts";
import { toast } from "sonner";

export default function StaffMessagesPage() {
  // Get notification context
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    getUserInfo,
  } = useNotifications();

  // Get sidebar counts
  const sidebarCounts = useSidebarCounts();

  // Local state
  const [activeTimeFilter, setActiveTimeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState({});

  // Filter mapping for API
  const filterMapping = {
    all: "all",
    today: "today",
    last3days: "last3days",
    last7days: "last7days",
  };

  const timeFilters = [
    { id: "all", label: "All" },
    { id: "today", label: "Today" },
    { id: "last3days", label: "Last 3 Days" },
    { id: "last7days", label: "Last 7 Days" },
  ];

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "urgent", label: "Urgent" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  // ============================================================================
  // NOTIFICATION HANDLING FUNCTIONS
  // ============================================================================

  /**
   * Handle filter change
   * @param {string} filter - Filter type
   */
  const handleFilterChange = async (filter) => {
    setActiveTimeFilter(filter);
    const apiFilter = filterMapping[filter] || "all";
    await fetchNotifications(apiFilter);
  };

  /**
   * Handle priority filter change
   * @param {string} priority - Priority level
   */
  const handlePriorityFilterChange = (priority) => {
    setPriorityFilter(priority);
  };

  /**
   * Filter notifications based on selected priority
   * @param {Array} notifications - Array of notifications
   * @returns {Array} Filtered notifications
   */
  const getFilteredNotifications = (notifications) => {
    if (priorityFilter === "all") {
      return notifications;
    }

    return notifications.filter((notification) => {
      const notificationPriority = notification.priority || "medium";
      return notificationPriority === priorityFilter;
    });
  };

  /**
   * Handle mark as read
   * @param {string} id - Notification ID
   */
  const handleMarkAsRead = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "read" }));
    try {
      await markAsRead(id);
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  /**
   * Handle delete notification
   * @param {string} id - Notification ID
   */
  const handleDeleteNotification = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "delete" }));
    try {
      await deleteNotification(id);
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  /**
   * Check if notification can be deleted
   * @param {Object} notification - Notification object
   * @returns {boolean} Whether notification can be deleted
   */
  const canDeleteNotification = (notification) => {
    const { userId, role } = getUserInfo();

    // Staff users can delete their own notifications
    if (role === "Staff") {
      return true;
    }

    // For other users, check if it's a personal notification
    if (notification.recipients && notification.recipients.includes(userId)) {
      return true;
    }

    // If no recipients field, allow deletion for personal notifications
    if (!notification.recipients && notification.userId === userId) {
      return true;
    }

    // Default to allowing deletion (can be made more restrictive if needed)
    return true;
  };

  /**
   * Get priority badge color
   * @param {string} priority - Priority level
   * @returns {string} Badge color class
   */
  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  /**
   * Format notification timestamp
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted time
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Unknown time";

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      // 7 days
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initial load
  useEffect(() => {
    fetchNotifications("all");
  }, [fetchNotifications]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const filteredNotifications = getFilteredNotifications(notifications);

  // Dynamically update the badges for sidebar items
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
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Messages & Notifications
          </h1>
          <p className="text-zinc-500">
            Stay updated with important messages and system notifications.
          </p>
        </div>

        <div className="ml-6 mr-6 space-y-6">
          {/* Filters Section */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-sm">
                  {filteredNotifications.length} notifications
                </Badge>
                {unreadCount > 0 && (
                  <Badge className="bg-blue-500 text-white">
                    {unreadCount} unread
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Time Period
                </label>
                <Select
                  value={activeTimeFilter}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeFilters.map((filter) => (
                      <SelectItem key={filter.id} value={filter.id}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Priority
                </label>
                <Select
                  value={priorityFilter}
                  onValueChange={handlePriorityFilterChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500 mb-4">
                  Error loading notifications: {error}
                </p>
                <Button
                  onClick={() => fetchNotifications("all")}
                  variant="outline"
                >
                  Retry
                </Button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500">
                  {priorityFilter !== "all" || activeTimeFilter !== "all"
                    ? "Try adjusting your filters to see more notifications."
                    : "You're all caught up! New notifications will appear here."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id || notification.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      !notification.isRead
                        ? "bg-blue-50 border-l-4 border-l-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {notification.senderName
                                ? notification.senderName[0]
                                : "S"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-gray-900">
                                {notification.title || "Notification"}
                              </h3>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                              {notification.message ||
                                notification.description ||
                                "No message content"}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(
                                  notification.createdAt ||
                                    notification.timestamp
                                )}
                              </div>

                              {notification.priority && (
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getPriorityBadgeColor(
                                    notification.priority
                                  )}`}
                                >
                                  {notification.priority}
                                </Badge>
                              )}

                              {notification.category && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {!notification.isRead && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleMarkAsRead(
                                notification._id || notification.id
                              )
                            }
                            disabled={
                              actionLoading[
                                notification._id || notification.id
                              ] === "read"
                            }
                            className="text-xs"
                          >
                            {actionLoading[
                              notification._id || notification.id
                            ] === "read" ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                            Mark Read
                          </Button>
                        )}

                        {canDeleteNotification(notification) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDeleteNotification(
                                notification._id || notification.id
                              )
                            }
                            disabled={
                              actionLoading[
                                notification._id || notification.id
                              ] === "delete"
                            }
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {actionLoading[
                              notification._id || notification.id
                            ] === "delete" ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
