/**
 * @fileoverview Notification Provider Context
 * @description Handles real-time notifications via Socket.IO and REST API integration
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { getApiUrl } from '@/config/apiConfig';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const NotificationContext = createContext();

// ============================================================================
// NOTIFICATION PROVIDER COMPONENT
// ============================================================================

export const NotificationProvider = ({ children }) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Get auth context
  const { accessToken } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Ref to track if we're already connecting to prevent multiple connections
  const isConnectingRef = useRef(false);

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get authentication headers for API requests
   * @returns {Object} Headers object with authorization
   */
  const getAuthHeaders = () => {
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
  };

  /**
   * Get user role and ID from localStorage
   * @returns {Object} User role and ID
   */
  const getUserInfo = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = localStorage.getItem('access_token');
    
    return {
      role: user?.role || 'Staff',
      userId: user?._id || user?.id,
      accessToken
    };
  };

  /**
   * Calculate latency for notification
   * @param {Object} notification - Notification object
   * @returns {number} Latency in milliseconds
   */
  const calculateLatency = (notification) => {
    if (!notification.createdAt) return 0;
    return Date.now() - new Date(notification.createdAt).getTime();
  };

  // ============================================================================
  // REST API METHODS
  // ============================================================================

  /**
   * Fetch notifications with filter
   * @param {string} filter - Filter type (all, today, last3days, last7days)
   * @returns {Promise<Object>} API response
   */
  const fetchNotifications = useCallback(async (filter = 'all') => {
    try {
      setLoading(true);
      setError(null);

      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log('Fetching notifications with filter:', filter);

      const response = await axios.get(`${getApiUrl()}/notifications`, {
        params: { filter },
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        const fetchedNotifications = response.data.data || response.data.notifications || [];
        
        // Add latency calculation to each notification
        const notificationsWithLatency = fetchedNotifications.map(notification => ({
          ...notification,
          latency: calculateLatency(notification)
        }));

        setNotifications(notificationsWithLatency);
        
        // Calculate unread count
        const unread = notificationsWithLatency.filter(n => !n.isRead).length;
        setUnreadCount(unread);

        console.log(`Fetched ${fetchedNotifications.length} notifications, ${unread} unread`);
        return { success: true, data: notificationsWithLatency };
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
      toast.error('Failed to fetch notifications');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} API response
   */
  const markAsRead = useCallback(async (id) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log('Marking notification as read:', id);

      const response = await axios.patch(`${getApiUrl()}/notifications/${id}/read`, {}, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === id || notification.id === id
              ? { ...notification, isRead: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        console.log('Notification marked as read');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
      return { success: false, error: error.message };
    }
  }, [accessToken]);

  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} API response
   */
  const deleteNotification = useCallback(async (id) => {
    try {
      if (!accessToken) {
        throw new Error('No access token available');
      }

      console.log('Deleting notification:', id);

      const response = await axios.delete(`${getApiUrl()}/notifications/${id}`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        // Update local state
        const deletedNotification = notifications.find(n => n._id === id || n.id === id);
        setNotifications(prev => prev.filter(notification => 
          notification._id !== id && notification.id !== id
        ));
        
        // Update unread count if the deleted notification was unread
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        console.log('Notification deleted');
        toast.success('Notification deleted');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
      return { success: false, error: error.message };
    }
  }, [notifications, accessToken]);

  // ============================================================================
  // SOCKET.IO INTEGRATION
  // ============================================================================

  /**
   * Initialize socket connection
   */
  const initializeSocket = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current) {
      console.log('Socket connection already in progress, skipping...');
      return;
    }
    
    try {
      const { role, userId } = getUserInfo();
      
      if (!accessToken) {
        console.log('No access token available for socket connection');
        return;
      }
      
      isConnectingRef.current = true;

      const socketUrl = import.meta.env?.VITE_SOCKET_URL || 'ws://localhost:5000';
      console.log('Connecting to socket:', socketUrl);
      console.log('Environment variables:', import.meta.env);

      const newSocket = io(socketUrl, {
        auth: {
          token: accessToken
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      isConnectingRef.current = false;
      
      // Join role and user rooms
      newSocket.emit('joinRole', { role });
      newSocket.emit('joinUser', { userId });
      
      console.log('Joined rooms:', { role, userId });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    // Notification event handler
    newSocket.on('notification', (notification) => {
      console.log('Received notification:', notification);
      
      // Calculate latency
      const latency = calculateLatency(notification);
      const notificationWithLatency = {
        ...notification,
        latency
      };
      
      // Add to notifications list
      setNotifications(prev => [notificationWithLatency, ...prev]);
      
      // Update unread count if not read
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
      
      // Show toast notification
      toast.info(notification.title || 'New notification', {
        description: notification.message
      });
      
      console.log(`Notification latency: ${latency}ms`);
    });

      setSocket(newSocket);
    } catch (error) {
      console.error('Error initializing socket connection:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, [accessToken]);

  /**
   * Cleanup socket connection
   */
  const cleanupSocket = useCallback(() => {
    console.log('Disconnecting socket');
    isConnectingRef.current = false;
    setSocket(prevSocket => {
      if (prevSocket) {
        prevSocket.disconnect();
        setIsConnected(false);
      }
      return null;
    });
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Initialize socket when access token becomes available
  useEffect(() => {
    if (accessToken) {
      initializeSocket();
    }
    
    return () => {
      cleanupSocket();
    };
  }, [accessToken, initializeSocket, cleanupSocket]); // Depend on accessToken and socket functions

  // Fetch initial notifications when access token becomes available
  useEffect(() => {
    if (accessToken) {
      console.log('Access token available, fetching notifications...');
      fetchNotifications('all');
    } else {
      console.log('No access token available for notifications');
    }
  }, [accessToken, fetchNotifications]); // Depend on accessToken and fetchNotifications

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue = {
    // State
    notifications,
    unreadCount,
    isConnected,
    loading,
    error,
    
    // Methods
    fetchNotifications,
    markAsRead,
    deleteNotification,
    
    // Utility
    getUserInfo,
    calculateLatency
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * useNotifications hook
 * @returns {Object} Notification context value
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationProvider;
