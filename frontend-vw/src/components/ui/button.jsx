/**
 * Button Component
 * 
 * A versatile button component built on top of Radix UI's Slot primitive.
 * Supports multiple variants, sizes, and can render as different HTML elements.
 * 
 * Features:
 * - Multiple visual variants (default, destructive, outline, secondary, ghost, link)
 * - Different sizes (default, sm, lg, icon)
 * - Polymorphic rendering (can render as any HTML element)
 * - Accessibility features (focus states, ARIA support)
 * - Icon support with automatic spacing
 * - Dark mode support
 * 
 * Usage:
 * ```jsx
 * import { Button } from "@/components/ui/button"
 * 
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Button with variant and size
 * <Button variant="destructive" size="lg">
 *   Delete Item
 * </Button>
 * 
 * // Button with icon
 * <Button variant="outline">
 *   <IconPlus />
 *   Add Item
 * </Button>
 * 
 * // Icon-only button
 * <Button size="icon" variant="ghost">
 *   <IconSettings />
 * </Button>
 * 
 * // Button as link
 * <Button asChild>
 *   <a href="/dashboard">Go to Dashboard</a>
 * </Button>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Button variant definitions using class-variance-authority
 * 
 * Defines all possible visual styles and sizes for the button component.
 * Each variant has specific styling for different states (hover, focus, disabled).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

/**
 * Button Component
 * 
 * A flexible button component that can render as any HTML element.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant] - Visual variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
 * @param {string} [props.size] - Size variant: 'default' | 'sm' | 'lg' | 'icon'
 * @param {boolean} [props.asChild] - Whether to render as child element using Radix Slot
 * @param {...any} props - All other props are passed to the underlying element
 * @returns {JSX.Element} Button component
 * 
 * @example
 * // Basic usage
 * <Button onClick={handleClick}>Click me</Button>
 * 
 * @example
 * // With variant and size
 * <Button variant="destructive" size="lg">
 *   Delete Account
 * </Button>
 * 
 * @example
 * // As a link
 * <Button asChild>
 *   <Link to="/dashboard">Dashboard</Link>
 * </Button>
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
