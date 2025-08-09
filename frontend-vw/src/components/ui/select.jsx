/**
 * Select Components
 * 
 * A collection of select components built on top of Radix UI's Select primitive.
 * Provides accessible select dropdowns with proper keyboard navigation and screen reader support.
 * 
 * Features:
 * - Accessible select dropdowns
 * - Keyboard navigation (Arrow keys, Enter, Escape)
 * - Screen reader support
 * - Smooth animations and transitions
 * - Scroll buttons for long lists
 * - Group and separator support
 * - Customizable positioning
 * - Dark mode support
 * 
 * Usage:
 * ```jsx
 * import { 
 *   Select,
 *   SelectContent,
 *   SelectGroup,
 *   SelectItem,
 *   SelectLabel,
 *   SelectSeparator,
 *   SelectTrigger,
 *   SelectValue
 * } from "@/components/ui/select"
 * 
 * // Basic select
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select a fruit" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="apple">Apple</SelectItem>
 *     <SelectItem value="banana">Banana</SelectItem>
 *     <SelectItem value="orange">Orange</SelectItem>
 *   </SelectContent>
 * </Select>
 * 
 * // Controlled select
 * <Select value={selectedFruit} onValueChange={setSelectedFruit}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select a fruit" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="apple">Apple</SelectItem>
 *     <SelectItem value="banana">Banana</SelectItem>
 *   </SelectContent>
 * </Select>
 * 
 * // Select with groups and separators
 * <Select>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select a category" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectGroup>
 *       <SelectLabel>Fruits</SelectLabel>
 *       <SelectItem value="apple">Apple</SelectItem>
 *       <SelectItem value="banana">Banana</SelectItem>
 *     </SelectGroup>
 *     <SelectSeparator />
 *     <SelectGroup>
 *       <SelectLabel>Vegetables</SelectLabel>
 *       <SelectItem value="carrot">Carrot</SelectItem>
 *       <SelectItem value="broccoli">Broccoli</SelectItem>
 *     </SelectGroup>
 *   </SelectContent>
 * </Select>
 * ```
 */

"use client"

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Select Root Component
 * 
 * The main container for the select dropdown. Manages the select state and accessibility.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.value] - The selected value (controlled)
 * @param {string} [props.defaultValue] - Default selected value (uncontrolled)
 * @param {function} [props.onValueChange] - Callback when value changes
 * @param {boolean} [props.disabled] - Whether the select is disabled
 * @param {boolean} [props.required] - Whether the select is required
 * @param {string} [props.name] - Name attribute for form submission
 * @param {...any} props - All other props are passed to Radix UI Select.Root
 * @returns {JSX.Element} Select root container
 * 
 * @example
 * <Select value={selectedValue} onValueChange={setSelectedValue}>
 *   <SelectTrigger>Trigger</SelectTrigger>
 *   <SelectContent>Items</SelectContent>
 * </Select>
 */
function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/**
 * Select Group Component
 * 
 * Groups related select items together with an optional label.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI Select.Group
 * @returns {JSX.Element} Select group container
 * 
 * @example
 * <SelectGroup>
 *   <SelectLabel>Fruits</SelectLabel>
 *   <SelectItem value="apple">Apple</SelectItem>
 *   <SelectItem value="banana">Banana</SelectItem>
 * </SelectGroup>
 */
function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/**
 * Select Value Component
 * 
 * Displays the currently selected value in the select trigger.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.placeholder] - Placeholder text when no value is selected
 * @param {...any} props - All other props are passed to Radix UI Select.Value
 * @returns {JSX.Element} Select value display
 * 
 * @example
 * <SelectValue placeholder="Select an option" />
 */
function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * Select Trigger Component
 * 
 * The clickable element that opens the select dropdown.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.size="default"] - Size variant: 'default' | 'sm'
 * @param {React.ReactNode} props.children - Trigger content
 * @param {...any} props - All other props are passed to Radix UI Select.Trigger
 * @returns {JSX.Element} Select trigger element
 * 
 * @example
 * <SelectTrigger>
 *   <SelectValue placeholder="Select an option" />
 * </SelectTrigger>
 * 
 * @example
 * <SelectTrigger size="sm">
 *   <SelectValue placeholder="Small select" />
 * </SelectTrigger>
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * Select Content Component
 * 
 * The dropdown content container for select options.
 * Includes scroll buttons and proper positioning.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Select content
 * @param {string} [props.position="popper"] - Positioning strategy: 'popper' | 'item'
 * @param {...any} props - All other props are passed to Radix UI Select.Content
 * @returns {JSX.Element} Select content container
 * 
 * @example
 * <SelectContent>
 *   <SelectItem value="option1">Option 1</SelectItem>
 *   <SelectItem value="option2">Option 2</SelectItem>
 * </SelectContent>
 */
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/**
 * Select Label Component
 * 
 * A label for a group of select items.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI Select.Label
 * @returns {JSX.Element} Select label
 * 
 * @example
 * <SelectLabel>Fruits</SelectLabel>
 */
function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props} />
  );
}

/**
 * Select Item Component
 * 
 * A selectable option in the select dropdown.
 * Shows a checkmark when selected.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Item content
 * @param {string} props.value - The value of this option
 * @param {boolean} [props.disabled] - Whether this item is disabled
 * @param {...any} props - All other props are passed to Radix UI Select.Item
 * @returns {JSX.Element} Select item
 * 
 * @example
 * <SelectItem value="apple">Apple</SelectItem>
 * 
 * @example
 * <SelectItem value="disabled" disabled>
 *   Disabled Option
 * </SelectItem>
 */
function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
        className
      )}
      {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="h-4 w-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
