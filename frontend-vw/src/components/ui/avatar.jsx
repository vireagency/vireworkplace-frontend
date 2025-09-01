/**
 * @fileoverview Avatar Components for Vire Workplace HR App
 * @description Accessible avatar UI built on Radix Avatar primitives with image and fallback support
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Client-side directive for Next.js compatibility
"use client"

// React core library for component creation
import * as React from "react"

// Radix UI Avatar primitives for accessibility and functionality
import * as AvatarPrimitive from "@radix-ui/react-avatar"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Avatar Components
 * @description Accessible avatar UI built on Radix Avatar primitives
 * 
 * Features:
 * - Circular avatar container with customizable sizing
 * - Image display with automatic aspect ratio
 * - Fallback display with initials or icon support
 * - Responsive design with Tailwind CSS
 * - Accessibility features from Radix UI
 * - Works with any size via className prop
 * 
 * Usage:
 * ```jsx
 * <Avatar>
 *   <AvatarImage src="/user.jpg" alt="Jane Doe" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 * ```
 */

/**
 * Avatar Root Component
 * @description Main avatar container that wraps image and fallback components
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to AvatarPrimitive.Root
 * @returns {JSX.Element} The avatar root component
 * 
 * Default Styling:
 * - Circular shape (rounded-full)
 * - Default size (size-8 = 32px)
 * - Relative positioning for child elements
 * - Overflow hidden for clean circular edges
 * - Shrink prevention for consistent sizing
 * 
 * @example
 * <Avatar className="size-12">
 *   <AvatarImage src="/user.jpg" alt="User" />
 *   <AvatarFallback>U</AvatarFallback>
 * </Avatar>
 */
function Avatar({
  className,                // Additional CSS classes
  ...props                  // Additional props for AvatarPrimitive.Root
}) {
  return (
    // ============================================================================
    // AVATAR ROOT CONTAINER
    // ============================================================================
    
    <AvatarPrimitive.Root
      data-slot="avatar"                                    // Data attribute for styling
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",  // Base avatar styles
        className                                           // Custom classes
      )}
      {...props}                                            // Spread additional props
    />
  );
}

/**
 * AvatarImage Component
 * @description The image element for the avatar with automatic sizing and aspect ratio
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text for accessibility
 * @param {...any} props - Additional props passed to AvatarPrimitive.Image
 * @returns {JSX.Element} The avatar image component
 * 
 * Features:
 * - Automatic square aspect ratio (aspect-square)
 * - Full size within container (size-full)
 * - Inherits all standard img element props
 * - Responsive image handling
 * - Accessibility support
 * 
 * @example
 * <AvatarImage 
 *   src="/user-profile.jpg" 
 *   alt="User Profile Picture"
 *   className="object-cover"
 * />
 */
function AvatarImage({
  className,                // Additional CSS classes
  ...props                  // Additional props for AvatarPrimitive.Image
}) {
  return (
    // ============================================================================
    // AVATAR IMAGE ELEMENT
    // ============================================================================
    
    <AvatarPrimitive.Image
      data-slot="avatar-image"                              // Data attribute for styling
      className={cn(
        "aspect-square size-full",                          // Square aspect ratio and full size
        className                                           // Custom classes
      )}
      {...props}                                            // Spread additional props
    />
  );
}

/**
 * AvatarFallback Component
 * @description Fallback display shown when the image fails to load or is not available
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Fallback content (initials, icon, or text)
 * @param {...any} props - Additional props passed to AvatarPrimitive.Fallback
 * @returns {JSX.Element} The avatar fallback component
 * 
 * Common Use Cases:
 * - User initials (e.g., "JD" for John Doe)
 * - Default user icon
 * - Loading placeholder
 * - Error state display
 * 
 * Default Styling:
 * - Muted background color (bg-muted)
 * - Full size within container (size-full)
 * - Centered content (flex items-center justify-center)
 * - Circular shape (rounded-full)
 * 
 * @example
 * // User initials
 * <AvatarFallback>JD</AvatarFallback>
 * 
 * // With custom styling
 * <AvatarFallback className="bg-blue-100 text-blue-800 font-semibold">
 *   JD
 * </AvatarFallback>
 * 
 * // With icon
 * <AvatarFallback>
 *   <IconUser className="size-4" />
 * </AvatarFallback>
 */
function AvatarFallback({
  className,                // Additional CSS classes
  ...props                  // Additional props for AvatarPrimitive.Fallback
}) {
  return (
    // ============================================================================
    // AVATAR FALLBACK ELEMENT
    // ============================================================================
    
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"                           // Data attribute for styling
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",  // Base fallback styles
        className                                           // Custom classes
      )}
      {...props}                                            // Spread additional props
    />
  );
}

// Export all avatar components for external use
export { Avatar, AvatarImage, AvatarFallback }
