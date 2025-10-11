/**
 * @fileoverview App Sidebar Component for Vire Workplace HR App
 * @description Main navigation sidebar with collapsible functionality and role-based navigation
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import * as React from "react";

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for navigation items and UI elements
import {
  IconCamera, // Camera icon for capture functionality
  IconChartBar, // Chart icon for analytics
  IconDashboard, // Dashboard icon for main dashboard
  IconDatabase, // Database icon for data library
  IconFileAi, // AI file icon for prompts
  IconFileDescription, // File description icon for proposals
  IconFileWord, // Word file icon for word assistant
  IconFolder, // Folder icon for projects
  IconHelp, // Help icon for support
  IconInnerShadowTop, // Shadow icon for visual effects
  IconListDetails, // List icon for lifecycle management
  IconReport, // Report icon for reports section
  IconSearch, // Search icon for search functionality
  IconSettings, // Settings icon for configuration
  IconUsers, // Users icon for team management
} from "@tabler/icons-react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Badge component for notifications and status indicators
import { Badge } from "@/components/ui/badge";

// ============================================================================
// NAVIGATION COMPONENT IMPORTS
// ============================================================================

// Navigation components for different sections of the sidebar
import { NavDocuments } from "@/components/nav-documents"; // Documents navigation
import { NavMain } from "@/components/nav-main"; // Main navigation items
import { NavSecondary } from "@/components/nav-secondary"; // Secondary navigation
import { NavUser } from "@/components/nav-user"; // User profile section
import { NavCategorized } from "@/components/nav-categorized"; // Categorized navigation

// ============================================================================
// SIDEBAR UI COMPONENTS
// ============================================================================

// Sidebar layout components from the UI library
import {
  Sidebar, // Main sidebar container
  SidebarContent, // Sidebar content area
  SidebarFooter, // Sidebar footer section
  SidebarGroup, // Sidebar group container
  SidebarGroupContent, // Sidebar group content area
  SidebarHeader, // Sidebar header section
  SidebarMenu, // Sidebar menu container
  SidebarMenuButton, // Sidebar menu button
  SidebarMenuItem, // Sidebar menu item
} from "@/components/ui/sidebar";

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Custom authentication hook for user context
import { useAuth } from "@/hooks/useAuth";
import { getSidebarAvatarUrl } from "@/utils/avatarUtils";

/**
 * AppSidebar Component
 * @description Main application sidebar with navigation, user profile, and collapsible functionality
 * @component
 * @param {Object} props - Component props
 * @param {Object} [props.config] - Custom navigation configuration to override defaults
 * @param {...any} props - Additional props passed to the Sidebar component
 * @returns {JSX.Element} The application sidebar component
 *
 * Features:
 * - Collapsible sidebar with offcanvas behavior
 * - Role-based navigation configuration
 * - User profile display
 * - Multiple navigation sections (main, categorized, documents, secondary)
 * - Customizable navigation items through config prop
 * - Responsive design for different screen sizes
 */
