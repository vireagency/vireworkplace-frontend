/**
 * @fileoverview Main Navigation Component for Vire Workplace HR App
 * @description Primary navigation menu with action buttons and navigation items
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for navigation and action buttons
import { IconCirclePlusFilled, IconMail } from "@tabler/icons-react";

// ============================================================================
// ROUTING IMPORTS
// ============================================================================

// React Router hooks for navigation and location
import { useLocation, useNavigate } from "react-router-dom";

// React hooks for state management
import { useState, useCallback } from "react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Button component for interactive elements
import { Button } from "@/components/ui/button";

// Action button component for quick actions
import { ActionButton } from "@/components/ui/action-button";

// Action buttons section component for grouped actions
import { ActionButtonsSection } from "@/components/action-buttons-section";

// Attendance modal component
import AttendanceModal from "@/components/AttendanceModal";

// Sidebar components for navigation structure
import {
  SidebarGroup, // Sidebar group container
  SidebarGroupContent, // Sidebar group content area
  SidebarMenu, // Sidebar menu container
  SidebarMenuButton, // Sidebar menu button
  SidebarMenuItem, // Sidebar menu item
} from "@/components/ui/sidebar";

/**
 * NavMain Component
 * @description Main navigation component with action buttons and navigation items
 * @component
 * @param {Object} props - Component props
 * @param {Array} [props.items=[]] - Array of navigation items
 * @param {Array} [props.actionButtons=[]] - Array of action button configurations
 * @returns {JSX.Element} The main navigation component
 *
 * Navigation Item Structure:
 * @param {string} item.title - Navigation item title
 * @param {string} item.url - Navigation URL
 * @param {React.Component} item.icon - Navigation item icon
 *
 * Action Button Structure:
 * @param {React.Component} button.icon - Button icon component
 * @param {string} button.text - Button text label
 * @param {string} [button.tooltip] - Optional tooltip text
 * @param {string} [button.variant] - Button variant/style
 * @param {Function} [button.onClick] - Click event handler
 *
 * Features:
 * - Dynamic navigation items with active state highlighting
 * - Configurable action buttons section
 * - Fallback check-in and inbox buttons
 * - Responsive design with hover effects
 * - Active route highlighting
 * - Tooltip support for navigation items
 */
export function NavMain({
  items = [], // Navigation items array
  actionButtons = [], // Action buttons array
}) {
  // ============================================================================
  // HOOKS
  // ============================================================================

  // Get current location for active state management
  const location = useLocation();

  // Navigation function for programmatic routing
  const navigate = useNavigate();

  // State for attendance modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle navigation to specified URL
   * @description Navigates to the specified URL if it's valid
   * @param {string} url - URL to navigate to
   */
  const handleNavigation = (url) => {
    // Only navigate if URL exists and is not a placeholder
    if (url && url !== "#") {
      navigate(url);
    }
  };

  // Handle attendance modal
  const handleAttendanceClick = useCallback(() => {
    setShowAttendanceModal(true);
  }, []);

  const handleAttendanceModalClose = useCallback(() => {
    setShowAttendanceModal(false);
  }, []);

  const handleAttendanceSuccess = useCallback(() => {
    console.log("Attendance action successful from HR sidebar");
  }, []);

  return (
    // ============================================================================
    // SIDEBAR GROUP CONTAINER
    // ============================================================================

    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* ========================================================================
             ACTION BUTTONS SECTION
             ========================================================================
             
             Display action buttons if provided, with "Quick Actions" title
             ======================================================================== */}

        {actionButtons && actionButtons.length > 0 && (
          <ActionButtonsSection
            actionButtons={actionButtons.map((button) => ({
              ...button,
              onClick:
                button.text === "Check-In"
                  ? handleAttendanceClick
                  : button.onClick,
            }))}
            title="Quick Actions"
          />
        )}

        {/* ========================================================================
             NAVIGATION ITEMS MENU
             ========================================================================
             
             Main navigation items with active state highlighting
             ======================================================================== */}

        <SidebarMenu>
          {/* Map through navigation items to render menu buttons */}
          {items.map((item) => {
            // Determine if current item is active based on location
            const isActive = location.pathname === item.url;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title} // Tooltip for navigation item
                  onClick={() => handleNavigation(item.url)} // Navigation handler
                  className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${
                    isActive ? "text-[#00DB12]" : ""
                  }`}
                >
                  {/* Render icon if provided */}
                  {item.icon && <item.icon />}

                  {/* Navigation item title */}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Attendance Modal */}
        <AttendanceModal
          isOpen={showAttendanceModal}
          onClose={handleAttendanceModalClose}
          onSuccess={handleAttendanceSuccess}
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
