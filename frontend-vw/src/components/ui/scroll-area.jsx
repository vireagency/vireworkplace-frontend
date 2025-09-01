/**
 * @fileoverview Scroll Area Component for Vire Workplace HR App
 * @description Custom scrollable area component with styled scrollbars
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/scroll-area Radix UI Scroll Area Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Scroll Area primitive for accessibility and functionality
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * ScrollArea Component
 * @description Custom scrollable area component with styled scrollbars and viewport
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Content to be scrollable
 * @param {string} [props.type="auto"] - Scroll type: 'auto', 'always', 'scroll', 'hover'
 * @param {string} [props.scrollHideDelay=600] - Delay before hiding scrollbars
 * @param {...any} props - Additional props passed to ScrollAreaPrimitive.Root
 * @returns {JSX.Element} The scroll area component
 * 
 * Features:
 * - Custom styled scrollbars
 * - Cross-browser compatibility
 * - Touch device support
 * - Focus management
 * - Accessibility features
 * - Responsive design
 * - Customizable through className prop
 * 
 * Scroll Types:
 * - auto: Show scrollbars only when needed (default)
 * - always: Always show scrollbars
 * - scroll: Show scrollbars on scroll
 * - hover: Show scrollbars on hover
 * 
 * @example
 * // Basic scroll area
 * <ScrollArea className="h-64 w-full">
 *   <div className="h-96">Long content here...</div>
 * </ScrollArea>
 * 
 * // Custom scroll type
 * <ScrollArea type="always" className="h-48">
 *   <div>Content with always-visible scrollbars</div>
 * </ScrollArea>
 * 
 * // With custom styling
 * <ScrollArea className="h-32 w-80 border rounded-lg">
 *   <div className="space-y-4">Multiple items...</div>
 * </ScrollArea>
 */
function ScrollArea({
  className,                  // Additional CSS classes
  children,                   // Content to be scrollable
  ...props                    // Additional props for ScrollAreaPrimitive.Root
}) {
  return (
    // ============================================================================
    // SCROLL AREA ROOT CONTAINER
    // ============================================================================
    
    <ScrollAreaPrimitive.Root 
      data-slot="scroll-area"                                // Data attribute for styling
      className={cn(
        "relative",                                           // Base positioning
        className                                             // Custom classes
      )} 
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           SCROLL AREA VIEWPORT
           ========================================================================
           
           The viewport contains the scrollable content
           ======================================================================== */}
      
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"                      // Data attribute for styling
        className={cn(
          // Base viewport styles
          "size-full rounded-[inherit]",                      // Full size and inherit border radius
          
          // Focus states
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          
          // Transitions
          "transition-[color,box-shadow]"                     // Smooth color and shadow transitions
        )}>
        {/* Scrollable content */}
        {children}
      </ScrollAreaPrimitive.Viewport>
      
      {/* Custom scrollbar component */}
      <ScrollBar />
      
      {/* Corner element for scrollbar intersection */}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * ScrollBar Component
 * @description Custom styled scrollbar for the scroll area
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.orientation="vertical"] - Scrollbar orientation: 'vertical' | 'horizontal'
 * @param {...any} props - Additional props passed to ScrollAreaPrimitive.ScrollAreaScrollbar
 * @returns {JSX.Element} The scrollbar component
 * 
 * Features:
 * - Vertical and horizontal orientation support
 * - Custom styling with design system colors
 * - Touch-friendly interaction
 * - Smooth transitions
 * - Consistent with application theme
 * 
 * Orientation Behavior:
 * - vertical: Full height, fixed width, left border (default)
 * - horizontal: Full width, fixed height, top border
 * 
 * Styling:
 * - Uses border colors from design system
 * - Rounded thumb for modern appearance
 * - Transparent borders for clean look
 * - Touch-friendly sizing
 */
function ScrollBar({
  className,                  // Additional CSS classes
  orientation = "vertical",   // Scrollbar orientation (default: vertical)
  ...props                    // Additional props for ScrollAreaPrimitive.ScrollAreaScrollbar
}) {
  return (
    // ============================================================================
    // SCROLLBAR CONTAINER
    // ============================================================================
    
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"                       // Data attribute for styling
      orientation={orientation}                                // Scrollbar orientation
      className={cn(
        // Base scrollbar styles
        "flex touch-none p-px transition-colors select-none",  // Layout, touch, transitions, selection
        
        // ========================================================================
        // ORIENTATION-SPECIFIC STYLING
        // ========================================================================
        
        // Vertical scrollbar
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",       // Full height, fixed width, left border
        
        // Horizontal scrollbar
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",     // Full width, fixed height, top border
        
        className                                               // Custom classes
      )}
      {...props}>                                             {/* Spread additional props */}
      
      {/* ========================================================================
           SCROLLBAR THUMB
           ========================================================================
           
           The draggable thumb that shows scroll position
           ======================================================================== */}
      
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"                         // Data attribute for styling
        className={cn(
          "bg-border relative flex-1 rounded-full"             // Background, positioning, and shape
        )} />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

// Export scroll area components for external use
export { 
  ScrollArea,                 // Main scroll area container
  ScrollBar                   // Custom scrollbar component
}
