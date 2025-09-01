/**
 * @fileoverview Menubar Component for Vire Workplace HR App
 * @description Accessible menubar component with dropdown menus and sub-menus
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/menubar Radix UI Menubar Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Menubar primitive for accessibility and functionality
import * as MenubarPrimitive from "@radix-ui/react-menubar"

// Icons for menubar items and indicators
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Menubar Component
 * @description Main menubar container with horizontal layout and styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menubar content and menus
 * @param {...any} props - Additional props passed to MenubarPrimitive.Root
 * @returns {JSX.Element} The menubar component
 * 
 * Features:
 * - Horizontal menubar layout
 * - Consistent styling with design system
 * - Border and shadow styling
 * - Responsive design
 * - Customizable through className prop
 * 
 * Layout:
 * - Horizontal flexbox layout
 * - Consistent gap between items
 * - Rounded corners
 * - Border and shadow styling
 * 
 * @example
 * <Menubar>
 *   <MenubarMenu>
 *     <MenubarTrigger>File</MenubarTrigger>
 *     <MenubarContent>
 *       <MenubarItem>New</MenubarItem>
 *       <MenubarItem>Open</MenubarItem>
 *       <MenubarSeparator />
 *       <MenubarItem>Exit</MenubarItem>
 *     </MenubarContent>
 *   </MenubarMenu>
 * </Menubar>
 */
