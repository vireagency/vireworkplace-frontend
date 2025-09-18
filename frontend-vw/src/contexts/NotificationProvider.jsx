import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";
import { getApiUrl } from "@/config/apiConfig";

// Create the notification context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification Provider Component
export const NotificationProvider = ({ children }) => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Get user data from localStorage
  const getUserData = useCallback(() => {
    try {
      const userData = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      return userData ? { ...JSON.parse(userData), accessToken } : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }, []);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    const userData = getUserData();
    if (!userData || !userData.accessToken) {
      console.warn(
        "No user data or access token found, skipping socket connection"
      );
      return;
    }

    // Get socket URL from environment or use default
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "ws://localhost:5000";

    // Skip socket connection if using localhost in production
    if (socketUrl.includes("localhost") && import.meta.env.PROD) {
      console.warn(
        "Skipping socket connection in production with localhost URL"
      );
      return;
    }

    try {
      const newSocket = io(socketUrl, {
        auth: {
          token: userData.accessToken,
        },
        transports: ["websocket", "polling"],
      });

      // Connection event handlers
      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id);
        setIsConnected(true);

        // Join role and user rooms
        if (userData.role) {
          newSocket.emit("joinRole", userData.role);
          console.log("Joined role room:", userData.role);
        }

        if (userData._id || userData.id) {
          newSocket.emit("joinUser", userData._id || userData.id);
          console.log("Joined user room:", userData._id || userData.id);
        }
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      newSocket.on("connect_error", (error) => {
        console.warn("Socket connection error:", error.message);
        setIsConnected(false);
        // Don't show toast for connection errors as they might be expected
      });

      // Listen for notification events
      newSocket.on("notification", (payload) => {
        console.log("Received notification:", payload);

        // Calculate latency
        const latency = Date.now() - new Date(payload.createdAt).getTime();
        console.log(`Notification latency: ${latency}ms`);

        // Add notification to state
        setNotifications((prev) => [payload, ...prev]);

        // Update unread count
        setUnreadCount((prev) => prev + 1);

        // Show toast notification
        toast.success(payload.title, {
          description: payload.message,
          duration: 5000,
        });
      });

      setSocket(newSocket);
    } catch (error) {
      console.error("Socket initialization error:", error);
      setError("Failed to connect to real-time notifications");
    }
  }, [getUserData]);

  // Cleanup socket connection
  const cleanupSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  // Initialize socket on mount and when user data changes
  useEffect(() => {
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [initializeSocket, cleanupSocket]);

  // Fetch notifications from REST API
  const fetchNotifications = useCallback(
    async (filter = "all") => {
      const userData = getUserData();
      if (!userData || !userData.accessToken) {
        setError("No authentication token found");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${getApiUrl()}/notifications`, {
          params: { filter },
          headers: {
            Authorization: `Bearer ${userData.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data && response.data.success) {
          setNotifications(response.data.notifications || []);

          // Calculate unread count
          const unread = (response.data.notifications || []).filter(
            (n) => !n.isRead
          ).length;
          setUnreadCount(unread);
        } else {
          setError("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setError(
          error.response?.data?.message || "Failed to fetch notifications"
        );
      } finally {
        setLoading(false);
      }
    },
    [getUserData]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (id) => {
      const userData = getUserData();
      if (!userData || !userData.accessToken) {
        setError("No authentication token found");
        return;
      }

      try {
        const response = await axios.patch(
          `${getApiUrl()}/notifications/${id}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success) {
          // Update local state optimistically
          setNotifications((prev) =>
            prev.map((notification) =>
              notification._id === id || notification.id === id
                ? { ...notification, isRead: true }
                : notification
            )
          );

          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));

          toast.success("Notification marked as read");
        } else {
          setError("Failed to mark notification as read");
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
        setError(
          error.response?.data?.message || "Failed to mark notification as read"
        );
      }
    },
    [getUserData]
  );

  // Delete notification
  const deleteNotification = useCallback(
    async (id) => {
      const userData = getUserData();
      if (!userData || !userData.accessToken) {
        setError("No authentication token found");
        return;
      }

      try {
        const response = await axios.delete(
          `${getApiUrl()}/notifications/${id}`,
          {
            headers: {
              Authorization: `Bearer ${userData.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.success) {
          // Update local state optimistically
          const deletedNotification = notifications.find(
            (n) => n._id === id || n.id === id
          );
          setNotifications((prev) =>
            prev.filter(
              (notification) =>
                notification._id !== id && notification.id !== id
            )
          );

          // Update unread count if the deleted notification was unread
          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          toast.success("Notification deleted");
        } else {
          setError("Failed to delete notification");
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
        setError(
          error.response?.data?.message || "Failed to delete notification"
        );
      }
    },
    [getUserData, notifications]
  );

  // Check if notification can be deleted (personal notifications only)
  const canDeleteNotification = useCallback(
    (notification) => {
      const userData = getUserData();
      if (!userData) return false;

      const userId = userData._id || userData.id;

      // Can delete if it's a personal notification (recipients contains current user)
      return (
        notification.recipients &&
        Array.isArray(notification.recipients) &&
        notification.recipients.includes(userId)
      );
    },
    [getUserData]
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Context value
  const contextValue = {
    // State
    notifications,
    unreadCount,
    loading,
    error,
    isConnected,

    // Actions
    fetchNotifications,
    markAsRead,
    deleteNotification,
    canDeleteNotification,
    clearAllNotifications,

    // Socket info
    socket,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
