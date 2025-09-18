/**
 * @fileoverview Staff Sidebar Component for Vire Workplace HR App
 * @description Custom sidebar component for staff dashboard with proper navigation and counts
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useEffect, useCallback } from "react";
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
import { getUserAvatarUrl } from "@/utils/avatarUtils";
import { NavUser } from "@/components/nav-user";
import { NavSecondary } from "@/components/nav-secondary";

/**
 * StaffSidebar Component
 * @description Custom sidebar for staff dashboard with proper navigation structure
 * @component
 * @param {Object} props - Component props
 * @param {Object} [props.config] - Navigation configuration
 * @param {Object} [props.itemCounts] - Item counts for badges
 * @param {Function} [props.onNavigate] - Navigation handler
 * @param {boolean} [props.isLoading] - Loading state
 * @param {...any} props - Additional props passed to the Sidebar component
 * @returns {JSX.Element} The staff sidebar component
 */
export function StaffSidebar({
  config,
  itemCounts = {},
  onNavigate,
  isLoading = false,
  ...props
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isNavigating, setIsNavigating] = useState(false);

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

  // Get item count for badges
  const getItemCount = useCallback(
    (itemTitle, sectionKey) => {
      // Map item titles to count keys
      const titleMapping = {
        Evaluations: "evaluations",
        Tasks: "tasks",
        Attendance: "attendance",
        Messages: "messages",
        Reports: "reports",
      };

      const countKey = titleMapping[itemTitle] || itemTitle.toLowerCase();
      const count =
        itemCounts[`${sectionKey}_${countKey}`] ||
        itemCounts[countKey] ||
        itemCounts[itemTitle] ||
        0;

      return count;
    },
    [itemCounts]
  );

  // Render navigation item
  const renderNavItem = useCallback(
    (item, sectionKey) => {
      const isActive = isActiveItem(item.url);
      const itemCount = getItemCount(item.title, sectionKey);
      const Icon = item.icon;

      return (
        <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            tooltip={item.title}
            onClick={() => handleNavigation(item.url, item)}
            className={cn(
              "cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 transition-all duration-200",
              isActive ? "text-[#00DB12] bg-green-50" : "",
              isNavigating && "opacity-50 pointer-events-none"
            )}
            disabled={isNavigating || isLoading}
          >
            {Icon && <Icon />}
            <span>{item.title}</span>
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className={cn(
                  "ml-auto h-6 px-2 text-sm font-bold",
                  isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-blue-100 text-blue-800 border-blue-200"
                )}
              >
                {itemCount}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    },
    [isActiveItem, getItemCount, handleNavigation, isNavigating, isLoading]
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
            {section.map((item) => renderNavItem(item, sectionKey))}
          </SidebarMenu>
        </div>
      );
    },
    [renderNavItem]
  );

  // Create user data object
  const userData = {
    user: {
      name: user ? `${user.firstName} ${user.lastName}` : "Loading...",
      email: user?.email || "loading@example.com",
      avatar: getUserAvatarUrl(user),
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
          <SidebarGroupContent className="flex flex-col gap-4">
            {/* Main Navigation */}
            {config.navMain && renderSection("navMain", config.navMain, "Main")}

            {/* Analytics Section */}
            {config.analytics &&
              renderSection("analytics", config.analytics, "Analytics")}

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
}

export default StaffSidebar;
