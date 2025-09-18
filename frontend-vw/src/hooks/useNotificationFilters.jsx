import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for managing notification filters and search
 * @description Provides filtering, searching, and sorting functionality for notifications
 * @returns {Object} Filter state and functions
 */
export const useNotificationFilters = () => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, read, unread
  const [typeFilter, setTypeFilter] = useState('all'); // all, evaluation, performance, task, system
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low
  const [dateFilter, setDateFilter] = useState('all'); // all, today, last3days, last7days, last30days
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, priority, type

  // Filter options
  const filterOptions = useMemo(() => ({
    status: [
      { value: 'all', label: 'All Status' },
      { value: 'unread', label: 'Unread' },
      { value: 'read', label: 'Read' }
    ],
    type: [
      { value: 'all', label: 'All Types' },
      { value: 'evaluation', label: 'Evaluation' },
      { value: 'performance', label: 'Performance' },
      { value: 'task', label: 'Task' },
      { value: 'system', label: 'System' },
      { value: 'attendance', label: 'Attendance' },
      { value: 'message', label: 'Message' }
    ],
    priority: [
      { value: 'all', label: 'All Priorities' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' }
    ],
    date: [
      { value: 'all', label: 'All Time' },
      { value: 'today', label: 'Today' },
      { value: 'last3days', label: 'Last 3 Days' },
      { value: 'last7days', label: 'Last 7 Days' },
      { value: 'last30days', label: 'Last 30 Days' }
    ],
    sort: [
      { value: 'newest', label: 'Newest First' },
      { value: 'oldest', label: 'Oldest First' },
      { value: 'priority', label: 'Priority' },
      { value: 'type', label: 'Type' }
    ]
  }), []);

  // Filter notifications based on current filters
  const filterNotifications = useCallback((notifications) => {
    if (!notifications || !Array.isArray(notifications)) {
      return [];
    }

    let filtered = [...notifications];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notification => 
        notification.title?.toLowerCase().includes(query) ||
        notification.message?.toLowerCase().includes(query) ||
        notification.type?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(notification => {
        if (statusFilter === 'read') return notification.isRead;
        if (statusFilter === 'unread') return !notification.isRead;
        return true;
      });
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(notification => 
        notification.type?.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(notification => 
        notification.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'last3days':
          filterDate.setDate(now.getDate() - 3);
          break;
        case 'last7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'last30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        default:
          break;
      }

      filtered = filtered.filter(notification => {
        const notificationDate = new Date(notification.createdAt);
        return notificationDate >= filterDate;
      });
    }

    // Sort notifications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority?.toLowerCase()] || 0;
          const bPriority = priorityOrder[b.priority?.toLowerCase()] || 0;
          return bPriority - aPriority;
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, dateFilter, sortBy]);

  // Get filter summary
  const getFilterSummary = useCallback((notifications) => {
    const total = notifications?.length || 0;
    const unread = notifications?.filter(n => !n.isRead).length || 0;
    const read = total - unread;

    return {
      total,
      unread,
      read,
      hasActiveFilters: searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || 
                       priorityFilter !== 'all' || dateFilter !== 'all'
    };
  }, [searchQuery, statusFilter, typeFilter, priorityFilter, dateFilter]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setSortBy('newest');
  }, []);

  // Reset to default filters
  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPriorityFilter('all');
    setDateFilter('all');
    setSortBy('newest');
  }, []);

  return {
    // Filter states
    searchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    dateFilter,
    sortBy,
    
    // Filter setters
    setSearchQuery,
    setStatusFilter,
    setTypeFilter,
    setPriorityFilter,
    setDateFilter,
    setSortBy,
    
    // Filter options
    filterOptions,
    
    // Filter functions
    filterNotifications,
    getFilterSummary,
    clearAllFilters,
    resetFilters
  };
};

export default useNotificationFilters;
