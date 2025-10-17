/**
 * @fileoverview Categorized Navigation Component for Vire Workplace HR App
 * @description Renders categorized navigation sections for dashboards with grouped navigation items
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import React from "react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Badge component for count displays
import { Badge } from "@/components/ui/badge";

// ============================================================================
// ROUTING IMPORTS
// ============================================================================

// React Router hooks for navigation and location
import { useNavigate, useLocation } from "react-router-dom";

// ============================================================================
// SIDEBAR COMPONENT IMPORTS
// ============================================================================

// Sidebar components for navigation structure
import {
  SidebarGroup, // Sidebar group container
  SidebarGroupContent, // Sidebar group content area
  SidebarMenu, // Sidebar menu container
  SidebarMenuButton, // Sidebar menu button
  SidebarMenuItem, // Sidebar menu item
} from "@/components/ui/sidebar";

/**
 * NavCategorized Component
 * @description Renders categorized navigation sections for dashboards with grouped navigation items
 * @component
 * @param {Object} props - Component props
 * @param {Array} [props.analytics=[]] - Analytics section navigation items
 * @param {Array} [props.teams=[]] - Teams section navigation items
 * @param {Array} [props.company=[]] - Company section navigation items
 * @returns {JSX.Element} The categorized navigation component
 *
 * Navigation Item Structure:
 * @param {string} item.title - Navigation item title
 * @param {string} item.url - Navigation URL
 * @param {React.Component} item.icon - Navigation item icon
 * @param {string|number} [item.badge] - Optional badge for notifications/counts
 *
 * Features:
 * - Categorized navigation sections (Analytics, Teams, Company)
 * - Conditional rendering of sections based on data availability
 * - Active state highlighting for current route
 * - Hover effects with green theme colors
 * - Badge support for analytics items
 * - Responsive design with consistent spacing
 * - Tooltip support for navigation items
 *
 * Section Categories:
 * - Analytics: Data analysis and reporting tools
 * - Teams: Team management and collaboration features
 * - Company: Company-wide settings and information
 */
