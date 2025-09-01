/**
 * @fileoverview Button Component for Vire Workplace HR App
 * @description Versatile button component with multiple variants and sizes using class-variance-authority
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import * as React from "react"

// Radix UI Slot component for polymorphic button behavior
import { Slot } from "@radix-ui/react-slot"

// Class variance authority for dynamic class combinations
import { cva } from "class-variance-authority";

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

// ============================================================================
// BUTTON VARIANTS CONFIGURATION
// ============================================================================

/**
 * Button variants configuration using class-variance-authority
 * @description Defines all possible button styles, sizes, and their CSS classes
 * @type {import('class-variance-authority').VariantProps<typeof buttonVariants>}
 */
const buttonVariants = cva(
  // Base classes applied to all button variants
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    // ========================================================================
    // VARIANT OPTIONS
    // ========================================================================
    
    variants: {
      // Button style variants
      variant: {
        // Default primary button
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        
        // Destructive/danger button
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        
        // Outlined button with border
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        
        // Secondary button with muted colors
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        
        // Ghost button with minimal styling
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        
        // Link-style button with underline
        link: "text-primary underline-offset-4 hover:underline",
      },
      
      // ========================================================================
      // SIZE OPTIONS
      // ========================================================================
      
      // Button size variants
      size: {
        // Default size (medium)
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        
        // Small size
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        
        // Large size
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        
        // Icon-only size (square)
        icon: "size-9",
      },
    },
    
    // ========================================================================
    // DEFAULT VARIANTS
    // ========================================================================
    
    // Default variant and size when none specified
    defaultVariants: {
      variant: "default",    // Default to primary button style
      size: "default",       // Default to medium size
    },
  }
)

/**
 * Button Component
 * @description Versatile button component with multiple variants, sizes, and polymorphic behavior
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.variant="default"] - Button style variant
 * @param {string} [props.size="default"] - Button size variant
 * @param {boolean} [props.asChild=false] - Whether to render as child component
 * @param {...any} props - Additional props passed to the button element
 * @returns {JSX.Element} The button component
 * 
 * Features:
 * - Multiple style variants (default, destructive, outline, secondary, ghost, link)
 * - Multiple size options (default, sm, lg, icon)
 * - Polymorphic rendering with asChild prop
 * - Comprehensive accessibility features
 * - Dark mode support
 * - Focus and hover states
 * - Disabled state handling
 * - SVG icon support with automatic sizing
 * - Responsive design with Tailwind CSS
 * 
 * Button Variants:
 * - default: Primary button with brand colors
 * - destructive: Danger button for destructive actions
 * - outline: Outlined button with border styling
 * - secondary: Secondary button with muted colors
 * - ghost: Minimal button with hover effects
 * - link: Link-style button with underline
 * 
 * Button Sizes:
 * - default: Medium size (h-9, px-4, py-2)
 * - sm: Small size (h-8, px-3)
 * - lg: Large size (h-10, px-6)
 * - icon: Icon-only size (size-9, square)
 * 
 * @example
 * // Basic button
 * <Button>Click me</Button>
 * 
 * // Button with variant and size
 * <Button variant="destructive" size="lg">
 *   Delete Item
 * </Button>
 * 
 * // Icon button
 * <Button size="icon" variant="outline">
 *   <IconPlus />
 * </Button>
 * 
 * // Polymorphic button (renders as anchor)
 * <Button asChild>
 *   <a href="/link">Link Button</a>
 * </Button>
 */
function Button({
  className,                // Additional CSS classes
  variant,                  // Button style variant
  size,                     // Button size variant
  asChild = false,          // Whether to render as child component
  ...props                  // Additional props
}) {
  // ============================================================================
  // COMPONENT RENDERING
  // ============================================================================
  
  // Determine component to render (Slot for polymorphic, "button" for default)
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"                                    // Data attribute for styling
      className={cn(buttonVariants({ variant, size, className }))}  // Dynamic class generation
      {...props}                                             // Spread additional props
    />
  );
}

// Export the Button component and buttonVariants for external use
export { Button, buttonVariants }
