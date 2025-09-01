/**
 * @fileoverview Action Buttons Section Component for Vire Workplace HR App
 * @description Renders a configurable section of action buttons for dashboard navigation
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import React from "react";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Custom action button component for individual buttons
import { ActionButton } from "@/components/ui/action-button";

// Sidebar menu components for layout structure
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * ActionButtonsSection Component
 * @description Renders a section of action buttons based on the provided configuration
 * @component
 * @param {Object} props - Component props
 * @param {Array} [props.actionButtons=[]] - Array of action button configurations
 * @param {string} [props.title] - Optional section title for the button group
 * @param {string} [props.className=""] - Additional CSS classes for styling
 * @returns {JSX.Element|null} The action buttons section or null if no buttons
 * 
 * Action Button Configuration Structure:
 * @param {React.Component} button.icon - Icon component to display
 * @param {string} button.text - Button text label
 * @param {string} [button.tooltip] - Optional tooltip text
 * @param {string} [button.variant] - Button variant/style
 * @param {Function} [button.onClick] - Click event handler
 * @param {boolean} [button.disabled] - Whether button is disabled
 * @param {string} [button.className] - Additional CSS classes for button
 * 
 * Features:
 * - Configurable action button layouts
 * - Optional section title
 * - Responsive button grouping
 * - Conditional rendering (hidden when no buttons)
 * - Flexible styling through className prop
 * - Reusable across different dashboards
 * 
 * @example
 * const actionButtons = [
 *   {
 *     icon: IconPlus,
 *     text: "Add New",
 *     tooltip: "Create new item",
 *     onClick: handleAddNew,
 *     variant: "default"
 *   }
 * ];
 * 
 * <ActionButtonsSection 
 *   actionButtons={actionButtons}
 *   title="Quick Actions"
 *   className="mb-4"
 * />
 */
export function ActionButtonsSection({
  actionButtons = [],        // Array of action button configurations
  title,                     // Optional section title
  className = "",            // Additional CSS classes
}) {
  // ============================================================================
  // EARLY RETURN
  // ============================================================================
  
  // Return null if no action buttons are provided
  // This prevents rendering empty sections
  if (!actionButtons || actionButtons.length === 0) {
    return null;
  }

  return (
    // ============================================================================
    // SIDEBAR MENU CONTAINER
    // ============================================================================
    
    <SidebarMenu className={className}>
      
      {/* ========================================================================
           OPTIONAL SECTION TITLE
           ========================================================================
           
           Display section title if provided
           ======================================================================== */}
      
      {title && (
        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      
      {/* ========================================================================
           ACTION BUTTONS CONTAINER
           ========================================================================
           
           Render all action buttons in a horizontal layout
           ======================================================================== */}
      
      <SidebarMenuItem className="flex items-center justify-start gap-2">
        {/* Map through action buttons array to render individual buttons */}
        {actionButtons.map((button, index) => (
          <ActionButton
            key={`${button.text}-${index}`}        // Unique key for React rendering
            icon={button.icon}                      // Button icon component
            text={button.text}                      // Button text label
            tooltip={button.tooltip}                // Optional tooltip text
            variant={button.variant}                // Button variant/style
            onClick={button.onClick}                // Click event handler
            disabled={button.disabled}              // Disabled state
            className={button.className}            // Additional CSS classes
          />
        ))}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
