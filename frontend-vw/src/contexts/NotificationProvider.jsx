import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { toast } from "sonner";

// Notification System Configuration
const NOTIFICATION_CONFIG = {
  API_BASE: __NOTIFICATION_API_BASE__,
  SOCKET_URL: __SOCKET_IO_URL__,
  ENDPOINTS: __NOTIFICATION_ENDPOINTS__,
  RECONNECTION_ATTEMPTS: 5,
  RECONNECTION_DELAY: 1000,
  POLLING_INTERVAL: 30000, // 30 seconds fallback polling
  MAX_NOTIFICATIONS: 100,
};

// Create Notification Context
const NotificationContext = createContext();

// Custom hook to use notification context
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
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [user, setUser] = useState(null);

  // Get access token from localStorage
  const getAccessToken = useCallback(() => {
    return localStorage.getItem("accessToken");
  }, []);

  // Get current user info
  const getCurrentUser = useCallback(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  }, []);

  // Initialize user data
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, [getCurrentUser]);

  // Socket.IO connection management
  const initializeSocket = useCallback(() => {
    const token = getAccessToken();
    if (!token || !user) return null;

    const socketInstance = io(NOTIFICATION_CONFIG.SOCKET_URL, {
      auth: {
        token: token,
        userId: user.id,
        role: user.role,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: NOTIFICATION_CONFIG.RECONNECTION_ATTEMPTS,
      reconnectionDelay: NOTIFICATION_CONFIG.RECONNECTION_DELAY,
      timeout: 20000,
    });

    // Connection event handlers
    socketInstance.on(
      NOTIFICATION_CONFIG.ENDPOINTS.SOCKET_EVENTS.CONNECT,
      () => {
        console.log("🔌 Socket connected");
        setIsConnected(true);
        setError(null);

        // Join user-specific and role-specific rooms
        socketInstance.emit("join-rooms", {
          userId: user.id,
          role: user.role,
        });
      }
    );

    socketInstance.on(
      NOTIFICATION_CONFIG.ENDPOINTS.SOCKET_EVENTS.DISCONNECT,
      () => {
        console.log("🔌 Socket disconnected");
        setIsConnected(false);
      }
    );

    // Notification event handlers
    socketInstance.on(
      NOTIFICATION_CONFIG.ENDPOINTS.SOCKET_EVENTS.NOTIFICATION_NEW,
      (notification) => {
        console.log("🔔 New notification received:", notification);
        handleNewNotification(notification);
      }
    );

    socketInstance.on(
      NOTIFICATION_CONFIG.ENDPOINTS.SOCKET_EVENTS.NOTIFICATION_UPDATE,
      (notification) => {
        console.log("🔄 Notification updated:", notification);
        handleNotificationUpdate(notification);
      }
    );

    // Error handling
    socketInstance.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setError("Connection failed. Using fallback polling.");
      setIsConnected(false);
      startPolling();
    });

    return socketInstance;
  }, [getAccessToken, user]);

  // Handle new notification
  const handleNewNotification = useCallback((notification) => {
    setNotifications((prev) => {
      const newNotifications = [notification, ...prev].slice(
        0,
        NOTIFICATION_CONFIG.MAX_NOTIFICATIONS
      );
      return newNotifications;
    });

    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    toast.success(notification.title, {
      description: notification.message,
      duration: 5000,
      action: {
        label: "View",
        onClick: () => {
          // Handle view action
          console.log("View notification:", notification.id);
        },
      },
    });
  }, []);

  // Handle notification update
  const handleNotificationUpdate = useCallback((updatedNotification) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === updatedNotification.id
          ? updatedNotification
          : notification
      )
    );
  }, []);

  // Fallback polling mechanism
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(() => {
      if (!isConnected) {
        fetchNotifications();
      }
    }, NOTIFICATION_CONFIG.POLLING_INTERVAL);

    setPollingInterval(interval);
  }, [isConnected, pollingInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(
    async (filter = "all") => {
      const token = getAccessToken();
      if (!token) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          `${NOTIFICATION_CONFIG.API_BASE}${NOTIFICATION_CONFIG.ENDPOINTS.FETCH_NOTIFICATIONS}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: { filter },
          }
        );

        if (response.status === 200) {
          const {
            notifications: fetchedNotifications,
            unreadCount: fetchedUnreadCount,
          } = response.data;
          setNotifications(fetchedNotifications || []);
          setUnreadCount(fetchedUnreadCount || 0);
        }
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        setError("Failed to fetch notifications");
      } finally {
        setIsLoading(false);
      }
    },
    [getAccessToken]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      const token = getAccessToken();
      if (!token) return { success: false, error: "No access token" };

      try {
        const response = await axios.patch(
          `${NOTIFICATION_CONFIG.API_BASE}${NOTIFICATION_CONFIG.ENDPOINTS.MARK_AS_READ}/${notificationId}/read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // Optimistic update
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === notificationId
                ? {
                    ...notification,
                    isRead: true,
                    readAt: new Date().toISOString(),
                  }
                : notification
            )
          );

          setUnreadCount((prev) => Math.max(0, prev - 1));

          return { success: true, data: response.data };
        }
      } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        return {
          success: false,
          error: error.response?.data?.message || error.message,
        };
      }
    },
    [getAccessToken]
  );

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId) => {
      const token = getAccessToken();
      if (!token) return { success: false, error: "No access token" };

      try {
        const response = await axios.delete(
          `${NOTIFICATION_CONFIG.API_BASE}${NOTIFICATION_CONFIG.ENDPOINTS.DELETE_NOTIFICATION}/${notificationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // Optimistic update
          const deletedNotification = notifications.find(
            (n) => n.id === notificationId
          );
          setNotifications((prev) =>
            prev.filter((notification) => notification.id !== notificationId)
          );

          if (deletedNotification && !deletedNotification.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }

          return { success: true, data: response.data };
        }
      } catch (error) {
        console.error("❌ Error deleting notification:", error);
        return {
          success: false,
          error: error.response?.data?.message || error.message,
        };
      }
    },
    [getAccessToken, notifications]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return { success: false, error: "No access token" };

    try {
      const response = await axios.patch(
        `${NOTIFICATION_CONFIG.API_BASE}${NOTIFICATION_CONFIG.ENDPOINTS.MARK_AS_READ}/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        // Optimistic update
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            isRead: true,
            readAt: new Date().toISOString(),
          }))
        );
        setUnreadCount(0);

        return { success: true, data: response.data };
      }
    } catch (error) {
      console.error("❌ Error marking all notifications as read:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }, [getAccessToken]);

  // Initialize socket connection
  useEffect(() => {
    if (user && getAccessToken()) {
      const socketInstance = initializeSocket();
      setSocket(socketInstance);

      // Initial fetch
      fetchNotifications();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      stopPolling();
    };
  }, [user, initializeSocket, fetchNotifications, stopPolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
      stopPolling();
    };
  }, [socket, stopPolling]);

  // Memoized context value
  const contextValue = useMemo(
    () => ({
      // State
      notifications,
      unreadCount,
      isConnected,
      isLoading,
      error,

      // Actions
      fetchNotifications,
      markAsRead,
      deleteNotification,
      markAllAsRead,

      // Connection management
      reconnect: () => {
        if (socket) {
          socket.disconnect();
        }
        const newSocket = initializeSocket();
        setSocket(newSocket);
      },
    }),
    [
      notifications,
      unreadCount,
      isConnected,
      isLoading,
      error,
      fetchNotifications,
      markAsRead,
      deleteNotification,
      markAllAsRead,
      initializeSocket,
      socket,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
