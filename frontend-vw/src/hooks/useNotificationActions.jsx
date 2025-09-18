import { useCallback } from "react";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationProvider";

/**
 * Custom hook for notification actions and operations
 * @description Provides action handlers for notifications with error handling and user feedback
 * @returns {Object} Action functions and loading states
 */
export const useNotificationActions = () => {
  const {
    notifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    isLoading,
  } = useNotifications();

  // Mark single notification as read
  const handleMarkAsRead = useCallback(
    async (notificationId) => {
      try {
        const result = await markAsRead(notificationId);
        if (result.success) {
          toast.success("Notification marked as read");
        } else {
          toast.error(result.error || "Failed to mark notification as read");
        }
        return result;
      } catch (error) {
        console.error("Error marking notification as read:", error);
        toast.error("Failed to mark notification as read");
        return { success: false, error: error.message };
      }
    },
    [markAsRead]
  );

  // Delete single notification
  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      try {
        const result = await deleteNotification(notificationId);
        if (result.success) {
          toast.success("Notification deleted");
        } else {
          toast.error(result.error || "Failed to delete notification");
        }
        return result;
      } catch (error) {
        console.error("Error deleting notification:", error);
        toast.error("Failed to delete notification");
        return { success: false, error: error.message };
      }
    },
    [deleteNotification]
  );

  // Mark all notifications as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const result = await markAllAsRead();
      if (result.success) {
        toast.success("All notifications marked as read");
      } else {
        toast.error(result.error || "Failed to mark all notifications as read");
      }
      return result;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast.error("Failed to mark all notifications as read");
      return { success: false, error: error.message };
    }
  }, [markAllAsRead]);

  // Bulk delete notifications
  const handleBulkDelete = useCallback(
    async (notificationIds) => {
      if (!notificationIds || notificationIds.length === 0) {
        toast.error("No notifications selected for deletion");
        return { success: false, error: "No notifications selected" };
      }

      try {
        const deletePromises = notificationIds.map((id) =>
          deleteNotification(id)
        );
        const results = await Promise.allSettled(deletePromises);

        const successful = results.filter(
          (result) => result.status === "fulfilled" && result.value.success
        ).length;
        const failed = results.length - successful;

        if (successful > 0) {
          toast.success(
            `${successful} notification${successful > 1 ? "s" : ""} deleted`
          );
        }

        if (failed > 0) {
          toast.error(
            `${failed} notification${failed > 1 ? "s" : ""} failed to delete`
          );
        }

        return { success: successful > 0, successful, failed };
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("Failed to delete notifications");
        return { success: false, error: error.message };
      }
    },
    [deleteNotification]
  );

  // Bulk mark as read
  const handleBulkMarkAsRead = useCallback(
    async (notificationIds) => {
      if (!notificationIds || notificationIds.length === 0) {
        toast.error("No notifications selected");
        return { success: false, error: "No notifications selected" };
      }

      try {
        const markPromises = notificationIds.map((id) => markAsRead(id));
        const results = await Promise.allSettled(markPromises);

        const successful = results.filter(
          (result) => result.status === "fulfilled" && result.value.success
        ).length;
        const failed = results.length - successful;

        if (successful > 0) {
          toast.success(
            `${successful} notification${
              successful > 1 ? "s" : ""
            } marked as read`
          );
        }

        if (failed > 0) {
          toast.error(
            `${failed} notification${
              failed > 1 ? "s" : ""
            } failed to mark as read`
          );
        }

        return { success: successful > 0, successful, failed };
      } catch (error) {
        console.error("Error in bulk mark as read:", error);
        toast.error("Failed to mark notifications as read");
        return { success: false, error: error.message };
      }
    },
    [markAsRead]
  );

  // Get notification statistics
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = total - unread;

    // Group by type
    const byType = notifications.reduce((acc, notification) => {
      const type = notification.type || "unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Group by priority
    const byPriority = notifications.reduce((acc, notification) => {
      const priority = notification.priority || "unknown";
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read,
      byType,
      byPriority,
      unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0,
    };
  }, [notifications]);

  // Check if notification can be deleted
  const canDeleteNotification = useCallback((notification) => {
    // Add business logic here if needed
    // For now, all notifications can be deleted
    return true;
  }, []);

  // Check if notification can be marked as read
  const canMarkAsRead = useCallback((notification) => {
    return !notification.isRead;
  }, []);

  return {
    // Action handlers
    handleMarkAsRead,
    handleDeleteNotification,
    handleMarkAllAsRead,
    handleBulkDelete,
    handleBulkMarkAsRead,

    // Utility functions
    getNotificationStats,
    canDeleteNotification,
    canMarkAsRead,

    // Loading state
    isLoading,
  };
};

export default useNotificationActions;
