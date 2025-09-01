/**
 * @fileoverview Navigation Menu Component for Vire Workplace HR App
 * @description Accessible navigation menu with dropdown support and animations
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/navigation-menu Radix UI Navigation Menu Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Navigation Menu primitive for accessibility and functionality
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"

// Class variance authority for dynamic class combinations
import { cva } from "class-variance-authority"

// Chevron down icon for dropdown indicators
import { ChevronDownIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * NavigationMenu Component
 * @description Main navigation menu container with viewport support
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Navigation menu content
 * @param {boolean} [props.viewport=true] - Whether to show the viewport
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Root
 * @returns {JSX.Element} The navigation menu component
 * 
 * Features:
 * - Accessible navigation structure
 * - Dropdown menu support
 * - Viewport management
 * - Responsive design
 * - Customizable through className prop
 * 
 * Viewport Behavior:
 * - viewport=true: Shows dropdown viewport (default)
 * - viewport=false: Inline dropdown without viewport
 * 
 * @example
 * <NavigationMenu>
 *   <NavigationMenuList>
 *     <NavigationMenuItem>
 *       <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *       <NavigationMenuContent>
 *         <NavigationMenuLink href="/products">All Products</NavigationMenuLink>
 *       </NavigationMenuContent>
 *     </NavigationMenuItem>
 *   </NavigationMenuList>
 * </NavigationMenu>
 */
