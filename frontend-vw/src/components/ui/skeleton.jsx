/**
 * @fileoverview Skeleton Component for Vire Workplace HR App
 * @description Loading placeholder component with animated pulse effect
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Skeleton Component
 * @description Loading placeholder component with animated pulse effect
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to the div element
 * @returns {JSX.Element} The skeleton loading component
 * 
 * Features:
 * - Animated pulse effect for loading states
 * - Customizable styling through className prop
 * - Consistent with design system colors
 * - Rounded corners for modern appearance
 * - Lightweight and performant
 * - Responsive design with Tailwind CSS
 * 
 * Common Use Cases:
 * - Content loading placeholders
 * - Image loading skeletons
 * - Text line loading skeletons
 * - Card loading skeletons
 * - Form input loading states
 * 
 * Default Styling:
 * - Background: accent color (muted background)
 * - Animation: pulse effect
 * - Border radius: medium rounded corners
 * - Size: inherits from parent or className
 * 
 * @example
 * // Basic skeleton
 * <Skeleton />
 * 
 * // Custom sized skeleton
 * <Skeleton className="h-12 w-full" />
 * 
 * // Circular skeleton for avatar
 * <Skeleton className="h-10 w-10 rounded-full" />
 * 
 * // Text line skeleton
 * <Skeleton className="h-4 w-3/4" />
 * 
 * // Card skeleton
 * <div className="space-y-3">
 *   <Skeleton className="h-4 w-full" />
 *   <Skeleton className="h-4 w-2/3" />
 *   <Skeleton className="h-4 w-1/2" />
 * </div>
 */
function Skeleton({
  className,                 // Additional CSS classes for styling
  ...props                   // Additional props for the div element
}) {
  return (
    // ============================================================================
    // SKELETON LOADING ELEMENT
    // ============================================================================
    
    <div
      data-slot="skeleton"                                   // Data attribute for styling
      className={cn(
        // Base skeleton styles
        "bg-accent animate-pulse rounded-md",                 // Background, animation, and shape
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

// Export the Skeleton component for external use
export { Skeleton }
