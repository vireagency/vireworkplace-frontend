import React from "react";
import { ActionButton } from "@/components/ui/action-button";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

/**
 * ActionButtonsSection Component
 * 
 * Renders a section of action buttons based on the provided configuration.
 * This component makes it easy to display different sets of action buttons
 * across different dashboards.
 * 
 * Props:
 * @param {Array} actionButtons - Array of action button configurations
 * @param {string} title - Optional section title
 * @param {string} className - Additional CSS classes
 */
export function ActionButtonsSection({
  actionButtons = [],
  title,
  className = "",
}) {
  if (!actionButtons || actionButtons.length === 0) {
    return null;
  }

  return (
    <SidebarMenu className={className}>
      {title && (
        <div className="px-3 py-2 text-sm font-medium text-muted-foreground">
          {title}
        </div>
      )}
      <SidebarMenuItem className="flex items-center justify-start gap-2">
        {actionButtons.map((button, index) => (
          <ActionButton
            key={`${button.text}-${index}`}
            icon={button.icon}
            text={button.text}
            tooltip={button.tooltip}
            variant={button.variant}
            onClick={button.onClick}
            disabled={button.disabled}
            className={button.className}
          />
        ))}
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
