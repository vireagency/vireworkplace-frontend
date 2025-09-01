/**
 * @fileoverview Slider Component for Vire Workplace HR App
 * @description Accessible range slider component with single or multiple thumbs
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/slider Radix UI Slider Documentation}
 */

// React core library for component creation and hooks
import * as React from "react"

// Radix UI Slider primitive for accessibility and functionality
import * as SliderPrimitive from "@radix-ui/react-slider"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Slider Component
 * @description Accessible range slider component with single or multiple thumbs
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {number|number[]} [props.defaultValue] - Default value(s) for the slider
 * @param {number|number[]} [props.value] - Controlled value(s) for the slider
 * @param {number} [props.min=0] - Minimum value for the slider range
 * @param {number} [props.max=100] - Maximum value for the slider range
 * @param {string} [props.orientation="horizontal"] - Slider orientation
 * @param {boolean} [props.disabled] - Whether the slider is disabled
 * @param {Function} [props.onValueChange] - Callback when value changes
 * @param {...any} props - Additional props passed to SliderPrimitive.Root
 * @returns {JSX.Element} The slider component
 * 
 * Features:
 * - Single or multiple thumb support
 * - Horizontal and vertical orientation
 * - Controlled and uncontrolled modes
 * - Accessibility features from Radix UI
 * - Touch-friendly interaction
 * - Customizable styling through className
 * - Responsive design with Tailwind CSS
 * - Disabled state handling
 * 
 * Value Handling:
 * - Single value: [value] or [defaultValue]
 * - Multiple values: [min, max] or custom array
 * - Automatic fallback to min/max range
 * 
 * Orientation Support:
 * - horizontal: Full width, fixed height (default)
 * - vertical: Full height, fixed width
 * 
 * @example
 * // Basic single-value slider
 * <Slider defaultValue={[50]} />
 * 
 * // Range slider with min/max
 * <Slider defaultValue={[25, 75]} min={0} max={100} />
 * 
 * // Controlled slider
 * <Slider value={[value]} onValueChange={setValue} />
 * 
 * // Custom styled slider
 * <Slider className="w-64" defaultValue={[30]} />
 * 
 * // Vertical orientation
 * <Slider orientation="vertical" className="h-64" defaultValue={[50]} />
 */
function Slider({
  className,                 // Additional CSS classes
  defaultValue,              // Default value(s) for uncontrolled mode
  value,                     // Controlled value(s)
  min = 0,                   // Minimum value (default: 0)
  max = 100,                 // Maximum value (default: 100)
  ...props                   // Additional props for SliderPrimitive.Root
}) {
  // ============================================================================
  // VALUE PROCESSING
  // ============================================================================
  
  // Process and normalize slider values for rendering
  const _values = React.useMemo(() =>
    // Use controlled value if provided
    Array.isArray(value)
      ? value
      // Otherwise use default value if provided
      : Array.isArray(defaultValue)
        ? defaultValue
        // Fallback to min/max range
        : [min, max], 
    [value, defaultValue, min, max]  // Dependencies for useMemo
  )

  return (
    // ============================================================================
    // SLIDER ROOT CONTAINER
    // ============================================================================
    
    <SliderPrimitive.Root
      data-slot="slider"                                    // Data attribute for styling
      defaultValue={defaultValue}                            // Default values for uncontrolled mode
      value={value}                                          // Controlled values
      min={min}                                              // Minimum value
      max={max}                                              // Maximum value
      className={cn(
        // Base slider styles
        "relative flex w-full touch-none items-center select-none",  // Layout and interaction
        
        // Disabled state styling
        "data-[disabled]:opacity-50",
        
        // Vertical orientation styles
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           SLIDER TRACK
           ========================================================================
           
           The track represents the full range of the slider
           ======================================================================== */}
      
      <SliderPrimitive.Track
        data-slot="slider-track"                             // Data attribute for styling
        className={cn(
          // Base track styles
          "bg-muted relative grow overflow-hidden rounded-full",  // Background and shape
          
          // Horizontal orientation styles
          "data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full",
          
          // Vertical orientation styles
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}>
        
        {/* ========================================================================
             SLIDER RANGE
             ========================================================================
             
             The range shows the selected portion of the track
             ======================================================================== */}
        
        <SliderPrimitive.Range
          data-slot="slider-range"                           // Data attribute for styling
          className={cn(
            "bg-primary absolute",                            // Primary color background
            
            // Full size within track
            "data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )} />
      </SliderPrimitive.Track>
      
      {/* ========================================================================
           SLIDER THUMBS
           ========================================================================
           
           Render thumb(s) based on the number of values
           ======================================================================== */}
      
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"                           // Data attribute for styling
          key={index}                                         // Unique key for each thumb
          className={cn(
            // Base thumb styles
            "border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm",
            
            // Interactive states
            "transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden",
            
            // Disabled state
            "disabled:pointer-events-none disabled:opacity-50"
          )} />
      ))}
    </SliderPrimitive.Root>
  );
}

// Export the Slider component for external use
export { Slider }
