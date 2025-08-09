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
} from "@tabler/icons-react"

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
      url: "/human-resource-manager",
      icon: IconDashboard,
    },
    {
      title: "Employee Management",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Recruitment",
      url: "#",
      icon: IconUserCheck,
    },
    {
      title: "Performance Reviews",
      url: "#",
      icon: IconFileText,
    },
    {
      title: "Leave Management",
      url: "#",
      icon: IconCalendar,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
  ],
  
  // Secondary navigation items (settings, help, etc.)
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  
  // Quick access document shortcuts
  documents: [
    {
      name: "Employee Database",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "HR Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Policy Documents",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

/**
 * Staff Dashboard Configuration
 * 
 * Navigation structure for Staff members.
 * Focuses on personal profile management, task tracking,
 * attendance, and personal documents.
 */
export const staffDashboardConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/staff",
      icon: IconDashboard,
    },
    {
      title: "My Profile",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Leave Requests",
      url: "#",
      icon: IconCalendar,
    },
    {
      title: "Performance",
      url: "#",
      icon: IconFileText,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "My Documents",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Company Policies",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

// Admin Dashboard Configuration
export const adminDashboardConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
    },
    {
      title: "System Management",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "User Management",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      title: "System Health",
      url: "#",
      icon: IconDatabase,
    },
  ],
  navSecondary: [
    {
      title: "System Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Documentation",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "System Logs",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Admin Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "System Documentation",
      url: "#",
      icon: IconFileWord,
    },
  ],
} 