function NavigationMenu({
  className,                  // Additional CSS classes
  children,                   // Navigation menu content
  viewport = true,            // Whether to show viewport (default: true)
  ...props                    // Additional props for NavigationMenuPrimitive.Root
}) {
  return (
    // ============================================================================
    // NAVIGATION MENU ROOT CONTAINER
    // ============================================================================
    
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"                             // Data attribute for styling
      data-viewport={viewport}                                // Viewport data attribute
      className={cn(
        // Base navigation menu styles
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",  // Layout and positioning
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Navigation menu content */}
      {children}
      
      {/* Conditional viewport rendering */}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

/**
 * NavigationMenuList Component
 * @description Container for navigation menu items with consistent layout
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Navigation menu items
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.List
 * @returns {JSX.Element} The navigation menu list component
 * 
 * Layout:
 * - Flexbox row layout
 * - Centered alignment
 * - Consistent gap between items
 * - Full width utilization
 */
function NavigationMenuList({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.List
}) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"                        // Data attribute for styling
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-1",  // Layout and spacing
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * NavigationMenuItem Component
 * @description Individual navigation menu item wrapper
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menu item content (trigger + content)
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Item
 * @returns {JSX.Element} The navigation menu item component
 * 
 * Purpose:
 * - Wraps navigation menu triggers and content
 * - Provides relative positioning context
 * - Enables consistent styling
 */
function NavigationMenuItem({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.Item
}) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"                        // Data attribute for styling
      className={cn(
        "relative",                                           // Relative positioning for dropdowns
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * Navigation Menu Trigger Style Configuration
 * @description Class variance authority configuration for trigger button styling
 * @type {import('class-variance-authority').VariantProps<typeof navigationMenuTriggerStyle>}
 */
const navigationMenuTriggerStyle = cva(
  // Base trigger button styles
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium",  // Layout, size, and typography
  
  // Interactive states
  "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",  // Hover and focus states
  
  // Disabled state
  "disabled:pointer-events-none disabled:opacity-50",        // Disabled interaction and appearance
  
  // Open state styling
  "data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50",
  
  // Focus ring
  "focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"  // Focus states and transitions
)

/**
 * NavigationMenuTrigger Component
 * @description Clickable trigger button for navigation menu dropdowns
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Trigger button content
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Trigger
 * @returns {JSX.Element} The navigation menu trigger component
 * 
 * Features:
 * - Dropdown indicator with chevron icon
 * - Hover and focus states
 * - Open state styling
 * - Smooth transitions
 * - Consistent with design system
 * 
 * Icon Behavior:
 * - Chevron down by default
 * - Rotates 180° when menu is open
 * - Smooth rotation animation
 */
function NavigationMenuTrigger({
  className,                  // Additional CSS classes
  children,                   // Trigger button content
  ...props                    // Additional props for NavigationMenuPrimitive.Trigger
}) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"                     // Data attribute for styling
      className={cn(
        navigationMenuTriggerStyle(),                         // Apply trigger button styles
        "group",                                              // Group class for state management
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Trigger button content */}
      {children}
      
      {/* Space between content and icon */}
      {" "}
      
      {/* Dropdown indicator icon */}
      <ChevronDownIcon
        className={cn(
          // Icon positioning and sizing
          "relative top-[1px] ml-1 size-3",                   // Positioning, margin, and size
          
          // Smooth rotation transition
          "transition duration-300",                          // Transition timing
          
          // Rotation when menu is open
          "group-data-[state=open]:rotate-180"                // 180° rotation on open state
        )}
        aria-hidden="true" />                                 {/* Hidden from screen readers */}
    </NavigationMenuPrimitive.Trigger>
  );
}

/**
 * NavigationMenuContent Component
 * @description Dropdown content container with animations and positioning
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Dropdown content
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Content
 * @returns {JSX.Element} The navigation menu content component
 * 
 * Features:
 * - Smooth slide and fade animations
 * - Responsive positioning
 * - Viewport-aware styling
 * - Consistent with design system
 * 
 * Animation States:
 * - from-start: Slide in from left
 * - from-end: Slide in from right
 * - to-start: Slide out to left
 * - to-end: Slide out to right
 */
function NavigationMenuContent({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.Content
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"                     // Data attribute for styling
      className={cn(
        // ========================================================================
        // ANIMATION CLASSES
        // ========================================================================
        
        // Motion-based animations
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out",  // Animation states
        "data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",       // Fade effects
        
        // Slide animations
        "data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52",  // Slide in
        "data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52",        // Slide out
        
        // ========================================================================
        // POSITIONING AND LAYOUT
        // ========================================================================
        
        // Base positioning
        "top-0 left-0 w-full p-2 pr-2.5",                    // Position and padding
        
        // Responsive positioning
        "md:absolute md:w-auto",                              // Absolute positioning on medium+ screens
        
        // ========================================================================
        // VIEWPORT-AWARE STYLING
        // ========================================================================
        
        // Inline viewport styling (when viewport=false)
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out",
        "group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0",
        "group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5",
        "group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md",
        "group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow",
        "group-data-[viewport=false]/navigation-menu:duration-200",
        
        // Focus management
        "**:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * NavigationMenuViewport Component
 * @description Viewport container for dropdown content positioning
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Viewport
 * @returns {JSX.Element} The navigation menu viewport component
 * 
 * Features:
 * - Absolute positioning below menu
 * - Centered alignment
 * - High z-index for layering
 * - Responsive width and height
 * 
 * Positioning:
 * - Positioned below the navigation menu
 * - Centered horizontally
 * - Isolated stacking context
 */
function NavigationMenuViewport({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.Viewport
}) {
  return (
    // ============================================================================
    // VIEWPORT POSITIONING CONTAINER
    // ============================================================================
    
    <div
      className={cn(
        "absolute top-full left-0 isolate z-50 flex justify-center"  // Positioning and layout
      )}>
      
      {/* ========================================================================
           RADIX VIEWPORT PRIMITIVE
           ========================================================================
           
           Handles dropdown positioning and sizing
           ======================================================================== */}
      
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"                   // Data attribute for styling
        className={cn(
          // Base viewport styles
          "origin-top-center bg-popover text-popover-foreground",  // Background and text colors
          
          // Animation states
          "data-[state=open]:animate-in data-[state=closed]:animate-out",  // Animation classes
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90",  // Zoom effects
          
          // Layout and positioning
          "relative mt-1.5",                                  // Margin top for spacing
          
          // Responsive sizing
          "h-[var(--radix-navigation-menu-viewport-height)] w-full",  // Height and width
          "md:w-[var(--radix-navigation-menu-viewport-width)]",       // Responsive width
          
          // Visual styling
          "overflow-hidden rounded-md border shadow",         // Overflow, shape, border, shadow
          
          className                                           // Custom classes
        )}
        {...props}                                           // Spread additional props
      />
    </div>
  );
}

/**
 * NavigationMenuLink Component
 * @description Clickable link within navigation menu dropdowns
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} props.href - Navigation URL
 * @param {boolean} [props.active] - Whether this link is active
 * @param {React.ReactNode} props.children - Link content
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Link
 * @returns {JSX.Element} The navigation menu link component
 * 
 * Features:
 * - Active state styling
 * - Hover and focus states
 * - Icon support with automatic sizing
 * - Smooth transitions
 * - Consistent with design system
 * 
 * Styling:
 * - Active: accent background with accent foreground
 * - Hover: accent background with accent foreground
 * - Focus: accent background with accent foreground
 * - Icons: muted foreground color by default
 */
function NavigationMenuLink({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.Link
}) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"                        // Data attribute for styling
      className={cn(
        // ========================================================================
        // STATE-BASED STYLING
        // ========================================================================
        
        // Active state
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground",
        
        // Hover and focus states
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        
        // ========================================================================
        // LAYOUT AND TYPOGRAPHY
        // ========================================================================
        
        // Flexbox layout
        "flex flex-col gap-1 rounded-sm p-2 text-sm",         // Layout, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus ring
        "focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px] focus-visible:outline-1",
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Icon color and sizing
        "[&_svg:not([class*='text-'])]:text-muted-foreground",  // Default icon color
        "[&_svg:not([class*='size-'])]:size-4",                 // Default icon size
        
        // ========================================================================
        // TRANSITIONS
        // ========================================================================
        
        // Smooth transitions
        "transition-all",                                     // All property transitions
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * NavigationMenuIndicator Component
 * @description Visual indicator for active navigation menu item
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to NavigationMenuPrimitive.Indicator
 * @returns {JSX.Element} The navigation menu indicator component
 * 
 * Features:
 * - Animated appearance/disappearance
 * - Positioned below active menu item
 * - Diamond-shaped indicator
 * - Consistent with design system
 * 
 * Animation:
 * - Fade in when visible
 * - Fade out when hidden
 * - Smooth transitions
 */
function NavigationMenuIndicator({
  className,                  // Additional CSS classes
  ...props                    // Additional props for NavigationMenuPrimitive.Indicator
}) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"                   // Data attribute for styling
      className={cn(
        // ========================================================================
        // ANIMATION STATES
        // ========================================================================
        
        // Visibility-based animations
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out",  // Animation classes
        "data-[state=hidden]:fade-out data-[state=visible]:fade-in",       // Fade effects
        
        // ========================================================================
        // POSITIONING AND LAYOUT
        // ========================================================================
        
        // Position below menu
        "top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",  // Positioning and layout
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           DIAMOND INDICATOR
           ========================================================================
           
           Visual indicator with diamond shape
           ======================================================================== */}
      
      <div
        className={cn(
          // Diamond shape styling
          "bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md"  // Background, size, rotation, shape, shadow
        )} />
    </NavigationMenuPrimitive.Indicator>
  );
}

// Export all navigation menu components for external use
export {
  NavigationMenu,                // Main navigation menu container
  NavigationMenuList,            // Navigation menu items container
  NavigationMenuItem,            // Individual menu item wrapper
  NavigationMenuContent,         // Dropdown content container
  NavigationMenuTrigger,         // Dropdown trigger button
  NavigationMenuLink,            // Navigation link within dropdowns
  NavigationMenuIndicator,       // Active item indicator
  NavigationMenuViewport,        // Dropdown viewport container
  navigationMenuTriggerStyle,    // Trigger button style configuration
}
