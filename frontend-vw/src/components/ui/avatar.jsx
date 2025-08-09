"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * Avatar Components
 *
 * Accessible avatar UI built on Radix Avatar. Includes root, image, and fallback.
 *
 * Features:
 * - Circular avatar container
 * - Image with automatic sizing
 * - Fallback with initials or icon
 * - Works with any size via className
 *
 * Usage:
 * ```jsx
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="Jane Doe" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 */
function Avatar({
  className,
  ...props
}) {
  // Root avatar container
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props} />
  );
}

/**
 * AvatarImage
 *
 * The image element for the avatar. Passes through all img props.
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
}

/**
 * AvatarFallback
 *
 * Shown when the image fails to load. Commonly used for initials.
 * @param {object} props
 * @param {string} [props.className]
 * @returns {JSX.Element}
 */
function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
