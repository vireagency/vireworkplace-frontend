/**
 * @fileoverview Radio Group Component for Vire Workplace HR App
 * @description Accessible radio button group component with custom styling
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/radio-group Radix UI Radio Group Documentation}
 */

// React core library for component creation
import * as React from "react"

// Radix UI Radio Group primitive for accessibility and functionality
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"

// Circle icon for radio button indicator
import { CircleIcon } from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * RadioGroup Component
 * @description Container for a group of radio buttons with consistent layout
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.value] - Controlled value of the selected radio button
 * @param {Function} [props.onValueChange] - Callback when selection changes
 * @param {string} [props.defaultValue] - Default selected value
 * @param {string} [props.name] - Form name for the radio group
 * @param {boolean} [props.disabled] - Whether the entire group is disabled
 * @param {boolean} [props.required] - Whether selection is required
 * @param {React.ReactNode} props.children - Radio button items
 * @param {...any} props - Additional props passed to RadioGroupPrimitive.Root
 * @returns {JSX.Element} The radio group component
 * 
 * Features:
 * - Accessible radio button group
 * - Controlled and uncontrolled modes
 * - Form integration
 * - Keyboard navigation
 * - Grid layout with consistent spacing
 * - Customizable through className prop
 * 
 * Layout:
 * - Grid layout with 3-unit gap
 * - Responsive design
 * - Consistent spacing between items
 * 
 * @example
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1" id="option1" />
 *   <label htmlFor="option1">Option 1</label>
 *   
 *   <RadioGroupItem value="option2" id="option2" />
 *   <label htmlFor="option2">Option 2</label>
 * </RadioGroup>
 */
function RadioGroup({
  className,                  // Additional CSS classes
  ...props                    // Additional props for RadioGroupPrimitive.Root
}) {
  return (
    // ============================================================================
    // RADIO GROUP ROOT CONTAINER
    // ============================================================================
    
    <RadioGroupPrimitive.Root
      data-slot="radio-group"                                 // Data attribute for styling
      className={cn(
        "grid gap-3",                                         // Grid layout with consistent spacing
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * RadioGroupItem Component
 * @description Individual radio button within a radio group
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} props.value - Value of this radio button
 * @param {string} [props.id] - Unique identifier for the radio button
 * @param {boolean} [props.disabled] - Whether this item is disabled
 * @param {boolean} [props.required] - Whether this item is required
 * @param {string} [props.name] - Form name (inherited from group)
 * @param {...any} props - Additional props passed to RadioGroupPrimitive.Item
 * @returns {JSX.Element} The radio button item component
 * 
 * Features:
 * - Accessible radio button with proper ARIA attributes
 * - Custom styled appearance
 * - Focus and hover states
 * - Disabled state handling
 * - Invalid state styling
 * - Smooth transitions
 * 
 * Styling:
 * - Circular shape with border
 * - Primary color for selected state
 * - Focus ring with ring color
 * - Invalid state with destructive colors
 * - Disabled state with reduced opacity
 * 
 * @example
 * // Basic radio button
 * <RadioGroupItem value="yes" id="yes" />
 * <label htmlFor="yes">Yes</label>
 * 
 * // Disabled radio button
 * <RadioGroupItem value="no" id="no" disabled />
 * <label htmlFor="no">No</label>
 * 
 * // With custom styling
 * <RadioGroupItem 
 *   value="maybe" 
 *   id="maybe" 
 *   className="border-blue-500" 
 * />
 */
function RadioGroupItem({
  className,                  // Additional CSS classes
  ...props                    // Additional props for RadioGroupPrimitive.Item
}) {
  return (
    // ============================================================================
    // RADIO BUTTON ITEM
    // ============================================================================
    
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"                            // Data attribute for styling
      className={cn(
        // Base radio button styles
        "aspect-square size-4 shrink-0 rounded-full border shadow-xs",  // Shape, size, border, shadow
        
        // Background and text colors
        "border-input text-primary dark:bg-input/30",         // Border, text, and dark mode background
        
        // Focus states
        "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        
        // Invalid state styling
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        
        // Transitions
        "transition-[color,box-shadow]",                      // Smooth color and shadow transitions
        
        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",    // Disabled interaction and appearance
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           RADIO BUTTON INDICATOR
           ========================================================================
           
           Shows the selected state with a filled circle
           ======================================================================== */}
      
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"                     // Data attribute for styling
        className={cn(
          "relative flex items-center justify-center"          // Layout and positioning
        )}>
        
        {/* Filled circle indicator for selected state */}
        <CircleIcon
          className={cn(
            // Indicator positioning and styling
            "fill-primary absolute top-1/2 left-1/2 size-2",  // Fill color, positioning, size
            
            // Center the indicator within the radio button
            "-translate-x-1/2 -translate-y-1/2"               // Transform to center
          )} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

// Export radio group components for external use
export { 
  RadioGroup,                 // Radio group container
  RadioGroupItem              // Individual radio button
}
