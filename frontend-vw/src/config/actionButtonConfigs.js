/**
 * Action Button Configuration File
 *
 * Contains configurations for action buttons used across different dashboards.
 * Each dashboard can have its own set of action buttons with different icons and text.
 *
 * Configuration Structure:
 * - actionButtons: Array of action button configurations
 * - Each button has: icon, text, tooltip, variant, and onClick handler
 */

import {
  IconCirclePlusFilled,
  IconUserPlus,
  IconFileText,
  IconCalendar,
  IconChartBar,
  IconSettings,
  IconDatabase,
  IconReport,
  IconUsers,
  IconCheck,
  IconClock,
  IconAlertCircle,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSearch,
} from "@tabler/icons-react";

/**
 * HR Dashboard Action Buttons
 *
 * Action buttons specific to Human Resource Managers.
 * Focuses on employee management, recruitment, and HR operations.
 */
const hrActionButtons = [
  {
    icon: IconPlus,
    text: "Check-In",
    tooltip: "Employee Check-In",
    variant: "primary",
    className:
      "bg-green-500 font-medium text-white text-sm hover:bg-green-600 active:bg-green-600",
    onClick: () => console.log("Check-In clicked"),
  },
];

/**
 * Staff Dashboard Action Buttons
 *
 * Action buttons specific to Staff members.
 * Focuses on check-in/check-out functionality as the primary action.
 */
const staffActionButtons = [
  {
    icon: IconPlus,
    text: "Check-In",
    tooltip: "Check-In",
    variant: "primary",
    className:
      "bg-green-500 font-medium text-white text-sm hover:bg-green-600 active:bg-green-600",
    onClick: () => console.log("Check-In clicked"),
  },
];

/**
 * Admin Dashboard Action Buttons
 *
 * Action buttons specific to System Administrators.
 * Focuses on system management, user administration, and system health.
 */
const adminActionButtons = [
  {
    icon: IconPlus,
    text: "Create User",
    tooltip: "Add New System User",
    variant: "primary",
    onClick: () => console.log("Create User clicked"),
  },
  {
    icon: IconSettings,
    text: "System Config",
    tooltip: "Configure System Settings",
    variant: "secondary",
    onClick: () => console.log("System Config clicked"),
  },
  {
    icon: IconDatabase,
    text: "Backup System",
    tooltip: "Create System Backup",
    variant: "outline",
    onClick: () => console.log("Backup System clicked"),
  },
  {
    icon: IconAlertCircle,
    text: "View Logs",
    tooltip: "Access System Logs",
    variant: "ghost",
    onClick: () => console.log("View Logs clicked"),
  },
  {
    icon: IconTrash,
    text: "Clean Cache",
    tooltip: "Clear System Cache",
    variant: "destructive",
    onClick: () => console.log("Clean Cache clicked"),
  },
];

/**
 * Default Action Buttons
 *
 * Generic action buttons that can be used across any dashboard.
 */
const defaultActionButtons = [
  {
    icon: IconCirclePlusFilled,
    text: "Quick Action",
    tooltip: "Perform Quick Action",
    variant: "primary",
    onClick: () => console.log("Quick Action clicked"),
  },
  {
    icon: IconSearch,
    text: "Search",
    tooltip: "Search Content",
    variant: "outline",
    onClick: () => console.log("Search clicked"),
  },
];

// Export all configurations
export {
  hrActionButtons,
  staffActionButtons,
  adminActionButtons,
  defaultActionButtons,
};
