/**
 * @fileoverview Hover Card Component for Vire Workplace HR App
 * @description Accessible hover card component with smooth animations and positioning
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/hover-card Radix UI Hover Card Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Hover Card primitive for accessibility and functionality
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * HoverCard Component
 * @description Main hover card container that manages hover state and positioning
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.openDelay=700] - Delay before showing card (milliseconds)
 * @param {number} [props.closeDelay=300] - Delay before hiding card (milliseconds)
 * @param {boolean} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {React.ReactNode} props.children - Hover card trigger and content
 * @param {...any} props - Additional props passed to HoverCardPrimitive.Root
 * @returns {JSX.Element} The hover card component
 * 
 * Features:
 * - Hover-based activation
 * - Configurable open/close delays
 * - Controlled and uncontrolled modes
 * - Accessibility features
 * - Smooth animations
 * 
 * Timing Behavior:
 * - openDelay: Time before card appears (default: 700ms)
 * - closeDelay: Time before card disappears (default: 300ms)
 * 
 * @example
 * <HoverCard>
 *   <HoverCardTrigger>Hover me</HoverCardTrigger>
 *   <HoverCardContent>
 *     <div>Additional information appears on hover</div>
 *   </HoverCardContent>
 * </HoverCard>
 * 
 * // With custom timing
 * <HoverCard openDelay={500} closeDelay={200}>
 *   <HoverCardTrigger>Quick hover</HoverCardTrigger>
 *   <HoverCardContent>Faster response</HoverCardContent>
 * </HoverCard>
 */
function HoverCard({
  ...props                    // Additional props for HoverCardPrimitive.Root
}) {
  return (
    <HoverCardPrimitive.Root 
      data-slot="hover-card"                                  // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * HoverCardTrigger Component
 * @description Element that triggers the hover card to appear
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger content (text, button, etc.)
 * @param {...any} props - Additional props passed to HoverCardPrimitive.Trigger
 * @returns {JSX.Element} The hover card trigger component
 * 
 * Purpose:
 * - Wraps the element that activates the hover card
 * - Manages hover state detection
 * - Enables accessibility features
 * 
 * Common Usage:
 * - Text elements
 * - Button elements
 * - Image elements
 * - Custom interactive elements
 */
function HoverCardTrigger({
  ...props                    // Additional props for HoverCardPrimitive.Trigger
}) {
  return (
    <HoverCardPrimitive.Trigger 
      data-slot="hover-card-trigger"                          // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * HoverCardContent Component
 * @description Content container that appears on hover with animations
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.align="center"] - Content alignment: 'start', 'center', 'end'
 * @param {number} [props.sideOffset=4] - Distance from trigger in pixels
 * @param {React.ReactNode} props.children - Hover card content
 * @param {...any} props - Additional props passed to HoverCardPrimitive.Content
 * @returns {JSX.Element} The hover card content component
 * 
 * Features:
 * - Smooth fade and zoom animations
 * - Side-based slide animations
 * - Configurable positioning
 * - Responsive design
 * - Consistent with design system
 * 
 * Animation States:
 * - Open: fade in and zoom in
 * - Closed: fade out and zoom out
 * - Side-based slide animations for smooth transitions
 * 
 * Positioning:
 * - align: Content alignment relative to trigger
 * - sideOffset: Distance from trigger element
 * 
 * @example
 * // Basic hover card content
 * <HoverCardContent>
 *   <div className="space-y-2">
 *     <h4 className="font-semibold">User Profile</h4>
 *     <p>Additional details about the user</p>
 *   </div>
 * </HoverCardContent>
 * 
 * // With custom positioning
 * <HoverCardContent align="start" sideOffset={8}>
 *   <div>Left-aligned content with more spacing</div>
 * </HoverCardContent>
 */
function HoverCardContent({
  className,                  // Additional CSS classes
  align = "center",           // Content alignment (default: center)
  sideOffset = 4,             // Side offset (default: 4px)
  ...props                    // Additional props for HoverCardPrimitive.Content
}) {
  return (
    // ============================================================================
    // HOVER CARD PORTAL
    // ============================================================================
    
    <HoverCardPrimitive.Portal 
      data-slot="hover-card-portal"                           // Data attribute for styling
    >
      {/* ========================================================================
           HOVER CARD CONTENT CONTAINER
           ========================================================================
           
           Content with animations and positioning
           ======================================================================== */}
      
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"                         // Data attribute for styling
        align={align}                                           // Content alignment
        sideOffset={sideOffset}                                 // Side offset
        className={cn(
          // ========================================================================
          // BASE STYLING
          // ========================================================================
          
          // Background and text colors
          "bg-popover text-popover-foreground",                 // Popover theme colors
          
          // ========================================================================
          // ANIMATION STATES
          // ========================================================================
          
          // Open/closed animations
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",  // Fade effects
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",                                                              // Zoom effects
          
          // ========================================================================
          // SIDE-BASED ANIMATIONS
          // ========================================================================
          
          // Slide animations based on position
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          
          // ========================================================================
          // LAYOUT AND POSITIONING
          // ========================================================================
          
          // Z-index and sizing
          "z-50 w-64",                                         // High z-index and fixed width
          
          // Transform origin and overflow
          "origin-(--radix-hover-card-content-transform-origin)",  // Transform origin
          
          // Visual styling
          "rounded-md border p-4 shadow-md outline-hidden",     // Shape, border, padding, shadow, focus outline
          
          className                                            // Custom classes
        )}
        {...props}                                            // Spread additional props
      />
    </HoverCardPrimitive.Portal>
  );
}

// Export all hover card components for external use
export { 
  HoverCard,                  // Main hover card container
  HoverCardTrigger,           // Hover card trigger element
  HoverCardContent            // Hover card content container
}
