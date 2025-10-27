/**
 * Dashboard Configuration File
 *
 * Contains navigation configurations for different user roles in the Vire Workplace HR Application.
 * Each role (HR, Staff, Admin) has its own navigation structure with relevant menu items
 * and document shortcuts.
 *
 * Configuration Structure:
 * - navMain: Primary navigation items (main menu)
 * - navSecondary: Secondary navigation items (settings, help, etc.)
 * - documents: Quick access document shortcuts
 * - actionButtons: Role-specific action buttons for quick actions
 *
 * Navigation Item Structure:
 * - title: Display name for the menu item
 * - url: Route or link destination
 * - icon: Tabler icon component for visual representation
 *
 * Available Icons:
 * - IconDashboard: Main dashboard
 * - IconUsers: User management
 * - IconUserCheck: Recruitment/verification
 * - IconFileText: Documents/reports
 * - IconCalendar: Scheduling/time management
 * - IconChartBar: Analytics/charts
 * - IconSettings: Configuration
 * - IconHelp: Support/help
 * - IconSearch: Search functionality
 * - IconDatabase: Data management
 * - IconReport: Reporting
 * - IconFileWord: Document management
 * - IconListDetails: Task management
 * - IconFolder: File organization
 * - IconCamera: Media/attachments
 * - IconFileAi: AI-powered features
 * - IconFileDescription: Documentation
 */

// Tabler Icons for navigation items
import {
  IconUsers,
  IconUserCheck,
  IconFileText,
  IconCalendar,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconDashboard,
  IconListDetails,
  IconFolder,
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconMail,
} from "@tabler/icons-react";

// Import action button configurations
import {
  hrActionButtons,
  staffActionButtons,
  adminActionButtons,
} from "./actionButtonConfigs";

/**
 * HR Dashboard Configuration
 *
 * Navigation structure for Human Resource Managers.
 * Focuses on employee management, recruitment, performance reviews,
 * leave management, and HR analytics.
 */
export const hrDashboardConfig = {
  // Primary navigation menu items
  navMain: [
    {
      title: "Dashboard",
      url: "/human-resource-manager/dashboard",
      icon: IconDashboard,
    },
  ],

  // Analytics section
  analytics: [
    {
      title: "Evaluations",
      url: "/human-resource-manager/evaluations",
      icon: IconFileText,
    },
    {
      title: "Performance",
      url: "/human-resource-manager/performance",
      icon: IconChartBar,
    },
    // {
    //   title: "Hiring",
    //   url: "/human-resource-manager/hiring",
    //   icon: IconUserCheck,
    //   badge: "NEW",
    // },
  ],

  // Teams section
  teams: [
    {
      title: "Employees",
      url: "/human-resource-manager/employees",
      icon: IconUsers,
    },
  ],

  // Company section
  company: [
    {
      title: "Messages",
      url: "/human-resource-manager/messages",
      icon: IconMail,
    },
    {
      title: "Reports",
      url: "/human-resource-manager/reports",
      icon: IconReport,
    },
  ],

  // Secondary navigation items (settings, help, etc.)
  navSecondary: [
    {
      title: "Settings",
      url: "/human-resource-manager/settings/profile",
      icon: IconSettings,
    },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],

  // HR-specific action buttons
  actionButtons: hrActionButtons,
};

/**
 * Staff Dashboard Configuration
 *
 * Navigation structure for Staff members.
 * Focuses on personal profile management, task tracking,
 * attendance, and personal documents.
 */
export const staffDashboardConfig = {
  // Primary navigation menu items
  navMain: [
    {
      title: "Dashboard",
      url: "/staff/dashboard",
      icon: IconDashboard,
    },
  ],

  // Analytics section
  analytics: [
    {
      title: "Evaluations",
      url: "/staff/evaluations",
      icon: IconFileText,
    },
  ],

  // Productivity section
  productivity: [
    {
      title: "Tasks",
      url: "/staff/tasks",
      icon: IconListDetails,
    },
    {
      title: "Attendance",
      url: "/staff/attendance",
      icon: IconUserCheck,
    },
  ],

  // Company section
  company: [
    {
      title: "Messages",
      url: "/staff/messages",
      icon: IconMail,
    },
    {
      title: "Reports",
      url: "/staff/reports",
      icon: IconReport,
    },
  ],

  // Secondary navigation items (settings, help, etc.)
  navSecondary: [
    {
      title: "Settings",
      url: "/staff/settings",
      icon: IconSettings,
    },
    // {
    //   title: "Get Help",
    //   url: "#",
    //   icon: IconHelp,
    // },
    // {
    //   title: "Search",
    //   url: "#",
    //   icon: IconSearch,
    // },
  ],

  // Staff-specific action buttons
  actionButtons: staffActionButtons,
};

// Admin Dashboard Configuration
export const adminDashboardConfig = {
  // Connect button for Skillltgh
  connectButton: {
    title: "Connect To Skillltgh",
    url: "#",
    variant: "primary",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
  ],

  // Analytics section
  analytics: [
    {
      title: "Performance",
      url: "/admin/performance",
      icon: IconChartBar,
    },
  ],

  // Teams section
  teams: [
    {
      title: "Tasks",
      url: "/admin/tasks",
      icon: IconListDetails,
      badge: "35",
    },
    {
      title: "Employees",
      url: "/admin/employees",
      icon: IconUsers,
    },
  ],

  // Company section
  company: [
    {
      title: "Inventory",
      url: "/admin/inventory",
      icon: IconFolder,
    },
    {
      title: "Messages",
      url: "/admin/messages",
      icon: IconMail,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
  ],

  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: IconSettings,
    },
  ],

  // Admin-specific action buttons (empty as requested)
  actionButtons: adminActionButtons,
};
