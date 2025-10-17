/**
 * @fileoverview HR Sidebar Component for Vire Workplace HR App
 * @description Custom sidebar component for HR dashboard with proper navigation and counts
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { getSidebarAvatarUrl } from "@/utils/avatarUtils";
import { NavUser } from "@/components/nav-user";
import { NavSecondary } from "@/components/nav-secondary";
import { useHRSidebarCounts } from "@/hooks/useHRSidebarCounts";

/**
 * HRSidebar Component
 * @description Custom sidebar for HR dashboard with proper navigation structure
 * @component
 * @param {Object} props - Component props
 * @param {Object} [props.config] - Navigation configuration
 * @param {Function} [props.onNavigate] - Navigation handler
 * @param {...any} props - Additional props passed to the Sidebar component
 * @returns {JSX.Element} The HR sidebar component
 */
const HRSidebarComponent = ({ config, onNavigate, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { counts, loading: sidebarLoading } = useHRSidebarCounts();
  const [isNavigating, setIsNavigating] = useState(false);

  // Debug logging for counts
  console.log("HRSidebar - Received counts:", counts);
  console.log("HRSidebar - Sidebar loading:", sidebarLoading);

  // Handle navigation with proper state management
  const handleNavigation = useCallback(
    async (url, item) => {
      if (isNavigating || location.pathname === url) return;

      setIsNavigating(true);

      try {
        // Call parent navigation handler if provided
        if (onNavigate) {
          await onNavigate(url, item);
        }

        // Navigate with smooth transition
        navigate(url);

        // Small delay for smooth UX
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error("Navigation error:", error);
      } finally {
        setIsNavigating(false);
      }
    },
    [isNavigating, location.pathname, navigate, onNavigate]
  );

  // Check if item is active
  const isActiveItem = useCallback(
    (url) => {
      return (
        location.pathname === url || location.pathname.startsWith(url + "/")
      );
    },
    [location.pathname]
  );

  // Get item count for badges from HR sidebar counts
  const getItemCount = useCallback(
    (itemTitle) => {
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
      console.log(`HR Badge for ${itemTitle} (key: ${countKey}):`, count);

      return count;
    },
    [counts]
  );

  // Render navigation item
  const renderNavItem = useCallback(
    (item) => {
      const isActive = isActiveItem(item.url);
      const itemCount = getItemCount(item.title);
      const Icon = item.icon;

      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            onClick={() => handleNavigation(item.url, item)}
            className={cn(
              "cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 transition-all duration-200",
              isActive ? "text-[#00DB12] bg-green-50" : "",
              isNavigating && "opacity-50 pointer-events-none"
            )}
            disabled={isNavigating || sidebarLoading}
          >
            {Icon && <Icon />}
            <span>{item.title}</span>
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-auto h-6 px-2 text-sm font-bold min-w-[24px] flex items-center justify-center",
                  isActive
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-red-500 text-white border-red-500"
                )}
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    },
    [isActiveItem, getItemCount, handleNavigation, isNavigating, sidebarLoading]
  );

  // Render navigation section
  const renderSection = useCallback(
    (sectionKey, section, sectionTitle) => {
      if (!Array.isArray(section) || section.length === 0) return null;

      return (
        <div key={sectionKey}>
          <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {sectionTitle}
          </h3>
          <SidebarMenu>
            {section.map((item) => renderNavItem(item))}
          </SidebarMenu>
        </div>
      );
    },
    [renderNavItem]
  );

  // Create user data object with full user information including role
  const userData = {
    user: {
      ...user, // Include all user properties including role
      name: user ? `${user.firstName} ${user.lastName}` : "Loading...",
      email: user?.email || "loading@example.com",
      avatar: getSidebarAvatarUrl(user) || "/staff.png",
    },
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center">
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

      {/* Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            {/* Main Section */}
            {config.navMain && renderSection("navMain", config.navMain, "Main")}

            {/* Analytics Section */}
            {config.analytics &&
              renderSection("analytics", config.analytics, "Analytics")}

            {/* Teams Section */}
            {config.teams && renderSection("teams", config.teams, "Teams")}

            {/* Productivity Section */}
            {config.productivity &&
              renderSection(
                "productivity",
                config.productivity,
                "Productivity"
              )}

            {/* Company Section */}
            {config.company &&
              renderSection("company", config.company, "Company")}

            {/* Quick Actions Section */}
            <div>
              <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Actions
              </h3>
              <div className="px-3 py-2">
                <button
                  onClick={() =>
                    handleNavigation(
                      "/human-resource-manager/evaluations/create",
                      {}
                    )
                  }
                  className="w-full bg-[#00DB12] hover:bg-[#00C010] text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
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
            </div>

            {/* Secondary Navigation with Popup */}
            {config.navSecondary && (
              <div>
                <h3 className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Settings
                </h3>
                <NavSecondary items={config.navSecondary} />
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <NavUser user={userData.user} />
      </SidebarFooter>
    </Sidebar>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const HRSidebar = memo(HRSidebarComponent);

export default HRSidebar;
