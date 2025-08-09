/**
 * Dropdown Menu Components
 * 
 * A collection of dropdown menu components built on top of Radix UI's DropdownMenu primitive.
 * Provides accessible dropdown menus with proper keyboard navigation and screen reader support.
 * 
 * Features:
 * - Accessible dropdown menus
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Screen reader support
 * - Smooth animations and transitions
 * - Checkbox and radio items
 * - Sub-menus support
 * - Destructive item variants
 * - Shortcut key display
 * 
 * Usage:
 * ```jsx
 * import { 
 *   DropdownMenu,
 *   DropdownMenuTrigger,
 *   DropdownMenuContent,
 *   DropdownMenuItem,
 *   DropdownMenuCheckboxItem,
 *   DropdownMenuRadioGroup,
 *   DropdownMenuRadioItem,
 *   DropdownMenuLabel,
 *   DropdownMenuSeparator,
 *   DropdownMenuShortcut,
 *   DropdownMenuSub,
 *   DropdownMenuSubTrigger,
 *   DropdownMenuSubContent
 * } from "@/components/ui/dropdown-menu"
 * 
 * // Basic dropdown menu
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button variant="outline">Open Menu</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Profile</DropdownMenuItem>
 *     <DropdownMenuItem>Settings</DropdownMenuItem>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem variant="destructive">Logout</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * 
 * // Dropdown with checkboxes
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>View Options</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuLabel>View Options</DropdownMenuLabel>
 *     <DropdownMenuCheckboxItem checked={showGrid}>
 *       Show Grid
 *     </DropdownMenuCheckboxItem>
 *     <DropdownMenuCheckboxItem checked={showLabels}>
 *       Show Labels
 *     </DropdownMenuCheckboxItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * 
 * // Dropdown with sub-menu
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>More Options</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuItem>Copy</DropdownMenuItem>
 *     <DropdownMenuSub>
 *       <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 *       <DropdownMenuSubContent>
 *         <DropdownMenuItem>Archive</DropdownMenuItem>
 *         <DropdownMenuItem>Delete</DropdownMenuItem>
 *       </DropdownMenuSubContent>
 *     </DropdownMenuSub>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 * ```
 */

"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * DropdownMenu Root Component
 * 
 * The main container for the dropdown menu. Manages the menu state and accessibility.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.Root
 * @returns {JSX.Element} Dropdown menu root container
 * 
 * @example
 * <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
 *   <DropdownMenuContent>Items</DropdownMenuContent>
 * </DropdownMenu>
 */
function DropdownMenu({
  ...props
}) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

/**
 * DropdownMenu Portal Component
 * 
 * Portals the dropdown menu content to the document body to avoid z-index issues.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.Portal
 * @returns {JSX.Element} Dropdown menu portal
 * 
 * @example
 * <DropdownMenuPortal>
 *   <DropdownMenuContent>Items</DropdownMenuContent>
 * </DropdownMenuPortal>
 */
function DropdownMenuPortal({
  ...props
}) {
  return (<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />);
}

/**
 * DropdownMenu Trigger Component
 * 
 * The element that triggers the dropdown menu to open when clicked.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.Trigger
 * @returns {JSX.Element} Dropdown menu trigger element
 * 
 * @example
 * <DropdownMenuTrigger asChild>
 *   <Button variant="outline">Open Menu</Button>
 * </DropdownMenuTrigger>
 */
function DropdownMenuTrigger({
  ...props
}) {
  return (<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />);
}

/**
 * DropdownMenu Content Component
 * 
 * The main content container for the dropdown menu.
 * Includes animations and proper positioning.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {number} [props.sideOffset=4] - Offset from the trigger element
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.Content
 * @returns {JSX.Element} Dropdown menu content container
 * 
 * @example
 * <DropdownMenuContent>
 *   <DropdownMenuItem>Item 1</DropdownMenuItem>
 *   <DropdownMenuItem>Item 2</DropdownMenuItem>
 * </DropdownMenuContent>
 */
function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props} />
    </DropdownMenuPrimitive.Portal>
  );
}

/**
 * DropdownMenu Group Component
 * 
 * Groups related dropdown menu items together.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.Group
 * @returns {JSX.Element} Dropdown menu group container
 * 
 * @example
 * <DropdownMenuGroup>
 *   <DropdownMenuItem>Group Item 1</DropdownMenuItem>
 *   <DropdownMenuItem>Group Item 2</DropdownMenuItem>
 * </DropdownMenuGroup>
 */
function DropdownMenuGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />);
}

/**
 * DropdownMenu Item Component
 * 
 * A clickable item in the dropdown menu.
 * Supports different variants including destructive styling.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.inset] - Whether to indent the item
 * @param {string} [props.variant="default"] - Item variant: 'default' | 'destructive'
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.Item
 * @returns {JSX.Element} Dropdown menu item
 * 
 * @example
 * <DropdownMenuItem>Regular Item</DropdownMenuItem>
 * 
 * @example
 * <DropdownMenuItem variant="destructive">
 *   Delete Item
 * </DropdownMenuItem>
 * 
 * @example
 * <DropdownMenuItem inset>
 *   Indented Item
 * </DropdownMenuItem>
 */
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

/**
 * DropdownMenu Checkbox Item Component
 * 
 * A dropdown menu item that behaves like a checkbox.
 * Shows a checkmark when selected.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Item content
 * @param {boolean} props.checked - Whether the checkbox is checked
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.CheckboxItem
 * @returns {JSX.Element} Dropdown menu checkbox item
 * 
 * @example
 * <DropdownMenuCheckboxItem checked={showGrid}>
 *   Show Grid
 * </DropdownMenuCheckboxItem>
 */
function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

/**
 * DropdownMenu Radio Group Component
 * 
 * Groups radio items together for single selection.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.RadioGroup
 * @returns {JSX.Element} Dropdown menu radio group container
 * 
 * @example
 * <DropdownMenuRadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
 *   <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
 *   <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
 * </DropdownMenuRadioGroup>
 */
function DropdownMenuRadioGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />);
}

/**
 * DropdownMenu Radio Item Component
 * 
 * A dropdown menu item that behaves like a radio button.
 * Shows a circle when selected.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Item content
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.RadioItem
 * @returns {JSX.Element} Dropdown menu radio item
 * 
 * @example
 * <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
 */
function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

/**
 * DropdownMenu Label Component
 * 
 * A label for a group of dropdown menu items.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.inset] - Whether to indent the label
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.Label
 * @returns {JSX.Element} Dropdown menu label
 * 
 * @example
 * <DropdownMenuLabel>Options</DropdownMenuLabel>
 */
function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props} />
  );
}

/**
 * DropdownMenu Separator Component
 * 
 * A horizontal line to separate groups of dropdown menu items.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.Separator
 * @returns {JSX.Element} Dropdown menu separator
 * 
 * @example
 * <DropdownMenuSeparator />
 */
function DropdownMenuSeparator({
  className,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

/**
 * DropdownMenu Shortcut Component
 * 
 * Displays a shortcut key for a dropdown menu item.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.Shortcut
 * @returns {JSX.Element} Dropdown menu shortcut
 * 
 * @example
 * <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
 */
function DropdownMenuShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props} />
  );
}

/**
 * DropdownMenu Sub Component
 * 
 * A container for sub-menus within a dropdown menu.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI DropdownMenu.Sub
 * @returns {JSX.Element} Dropdown menu sub container
 * 
 * @example
 * <DropdownMenuSub>
 *   <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 *   <DropdownMenuSubContent>
 *     <DropdownMenuItem>Archive</DropdownMenuItem>
 *     <DropdownMenuItem>Delete</DropdownMenuItem>
 *   </DropdownMenuSubContent>
 * </DropdownMenuSub>
 */
function DropdownMenuSub({
  ...props
}) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

/**
 * DropdownMenu Sub Trigger Component
 * 
 * The element that triggers the sub-menu to open when clicked.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.inset] - Whether to indent the trigger
 * @param {React.ReactNode} props.children - Trigger content
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.SubTrigger
 * @returns {JSX.Element} Dropdown menu sub trigger
 * 
 * @example
 * <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
 */
function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

/**
 * DropdownMenu Sub Content Component
 * 
 * The content container for a sub-menu.
 * Includes animations and proper positioning.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI DropdownMenu.SubContent
 * @returns {JSX.Element} Dropdown menu sub content
 * 
 * @example
 * <DropdownMenuSubContent>
 *   <DropdownMenuItem>Archive</DropdownMenuItem>
 *   <DropdownMenuItem>Delete</DropdownMenuItem>
 * </DropdownMenuSubContent>
 */
function DropdownMenuSubContent({
  className,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props} />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
