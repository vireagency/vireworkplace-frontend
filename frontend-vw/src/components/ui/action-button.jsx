import React from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

/**
 * ActionButton Component
 * 
 * A reusable action button component designed for dashboard sidebars.
 * Can be customized with different icons, text, and actions for different user roles.
 * 
 * Props:
 * @param {React.ReactNode} icon - Icon component to display
 * @param {string} text - Button text to display
 * @param {string} tooltip - Tooltip text for the button
 * @param {function} onClick - Click handler function
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Button variant (primary, secondary, etc.)
 * @param {boolean} disabled - Whether the button is disabled
 */
export function ActionButton({
  icon: Icon,
  text,
  tooltip,
  onClick,
  className = "",
  variant = "primary",
  disabled = false,
  ...props
}) {
  // Base classes for the button
  const baseClasses = "min-w-6 max-w-45 duration-200 ease-linear flex items-center justify-center";
  
  // Variant-specific classes
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:text-secondary-foreground active:bg-secondary/80 active:text-secondary-foreground",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

  return (
    <SidebarMenuButton
      tooltip={tooltip}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon />}
      <span>{text}</span>
    </SidebarMenuButton>
  );
}
