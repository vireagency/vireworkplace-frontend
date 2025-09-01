/**
 * @fileoverview Context Menu Component for Vire Workplace HR App
 * @description Accessible context menu component with right-click activation and sub-menus
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/context-menu Radix UI Context Menu Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Context Menu primitive for accessibility and functionality
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"

// Icons for context menu items and indicators
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * ContextMenu Component
 * @description Main context menu container that manages right-click activation
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {boolean} [props.defaultOpen] - Default open state
 * @param {React.ReactNode} props.children - Context menu content and trigger
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Root
 * @returns {JSX.Element} The context menu component
 * 
 * Features:
 * - Right-click activation
 * - Controlled and uncontrolled modes
 * - Accessibility features
 * - Keyboard navigation
 * - Focus management
 * 
 * @example
 * <ContextMenu>
 *   <ContextMenuTrigger>Right-click me</ContextMenuTrigger>
 *   <ContextMenuContent>
 *     <ContextMenuItem>Copy</ContextMenuItem>
 *     <ContextMenuItem>Paste</ContextMenuItem>
 *     <ContextMenuSeparator />
 *     <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
 *   </ContextMenuContent>
 * </ContextMenu>
 */
function ContextMenu({
  ...props                    // Additional props for ContextMenuPrimitive.Root
}) {
  return (
    <ContextMenuPrimitive.Root 
      data-slot="context-menu"                                 // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuTrigger Component
 * @description Element that triggers the context menu on right-click
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Trigger content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Trigger
 * @returns {JSX.Element} The context menu trigger component
 * 
 * Purpose:
 * - Wraps the element that activates the context menu
 * - Responds to right-click events
 * - Manages context menu state
 * - Enables accessibility features
 * 
 * Common Usage:
 * - Text elements
 * - Button elements
 * - Image elements
 * - Custom interactive elements
 */
function ContextMenuTrigger({
  ...props                    // Additional props for ContextMenuPrimitive.Trigger
}) {
  return (
    <ContextMenuPrimitive.Trigger 
      data-slot="context-menu-trigger"                          // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuGroup Component
 * @description Groups related context menu items together
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grouped menu items
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Group
 * @returns {JSX.Element} The context menu group component
 * 
 * Purpose:
 * - Organizes related menu items
 * - Provides logical grouping
 * - Enables consistent styling
 */
function ContextMenuGroup({
  ...props                    // Additional props for ContextMenuPrimitive.Group
}) {
  return (
    <ContextMenuPrimitive.Group 
      data-slot="context-menu-group"                            // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuPortal Component
 * @description Portals context menu content to the document body
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Menu content to portal
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Portal
 * @returns {JSX.Element} The context menu portal component
 * 
 * Purpose:
 * - Ensures proper z-index stacking
 * - Prevents layout issues
 * - Maintains accessibility tree
 */
function ContextMenuPortal({
  ...props                    // Additional props for ContextMenuPrimitive.Portal
}) {
  return (
    <ContextMenuPrimitive.Portal 
      data-slot="context-menu-portal"                           // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuSub Component
 * @description Container for sub-menu functionality
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Sub-menu trigger and content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Sub
 * @returns {JSX.Element} The context menu sub component
 * 
 * Purpose:
 * - Enables nested menu structures
 * - Manages sub-menu state
 * - Provides sub-menu positioning
 */
function ContextMenuSub({
  ...props                    // Additional props for ContextMenuPrimitive.Sub
}) {
  return (
    <ContextMenuPrimitive.Sub 
      data-slot="context-menu-sub"                              // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuRadioGroup Component
 * @description Container for radio button context menu items
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.value] - Selected radio value
 * @param {Function} [props.onValueChange] - Callback when selection changes
 * @param {React.ReactNode} props.children - Radio menu items
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.RadioGroup
 * @returns {JSX.Element} The context menu radio group component
 * 
 * Features:
 * - Radio button selection behavior
 * - Single selection within group
 * - Controlled and uncontrolled modes
 */
function ContextMenuRadioGroup({
  ...props                    // Additional props for ContextMenuPrimitive.RadioGroup
}) {
  return (
    <ContextMenuPrimitive.RadioGroup 
      data-slot="context-menu-radio-group"                      // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuSubTrigger Component
 * @description Clickable trigger for opening sub-menus
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the trigger
 * @param {React.ReactNode} props.children - Trigger content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.SubTrigger
 * @returns {JSX.Element} The context menu sub-trigger component
 * 
 * Features:
 * - Hover and focus states
 * - Open state styling
 * - Right chevron indicator
 * - Inset support for indentation
 * 
 * Interactive States:
 * - Hover: accent background and foreground
 * - Focus: accent background and foreground
 * - Open: accent background and foreground
 */
function ContextMenuSubTrigger({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the trigger
  children,                   // Trigger content
  ...props                    // Additional props for ContextMenuPrimitive.SubTrigger
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"                      // Data attribute for styling
      data-inset={inset}                                       // Inset data attribute
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm",  // Layout, cursor, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus and open states
        "focus:bg-accent focus:text-accent-foreground",        // Focus state
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",  // Open state
        
        // ========================================================================
        // INSET AND ACCESSIBILITY
        // ========================================================================
        
        // Inset indentation
        "data-[inset]:pl-8",                                   // Increased left padding for inset
        
        // Focus and selection
        "outline-hidden select-none",                          // Focus outline and text selection
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Icon behavior and sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",  // Icon behavior and size
        
        className                                              // Custom classes
      )}
      {...props}>                                             {/* Spread additional props */}
      
      {/* Trigger content */}
      {children}
      
      {/* Right chevron indicator */}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

/**
 * ContextMenuSubContent Component
 * @description Dropdown content container for sub-menus
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Sub-menu content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.SubContent
 * @returns {JSX.Element} The context menu sub-content component
 * 
 * Features:
 * - Smooth animations and transitions
 * - Responsive design
 * - Consistent with main menu content
 * - Sub-menu specific styling
 * 
 * Animation States:
 * - Open: fade in and zoom in
 * - Closed: fade out and zoom out
 * - Side-based slide animations
 * 
 * Differences from Main Content:
 * - Smaller minimum width (8rem vs 8rem)
 * - Shadow-lg instead of shadow-md
 */
function ContextMenuSubContent({
  className,                  // Additional CSS classes
  ...props                    // Additional props for ContextMenuPrimitive.SubContent
}) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"                      // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Background and text colors
        "bg-popover text-popover-foreground",                   // Popover theme colors
        
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
        "z-50 min-w-[8rem]",                                    // High z-index and minimum width
        
        // Transform origin and overflow
        "origin-(--radix-context-menu-content-transform-origin) overflow-hidden",  // Transform origin and overflow
        
        // Visual styling
        "rounded-md border p-1 shadow-lg",                      // Shape, border, padding, larger shadow
        
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuContent Component
 * @description Main content container for the context menu
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Context menu content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Content
 * @returns {JSX.Element} The context menu content component
 * 
 * Features:
 * - Smooth animations and transitions
 * - Responsive design
 * - Consistent with design system
 * - Portal-based rendering
 * 
 * Animation States:
 * - Open: fade in and zoom in
 * - Closed: fade out and zoom out
 * - Side-based slide animations
 * 
 * Layout:
 * - Maximum height based on available space
 * - Horizontal overflow hidden
 * - Vertical overflow with scrolling
 */
function ContextMenuContent({
  className,                  // Additional CSS classes
  ...props                    // Additional props for ContextMenuPrimitive.Content
}) {
  return (
    // ============================================================================
    // CONTEXT MENU PORTAL
    // ============================================================================
    
    <ContextMenuPrimitive.Portal>
      {/* ========================================================================
           CONTEXT MENU CONTENT CONTAINER
           ========================================================================
           
           Main content with animations and positioning
           ======================================================================== */}
      
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"                        // Data attribute for styling
        className={cn(
          // ========================================================================
          // BASE STYLING
          // ========================================================================
          
          // Background and text colors
          "bg-popover text-popover-foreground",                  // Popover theme colors
          
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
          "z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem]",  // High z-index, max height, min width
          
          // Transform origin and overflow
          "origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto",  // Transform origin and overflow
          
          // Visual styling
          "rounded-md border p-1 shadow-md",                    // Shape, border, padding, shadow
          
          className                                            // Custom classes
        )}
        {...props}                                            // Spread additional props
      />
    </ContextMenuPrimitive.Portal>
  );
}

/**
 * ContextMenuItem Component
 * @description Clickable context menu item with various states and variants
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the item
 * @param {string} [props.variant="default"] - Item variant: 'default', 'destructive'
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {React.ReactNode} props.children - Menu item content
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Item
 * @returns {JSX.Element} The context menu item component
 * 
 * Features:
 * - Multiple variants (default, destructive)
 * - Inset support for indentation
 * - Disabled state handling
 * - Focus and hover states
 * - Icon support with automatic sizing
 * 
 * Variants:
 * - default: Standard menu item styling
 * - destructive: Danger/delete action styling
 * 
 * Inset Behavior:
 * - inset=false: Normal left padding (default)
 * - inset=true: Increased left padding for indentation
 */
function ContextMenuItem({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the item
  variant = "default",        // Item variant (default: default)
  ...props                    // Additional props for ContextMenuPrimitive.Item
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"                             // Data attribute for styling
      data-inset={inset}                                       // Inset data attribute
      data-variant={variant}                                   // Variant data attribute
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus state
        "focus:bg-accent focus:text-accent-foreground",        // Focus background and text
        
        // ========================================================================
        // VARIANT STYLING
        // ========================================================================
        
        // Destructive variant
        "data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive",
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Default icon color and sizing
        "[&_svg:not([class*='text-'])]:text-muted-foreground",  // Default icon color
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",  // Icon behavior and size
        
        // ========================================================================
        // INSET AND DISABLED STATES
        // ========================================================================
        
        // Inset indentation
        "data-[inset]:pl-8",                                   // Increased left padding for inset
        
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",  // Disabled interaction and appearance
        
        // ========================================================================
        // ACCESSIBILITY
        // ========================================================================
        
        // Focus and selection
        "outline-hidden select-none",                          // Focus outline and text selection
        
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuCheckboxItem Component
 * @description Context menu item with checkbox functionality
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menu item content
 * @param {boolean} [props.checked] - Whether the checkbox is checked
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.CheckboxItem
 * @returns {JSX.Element} The context menu checkbox item component
 * 
 * Features:
 * - Checkbox state management
 * - Check icon indicator
 * - Disabled state handling
 * - Focus and hover states
 * - Consistent with design system
 * 
 * Checkbox Behavior:
 * - checked=true: Shows check icon
 * - checked=false: No check icon
 * - Toggleable state
 */
function ContextMenuCheckboxItem({
  className,                  // Additional CSS classes
  children,                   // Menu item content
  checked,                    // Checkbox state
  ...props                    // Additional props for ContextMenuPrimitive.CheckboxItem
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"                    // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus state
        "focus:bg-accent focus:text-accent-foreground",        // Focus background and text
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Icon behavior and sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",  // Icon behavior and size
        
        // ========================================================================
        // DISABLED STATE
        // ========================================================================
        
        // Disabled interaction and appearance
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        
        // ========================================================================
        // ACCESSIBILITY
        // ========================================================================
        
        // Focus and selection
        "outline-hidden select-none",                          // Focus outline and text selection
        
        className                                              // Custom classes
      )}
      checked={checked}                                        // Checkbox state
      {...props}>                                             {/* Spread additional props */}
      
      {/* ========================================================================
           CHECKBOX INDICATOR
           ========================================================================
           
           Check icon positioned on the left
           ======================================================================== */}
      
      <span
        className={cn(
          "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"  // Positioning, size, layout
        )}>
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      
      {/* Menu item content */}
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

/**
 * ContextMenuRadioItem Component
 * @description Context menu item with radio button functionality
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menu item content
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.RadioItem
 * @returns {JSX.Element} The context menu radio item component
 * 
 * Features:
 * - Radio button selection
 * - Circle icon indicator
 * - Disabled state handling
 * - Focus and hover states
 * - Consistent with design system
 * 
 * Radio Behavior:
 * - Single selection within group
 * - Circle icon shows selected state
 * - Automatic state management
 */
function ContextMenuRadioItem({
  className,                  // Additional CSS classes
  children,                   // Menu item content
  ...props                    // Additional props for ContextMenuPrimitive.RadioItem
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"                       // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus state
        "focus:bg-accent focus:text-accent-foreground",        // Focus background and text
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Icon behavior and sizing
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",  // Icon behavior and size
        
        // ========================================================================
        // DISABLED STATE
        // ========================================================================
        
        // Disabled interaction and appearance
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        
        // ========================================================================
        // ACCESSIBILITY
        // ========================================================================
        
        // Focus and selection
        "outline-hidden select-none",                          // Focus outline and text selection
        
        className                                              // Custom classes
      )}
      {...props}>                                             {/* Spread additional props */}
      
      {/* ========================================================================
           RADIO INDICATOR
           ========================================================================
           
           Circle icon positioned on the left
           ======================================================================== */}
      
      <span
        className={cn(
          "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"  // Positioning, size, layout
        )}>
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      
      {/* Menu item content */}
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

/**
 * ContextMenuLabel Component
 * @description Non-interactive label for context menu sections
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the label
 * @param {React.ReactNode} props.children - Label text
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Label
 * @returns {JSX.Element} The context menu label component
 * 
 * Features:
 * - Non-interactive menu section headers
 * - Inset support for indentation
 * - Consistent typography
 * - Clear visual hierarchy
 * 
 * Inset Behavior:
 * - inset=false: Normal left padding (default)
 * - inset=true: Increased left padding for indentation
 */
function ContextMenuLabel({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the label
  ...props                    // Additional props for ContextMenuPrimitive.Label
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"                            // Data attribute for styling
      data-inset={inset}                                       // Inset data attribute
      className={cn(
        // Base label styles
        "text-foreground px-2 py-1.5 text-sm font-medium",      // Color, padding, size, weight
        
        // Inset indentation
        "data-[inset]:pl-8",                                    // Increased left padding for inset
        
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuSeparator Component
 * @description Visual divider between context menu sections
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to ContextMenuPrimitive.Separator
 * @returns {JSX.Element} The context menu separator component
 * 
 * Features:
 * - Horizontal line divider
 * - Consistent spacing
 * - Design system border color
 * - Visual section separation
 * 
 * Styling:
 * - 1px height horizontal line
 * - Border color from design system
 * - Negative margins for full width
 * - Consistent vertical spacing
 */
function ContextMenuSeparator({
  className,                  // Additional CSS classes
  ...props                    // Additional props for ContextMenuPrimitive.Separator
}) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"                        // Data attribute for styling
      className={cn(
        // Separator styling
        "bg-border -mx-1 my-1 h-px",                           // Background, margins, height
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ContextMenuShortcut Component
 * @description Keyboard shortcut display for context menu items
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Shortcut text (e.g., "⌘S")
 * @param {...any} props - Additional props passed to the span element
 * @returns {JSX.Element} The context menu shortcut component
 * 
 * Features:
 * - Right-aligned positioning
 * - Muted text color
 * - Monospace-like tracking
 * - Consistent with design system
 * 
 * Styling:
 * - Muted foreground color
 * - Right margin auto for alignment
 * - Extra letter spacing
 * - Smaller text size
 */
function ContextMenuShortcut({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the span element
}) {
  return (
    <span
      data-slot="context-menu-shortcut"                         // Data attribute for styling
      className={cn(
        // Shortcut styling
        "text-muted-foreground ml-auto text-xs tracking-widest",  // Color, margin, size, spacing
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  );
}

// Export all context menu components for external use
export {
  ContextMenu,                // Main context menu container
  ContextMenuTrigger,          // Context menu trigger element
  ContextMenuContent,          // Context menu content container
  ContextMenuItem,             // Clickable menu item
  ContextMenuCheckboxItem,     // Checkbox menu item
  ContextMenuRadioItem,        // Radio button item
  ContextMenuLabel,            // Non-interactive label
  ContextMenuSeparator,        // Visual divider
  ContextMenuShortcut,         // Keyboard shortcut display
  ContextMenuGroup,            // Menu item grouping
  ContextMenuPortal,           // Menu content portal
  ContextMenuSub,              // Sub-menu container
  ContextMenuSubContent,       // Sub-menu content
  ContextMenuSubTrigger,       // Sub-menu trigger
  ContextMenuRadioGroup,       // Radio button group
}