export function AppSidebar({
  config, // Custom navigation configuration
  ...props // Additional props for the Sidebar component
}) {
  // Get current authenticated user and loading state
  const { user, loading } = useAuth();

  // ============================================================================
  // DEFAULT NAVIGATION CONFIGURATION
  // ============================================================================

  // Default navigation structure when no custom config is provided
  const defaultConfig = {
    // ========================================================================
    // MAIN NAVIGATION ITEMS
    // ========================================================================

    navMain: [
      {
        title: "Dashboard", // Dashboard navigation item
        url: "#", // Navigation URL (placeholder)
        icon: IconDashboard, // Dashboard icon
      },
      {
        title: "Lifecycle", // Lifecycle management
        url: "#", // Navigation URL (placeholder)
        icon: IconListDetails, // List details icon
      },
      {
        title: "Analytics", // Analytics and reporting
        url: "#", // Navigation URL (placeholder)
        icon: IconChartBar, // Chart bar icon
      },
      {
        title: "Projects", // Project management
        url: "#", // Navigation URL (placeholder)
        icon: IconFolder, // Folder icon
      },
      {
        title: "Team", // Team management
        url: "#", // Navigation URL (placeholder)
        icon: IconUsers, // Users icon
      },
    ],

    // ========================================================================
    // CLOUD-BASED NAVIGATION ITEMS
    // ========================================================================

    navClouds: [
      {
        title: "Capture", // Capture functionality
        icon: IconCamera, // Camera icon
        isActive: true, // Active state indicator
        url: "#", // Navigation URL (placeholder)
        items: [
          // Sub-navigation items
          {
            title: "Active Proposals", // Active proposals sub-item
            url: "#", // Sub-navigation URL
          },
          {
            title: "Archived", // Archived items sub-item
            url: "#", // Sub-navigation URL
          },
        ],
      },
      {
        title: "Proposal", // Proposal management
        icon: IconFileDescription, // File description icon
        url: "#", // Navigation URL (placeholder)
        items: [
          // Sub-navigation items
          {
            title: "Active Proposals", // Active proposals sub-item
            url: "#", // Sub-navigation URL
          },
          {
            title: "Archived", // Archived items sub-item
            url: "#", // Sub-navigation URL
          },
        ],
      },
      {
        title: "Prompts", // AI prompts functionality
        icon: IconFileAi, // AI file icon
        url: "#", // Navigation URL (placeholder)
        items: [
          // Sub-navigation items
          {
            title: "Active Proposals", // Active proposals sub-item
            url: "#", // Sub-navigation URL
          },
          {
            title: "Archived", // Archived items sub-item
            url: "#", // Sub-navigation URL
          },
        ],
      },
    ],

    // ========================================================================
    // SECONDARY NAVIGATION ITEMS
    // ========================================================================

    navSecondary: [
      {
        title: "Settings", // Application settings
        url: "#", // Navigation URL (placeholder)
        icon: IconSettings, // Settings icon
      },
      {
        title: "Get Help", // Help and support
        url: "#", // Navigation URL (placeholder)
        icon: IconHelp, // Help icon
      },
      {
        title: "Search", // Search functionality
        url: "#", // Navigation URL (placeholder)
        icon: IconSearch, // Search icon
      },
    ],

    // ========================================================================
    // DOCUMENTS NAVIGATION ITEMS
    // ========================================================================

    documents: [
      {
        name: "Data Library", // Data library access
        url: "#", // Navigation URL (placeholder)
        icon: IconDatabase, // Database icon
      },
      {
        name: "Reports", // Reports section
        url: "#", // Navigation URL (placeholder)
        icon: IconReport, // Report icon
      },
      {
        name: "Word Assistant", // Word processing assistance
        url: "#", // Navigation URL (placeholder)
        icon: IconFileWord, // Word file icon
      },
    ],
  };

  // ============================================================================
  // CONFIGURATION MERGING
  // ============================================================================

  // Use custom configuration if provided, otherwise fall back to default configuration
  const finalConfig = config || defaultConfig;

  // ============================================================================
  // USER DATA PREPARATION
  // ============================================================================

  // Create user data object from API response for navigation components
  const userData = {
    user: {
      ...user, // Include all user properties including role
      name: user ? `${user.firstName} ${user.lastName}` : "Loading...", // User's full name or loading state
      email: user?.email || "loading@example.com", // User's email or placeholder
      avatar: getSidebarAvatarUrl(user), // User's profile image or null
    },
    ...finalConfig, // Spread the navigation configuration
  };

  return (
    // ============================================================================
    // SIDEBAR CONTAINER
    // ============================================================================

    <Sidebar collapsible="offcanvas" {...props}>
      {/* ========================================================================
           SIDEBAR HEADER
           ========================================================================
           
           Contains the application logo and branding
           ======================================================================== */}

      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            {/* Logo button that links to home */}
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center">
                {/* Application logo */}
                <img
                  src="/VireWorkplace.svg"
                  alt="Vire Workplace"
                  className="h-6 w-auto"
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ========================================================================
           QUICK ACTIONS SECTION
           ========================================================================
           
           Quick action buttons positioned right under the logo
           Only show for HR users
           ======================================================================== */}

      {user?.role === "Human Resource Manager" && (
        <SidebarGroup>
          <SidebarGroupContent>
            {/* Quick Actions section header */}
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Quick Actions
            </h3>

            {/* Quick Actions button */}
            <div className="px-3">
              <button
                onClick={() => {
                  // Navigate to evaluation creation page
                  if (typeof window !== "undefined" && window.location) {
                    window.location.href =
                      "/human-resource-manager/evaluations/create";
                  }
                }}
                className="w-full bg-[#04B435] hover:bg-[#00C010] text-white font-medium py-2.5 px-1.5 rounded-md transition-colors duration-200 flex items-center justify-center gap-1.5 text-sm"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Create Evaluation
              </button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* ========================================================================
           SIDEBAR CONTENT
           ========================================================================
           
           Main navigation sections and content
           ======================================================================== */}

      <SidebarContent>
        {/* Main navigation items (Dashboard, Lifecycle, Analytics, etc.) */}
        <NavMain
          items={userData.navMain}
          actionButtons={userData.actionButtons}
        />

        {/* Categorized navigation (Analytics, Teams, Productivity, Company) */}
        <NavCategorized
          analytics={userData.analytics}
          teams={userData.teams}
          productivity={userData.productivity}
          company={userData.company}
        />

        {/* Documents navigation (Data Library, Reports, Word Assistant) */}
        <NavDocuments items={userData.documents} />

        {/* Secondary navigation (Settings, Help, Search) - positioned at bottom */}
        <NavSecondary items={userData.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* ========================================================================
           SIDEBAR FOOTER
           ========================================================================
           
           User profile section at the bottom of the sidebar
           ======================================================================== */}

      <SidebarFooter>
        {/* User profile display with avatar and information */}
        <NavUser user={userData.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
