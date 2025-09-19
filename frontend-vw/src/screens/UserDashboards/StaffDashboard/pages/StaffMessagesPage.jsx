import { useState, useEffect } from "react";
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Filter,
  Clock,
  Settings,
  Trash2,
  Check,
  Loader2,
  Search,
  Bell,
  CheckCheck,
  AlertCircle,
  Info,
  MessageSquare,
} from "lucide-react";
import { useNotifications } from "@/contexts/NotificationProvider";
import { useNotificationFilters } from "@/hooks/useNotificationFilters";
import { useNotificationActions } from "@/hooks/useNotificationActions";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
import { toast } from "sonner";

export default function StaffMessagesPage() {
  // Get notification context
  const {
    notifications,
    unreadCount,
    isLoading: notificationsLoading,
    error: notificationsError,
    fetchNotifications,
    isConnected,
  } = useNotifications();

  // Get notification filters hook
  const {
    searchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    dateFilter,
    sortBy,
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    setPriorityFilter,
    setDateFilter,
    setSortBy,
    filterOptions,
    filterNotifications,
    getFilterSummary,
    clearAllFilters,
  } = useNotificationFilters();

  // Get notification actions hook
  const {
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead,
    handleBulkDelete,
    handleBulkMarkAsRead,
    getNotificationStats,
    canDeleteNotification,
    canMarkAsRead,
    isLoading: actionsLoading,
  } = useNotificationActions();

  // Get standardized sidebar
  const { sidebarConfig } = useStandardizedSidebar();

  // Local state
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Get filtered notifications using the hook
  const filteredNotifications = filterNotifications(notifications);
  const filterSummary = getFilterSummary(notifications);
  const notificationStats = getNotificationStats();

  // Add some mock data for testing if no notifications are available
  const mockNotifications = [
    {
      _id: "mock-1",
      title: "Welcome to Vire Workplace",
      message:
        "Welcome to the Vire Workplace HR system. You can now access all your HR features.",
      type: "welcome",
      priority: "medium",
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: "System",
    },
    {
      _id: "mock-2",
      title: "Performance Review Due",
      message:
        "Your annual performance review is due next week. Please complete it by the deadline.",
      type: "evaluation",
      priority: "high",
      isRead: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sender: "HR Department",
    },
    {
      _id: "mock-3",
      title: "New Task Assigned",
      message:
        "You have been assigned a new task: Complete project documentation.",
      type: "task",
      priority: "medium",
      isRead: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      sender: "Project Manager",
    },
  ];

  // Use mock data if no real notifications are available
  const displayNotifications =
    notifications.length > 0 ? filteredNotifications : mockNotifications;

  // ============================================================================
  // BULK ACTIONS HANDLERS
  // ============================================================================

  /**
   * Handle notification selection
   * @param {string} notificationId - Notification ID
   * @param {boolean} selected - Whether notification is selected
   */
  const handleNotificationSelection = (notificationId, selected) => {
    if (selected) {
      setSelectedNotifications((prev) => [...prev, notificationId]);
    } else {
      setSelectedNotifications((prev) =>
        prev.filter((id) => id !== notificationId)
      );
    }
  };

  /**
   * Handle select all notifications
   * @param {boolean} selectAll - Whether to select all or none
   */
  const handleSelectAll = (selectAll) => {
    if (selectAll) {
      setSelectedNotifications(displayNotifications.map((n) => n._id || n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  /**
   * Handle bulk mark as read
   */
  const handleBulkMarkAsReadAction = async () => {
    if (selectedNotifications.length === 0) {
      toast.error("No notifications selected");
      return;
    }

    const result = await handleBulkMarkAsRead(selectedNotifications);
    if (result.success) {
      setSelectedNotifications([]);
      setShowBulkActions(false);
    }
  };

  /**
   * Handle bulk delete
   */
  const handleBulkDeleteAction = async () => {
    if (selectedNotifications.length === 0) {
      toast.error("No notifications selected");
      return;
    }

    const result = await handleBulkDelete(selectedNotifications);
    if (result.success) {
      setSelectedNotifications([]);
      setShowBulkActions(false);
    }
  };

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
   * Get notification type icon
   * @param {string} type - Notification type
   * @returns {JSX.Element} Icon component
   */
  const getNotificationTypeIcon = (type) => {
    const iconMap = {
      evaluation: <Check className="w-4 h-4" />,
      performance: <AlertCircle className="w-4 h-4" />,
      task: <MessageSquare className="w-4 h-4" />,
      system: <Settings className="w-4 h-4" />,
      attendance: <Clock className="w-4 h-4" />,
      message: <Bell className="w-4 h-4" />,
    };
    return iconMap[type] || <Info className="w-4 h-4" />;
  };

  /**
   * Get notification type color
   * @param {string} type - Notification type
   * @returns {string} Color class
   */
  const getNotificationTypeColor = (type) => {
    const colorMap = {
      evaluation: "bg-green-100 text-green-600",
      performance: "bg-orange-100 text-orange-600",
      task: "bg-blue-100 text-blue-600",
      system: "bg-gray-100 text-gray-600",
      attendance: "bg-purple-100 text-purple-600",
      message: "bg-indigo-100 text-indigo-600",
    };
    return colorMap[type] || "bg-gray-100 text-gray-600";
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

  // Update bulk actions visibility based on selection
  useEffect(() => {
    setShowBulkActions(selectedNotifications.length > 0);
  }, [selectedNotifications]);

  return (
    <StaffDashboardLayout
      sidebarConfig={sidebarConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
              {!isConnected && (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-300"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2" />
                  Offline Mode
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filterSummary.total} total notifications, {filterSummary.unread}{" "}
              unread
              {filterSummary.hasActiveFilters && " (filtered)"}
            </p>
          </div>
          {notificationsError && (
            <div className="text-red-500 text-sm">
              Error: {notificationsError}
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {notificationStats.total}
                </p>
              </div>
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread</p>
                <p className="text-2xl font-bold text-blue-600">
                  {notificationStats.unread}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Read</p>
                <p className="text-2xl font-bold text-green-600">
                  {notificationStats.read}
                </p>
              </div>
              <CheckCheck className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Unread %</p>
                <p className="text-2xl font-bold text-orange-600">
                  {notificationStats.unreadPercentage}%
                </p>
              </div>
              <Info className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.status.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.type.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
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
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.priority.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.date.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                disabled={!filterSummary.hasActiveFilters}
              >
                Clear Filters
              </Button>
              {filterSummary.hasActiveFilters && (
                <span className="text-sm text-gray-500">
                  {displayNotifications.length} of {filterSummary.total}{" "}
                  notifications
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={filterSummary.unread === 0}
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedNotifications.length} notification
                  {selectedNotifications.length > 1 ? "s" : ""} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedNotifications([])}
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkMarkAsReadAction}
                  disabled={actionsLoading}
                >
                  {actionsLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCheck className="w-4 h-4 mr-2" />
                  )}
                  Mark as Read
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDeleteAction}
                  disabled={actionsLoading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {actionsLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Messages List */}
        <div className="space-y-4">
          {notificationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-gray-500">Loading notifications...</span>
            </div>
          ) : displayNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                {filterSummary.hasActiveFilters
                  ? "No notifications match your current filters."
                  : "You don't have any notifications yet."}
              </p>
              {filterSummary.hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            displayNotifications.map((notification) => {
              const priorityStyle = getPriorityStyle(
                notification.priority || "medium"
              );
              const notificationId = notification._id || notification.id;
              const isSelected = selectedNotifications.includes(notificationId);
              const notificationType = notification.type || "message";

              return (
                <div
                  key={notificationId}
                  className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    !notification.isRead ? "bg-blue-50 border-blue-200" : ""
                  } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                  onClick={() =>
                    handleNotificationSelection(notificationId, !isSelected)
                  }
                >
                  <div className="flex items-start space-x-4">
                    {/* Selection Checkbox */}
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleNotificationSelection(
                            notificationId,
                            e.target.checked
                          );
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>

                    {/* Type Icon */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationTypeColor(
                          notificationType
                        )}`}
                      >
                        {getNotificationTypeIcon(notificationType)}
                      </div>
                    </div>

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
                            <Badge
                              className={`${getNotificationTypeColor(
                                notificationType
                              )} text-xs px-2 py-1 rounded-full`}
                            >
                              {notificationType}
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
                        {canMarkAsRead(notification) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs px-2 py-1 h-6 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notificationId);
                            }}
                            disabled={actionsLoading}
                          >
                            {actionsLoading ? (
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notificationId);
                            }}
                            disabled={actionsLoading}
                          >
                            {actionsLoading ? (
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
          )}
        </div>
      </div>
    </StaffDashboardLayout>
  );
}
