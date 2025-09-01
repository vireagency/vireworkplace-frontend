/**
 * @fileoverview Sonner Toast Component for Vire Workplace HR App
 * @description Toast notification component with theme integration and custom styling
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://sonner.emilkowal.ski/ Sonner Toast Documentation}
 */

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Theme hook for detecting and managing application theme
import { useTheme } from "next-themes"

// ============================================================================
// TOAST COMPONENT IMPORTS
// ============================================================================

// Sonner toast library for notifications
import { Toaster as Sonner } from "sonner";

/**
 * Toaster Component
 * @description Toast notification component with theme integration and custom styling
 * @component
 * @param {Object} props - Component props
 * @param {...any} props - Additional props passed to Sonner Toaster
 * @returns {JSX.Element} The toast notification component
 * 
 * Features:
 * - Automatic theme detection (light/dark/system)
 * - Custom CSS variables for consistent theming
 * - Integration with application design system
 * - Responsive toast positioning
 * - Accessibility features from Sonner
 * - Custom styling through CSS variables
 * 
 * Theme Integration:
 * - Automatically detects current theme
 * - Applies appropriate styling for light/dark modes
 * - Falls back to system theme if no preference set
 * 
 * CSS Variables:
 * - --normal-bg: Background color for normal toasts
 * - --normal-text: Text color for normal toasts
 * - --normal-border: Border color for normal toasts
 * 
 * Usage:
 * ```jsx
 * // Basic usage
 * <Toaster />
 * 
 * // With custom props
 * <Toaster 
 *   position="top-right"
 *   richColors
 *   closeButton
 * />
 * 
 * // Toast notifications
 * toast.success("Operation completed!")
 * toast.error("Something went wrong")
 * toast.info("Here's some information")
 * ```
 */
const Toaster = ({
  ...props                    // Additional props for Sonner Toaster
}) => {
  // Get current theme from theme context (defaults to "system")
  const { theme = "system" } = useTheme()

  return (
    // ============================================================================
    // SONNER TOASTER COMPONENT
    // ============================================================================
    
    <Sonner
      theme={theme}           // Apply detected theme to toasts
      className="toaster group"  // Custom CSS classes for styling
      style={{
        // ========================================================================
        // CUSTOM CSS VARIABLES
        // ========================================================================
        
        "--normal-bg": "var(--popover)",           // Background color from design system
        "--normal-text": "var(--popover-foreground)", // Text color from design system
        "--normal-border": "var(--border)"          // Border color from design system
      }}
      {...props}              // Spread additional props
    />
  );
}

// Export the Toaster component for external use
export { Toaster }
