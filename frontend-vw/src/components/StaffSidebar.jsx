/**
 * @fileoverview Staff Sidebar Component for Vire Workplace HR App
 * @description Custom sidebar component for staff dashboard with proper navigation and counts
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
import { useStaffSidebar } from "@/contexts/StaffSidebarContext";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import AttendanceModal from "@/components/AttendanceModal";
import { ActionButtonsSection } from "@/components/action-buttons-section";
import { ActionButton } from "@/components/ui/action-button";
import { staffActionButtons } from "@/config/actionButtonConfigs";
// import { useAttendanceStatus } from "@/hooks/useAttendanceStatus";

/**
 * StaffSidebar Component
 * @description Custom sidebar for staff dashboard with proper navigation structure
 * @component
 * @param {Object} props - Component props
 * @param {Object} [props.config] - Navigation configuration
 * @param {Function} [props.onNavigate] - Navigation handler
 * @param {...any} props - Additional props passed to the Sidebar component
 * @returns {JSX.Element} The staff sidebar component
 */
const StaffSidebarComponent = ({ config, onNavigate, ...props }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { counts, loading: sidebarLoading } = useStaffSidebar();
  // const { attendanceStatus } = useAttendanceStatus();
  const [isNavigating, setIsNavigating] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // Debug logging for counts
  console.log("StaffSidebar - Received counts:", counts);
  console.log("StaffSidebar - Sidebar loading:", sidebarLoading);

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

  // Get item count for badges from shared context
  const getItemCount = useCallback(
    (itemTitle) => {
      // Map item titles to count keys
      const titleMapping = {
        Evaluations: "evaluations",
        Tasks: "tasks",
        Attendance: "attendance",
        Messages: "messages",
        Reports: "reports",
      };

      const countKey = titleMapping[itemTitle] || itemTitle.toLowerCase();
      const count = counts[countKey] || 0;

      // Debug logging for badge counts
      console.log(`Badge for ${itemTitle} (key: ${countKey}):`, count);

      return count;
    },
    [counts]
  );

  // Handle attendance modal
  const handleAttendanceClick = useCallback(() => {
    setShowAttendanceModal(true);
  }, []);

  const handleAttendanceModalClose = useCallback(() => {
    setShowAttendanceModal(false);
  }, []);

  const handleAttendanceSuccess = useCallback(() => {
    // Refresh sidebar counts after successful check-in/check-out
    // The context will automatically refresh counts
    console.log(
      "Attendance action successful, sidebar counts will be refreshed"
    );
  }, []);

  // Get staff action buttons with custom styling
  const staffActionButtonsWithHandlers = staffActionButtons.map((button) => ({
    ...button,
    onClick:
      button.text === "Check-In" ? handleAttendanceClick : button.onClick,
    // Override styling to match staff theme
    className:
      "bg-green-500 font-medium text-white text-sm hover:bg-green-600 active:bg-green-600 min-w-6 max-w-45 duration-200 ease-linear flex items-center justify-center",
  }));

  // Render navigation item
  const renderNavItem = useCallback(
    (item) => {
      const isActive = isActiveItem(item.url);
      const itemCount = getItemCount(item.title);
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

  // Create user data object
  const userData = {
    user: {
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
            {/* Quick Actions Section - Using ActionButtonsSection like HR Dashboard */}
            {staffActionButtonsWithHandlers &&
              staffActionButtonsWithHandlers.length > 0 && (
                <ActionButtonsSection
                  actionButtons={staffActionButtonsWithHandlers}
                  title="Quick Actions"
                />
              )}

            {/* Fallback Action Buttons - Staff themed */}
            {(!staffActionButtonsWithHandlers ||
              staffActionButtonsWithHandlers.length === 0) && (
              <SidebarMenu>
                <SidebarMenuItem className="flex items-center gap-2">
                  {/* Check-in action button with staff styling */}
                  <ActionButton
                    icon={IconPlus}
                    text="Check-In"
                    tooltip="Check-In"
                    variant="primary"
                    onClick={handleAttendanceClick}
                    className="bg-green-500 font-medium text-white text-sm hover:bg-green-600 active:bg-green-600 min-w-6 max-w-45 duration-200 ease-linear flex items-center justify-center"
                  />
                </SidebarMenuItem>
              </SidebarMenu>
            )}

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

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={showAttendanceModal}
        onClose={handleAttendanceModalClose}
        onSuccess={handleAttendanceSuccess}
      />
    </Sidebar>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const StaffSidebar = memo(StaffSidebarComponent);

export default StaffSidebar;
