/**
 * @fileoverview Switch Component for Vire Workplace HR App
 * @description A toggle switch component built on Radix UI primitives with custom styling
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://www.radix-ui.com/primitives/docs/components/switch Radix UI Switch Documentation}
 */

// Client-side directive for Next.js compatibility
"use client"

// React core library for component creation
import * as React from "react"

// Radix UI Switch primitive for accessibility and functionality
import * as SwitchPrimitive from "@radix-ui/react-switch"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * Switch Component
 * @description A customizable toggle switch with accessibility features and smooth animations
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for customization
 * @param {React.Ref} ref - Forwarded ref for DOM access
 * @returns {JSX.Element} The switch component
 * 
 * Features:
 * - Built on Radix UI primitives for accessibility
 * - Smooth state transitions and animations
 * - Focus management and keyboard navigation
 * - Customizable styling through className prop
 * - Disabled state support
 * - Checked/unchecked state styling
 * 
 * @example
 * <Switch 
 *   checked={isEnabled} 
 *   onCheckedChange={setIsEnabled}
 *   className="data-[state=checked]:bg-green-500"
 * />
 */
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  // ============================================================================
  // SWITCH ROOT CONTAINER
  // ============================================================================
  
  <SwitchPrimitive.Root
    // Merge default classes with custom className prop
    className={cn(
      // Base switch styling
      "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full",
      
      // Border and transition properties
      "border-2 border-transparent transition-colors",
      
      // Focus management for accessibility
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      
      // Disabled state styling
      "disabled:cursor-not-allowed disabled:opacity-50",
      
      // State-based background colors
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      
      // Custom className for additional styling
      className
    )}
    
    // Spread additional props to the root element
    {...props}
    
    // Forward the ref for DOM access
    ref={ref}
  >
    {/* ========================================================================
         SWITCH THUMB (TOGGLE KNOB)
         ======================================================================== */}
    
    <SwitchPrimitive.Thumb
      // Thumb-specific styling
      className={cn(
        // Base thumb properties
        "pointer-events-none block h-5 w-5 rounded-full bg-background",
        
        // Visual effects
        "shadow-lg ring-0",
        
        // Smooth transform transitions
        "transition-transform",
        
        // State-based positioning
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitive.Root>
))

// Set display name for React DevTools debugging
Switch.displayName = SwitchPrimitive.Root.displayName

// Export the Switch component
export { Switch }