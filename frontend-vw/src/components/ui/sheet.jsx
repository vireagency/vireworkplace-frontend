/**
 * @fileoverview Sheet Component for Vire Workplace HR App
 * @description Slide-out panel component with multiple sides and animations
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/dialog Radix UI Dialog Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Dialog primitive for sheet functionality (reused for sheets)
import * as SheetPrimitive from "@radix-ui/react-dialog"

// Close icon from Lucide React icon library
import { XIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Sheet Root Component
 * @description Main sheet container that manages the sheet state
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {boolean} [props.defaultOpen] - Default open state
 * @param {boolean} [props.modal=true] - Whether the sheet is modal
 * @param {...any} props - Additional props passed to SheetPrimitive.Root
 * @returns {JSX.Element} The sheet root component
 * 
 * Features:
 * - Controlled and uncontrolled open state
 * - Modal and non-modal behavior
 * - Accessibility features from Radix UI
 * - Keyboard navigation support
 * - Focus management
 */
function Sheet({
  ...props                    // Additional props for SheetPrimitive.Root
}) {
  return (
    <SheetPrimitive.Root 
      data-slot="sheet"       // Data attribute for styling
      {...props}              // Spread additional props
    />
  );
}

/**
 * Sheet Trigger Component
 * @description Element that triggers the sheet to open
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger content (button, link, etc.)
 * @param {...any} props - Additional props passed to SheetPrimitive.Trigger
 * @returns {JSX.Element} The sheet trigger component
 * 
 * Common Usage:
 * - Button elements
 * - Link elements
 * - Custom interactive elements
 */
function SheetTrigger({
  ...props                    // Additional props for SheetPrimitive.Trigger
}) {
  return (
    <SheetPrimitive.Trigger 
      data-slot="sheet-trigger"  // Data attribute for styling
      {...props}                  // Spread additional props
    />
  );
}

/**
 * Sheet Close Component
 * @description Element that closes the sheet when activated
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Close button content
 * @param {...any} props - Additional props passed to SheetPrimitive.Close
 * @returns {JSX.Element} The sheet close component
 * 
 * Common Usage:
 * - Close buttons
 * - Escape key handling
 * - Click outside handling
 */
function SheetClose({
  ...props                    // Additional props for SheetPrimitive.Close
}) {
  return (
    <SheetPrimitive.Close 
      data-slot="sheet-close"    // Data attribute for styling
      {...props}                  // Spread additional props
    />
  );
}

/**
 * Sheet Portal Component
 * @description Portals the sheet content to the document body
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Sheet content to portal
 * @param {...any} props - Additional props passed to SheetPrimitive.Portal
 * @returns {JSX.Element} The sheet portal component
 * 
 * Purpose:
 * - Ensures proper z-index stacking
 * - Prevents layout issues
 * - Maintains accessibility tree
 */
function SheetPortal({
  ...props                    // Additional props for SheetPrimitive.Portal
}) {
  return (
    <SheetPrimitive.Portal 
      data-slot="sheet-portal"   // Data attribute for styling
      {...props}                  // Spread additional props
    />
  );
}

/**
 * Sheet Overlay Component
 * @description Semi-transparent backdrop behind the sheet
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to SheetPrimitive.Overlay
 * @returns {JSX.Element} The sheet overlay component
 * 
 * Features:
 * - Semi-transparent black background
 * - Fade in/out animations
 * - Click outside to close functionality
 * - High z-index for proper layering
 */
function SheetOverlay({
  className,                  // Additional CSS classes
  ...props                    // Additional props for SheetPrimitive.Overlay
}) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"  // Data attribute for styling
      className={cn(
        // Base overlay styles
        "fixed inset-0 z-50 bg-black/50",                     // Full screen, high z-index, semi-transparent
        
        // Animation states
        "data-[state=open]:animate-in data-[state=closed]:animate-out",  // Animation classes
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",   // Fade effects
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * Sheet Content Component
 * @description Main content area of the sheet with animations and positioning
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Sheet content
 * @param {string} [props.side="right"] - Sheet side: 'top', 'right', 'bottom', 'left'
 * @param {...any} props - Additional props passed to SheetPrimitive.Content
 * @returns {JSX.Element} The sheet content component
 * 
 * Features:
 * - Multiple side positioning (top, right, bottom, left)
 * - Slide animations from/to different directions
 * - Responsive sizing
 * - Built-in close button
 * - Shadow and border styling
 * - Smooth transitions
 * 
 * Side Behavior:
 * - right: Slides from right, full height, left border (default)
 * - left: Slides from left, full height, right border
 * - top: Slides from top, auto height, bottom border
 * - bottom: Slides from bottom, auto height, top border
 * 
 * @example
 * <SheetContent side="right">
 *   <SheetHeader>
 *     <SheetTitle>Settings</SheetTitle>
 *   </SheetHeader>
 *   <div>Content goes here</div>
 * </SheetContent>
 */
function SheetContent({
  className,                  // Additional CSS classes
  children,                   // Sheet content
  side = "right",            // Sheet side (default: right)
  ...props                    // Additional props for SheetPrimitive.Content
}) {
  return (
    // ============================================================================
    // SHEET PORTAL AND OVERLAY
    // ============================================================================
    
    <SheetPortal>
      {/* Semi-transparent backdrop */}
      <SheetOverlay />
      
      {/* ========================================================================
           SHEET CONTENT CONTAINER
           ========================================================================
           
           Main sheet content with animations and positioning
           ======================================================================== */}
      
      <SheetPrimitive.Content
        data-slot="sheet-content"                            // Data attribute for styling
        className={cn(
          // Base content styles
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg",  // Background, positioning, layout
          "transition ease-in-out",                          // Smooth transitions
          
          // Animation timing
          "data-[state=closed]:duration-300 data-[state=open]:duration-500",
          
          // Animation states
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          
          // ========================================================================
          // SIDE-SPECIFIC POSITIONING AND ANIMATIONS
          // ========================================================================
          
          // Right side (default)
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          
          // Left side
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          
          // Top side
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          
          // Bottom side
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          
          className                                           // Custom classes
        )}
        {...props}>                                          {/* Spread additional props */}
        
        {/* Sheet content */}
        {children}
        
        {/* ========================================================================
             CLOSE BUTTON
             ========================================================================
             
             Built-in close button positioned in top-right corner
             ======================================================================== */}
        
        <SheetPrimitive.Close
          className={cn(
            // Base close button styles
            "absolute top-4 right-4 rounded-xs opacity-70",   // Positioning and appearance
            
            // Interactive states
            "transition-opacity hover:opacity-100",           // Hover effect
            "focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:outline-hidden", // Focus states
            
            // Background and ring
            "ring-offset-background data-[state=open]:bg-secondary", // Background colors
            
            // Disabled state
            "disabled:pointer-events-none"                   // Disabled interaction
          )}>
          {/* Close icon */}
          <XIcon className="size-4" />
          
          {/* Screen reader text */}
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

/**
 * Sheet Header Component
 * @description Header section of the sheet content
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Header content
 * @param {...any} props - Additional props passed to the div element
 * @returns {JSX.Element} The sheet header component
 * 
 * Default Styling:
 * - Flexbox column layout
 * - Gap between elements
 * - Padding around content
 * - Common usage for titles and descriptions
 */
function SheetHeader({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the div element
}) {
  return (
    <div
      data-slot="sheet-header"                               // Data attribute for styling
      className={cn(
        "flex flex-col gap-1.5 p-4",                         // Layout and spacing
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * Sheet Footer Component
 * @description Footer section of the sheet content
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Footer content
 * @param {...any} props - Additional props passed to the div element
 * @returns {JSX.Element} The sheet footer component
 * 
 * Default Styling:
 * - Auto margin top for positioning at bottom
 * - Flexbox column layout
 * - Gap between elements
 * - Padding around content
 * - Common usage for action buttons
 */
function SheetFooter({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the div element
}) {
  return (
    <div
      data-slot="sheet-footer"                               // Data attribute for styling
      className={cn(
        "mt-auto flex flex-col gap-2 p-4",                   // Layout, spacing, and positioning
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * Sheet Title Component
 * @description Title element for the sheet with proper accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Title text
 * @param {...any} props - Additional props passed to SheetPrimitive.Title
 * @returns {JSX.Element} The sheet title component
 * 
 * Features:
 * - Proper heading semantics for screen readers
 * - Consistent typography styling
 * - Foreground color from design system
 * - Semibold font weight
 */
function SheetTitle({
  className,                  // Additional CSS classes
  ...props                    // Additional props for SheetPrimitive.Title
}) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"                                // Data attribute for styling
      className={cn(
        "text-foreground font-semibold",                     // Typography styling
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * Sheet Description Component
 * @description Description element for the sheet with proper accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Description text
 * @param {...any} props - Additional props passed to SheetPrimitive.Description
 * @returns {JSX.Element} The sheet description component
 * 
 * Features:
 * - Proper description semantics for screen readers
 * - Muted text color for secondary information
 * - Smaller font size for hierarchy
 * - Consistent with design system
 */
function SheetDescription({
  className,                  // Additional CSS classes
  ...props                    // Additional props for SheetPrimitive.Description
}) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"                          // Data attribute for styling
      className={cn(
        "text-muted-foreground text-sm",                     // Typography styling
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

// Export all sheet components for external use
export {
  Sheet,                     // Main sheet container
  SheetTrigger,              // Sheet trigger element
  SheetClose,                // Sheet close element
  SheetPortal,               // Sheet portal wrapper
  SheetOverlay,              // Sheet backdrop overlay
  SheetContent,              // Sheet content container
  SheetHeader,               // Sheet header section
  SheetFooter,               // Sheet footer section
  SheetTitle,                // Sheet title element
  SheetDescription,          // Sheet description element
}
