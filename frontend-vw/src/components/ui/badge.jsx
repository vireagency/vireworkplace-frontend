/**
 * Badge Component
 * 
 * A versatile badge component for displaying status, labels, or small pieces of information.
 * Built on top of Radix UI's Slot primitive with multiple visual variants.
 * 
 * Features:
 * - Multiple visual variants (default, secondary, destructive, outline)
 * - Polymorphic rendering (can render as any HTML element)
 * - Icon support with automatic spacing
 * - Accessibility features (focus states, ARIA support)
 * - Responsive design
 * - Dark mode support
 * 
 * Usage:
 * ```jsx
 * import { Badge } from "@/components/ui/badge"
 * 
 * // Basic badge
 * <Badge>New</Badge>
 * 
 * // Badge with variant
 * <Badge variant="secondary">Draft</Badge>
 * <Badge variant="destructive">Error</Badge>
 * <Badge variant="outline">Beta</Badge>
 * 
 * // Badge with icon
 * <Badge>
 *   <CheckIcon />
 *   Completed
 * </Badge>
 * 
 * // Badge as link
 * <Badge asChild>
 *   <a href="/tags/react">React</a>
 * </Badge>
 * 
 * // Status badges
 * <div className="flex gap-2">
 *   <Badge variant="default">Active</Badge>
 *   <Badge variant="secondary">Pending</Badge>
 *   <Badge variant="destructive">Failed</Badge>
 * </div>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Badge variant definitions using class-variance-authority
 * 
 * Defines all possible visual styles for the badge component.
 * Each variant has specific styling for different states (hover, focus).
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Badge Component
 * 
 * A flexible badge component that can render as any HTML element.
 * Perfect for displaying status indicators, labels, or small pieces of information.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant] - Visual variant: 'default' | 'secondary' | 'destructive' | 'outline'
 * @param {boolean} [props.asChild] - Whether to render as child element using Radix Slot
 * @param {...any} props - All other props are passed to the underlying element
 * @returns {JSX.Element} Badge component
 * 
 * @example
 * // Basic usage
 * <Badge>New Feature</Badge>
 * 
 * @example
 * // With variant
 * <Badge variant="destructive">Critical</Badge>
 * 
 * @example
 * // With icon
 * <Badge>
 *   <StarIcon />
 *   Featured
 * </Badge>
 * 
 * @example
 * // As a link
 * <Badge asChild>
 *   <Link to="/category/tech">Technology</Link>
 * </Badge>
 * 
 * @example
 * // Status indicators
 * <div className="flex gap-2">
 *   <Badge variant="default">Online</Badge>
 *   <Badge variant="secondary">Away</Badge>
 *   <Badge variant="destructive">Offline</Badge>
 * </div>
 */
function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