export function NavCategorized({
  analytics = [], // Analytics section navigation items
  teams = [], // Teams section navigation items
  productivity = [], // Productivity section navigation items
  company = [], // Company section navigation items
  counts = {}, // Count data for badges
}) {
  // ============================================================================
  // HOOKS
  // ============================================================================

  // Navigation function for programmatic routing
  const navigate = useNavigate();

  // Current location for active state management
  const location = useLocation();

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get count for navigation item based on title
   * @description Maps navigation item titles to count keys and returns the count
   * @param {string} itemTitle - Navigation item title
   * @returns {number} Count for the navigation item
   */
  const getItemCount = (itemTitle) => {
    // Map item titles to count keys
    const titleMapping = {
      Evaluations: "evaluations",
      Employees: "employees",
      Messages: "messages",
      Reports: "reports",
      "Employee Management": "employees",
      "Team Management": "employees",
      Analytics: "reports",
      "Performance Reports": "reports",
    };

    const countKey = titleMapping[itemTitle] || itemTitle.toLowerCase();
    const count = counts[countKey] || 0;

    // Debug logging for badge counts
    console.log(
      `NavCategorized Badge for ${itemTitle} (key: ${countKey}):`,
      count
    );

    return count;
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle navigation to specified URL
   * @description Navigates to the specified URL if it's valid and prevents page reload
   * @param {string} url - URL to navigate to
   * @param {Event} event - Click event
   */
  const handleNavigation = (url, event) => {
    // Prevent default behavior to avoid page reload
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Only navigate if URL exists and is not a placeholder
    if (url && url !== "#") {
      // Use React Router navigation without page reload
      navigate(url, { replace: false });
    }
  };

  return (
    // ============================================================================
    // CATEGORIZED NAVIGATION CONTAINER
    // ============================================================================

    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-4">
        {/* ========================================================================
             ANALYTICS SECTION
             ========================================================================
             
             Analytics and reporting navigation items
             ======================================================================== */}

        {analytics && analytics.length > 0 && (
          <div>
            {/* Analytics section header */}
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Analytics
            </h3>

            {/* Analytics navigation menu */}
            <SidebarMenu>
              {/* Map through analytics items */}
              {analytics.map((item) => {
                // Determine if current analytics item is active
                const isActive = location.pathname === item.url;
                const itemCount = getItemCount(item.title);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title} // Tooltip for navigation item
                      onClick={(e) => handleNavigation(item.url, e)} // Navigation handler
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${
                        isActive ? "text-[#00DB12]" : ""
                      }`}
                    >
                      {/* Render analytics icon if provided */}
                      {item.icon && <item.icon />}

                      {/* Analytics item title */}
                      <span>{item.title}</span>

                      {/* Dynamic badge for counts or static badge */}
                      {itemCount > 0 && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto h-6 px-2 text-sm font-bold min-w-[24px] flex items-center justify-center ${
                            isActive
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-red-500 text-white border-red-500"
                          }`}
                        >
                          {itemCount > 99 ? "99+" : itemCount}
                        </Badge>
                      )}
                      {/* Fallback to static badge if no count and badge exists */}
                      {itemCount === 0 && item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium text-blue-600 border border-blue-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}

        {/* ========================================================================
             TEAMS SECTION
             ========================================================================
             
             Team management and collaboration navigation items
             ======================================================================== */}

        {teams && teams.length > 0 && (
          <div>
            {/* Teams section header */}
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Teams
            </h3>

            {/* Teams navigation menu */}
            <SidebarMenu>
              {/* Map through teams items */}
              {teams.map((item) => {
                // Determine if current teams item is active
                const isActive = location.pathname === item.url;
                const itemCount = getItemCount(item.title);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title} // Tooltip for navigation item
                      onClick={(e) => handleNavigation(item.url, e)} // Navigation handler
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${
                        isActive ? "text-[#00DB12]" : ""
                      }`}
                    >
                      {/* Render teams icon if provided */}
                      {item.icon && <item.icon />}

                      {/* Teams item title */}
                      <span>{item.title}</span>

                      {/* Dynamic badge for counts */}
                      {itemCount > 0 && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto h-6 px-2 text-sm font-bold min-w-[24px] flex items-center justify-center ${
                            isActive
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-red-500 text-white border-red-500"
                          }`}
                        >
                          {itemCount > 99 ? "99+" : itemCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}

        {/* ========================================================================
             PRODUCTIVITY SECTION
             ========================================================================
             
             Productivity and task management navigation items
             ======================================================================== */}

        {productivity && productivity.length > 0 && (
          <div>
            {/* Productivity section header */}
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Productivity
            </h3>

            {/* Productivity navigation menu */}
            <SidebarMenu>
              {/* Map through productivity items */}
              {productivity.map((item) => {
                // Determine if current productivity item is active
                const isActive = location.pathname === item.url;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title} // Tooltip for navigation item
                      onClick={(e) => handleNavigation(item.url, e)} // Navigation handler
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${
                        isActive ? "text-[#00DB12]" : ""
                      }`}
                    >
                      {/* Render productivity icon if provided */}
                      {item.icon && <item.icon />}

                      {/* Productivity item title */}
                      <span>{item.title}</span>

                      {/* Optional badge for notifications or counts */}
                      {item.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs font-medium text-white bg-gray-600 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}

        {/* ========================================================================
             COMPANY SECTION
             ========================================================================
             
             Company-wide settings and information navigation items
             ======================================================================== */}

        {company && company.length > 0 && (
          <div>
            {/* Company section header */}
            <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Company
            </h3>

            {/* Company navigation menu */}
            <SidebarMenu>
              {/* Map through company items */}
              {company.map((item) => {
                // Determine if current company item is active
                const isActive = location.pathname === item.url;
                const itemCount = getItemCount(item.title);

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title} // Tooltip for navigation item
                      onClick={(e) => handleNavigation(item.url, e)} // Navigation handler
                      className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${
                        isActive ? "text-[#00DB12]" : ""
                      }`}
                    >
                      {/* Render company icon if provided */}
                      {item.icon && <item.icon />}

                      {/* Company item title */}
                      <span>{item.title}</span>

                      {/* Dynamic badge for counts */}
                      {itemCount > 0 && (
                        <Badge
                          variant="secondary"
                          className={`ml-auto h-6 px-2 text-sm font-bold min-w-[24px] flex items-center justify-center ${
                            isActive
                              ? "bg-green-500 text-white border-green-500"
                              : "bg-red-500 text-white border-red-500"
                          }`}
                        >
                          {itemCount > 99 ? "99+" : itemCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
