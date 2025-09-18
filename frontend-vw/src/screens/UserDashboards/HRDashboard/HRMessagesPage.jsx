import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { hrDashboardConfig } from "@/config/dashboardConfigs";
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
import { toast } from "sonner";

export default function HRMessagesPage() {
  // Get notification context
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    canDeleteNotification,
  } = useNotifications();

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

  // Use the canDeleteNotification function from context

  /**
   * Get priority styling for notification
   * @param {string} priority - Priority level
   * @returns {Object} Styling object
   */
  const getPriorityStyle = (priority) => {
    const styles = {
      urgent: { color: "bg-red-500", text: "Urgent" },
      high: { color: "bg-orange-500", text: "High" },
      medium: { color: "bg-yellow-500", text: "Medium" },
      low: { color: "bg-green-500", text: "Low" },
    };
    return styles[priority] || styles.medium;
  };

  /**
   * Format notification date
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  const formatNotificationDate = (dateString) => {
    if (!dateString) return "Unknown time";

    const date = new Date(dateString);
    const now = new Date();

    // Check if date is valid
    if (isNaN(date.getTime())) return "Invalid date";

    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Fetch notifications when component mounts
  useEffect(() => {
    fetchNotifications("all");
  }, [fetchNotifications]);

  return (
    <DashboardLayout
      sidebarConfig={hrDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              {(() => {
                const filteredNotifications =
                  getFilteredNotifications(notifications);
                const filteredUnreadCount = filteredNotifications.filter(
                  (n) => !n.isRead
                ).length;
                return `${filteredNotifications.length} ${
                  priorityFilter === "all"
                    ? "total"
                    : priorityFilter + " priority"
                } notifications, ${filteredUnreadCount} unread`;
              })()}
            </p>
          </div>
          {error && <div className="text-red-500 text-sm">Error: {error}</div>}
        </div>

        {/* Time Filter Tabs */}
        <div className="flex space-x-2">
          {timeFilters.map((filter) => (
            <Button
              key={filter.id}
              variant={activeTimeFilter === filter.id ? "default" : "outline"}
              onClick={() => handleFilterChange(filter.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTimeFilter === filter.id
                  ? "bg-green-500 text-white border-green-500 shadow-sm hover:bg-green-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              } ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading && activeTimeFilter === filter.id ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select
            value={priorityFilter}
            onValueChange={handlePriorityFilterChange}
          >
            <SelectTrigger className="w-48 border-gray-300 rounded-lg">
              <SelectValue placeholder="All Priorities" />
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

        {/* Messages List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-gray-500">Loading notifications...</span>
            </div>
          ) : (
            (() => {
              const filteredNotifications =
                getFilteredNotifications(notifications);
              return filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-500">
                    {priorityFilter === "all"
                      ? "You don't have any notifications for the selected filter."
                      : `You don't have any ${priorityFilter} priority notifications.`}
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const priorityStyle = getPriorityStyle(
                    notification.priority || "medium"
                  );
                  const notificationId = notification._id || notification.id;
                  const isLoading = actionLoading[notificationId];

                  return (
                    <div
                      key={notificationId}
                      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                        !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarImage src={null} />
                          <AvatarFallback className="bg-gray-300 text-gray-600">
                            {notification.sender === "System" ||
                            notification.isSystem ? (
                              <Settings className="w-5 h-5" />
                            ) : (
                              (notification.sender || "N")
                                .charAt(0)
                                .toUpperCase()
                            )}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {notification.title || "Notification"}
                                </h3>
                                <Badge
                                  className={`${priorityStyle.color} text-white text-xs px-2 py-1 rounded-full`}
                                >
                                  {priorityStyle.text}
                                </Badge>
                                {!notification.isRead && (
                                  <Badge className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                    New
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {notification.sender || "System"}
                              </p>
                              <p className="text-sm text-gray-500 line-clamp-2">
                                {notification.message ||
                                  notification.description ||
                                  "No message content"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions and Timestamp */}
                        <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                          {/* Timestamp */}
                          <div className="flex items-center space-x-1 text-xs text-gray-600 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatNotificationDate(
                                notification.createdAt ||
                                  notification.timestamp ||
                                  notification.date
                              )}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-6 cursor-pointer"
                                onClick={() => handleMarkAsRead(notificationId)}
                                disabled={isLoading}
                              >
                                {isLoading === "read" ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark Read
                                  </>
                                )}
                              </Button>
                            )}

                            {canDeleteNotification(notification) && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-2 py-1 h-6 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                                onClick={() =>
                                  handleDeleteNotification(notificationId)
                                }
                                disabled={isLoading}
                              >
                                {isLoading === "delete" ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <>
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              );
            })()
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
