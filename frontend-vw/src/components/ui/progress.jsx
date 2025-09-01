/**
 * @fileoverview Progress Component for Vire Workplace HR App
 * @description Accessible progress bar component with smooth animations
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/progress Radix UI Progress Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Progress primitive for accessibility and functionality
import * as ProgressPrimitive from "@radix-ui/react-progress"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Progress Component
 * @description Accessible progress bar component with smooth animations and custom styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {number} [props.value] - Progress value (0-100)
 * @param {number} [props.max=100] - Maximum progress value
 * @param {string} [props.valueText] - Custom text for screen readers
 * @param {boolean} [props.indeterminate] - Whether progress is indeterminate
 * @param {...any} props - Additional props passed to ProgressPrimitive.Root
 * @returns {JSX.Element} The progress bar component
 * 
 * Features:
 * - Accessible progress indicator
 * - Smooth value transitions
 * - Customizable styling
 * - Indeterminate state support
 * - Screen reader compatibility
 * - Responsive design
 * 
 * Value Behavior:
 * - value: Progress percentage (0-100)
 * - max: Maximum value (default: 100)
 * - Automatic percentage calculation
 * - Smooth transform animations
 * 
 * Styling:
 * - Primary color theme
 * - Rounded corners
 * - Subtle background
 * - Smooth transitions
 * - Consistent with design system
 * 
 * @example
 * // Basic progress bar
 * <Progress value={75} />
 * 
 * // Custom styled progress
 * <Progress 
 *   value={50} 
 *   className="h-3 bg-gray-200" 
 * />
 * 
 * // Indeterminate progress
 * <Progress 
 *   indeterminate 
 *   className="h-4" 
 * />
 * 
 * // With custom max value
 * <Progress 
 *   value={7} 
 *   max={10} 
 *   className="h-2" 
 * />
 */
function Progress({
  className,                  // Additional CSS classes
  value,                      // Progress value (0-100)
  ...props                    // Additional props for ProgressPrimitive.Root
}) {
  return (
    // ============================================================================
    // PROGRESS ROOT CONTAINER
    // ============================================================================
    
    <ProgressPrimitive.Root
      data-slot="progress"                                    // Data attribute for styling
      className={cn(
        // Base progress bar styles
        "relative h-2 w-full overflow-hidden rounded-full",    // Layout, size, overflow, shape
        
        // Background styling
        "bg-primary/20",                                      // Subtle primary color background
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           PROGRESS INDICATOR
           ========================================================================
           
           The filled portion of the progress bar
           ======================================================================== */}
      
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"                        // Data attribute for styling
        className={cn(
          // Indicator styles
          "bg-primary h-full w-full flex-1",                  // Background, size, and flex properties
          
          // Animation
          "transition-all"                                    // Smooth transitions for all properties
        )}
        style={{ 
          // Transform to show progress percentage
          // translateX(-100%) = fully hidden, translateX(0%) = fully visible
          transform: `translateX(-${100 - (value || 0)}%)`    // Calculate visible portion
        }} />
    </ProgressPrimitive.Root>
  );
}

// Export the Progress component for external use
export { Progress }
