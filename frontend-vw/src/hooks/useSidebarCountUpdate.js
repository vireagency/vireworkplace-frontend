import { useStaffSidebar } from "@/contexts/StaffSidebarContext";

/**
 * Custom hook to provide easy access to sidebar count update functions
 * This allows pages to update sidebar counts when they perform actions
 * that affect the counts (e.g., adding/removing tasks, marking messages as read)
 */
export const useSidebarCountUpdate = () => {
  const { updateCount, refreshCounts } = useStaffSidebar();

  // Helper functions for common count updates
  const updateTasksCount = (newCount) => {
    updateCount("tasks", newCount);
  };

  const updateEvaluationsCount = (newCount) => {
    updateCount("evaluations", newCount);
  };

  const updateMessagesCount = (newCount) => {
    updateCount("messages", newCount);
  };

  const updateAttendanceCount = (newCount) => {
    updateCount("attendance", newCount);
  };

  // Increment/decrement helpers
  const incrementTasksCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("tasks", (counts.tasks || 0) + 1);
  };

  const decrementTasksCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("tasks", Math.max(0, (counts.tasks || 0) - 1));
  };

  const incrementMessagesCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("messages", (counts.messages || 0) + 1);
  };

  const decrementMessagesCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("messages", Math.max(0, (counts.messages || 0) - 1));
  };

  const incrementEvaluationsCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("evaluations", (counts.evaluations || 0) + 1);
  };

  const decrementEvaluationsCount = () => {
    const { counts } = useStaffSidebar();
    updateCount("evaluations", Math.max(0, (counts.evaluations || 0) - 1));
  };

  return {
    // Direct update functions
    updateCount,
    updateTasksCount,
    updateEvaluationsCount,
    updateMessagesCount,
    updateAttendanceCount,

    // Increment/decrement helpers
    incrementTasksCount,
    decrementTasksCount,
    incrementMessagesCount,
    decrementMessagesCount,
    incrementEvaluationsCount,
    decrementEvaluationsCount,

    // Refresh all counts
    refreshCounts,
  };
};

export default useSidebarCountUpdate;
