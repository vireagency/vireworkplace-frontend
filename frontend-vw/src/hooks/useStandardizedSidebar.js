import { useMemo } from "react";
import { staffDashboardConfig } from "@/config/dashboardConfigs";
import { useStaffSidebar } from "@/contexts/StaffSidebarContext";

/**
 * Custom hook to provide a standardized sidebar configuration across all staff pages
 * This prevents badge flickering and ensures consistent sidebar behavior
 * Now uses the shared StaffSidebarContext for state management
 */
export const useStandardizedSidebar = () => {
  const { counts, loading, updateCount, refreshCounts } = useStaffSidebar();

  // Memoized sidebar configuration to prevent unnecessary re-renders
  const standardizedSidebarConfig = useMemo(() => {
    return {
      ...staffDashboardConfig,
      // Remove badge properties as they're now handled by the context
      analytics: staffDashboardConfig.analytics || [],
      productivity: staffDashboardConfig.productivity || [],
      company: staffDashboardConfig.company || [],
    };
  }, []);

  // Memoized item counts for consistent behavior
  const standardizedItemCounts = useMemo(
    () => ({
      tasks: counts.tasks,
      evaluations: counts.evaluations,
      attendance: counts.attendance,
      messages: counts.messages,
    }),
    [counts.tasks, counts.evaluations, counts.attendance, counts.messages]
  );

  return {
    sidebarConfig: standardizedSidebarConfig,
    itemCounts: standardizedItemCounts,
    isLoading: loading,
    sidebarCounts: counts, // Expose the raw counts if needed
    updateCount, // Expose update function for pages that need to update counts
    refreshCounts, // Expose refresh function for manual refresh
  };
};
