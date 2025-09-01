/**
 * @fileoverview Drawer Component for Vire Workplace HR App
 * @description Accessible drawer component with multiple directions and smooth animations
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://vaul-ui.com/ Vaul Drawer Documentation}
 */

// React core library for component creation
import * as React from "react"

// Vaul drawer primitive for drawer functionality
import { Drawer as DrawerPrimitive } from "vaul"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Drawer Component
 * @description Main drawer container that manages drawer state and behavior
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {boolean} [props.defaultOpen] - Default open state
 * @param {boolean} [props.modal=true] - Whether the drawer is modal
 * @param {React.ReactNode} props.children - Drawer content and controls
 * @param {...any} props - Additional props passed to DrawerPrimitive.Root
 * @returns {JSX.Element} The drawer component
 * 
 * Features:
 * - Multiple direction support (top, bottom, left, right)
 * - Modal and non-modal behavior
 * - Accessibility features
 * - Keyboard navigation
 * - Focus management
 * 
 * @example
 * <Drawer>
 *   <DrawerTrigger>Open Drawer</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Drawer Title</DrawerTitle>
 *       <DrawerDescription>Drawer description</DrawerDescription>
 *     </DrawerHeader>
 *     <div>Drawer content goes here</div>
 *     <DrawerFooter>
 *       <button>Action</button>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
