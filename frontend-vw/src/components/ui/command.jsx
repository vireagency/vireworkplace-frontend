/**
 * @fileoverview Command Component for Vire Workplace HR App
 * @description Accessible command palette component with search and keyboard navigation
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://cmdk.paco.me/ CMDK Command Documentation}
 */

// Client-side directive for Next.js compatibility
"use client"

// React core library for component creation
import * as React from "react"

// CMDK command primitive for command palette functionality
import { Command as CommandPrimitive } from "cmdk"

// Search icon for command input
import { SearchIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

// Dialog components for command palette modal
import {
  Dialog,                // Main dialog container
  DialogContent,         // Dialog content area
  DialogDescription,     // Dialog description text
  DialogHeader,          // Dialog header section
  DialogTitle,           // Dialog title text
} from "@/components/ui/dialog"

/**
 * Command Component
 * @description Main command palette container with search and navigation
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.value] - Controlled search value
 * @param {Function} [props.onValueChange] - Callback when search value changes
 * @param {boolean} [props.shouldFilter=true] - Whether to filter results automatically
 * @param {React.ReactNode} props.children - Command palette content
 * @param {...any} props - Additional props passed to CommandPrimitive
 * @returns {JSX.Element} The command component
 * 
 * Features:
 * - Search-based filtering
 * - Keyboard navigation
 * - Accessibility features
 * - Customizable styling
 * - Automatic result filtering
 * 
 * @example
 * <Command>
 *   <CommandInput placeholder="Search commands..." />
 *   <CommandList>
 *     <CommandGroup heading="Actions">
 *       <CommandItem>New File</CommandItem>
 *       <CommandItem>Open File</CommandItem>
 *     </CommandGroup>
 *   </CommandList>
 * </Command>
 */
function Command({
  className,                  // Additional CSS classes
  ...props                    // Additional props for CommandPrimitive
}) {
  return (
    <CommandPrimitive
      data-slot="command"                                     // Data attribute for styling
      className={cn(
        // Base command palette styles
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",  // Background, text, layout, size, overflow, shape
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  )
}

/**
 * CommandDialog Component
 * @description Modal dialog wrapper for command palette with accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title="Command Palette"] - Dialog title
 * @param {string} [props.description="Search for a command to run..."] - Dialog description
 * @param {React.ReactNode} props.children - Command palette content
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.showCloseButton=true] - Whether to show close button
 * @param {boolean} [props.open] - Controlled open state
 * @param {Function} [props.onOpenChange] - Callback when open state changes
 * @param {...any} props - Additional props passed to Dialog
 * @returns {JSX.Element} The command dialog component
 * 
 * Features:
 * - Modal dialog presentation
 * - Screen reader accessible header
 * - Customizable title and description
 * - Optional close button
 * - Consistent with design system
 * 
 * Accessibility:
 * - Screen reader only header for context
 * - Proper ARIA labels and descriptions
 * - Keyboard navigation support
 * 
 * @example
 * <CommandDialog title="Quick Actions" description="Find and execute commands quickly">
 *   <CommandInput placeholder="Type to search..." />
 *   <CommandList>
 *     <CommandItem>Save</CommandItem>
 *     <CommandItem>Undo</CommandItem>
 *   </CommandList>
 * </CommandDialog>
 */
function CommandDialog({
  title = "Command Palette",                                  // Dialog title (default: Command Palette)
  description = "Search for a command to run...",             // Dialog description (default: Search for a command to run...)
  children,                                                   // Command palette content
  className,                                                  // Additional CSS classes
  showCloseButton = true,                                     // Whether to show close button (default: true)
  ...props                                                    // Additional props for Dialog
}) {
  return (
    // ============================================================================
    // COMMAND DIALOG CONTAINER
    // ============================================================================
    
    <Dialog {...props}>
      {/* ========================================================================
           SCREEN READER ONLY HEADER
           ========================================================================
           
           Provides accessibility context without visual display
           ======================================================================== */}
      
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      
      {/* ========================================================================
           DIALOG CONTENT AREA
           ========================================================================
           
           Contains the command palette with custom styling
           ======================================================================== */}
      
      <DialogContent
        className={cn(
          "overflow-hidden p-0",                              // Hide overflow, no padding
          className                                           // Custom classes
        )}
        showCloseButton={showCloseButton}                      // Control close button visibility
      >
        {/* ========================================================================
             COMMAND PALETTE WITH CUSTOM STYLING
             ========================================================================
             
             Enhanced command component with comprehensive styling
             ======================================================================== */}
        
        <Command className={cn(
          // ========================================================================
          // GROUP HEADING STYLING
          // ========================================================================
          
          // Group heading text color and typography
          "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium",
          
          // ========================================================================
          // INPUT WRAPPER STYLING
          // ========================================================================
          
          // Input wrapper height
          "**:data-[slot=command-input-wrapper]:h-12",
          
          // ========================================================================
          // GROUP SPACING
          // ========================================================================
          
          // Group padding and spacing
          "[&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
          
          // ========================================================================
          // INPUT STYLING
          // ========================================================================
          
          // Input wrapper icon sizing
          "[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5",
          
          // Input height
          "[&_[cmdk-input]]:h-12",
          
          // ========================================================================
          // ITEM STYLING
          // ========================================================================
          
          // Item padding and icon sizing
          "[&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        )}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

/**
 * CommandInput Component
 * @description Search input field for command palette with search icon
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.placeholder] - Input placeholder text
 * @param {string} [props.value] - Controlled input value
 * @param {Function} [props.onValueChange] - Callback when input value changes
 * @param {...any} props - Additional props passed to CommandPrimitive.Input
 * @returns {JSX.Element} The command input component
 * 
 * Features:
 * - Search icon indicator
 * - Transparent background
 * - Consistent with design system
 * - Keyboard navigation support
 * - Disabled state handling
 * 
 * Layout:
 * - Search icon on the left
 * - Input field taking full width
 * - Border bottom separator
 * - Consistent height and padding
 */
function CommandInput(props) {
  const { className, ...rest } = props;                       // Extract className from props
  
  return (
    // ============================================================================
    // COMMAND INPUT WRAPPER
    // ============================================================================
    
    <div
      data-slot="command-input-wrapper"                        // Data attribute for styling
      className={cn(
        "flex h-9 items-center gap-2 border-b px-3"            // Layout, height, spacing, border, padding
      )}
    >
      {/* Search icon indicator */}
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      
      {/* ========================================================================
           COMMAND INPUT FIELD
           ========================================================================
           
           Search input with custom styling
           ======================================================================== */}
      
      <CommandPrimitive.Input
        data-slot="command-input"                              // Data attribute for styling
        className={cn(
          // Base input styles
          "flex h-10 w-full rounded-md bg-transparent py-3 text-sm",  // Layout, size, shape, background, padding, typography
          
          // Placeholder styling
          "placeholder:text-muted-foreground",                 // Placeholder text color
          
          // Focus and disabled states
          "outline-hidden disabled:cursor-not-allowed disabled:opacity-50",  // Focus outline, disabled cursor and opacity
          
          className                                           // Custom classes
        )}
        {...rest}                                            // Spread remaining props
      />
    </div>
  )
}

/**
 * CommandList Component
 * @description Scrollable container for command results
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Command list content
 * @param {...any} props - Additional props passed to CommandPrimitive.List
 * @returns {JSX.Element} The command list component
 * 
 * Features:
 * - Scrollable content area
 * - Maximum height constraint
 * - Smooth scrolling
 * - Overflow handling
 * 
 * Layout:
 * - Maximum height of 300px
 * - Vertical scrolling enabled
 * - Horizontal overflow hidden
 * - Scroll padding for better UX
 */
function CommandList({ 
  className,                  // Additional CSS classes
  ...props                    // Additional props for CommandPrimitive.List
}) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"                                // Data attribute for styling
      className={cn(
        // List container styles
        "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",  // Max height, scroll padding, overflow handling
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  )
}

/**
 * CommandEmpty Component
 * @description Display component for when no search results are found
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Empty state content
 * @param {...any} props - Additional props passed to CommandPrimitive.Empty
 * @returns {JSX.Element} The command empty component
 * 
 * Features:
 * - Centered text alignment
 * - Consistent padding
 * - Muted text styling
 * - Customizable content
 * 
 * Common Usage:
 * - "No results found" messages
 * - Empty state illustrations
 * - Helpful suggestions
 */
function CommandEmpty(props) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"                                // Data attribute for styling
      className={cn(
        "py-6 text-center text-sm"                             // Padding, text alignment, size
      )}
      {...props}                                              // Spread additional props
    />
  )
}

/**
 * CommandGroup Component
 * @description Groups related command items with optional heading
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.heading] - Group heading text
 * @param {React.ReactNode} props.children - Grouped command items
 * @param {...any} props - Additional props passed to CommandPrimitive.Group
 * @returns {JSX.Element} The command group component
 * 
 * Features:
 * - Optional group heading
 * - Consistent padding and spacing
 * - Muted heading text color
 * - Overflow handling
 * 
 * Styling:
 * - Group heading: muted foreground, small text, medium weight
 * - Group content: consistent padding
 * - Overflow: hidden for clean appearance
 */
function CommandGroup({
  className,                  // Additional CSS classes
  ...props                    // Additional props for CommandPrimitive.Group
}) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"                                // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE GROUP STYLING
        // ========================================================================
        
        // Text colors and overflow
        "text-foreground overflow-hidden p-1",                  // Text color, overflow, padding
        
        // ========================================================================
        // GROUP HEADING STYLING
        // ========================================================================
        
        // Heading typography and spacing
        "[&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  )
}

/**
 * CommandSeparator Component
 * @description Visual divider between command groups
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to CommandPrimitive.Separator
 * @returns {JSX.Element} The command separator component
 * 
 * Features:
 * - Horizontal line divider
 * - Consistent spacing
 * - Design system border color
 * - Visual group separation
 * 
 * Styling:
 * - 1px height horizontal line
 * - Border color from design system
 * - Negative margins for full width
 */
function CommandSeparator({
  className,                  // Additional CSS classes
  ...props                    // Additional props for CommandPrimitive.Separator
}) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"                             // Data attribute for styling
      className={cn(
        "bg-border -mx-1 h-px",                                // Background, margins, height
        className                                             // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  )
}

/**
 * CommandItem Component
 * @description Clickable command item with selection states
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.disabled] - Whether the item is disabled
 * @param {React.ReactNode} props.children - Command item content
 * @param {...any} props - Additional props passed to CommandPrimitive.Item
 * @returns {JSX.Element} The command item component
 * 
 * Features:
 * - Selection state styling
 * - Hover and focus states
 * - Icon support with automatic sizing
 * - Disabled state handling
 * - Keyboard navigation
 * 
 * Interactive States:
 * - Selected: accent background and foreground
 * - Hover: accent background and foreground
 * - Focus: accent background and foreground
 * - Disabled: reduced opacity, no pointer events
 */
function CommandItem({
  className,                  // Additional CSS classes
  ...props                    // Additional props for CommandPrimitive.Item
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"                                  // Data attribute for styling
      className={cn(
        // ========================================================================
        // BASE STYLING
        // ========================================================================
        
        // Layout and typography
        "relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm",  // Positioning, layout, spacing, shape, padding, size
        
        // ========================================================================
        // INTERACTIVE STATES
        // ========================================================================
        
        // Selection state
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",  // Selected background and text
        
        // ========================================================================
        // ICON STYLING
        // ========================================================================
        
        // Default icon color and sizing
        "[&_svg:not([class*='text-'])]:text-muted-foreground",  // Default icon color
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",  // Icon behavior and size
        
        // ========================================================================
        // DISABLED STATE
        // ========================================================================
        
        // Disabled interaction and appearance
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        
        // ========================================================================
        // ACCESSIBILITY
        // ========================================================================
        
        // Focus and selection
        "outline-hidden select-none",                          // Focus outline and text selection
        
        className                                              // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  )
}

/**
 * CommandShortcut Component
 * @description Keyboard shortcut display for command items
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Shortcut text (e.g., "⌘S")
 * @param {...any} props - Additional props passed to the span element
 * @returns {JSX.Element} The command shortcut component
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
function CommandShortcut({ 
  className,                  // Additional CSS classes
  ...props                    // Additional props for the span element
}) {
  return (
    <span
      data-slot="command-shortcut"                             // Data attribute for styling
      className={cn(
        // Shortcut styling
        "text-muted-foreground ml-auto text-xs tracking-widest",  // Color, margin, size, spacing
        className                                             // Custom classes
      )}
      {...props}                                              // Spread additional props
    />
  )
}

// Export all command components for external use
export {
  Command,                    // Main command palette container
  CommandDialog,              // Modal dialog wrapper
  CommandInput,               // Search input field
  CommandList,                // Scrollable results container
  CommandEmpty,               // Empty state display
  CommandGroup,               // Grouped command items
  CommandItem,                // Individual command item
  CommandShortcut,            // Keyboard shortcut display
  CommandSeparator,           // Visual group divider
}
