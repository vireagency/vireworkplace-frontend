import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/NotificationProvider';
import { toast } from 'sonner';

/**
 * Test component for notification system
 * @description Provides buttons to test various notification functionalities
 */
export const NotificationTest = () => {
  const {
    notifications,
    unreadCount,
    isConnected,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    markAllAsRead,
  } = useNotifications();

  const [testLoading, setTestLoading] = useState(false);

  // Test functions
  const testFetchNotifications = async () => {
    setTestLoading(true);
    try {
      await fetchNotifications('all');
      toast.success('Notifications fetched successfully');
    } catch (error) {
      toast.error('Failed to fetch notifications');
    } finally {
      setTestLoading(false);
    }
  };

  const testMarkAsRead = async () => {
    if (notifications.length === 0) {
      toast.error('No notifications to mark as read');
      return;
    }
    
    const firstNotification = notifications[0];
    const result = await markAsRead(firstNotification._id || firstNotification.id);
    
    if (result.success) {
      toast.success('Notification marked as read');
    } else {
      toast.error(result.error || 'Failed to mark notification as read');
    }
  };

  const testDeleteNotification = async () => {
    if (notifications.length === 0) {
      toast.error('No notifications to delete');
      return;
    }
    
    const firstNotification = notifications[0];
    const result = await deleteNotification(firstNotification._id || firstNotification.id);
    
    if (result.success) {
      toast.success('Notification deleted');
    } else {
      toast.error(result.error || 'Failed to delete notification');
    }
  };

  const testMarkAllAsRead = async () => {
    if (notifications.length === 0) {
      toast.error('No notifications to mark as read');
      return;
    }
    
    const result = await markAllAsRead();
    
    if (result.success) {
      toast.success('All notifications marked as read');
    } else {
      toast.error(result.error || 'Failed to mark all notifications as read');
    }
  };

  const testToastNotification = () => {
    toast.success('Test Notification', {
      description: 'This is a test notification from the notification system',
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => {
          console.log('Test notification action clicked');
        }
      }
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification System Test</h3>
      
      {/* Status Display */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">System Status</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Connection:</span>
            <span className={`ml-2 font-medium ${isConnected ? 'text-green-600' : 'text-yellow-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected (Polling)'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Loading:</span>
            <span className={`ml-2 font-medium ${isLoading ? 'text-blue-600' : 'text-gray-600'}`}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Total Notifications:</span>
            <span className="ml-2 font-medium text-gray-900">{notifications.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Unread Count:</span>
            <span className="ml-2 font-medium text-blue-600">{unreadCount}</span>
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Button
          onClick={testFetchNotifications}
          disabled={testLoading || isLoading}
          variant="outline"
          size="sm"
        >
          {testLoading ? 'Fetching...' : 'Fetch Notifications'}
        </Button>

        <Button
          onClick={testMarkAsRead}
          disabled={notifications.length === 0}
          variant="outline"
          size="sm"
        >
          Mark First as Read
        </Button>

        <Button
          onClick={testDeleteNotification}
          disabled={notifications.length === 0}
          variant="outline"
          size="sm"
        >
          Delete First
        </Button>

        <Button
          onClick={testMarkAllAsRead}
          disabled={notifications.length === 0}
          variant="outline"
          size="sm"
        >
          Mark All as Read
        </Button>

        <Button
          onClick={testToastNotification}
          variant="outline"
          size="sm"
        >
          Test Toast
        </Button>

        <Button
          onClick={() => {
            console.log('Current notifications:', notifications);
            console.log('Unread count:', unreadCount);
            console.log('Connection status:', isConnected);
          }}
          variant="outline"
          size="sm"
        >
          Log State
        </Button>
      </div>

      {/* Notifications List */}
      {notifications.length > 0 && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Current Notifications</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notifications.slice(0, 5).map((notification, index) => (
              <div
                key={notification._id || notification.id || index}
                className={`p-3 rounded border text-sm ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{notification.title || 'No Title'}</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      !notification.isRead ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {notification.isRead ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {notification.priority || 'medium'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1 truncate">
                  {notification.message || notification.description || 'No message'}
                </p>
              </div>
            ))}
            {notifications.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                ... and {notifications.length - 5} more notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationTest;