function Drawer({
  ...props                    // Additional props for DrawerPrimitive.Root
}) {
  return (
    <DrawerPrimitive.Root 
      data-slot="drawer"                                      // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * DrawerTrigger Component
 * @description Element that triggers the drawer to open
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger content (button, link, etc.)
 * @param {...any} props - Additional props passed to DrawerPrimitive.Trigger
 * @returns {JSX.Element} The drawer trigger component
 * 
 * Purpose:
 * - Wraps the element that opens the drawer
 * - Manages drawer state
 * - Enables accessibility features
 * 
 * Common Usage:
 * - Button elements
 * - Link elements
 * - Custom interactive elements
 */
function DrawerTrigger({
  ...props                    // Additional props for DrawerPrimitive.Trigger
}) {
  return (
    <DrawerPrimitive.Trigger 
      data-slot="drawer-trigger"                               // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * DrawerPortal Component
 * @description Portals the drawer content to the document body
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Drawer content to portal
 * @param {...any} props - Additional props passed to DrawerPrimitive.Portal
 * @returns {JSX.Element} The drawer portal component
 * 
 * Purpose:
 * - Ensures proper z-index stacking
 * - Prevents layout issues
 * - Maintains accessibility tree
 */
function DrawerPortal({
  ...props                    // Additional props for DrawerPrimitive.Portal
}) {
  return (
    <DrawerPrimitive.Portal 
      data-slot="drawer-portal"                                // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * DrawerClose Component
 * @description Element that closes the drawer when activated
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Close button content
 * @param {...any} props - Additional props passed to DrawerPrimitive.Close
 * @returns {JSX.Element} The drawer close component
 * 
 * Common Usage:
 * - Close buttons
 * - Escape key handling
 * - Click outside handling
 */
function DrawerClose({
  ...props                    // Additional props for DrawerPrimitive.Close
}) {
  return (
    <DrawerPrimitive.Close 
      data-slot="drawer-close"                                 // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * DrawerOverlay Component
 * @description Semi-transparent backdrop behind the drawer
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to DrawerPrimitive.Overlay
 * @returns {JSX.Element} The drawer overlay component
 * 
 * Features:
 * - Semi-transparent black background
 * - Fade in/out animations
 * - Click outside to close functionality
 * - High z-index for proper layering
 * 
 * Styling:
 * - Fixed positioning covering entire viewport
 * - 50% opacity black background
 * - Smooth fade animations
 * - High z-index (50)
 */
function DrawerOverlay({
  className,                  // Additional CSS classes
  ...props                    // Additional props for DrawerPrimitive.Overlay
}) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"                               // Data attribute for styling
      className={cn(
        // ========================================================================
        // ANIMATION STATES
        // ========================================================================
        
        // Open/closed animations
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        
        // ========================================================================
        // POSITIONING AND STYLING
        // ========================================================================
        
        // Fixed positioning and z-index
        "fixed inset-0 z-50",                                  // Full viewport coverage, high z-index
        
        // Semi-transparent background
        "bg-black/50",                                         // 50% opacity black background
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * DrawerContent Component
 * @description Main content area of the drawer with direction-aware styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Drawer content
 * @param {string} [props.direction="bottom"] - Drawer direction: 'top', 'bottom', 'left', 'right'
 * @param {...any} props - Additional props passed to DrawerPrimitive.Content
 * @returns {JSX.Element} The drawer content component
 * 
 * Features:
 * - Multiple direction support
 * - Direction-aware styling and positioning
 * - Drag handle for bottom direction
 * - Responsive design
 * - Smooth animations
 * 
 * Direction Behavior:
 * - top: Slides down from top, rounded bottom corners
 * - bottom: Slides up from bottom, rounded top corners, drag handle
 * - left: Slides in from left, rounded right corners
 * - right: Slides in from right, rounded left corners
 * 
 * @example
 * // Bottom drawer (default)
 * <DrawerContent>
 *   <DrawerHeader>Title</DrawerHeader>
 *   <div>Content</div>
 * </DrawerContent>
 * 
 * // Top drawer
 * <DrawerContent direction="top">
 *   <div>Top drawer content</div>
 * </DrawerContent>
 */
function DrawerContent({
  className,                  // Additional CSS classes
  children,                   // Drawer content
  ...props                    // Additional props for DrawerPrimitive.Content
}) {
  return (
    // ============================================================================
    // DRAWER PORTAL AND OVERLAY
    // ============================================================================
    
    <DrawerPortal 
      data-slot="drawer-portal"                                // Data attribute for styling
    >
      {/* Semi-transparent backdrop */}
      <DrawerOverlay />
      
      {/* ========================================================================
           DRAWER CONTENT CONTAINER
           ========================================================================
           
           Main drawer content with direction-aware styling
           ======================================================================== */}
      
      <DrawerPrimitive.Content
        data-slot="drawer-content"                             // Data attribute for styling
        className={cn(
          // ========================================================================
          // BASE STYLING
          // ========================================================================
          
          // Background and layout
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",  // Background, positioning, z-index, layout
          
          // ========================================================================
          // TOP DIRECTION STYLING
          // ========================================================================
          
          // Top drawer positioning and styling
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          
          // ========================================================================
          // BOTTOM DIRECTION STYLING
          // ========================================================================
          
          // Bottom drawer positioning and styling
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          
          // ========================================================================
          // RIGHT DIRECTION STYLING
          // ========================================================================
          
          // Right drawer positioning and styling
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          
          // ========================================================================
          // LEFT DIRECTION STYLING
          // ========================================================================
          
          // Left drawer positioning and styling
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          
          className                                           // Custom classes
        )}
        {...props}>                                          {/* Spread additional props */}
        
        {/* ========================================================================
             DRAG HANDLE (BOTTOM DIRECTION ONLY)
             ========================================================================
             
             Visual indicator for dragging bottom drawer
             ======================================================================== */}
        
        <div
          className={cn(
            // Base drag handle styles
            "bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full",  // Background, positioning, size, shape
            
            // Only show for bottom direction
            "group-data-[vaul-drawer-direction=bottom]/drawer-content:block"      // Show when direction is bottom
          )} />
        
        {/* Drawer content */}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

/**
 * DrawerHeader Component
 * @description Header section of the drawer content
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Header content
 * @param {...any} props - Additional props passed to the div element
 * @returns {JSX.Element} The drawer header component
 * 
 * Features:
 * - Direction-aware text alignment
 * - Consistent spacing and typography
 * - Responsive design
 * 
 * Text Alignment:
 * - top/bottom direction: Centered on mobile, left-aligned on medium+ screens
 * - left/right direction: Left-aligned by default
 */
function DrawerHeader({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the div element
}) {
  return (
    <div
      data-slot="drawer-header"                                // Data attribute for styling
      className={cn(
        // Base header styles
        "flex flex-col gap-0.5 p-4",                           // Layout, spacing, padding
        
        // Direction-aware text alignment
        "group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",  // Responsive alignment
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * DrawerFooter Component
 * @description Footer section of the drawer content
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Footer content
 * @param {...any} props - Additional props passed to the div element
 * @returns {JSX.Element} The drawer footer component
 * 
 * Features:
 * - Auto margin top for positioning at bottom
 * - Flexbox column layout
 * - Consistent spacing
 * - Common usage for action buttons
 * 
 * Layout:
 * - Auto margin top pushes footer to bottom
 * - Flexbox column for vertical stacking
 * - Consistent padding and gap
 */
function DrawerFooter({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the div element
}) {
  return (
    <div
      data-slot="drawer-footer"                                // Data attribute for styling
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",                     // Auto margin top, layout, spacing, padding
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * DrawerTitle Component
 * @description Title element for the drawer with proper accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Title text
 * @param {...any} props - Additional props passed to DrawerPrimitive.Title
 * @returns {JSX.Element} The drawer title component
 * 
 * Features:
 * - Proper heading semantics for screen readers
 * - Consistent typography styling
 * - Foreground color from design system
 * - Semibold font weight
 */
function DrawerTitle({
  className,                  // Additional CSS classes
  ...props                    // Additional props for DrawerPrimitive.Title
}) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"                                 // Data attribute for styling
      className={cn(
        "text-foreground font-semibold",                        // Typography styling
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * DrawerDescription Component
 * @description Description element for the drawer with proper accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Description text
 * @param {...any} props - Additional props passed to DrawerPrimitive.Description
 * @returns {JSX.Element} The drawer description component
 * 
 * Features:
 * - Proper description semantics for screen readers
 * - Muted text color for secondary information
 * - Smaller font size for hierarchy
 * - Consistent with design system
 */
function DrawerDescription({
  className,                  // Additional CSS classes
  ...props                    // Additional props for DrawerPrimitive.Description
}) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"                            // Data attribute for styling
      className={cn(
        "text-muted-foreground text-sm",                        // Typography styling
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

// Export all drawer components for external use
export {
  Drawer,                     // Main drawer container
  DrawerPortal,               // Drawer content portal
  DrawerOverlay,              // Drawer backdrop overlay
  DrawerTrigger,              // Drawer trigger element
  DrawerClose,                // Drawer close element
  DrawerContent,              // Drawer content container
  DrawerHeader,               // Drawer header section
  DrawerFooter,               // Drawer footer section
  DrawerTitle,                // Drawer title element
  DrawerDescription,          // Drawer description element
}
