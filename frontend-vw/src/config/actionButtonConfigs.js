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
const hrActionButtons = [];

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
    onClick: () => {
      // This will be overridden by nav-main.jsx to show the modal
    },
  },
];

/**
 * Admin Dashboard Action Buttons
 *
 * Action buttons specific to System Administrators.
 * Focuses on system management, user administration, and system health.
 */
const adminActionButtons = [];

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
