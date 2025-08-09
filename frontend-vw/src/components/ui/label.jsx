/**
 * Label Component
 * 
 * A label component built on top of Radix UI's Label primitive.
 * Provides accessible labels for form controls with proper association.
 * 
 * Features:
 * - Accessible labels with proper form control association
 * - Automatic disabled state handling
 * - Consistent typography and spacing
 * - Screen reader support
 * - Flexible styling with className prop
 * 
 * Usage:
 * ```jsx
 * import { Label } from "@/components/ui/label"
 * 
 * // Basic label
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 * 
 * // Label with required indicator
 * <Label htmlFor="name">
 *   Full Name <span className="text-destructive">*</span>
 * </Label>
 * <Input id="name" required />
 * 
 * // Label with description
 * <div className="space-y-2">
 *   <Label htmlFor="password">Password</Label>
 *   <p className="text-sm text-muted-foreground">
 *     Must be at least 8 characters long
 *   </p>
 *   <Input id="password" type="password" />
 * </div>
 * 
 * // Label with icon
 * <Label htmlFor="search" className="flex items-center gap-2">
 *   <SearchIcon className="w-4 h-4" />
 *   Search
 * </Label>
 * <Input id="search" placeholder="Search..." />
 * ```
 */

"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * Label Component
 * 
 * An accessible label component that can be associated with form controls.
 * Automatically handles disabled states and provides proper accessibility features.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.htmlFor] - ID of the form control this label is for
 * @param {...any} props - All other props are passed to Radix UI Label.Root
 * @returns {JSX.Element} Label component
 * 
 * @example
 * // Basic usage
 * <Label htmlFor="username">Username</Label>
 * <Input id="username" />
 * 
 * @example
 * // With custom styling
 * <Label 
 *   htmlFor="email" 
 *   className="text-lg font-semibold text-primary"
 * >
 *   Email Address
 * </Label>
 * 
 * @example
 * // With required indicator
 * <Label htmlFor="phone">
 *   Phone Number <span className="text-destructive">*</span>
 * </Label>
 */
function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Label }
