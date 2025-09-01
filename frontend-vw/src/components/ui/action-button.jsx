/**
 * @fileoverview Action Button Component for Vire Workplace HR App
 * @description Reusable action button component designed for dashboard sidebars
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import React from "react";

// ============================================================================
// SIDEBAR COMPONENT IMPORTS
// ============================================================================

// Sidebar menu button component for integration
import { SidebarMenuButton } from "@/components/ui/sidebar";

/**
 * ActionButton Component
 * @description A reusable action button component designed for dashboard sidebars
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.icon - Icon component to display
 * @param {string} props.text - Button text to display
 * @param {string} [props.tooltip] - Tooltip text for the button
 * @param {Function} [props.onClick] - Click handler function
 * @param {string} [props.className=""] - Additional CSS classes
 * @param {string} [props.variant="primary"] - Button variant (primary, secondary, outline, ghost, destructive)
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {...any} props - Additional props passed to SidebarMenuButton
 * @returns {JSX.Element} The action button component
 * 
 * Features:
 * - Multiple button variants with consistent styling
 * - Icon and text support
 * - Tooltip functionality
 * - Disabled state handling
 * - Customizable through className prop
 * - Responsive design with hover and active states
 * - Integration with sidebar navigation system
 * 
 * Button Variants:
 * - primary: Main action button with primary colors
 * - secondary: Secondary action button with muted colors
 * - outline: Outlined button with border styling
 * - ghost: Minimal button with hover effects
 * - destructive: Danger/delete button with destructive colors
 * 
 * @example
 * <ActionButton
 *   icon={IconPlus}
 *   text="Add New"
 *   tooltip="Create new item"
 *   onClick={handleAddNew}
 *   variant="primary"
 * />
 */
export function ActionButton({
  icon: Icon,              // Icon component (renamed to Icon for JSX usage)
  text,                    // Button text label
  tooltip,                 // Tooltip text for accessibility
  onClick,                 // Click event handler
  className = "",          // Additional CSS classes
  variant = "primary",     // Button variant for styling
  disabled = false,        // Disabled state
  ...props                 // Additional props for SidebarMenuButton
}) {
  // ============================================================================
  // STYLING CONFIGURATION
  // ============================================================================
  
  // Base classes for consistent button styling
  const baseClasses = "min-w-6 max-w-45 duration-200 ease-linear flex items-center justify-center";
  
  // ============================================================================
  // VARIANT-SPECIFIC STYLING
  // ============================================================================
  
  // Variant-specific CSS classes for different button styles
  const variantClasses = {
    // Primary button with main brand colors
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
    
    // Secondary button with muted colors
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground active:bg-secondary/80 active:text-secondary-foreground",
    
    // Outline button with border styling
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    
    // Ghost button with minimal styling
    ghost: "hover:bg-accent hover:text-accent-foreground",
    
    // Destructive button for dangerous actions
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  // ============================================================================
  // CLASS COMBINATION
  // ============================================================================
  
  // Combine base classes, variant classes, and custom classes
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    // ============================================================================
    // SIDEBAR MENU BUTTON
    // ============================================================================
    
    <SidebarMenuButton
      tooltip={tooltip}                    // Tooltip for accessibility
      className={combinedClasses}          // Combined CSS classes
      onClick={onClick}                    // Click event handler
      disabled={disabled}                  // Disabled state
      {...props}                           // Spread additional props
    >
      {/* Render icon if provided */}
      {Icon && <Icon />}
      
      {/* Button text label */}
      <span>{text}</span>
    </SidebarMenuButton>
  );
}