function Menubar({
  className,                  // Additional CSS classes
  ...props                    // Additional props for MenubarPrimitive.Root
}) {
  return (
    // ============================================================================
    // MENUBAR ROOT CONTAINER
    // ============================================================================
    
    <MenubarPrimitive.Root
      data-slot="menubar"                                     // Data attribute for styling
      className={cn(
        // Base menubar styles
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",  // Background, layout, size, spacing, shape, border, shadow
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarMenu Component
 * @description Container for individual menu items and their content
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Menu trigger and content
 * @param {...any} props - Additional props passed to MenubarPrimitive.Menu
 * @returns {JSX.Element} The menubar menu component
 * 
 * Purpose:
 * - Wraps menu triggers and their dropdown content
 * - Manages menu state and positioning
 * - Enables consistent menu behavior
 */
function MenubarMenu({
  ...props                    // Additional props for MenubarPrimitive.Menu
}) {
  return (
    <MenubarPrimitive.Menu 
      data-slot="menubar-menu"                                // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * MenubarGroup Component
 * @description Groups related menu items together
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grouped menu items
 * @param {...any} props - Additional props passed to MenubarPrimitive.Group
 * @returns {JSX.Element} The menubar group component
 * 
 * Purpose:
 * - Organizes related menu items
 * - Provides logical grouping
 * - Enables consistent styling
 */
function MenubarGroup({
  ...props                    // Additional props for MenubarPrimitive.Group
}) {
  return (
    <MenubarPrimitive.Group 
      data-slot="menubar-group"                               // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * MenubarPortal Component
 * @description Portals menu content to the document body
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Menu content to portal
 * @param {...any} props - Additional props passed to MenubarPrimitive.Portal
 * @returns {JSX.Element} The menubar portal component
 * 
 * Purpose:
 * - Ensures proper z-index stacking
 * - Prevents layout issues
 * - Maintains accessibility tree
 */
function MenubarPortal({
  ...props                    // Additional props for MenubarPrimitive.Portal
}) {
  return (
    <MenubarPrimitive.Portal 
      data-slot="menubar-portal"                              // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * MenubarRadioGroup Component
 * @description Container for radio button menu items
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.value] - Selected radio value
 * @param {Function} [props.onValueChange] - Callback when selection changes
 * @param {React.ReactNode} props.children - Radio menu items
 * @param {...any} props - Additional props passed to MenubarPrimitive.RadioGroup
 * @returns {JSX.Element} The menubar radio group component
 * 
 * Features:
 * - Radio button selection behavior
 * - Single selection within group
 * - Controlled and uncontrolled modes
 */
function MenubarRadioGroup({
  ...props                    // Additional props for MenubarPrimitive.RadioGroup
}) {
  return (
    <MenubarPrimitive.RadioGroup 
      data-slot="menubar-radio-group"                         // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * MenubarTrigger Component
 * @description Clickable trigger button for opening menus
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Trigger button content
 * @param {...any} props - Additional props passed to MenubarPrimitive.Trigger
 * @returns {JSX.Element} The menubar trigger component
 * 
 * Features:
 * - Hover and focus states
 * - Open state styling
 * - Consistent with design system
 * - Smooth transitions
 * 
 * Interactive States:
 * - Hover: accent background and foreground
 * - Focus: accent background and foreground
 * - Open: accent background and foreground
 */
function MenubarTrigger({
  className,                  // Additional CSS classes
  ...props                    // Additional props for MenubarPrimitive.Trigger
}) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"                             // Data attribute for styling
      className={cn(
        // Base trigger styles
        "flex items-center rounded-sm px-2 py-1 text-sm font-medium",  // Layout, shape, padding, typography
        
        // Interactive states
        "focus:bg-accent focus:text-accent-foreground",       // Focus state
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",  // Open state
        
        // Accessibility and interaction
        "outline-hidden select-none",                         // Focus and selection behavior
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarContent Component
 * @description Dropdown content container with animations and positioning
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.align="start"] - Content alignment: 'start', 'center', 'end'
 * @param {number} [props.alignOffset=-4] - Alignment offset in pixels
 * @param {number} [props.sideOffset=8] - Distance from trigger in pixels
 * @param {React.ReactNode} props.children - Menu content
 * @param {...any} props - Additional props passed to MenubarPrimitive.Content
 * @returns {JSX.Element} The menubar content component
 * 
 * Features:
 * - Smooth animations and transitions
 * - Configurable positioning
 * - Responsive design
 * - Consistent with design system
 * 
 * Animation States:
 * - Open: fade in and zoom in
 * - Closed: fade out and zoom out
 * - Side-based slide animations
 * 
 * Positioning:
 * - align: Content alignment relative to trigger
 * - alignOffset: Fine-tune alignment
 * - sideOffset: Distance from trigger
 */
function MenubarContent({
  className,                  // Additional CSS classes
  align = "start",            // Content alignment (default: start)
  alignOffset = -4,           // Alignment offset (default: -4px)
  sideOffset = 8,             // Side offset (default: 8px)
  ...props                    // Additional props for MenubarPrimitive.Content
}) {
  return (
    // ============================================================================
    // MENU CONTENT PORTAL
    // ============================================================================
    
    <MenubarPortal>
      {/* ========================================================================
           MENU CONTENT CONTAINER
           ========================================================================
           
           Dropdown content with animations and positioning
           ======================================================================== */}
      
      <MenubarPrimitive.Content
        data-slot="menubar-content"                           // Data attribute for styling
        align={align}                                          // Content alignment
        alignOffset={alignOffset}                              // Alignment offset
        sideOffset={sideOffset}                                // Side offset
        className={cn(
          // ========================================================================
          // BASE STYLING
          // ========================================================================
          
          // Background and text colors
          "bg-popover text-popover-foreground",                // Popover theme colors
          
          // ========================================================================
          // ANIMATION STATES
          // ========================================================================
          
          // Open/closed animations
          "data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",  // Fade effects
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",                              // Zoom effects
          
          // ========================================================================
          // SIDE-BASED ANIMATIONS
          // ========================================================================
          
          // Slide animations based on position
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          
          // ========================================================================
          // LAYOUT AND POSITIONING
          // ========================================================================
          
          // Z-index and sizing
          "z-50 min-w-[12rem]",                               // High z-index and minimum width
          
          // Transform origin and overflow
          "origin-(--radix-menubar-content-transform-origin) overflow-hidden",  // Transform origin and overflow
          
          // Visual styling
          "rounded-md border p-1 shadow-md",                  // Shape, border, padding, shadow
          
          className                                           // Custom classes
        )}
        {...props}                                           // Spread additional props
      />
    </MenubarPortal>
  );
}

/**
 * MenubarItem Component
 * @description Clickable menu item with various states and variants
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the item
 * @param {string} [props.variant="default"] - Item variant: 'default', 'destructive'
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {React.ReactNode} props.children - Menu item content
 * @param {...any} props - Additional props passed to MenubarPrimitive.Item
 * @returns {JSX.Element} The menubar item component
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
function MenubarItem({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the item
  variant = "default",        // Item variant (default: default)
  ...props                    // Additional props for MenubarPrimitive.Item
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"                                // Data attribute for styling
      data-inset={inset}                                      // Inset data attribute
      data-variant={variant}                                  // Variant data attribute
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
        "focus:bg-accent focus:text-accent-foreground",       // Focus background and text
        
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
        "data-[inset]:pl-8",                                  // Increased left padding for inset
        
        // Disabled state
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",  // Disabled interaction and appearance
        
        // ========================================================================
        // ACCESSIBILITY
        // ========================================================================
        
        // Focus and selection
        "outline-hidden select-none",                         // Focus outline and text selection
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarCheckboxItem Component
 * @description Menu item with checkbox functionality
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menu item content
 * @param {boolean} [props.checked] - Whether the checkbox is checked
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {...any} props - Additional props passed to MenubarPrimitive.CheckboxItem
 * @returns {JSX.Element} The menubar checkbox item component
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
function MenubarCheckboxItem({
  className,                  // Additional CSS classes
  children,                   // Menu item content
  checked,                    // Checkbox state
  ...props                    // Additional props for MenubarPrimitive.CheckboxItem
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"                       // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus state
        "focus:bg-accent focus:text-accent-foreground",       // Focus background and text
        
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
        "outline-hidden select-none",                         // Focus outline and text selection
        
        className                                             // Custom classes
      )}
      checked={checked}                                       // Checkbox state
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           CHECKBOX INDICATOR
           ========================================================================
           
           Check icon positioned on the left
           ======================================================================== */}
      
      <span
        className={cn(
          "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"  // Positioning, size, layout
        )}>
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      
      {/* Menu item content */}
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

/**
 * MenubarRadioItem Component
 * @description Menu item with radio button functionality
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Menu item content
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {...any} props - Additional props passed to MenubarPrimitive.RadioItem
 * @returns {JSX.Element} The menubar radio item component
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
function MenubarRadioItem({
  className,                  // Additional CSS classes
  children,                   // Menu item content
  ...props                    // Additional props for MenubarPrimitive.RadioItem
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"                          // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Focus state
        "focus:bg-accent focus:text-accent-foreground",       // Focus background and text
        
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
        "outline-hidden select-none",                         // Focus outline and text selection
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           RADIO INDICATOR
           ========================================================================
           
           Circle icon positioned on the left
           ======================================================================== */}
      
      <span
        className={cn(
          "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center"  // Positioning, size, layout
        )}>
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      
      {/* Menu item content */}
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

/**
 * MenubarLabel Component
 * @description Non-interactive label for menu sections
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the label
 * @param {React.ReactNode} props.children - Label text
 * @param {...any} props - Additional props passed to MenubarPrimitive.Label
 * @returns {JSX.Element} The menubar label component
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
function MenubarLabel({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the label
  ...props                    // Additional props for MenubarPrimitive.Label
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"                               // Data attribute for styling
      data-inset={inset}                                      // Inset data attribute
      className={cn(
        // Base label styles
        "px-2 py-1.5 text-sm font-medium",                    // Padding, size, weight
        
        // Inset indentation
        "data-[inset]:pl-8",                                  // Increased left padding for inset
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarSeparator Component
 * @description Visual divider between menu sections
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to MenubarPrimitive.Separator
 * @returns {JSX.Element} The menubar separator component
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
function MenubarSeparator({
  className,                  // Additional CSS classes
  ...props                    // Additional props for MenubarPrimitive.Separator
}) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"                           // Data attribute for styling
      className={cn(
        // Separator styling
        "bg-border -mx-1 my-1 h-px",                          // Background, margins, height
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarShortcut Component
 * @description Keyboard shortcut display for menu items
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Shortcut text (e.g., "⌘S")
 * @param {...any} props - Additional props passed to the span element
 * @returns {JSX.Element} The menubar shortcut component
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
function MenubarShortcut({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the span element
}) {
  return (
    <span
      data-slot="menubar-shortcut"                            // Data attribute for styling
      className={cn(
        // Shortcut styling
        "text-muted-foreground ml-auto text-xs tracking-widest",  // Color, margin, size, spacing
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * MenubarSub Component
 * @description Container for sub-menu functionality
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Sub-menu trigger and content
 * @param {...any} props - Additional props passed to MenubarPrimitive.Sub
 * @returns {JSX.Element} The menubar sub component
 * 
 * Purpose:
 * - Enables nested menu structures
 * - Manages sub-menu state
 * - Provides sub-menu positioning
 */
function MenubarSub({
  ...props                    // Additional props for MenubarPrimitive.Sub
}) {
  return (
    <MenubarPrimitive.Sub 
      data-slot="menubar-sub"                                 // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * MenubarSubTrigger Component
 * @description Clickable trigger for opening sub-menus
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.inset] - Whether to indent the trigger
 * @param {React.ReactNode} props.children - Trigger content
 * @param {...any} props - Additional props passed to MenubarPrimitive.SubTrigger
 * @returns {JSX.Element} The menubar sub-trigger component
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
function MenubarSubTrigger({
  className,                  // Additional CSS classes
  inset,                      // Whether to indent the trigger
  children,                   // Trigger content
  ...props                    // Additional props for MenubarPrimitive.SubTrigger
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"                         // Data attribute for styling
      data-inset={inset}                                      // Inset data attribute
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
        "focus:bg-accent focus:text-accent-foreground",       // Focus state
        "data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",  // Open state
        
        // ========================================================================
        // INSET AND ACCESSIBILITY
        // ========================================================================
        
        // Inset indentation
        "data-[inset]:pl-8",                                  // Increased left padding for inset
        
        // Focus and selection
        "outline-none select-none",                           // Focus outline and text selection
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Trigger content */}
      {children}
      
      {/* Right chevron indicator */}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

/**
 * MenubarSubContent Component
 * @description Dropdown content container for sub-menus
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Sub-menu content
 * @param {...any} props - Additional props passed to MenubarPrimitive.SubContent
 * @returns {JSX.Element} The menubar sub-content component
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
 * - Smaller minimum width (8rem vs 12rem)
 * - Shadow-lg instead of shadow-md
 */
function MenubarSubContent({
  className,                  // Additional CSS classes
  ...props                    // Additional props for MenubarPrimitive.SubContent
}) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"                         // Data attribute for styling
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
        "z-50 min-w-[8rem]",                                  // High z-index and smaller minimum width
        
        // Transform origin and overflow
        "origin-(--radix-menubar-content-transform-origin) overflow-hidden",  // Transform origin and overflow
        
        // Visual styling
        "rounded-md border p-1 shadow-lg",                    // Shape, border, padding, larger shadow
        
        className                                           // Custom classes
      )}
      {...props}                                           // Spread additional props
    />
  );
}

// Export all menubar components for external use
export {
  Menubar,                    // Main menubar container
  MenubarPortal,              // Menu content portal
  MenubarMenu,                // Individual menu container
  MenubarTrigger,             // Menu trigger button
  MenubarContent,             // Menu dropdown content
  MenubarGroup,               // Menu item grouping
  MenubarSeparator,            // Visual divider
  MenubarLabel,               // Non-interactive label
  MenubarItem,                // Clickable menu item
  MenubarShortcut,            // Keyboard shortcut display
  MenubarCheckboxItem,        // Checkbox menu item
  MenubarRadioGroup,          // Radio button group
  MenubarRadioItem,           // Radio button item
  MenubarSub,                 // Sub-menu container
  MenubarSubTrigger,          // Sub-menu trigger
  MenubarSubContent,          // Sub-menu content
}
