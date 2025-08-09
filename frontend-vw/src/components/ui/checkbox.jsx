/**
 * Checkbox Component
 * 
 * An accessible checkbox component built on top of Radix UI's Checkbox primitive.
 * Provides proper keyboard navigation, screen reader support, and visual feedback.
 * 
 * Features:
 * - Accessible checkbox with proper ARIA attributes
 * - Keyboard navigation (Space, Enter)
 * - Screen reader support
 * - Visual feedback for different states (checked, unchecked, disabled, focus)
 * - Dark mode support
 * - Customizable styling
 * - Error state support
 * 
 * Usage:
 * ```jsx
 * import { Checkbox } from "@/components/ui/checkbox"
 * 
 * // Basic checkbox
 * <Checkbox id="terms" />
 * <label htmlFor="terms">I agree to the terms</label>
 * 
 * // Controlled checkbox
 * <Checkbox 
 *   id="newsletter" 
 *   checked={isSubscribed} 
 *   onCheckedChange={setIsSubscribed} 
 * />
 * <label htmlFor="newsletter">Subscribe to newsletter</label>
 * 
 * // Disabled checkbox
 * <Checkbox id="disabled" disabled />
 * <label htmlFor="disabled">Disabled option</label>
 * 
 * // Checkbox with error state
 * <Checkbox 
 *   id="required" 
 *   aria-invalid="true" 
 *   aria-describedby="error-message" 
 * />
 * <label htmlFor="required">Required field</label>
 * <p id="error-message" className="text-destructive">
 *   This field is required
 * </p>
 * 
 * // Checkbox group
 * <div className="space-y-2">
 *   <div className="flex items-center space-x-2">
 *     <Checkbox id="option1" />
 *     <label htmlFor="option1">Option 1</label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <Checkbox id="option2" />
 *     <label htmlFor="option2">Option 2</label>
 *   </div>
 * </div>
 * ```
 */

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Checkbox Component
 * 
 * An accessible checkbox input with proper keyboard navigation and screen reader support.
 * Supports controlled and uncontrolled usage patterns.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {boolean} [props.checked] - Whether the checkbox is checked (controlled)
 * @param {boolean} [props.defaultChecked] - Default checked state (uncontrolled)
 * @param {function} [props.onCheckedChange] - Callback when checked state changes
 * @param {boolean} [props.disabled] - Whether the checkbox is disabled
 * @param {boolean} [props.required] - Whether the checkbox is required
 * @param {string} [props.id] - Unique identifier for the checkbox
 * @param {string} [props.name] - Name attribute for form submission
 * @param {string} [props.value] - Value attribute for form submission
 * @param {...any} props - All other props are passed to Radix UI Checkbox.Root
 * @returns {JSX.Element} Checkbox component
 * 
 * @example
 * // Basic usage
 * <Checkbox id="agree" />
 * <label htmlFor="agree">I agree to the terms</label>
 * 
 * @example
 * // Controlled checkbox
 * <Checkbox 
 *   id="subscribe" 
 *   checked={isSubscribed} 
 *   onCheckedChange={setIsSubscribed} 
 * />
 * 
 * @example
 * // With error state
 * <Checkbox 
 *   id="required" 
 *   aria-invalid="true" 
 *   aria-describedby="error" 
 * />
 * <p id="error" className="text-destructive">Required field</p>
 * 
 * @example
 * // Disabled state
 * <Checkbox id="disabled" disabled />
 * <label htmlFor="disabled">Disabled option</label>
 */
function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }
