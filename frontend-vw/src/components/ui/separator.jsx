/**
 * @fileoverview Separator Component for Vire Workplace HR App
 * @description Horizontal or vertical rule for grouping UI content with accessibility features
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import * as React from "react"

// Radix UI Separator primitive for accessibility and functionality
import * as SeparatorPrimitive from "@radix-ui/react-separator"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Separator Component
 * @description Horizontal or vertical rule for grouping UI content with accessibility features
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.orientation="horizontal"] - Separator orientation: 'horizontal' | 'vertical'
 * @param {boolean} [props.decorative=true] - Whether the separator is decorative (for screen readers)
 * @param {...any} props - Additional props passed to SeparatorPrimitive.Root
 * @returns {JSX.Element} The separator component
 * 
 * Features:
 * - Horizontal and vertical orientation support
 * - Accessible separator with proper ARIA attributes
 * - Responsive design with Tailwind CSS
 * - Customizable styling through className prop
 * - Decorative mode for screen reader compatibility
 * - Consistent border color theming
 * - Automatic sizing based on orientation
 * 
 * Orientation Behavior:
 * - horizontal: Full width, 1px height (default)
 * - vertical: Full height, 1px width
 * 
 * Accessibility:
 * - When decorative=true: Screen readers ignore the separator
 * - When decorative=false: Screen readers announce the separator
 * - Proper ARIA attributes for orientation
 * 
 * @example
 * // Basic horizontal separator
 * <Separator />
 * 
 * // Vertical separator
 * <Separator orientation="vertical" />
 * 
 * // Custom styled separator
 * <Separator className="my-4 bg-gray-300" />
 * 
 * // Non-decorative separator (announced to screen readers)
 * <Separator decorative={false} />
 * 
 * // Between content sections
 * <div>Content above</div>
 * <Separator className="my-2" />
 * <div>Content below</div>
 */
function Separator({
  className,                 // Additional CSS classes
  orientation = "horizontal", // Separator orientation (horizontal or vertical)
  decorative = true,         // Whether separator is decorative for screen readers
  ...props                   // Additional props for SeparatorPrimitive.Root
}) {
  return (
    // ============================================================================
    // SEPARATOR ROOT ELEMENT
    // ============================================================================
    
    <SeparatorPrimitive.Root
      data-slot="separator"                                  // Data attribute for styling
      decorative={decorative}                                // Accessibility mode
      orientation={orientation}                               // Visual orientation
      className={cn(
        // Base separator styles
        "bg-border shrink-0",                                // Border color and no shrinking
        
        // Horizontal orientation styles
        "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
        
        // Vertical orientation styles  
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

// Export the Separator component for external use
export { Separator }
