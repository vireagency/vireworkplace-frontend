import { useMemo } from 'react';
import { staffDashboardConfig } from '@/config/dashboardConfigs';
import { useSidebarCounts } from './useSidebarCounts';

/**
 * Custom hook to provide a standardized sidebar configuration across all staff pages
 * This prevents badge flickering and ensures consistent sidebar behavior
 */
export const useStandardizedSidebar = () => {
  const sidebarCounts = useSidebarCounts();

  // Memoized sidebar configuration to prevent unnecessary re-renders
  const standardizedSidebarConfig = useMemo(() => {
    return {
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
  }, [
    sidebarCounts.evaluations,
    sidebarCounts.tasks,
    sidebarCounts.attendance,
    sidebarCounts.messages,
  ]);

  // Memoized item counts for consistent behavior
  const standardizedItemCounts = useMemo(() => ({
    tasks: sidebarCounts.tasks,
    evaluations: sidebarCounts.evaluations,
    attendance: sidebarCounts.attendance,
    messages: sidebarCounts.messages,
  }), [
    sidebarCounts.tasks,
    sidebarCounts.evaluations,
    sidebarCounts.attendance,
    sidebarCounts.messages,
  ]);

  return {
    sidebarConfig: standardizedSidebarConfig,
    itemCounts: standardizedItemCounts,
    isLoading: sidebarCounts.loading,
    sidebarCounts, // Expose the raw counts if needed
  };
};
