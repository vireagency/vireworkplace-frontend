/**
 * Input Component
 * 
 * A flexible input component with consistent styling and accessibility features.
 * Supports all standard HTML input types and includes proper focus states.
 * 
 * Features:
 * - Consistent styling across all input types
 * - File input support with custom styling
 * - Focus and hover states
 * - Error state styling
 * - Dark mode support
 * - Accessibility features (ARIA support)
 * - Responsive design
 * 
 * Usage:
 * ```jsx
 * import { Input } from "@/components/ui/input"
 * 
 * // Basic text input
 * <Input placeholder="Enter your name" />
 * 
 * // Email input
 * <Input type="email" placeholder="Enter your email" />
 * 
 * // Password input
 * <Input type="password" placeholder="Enter your password" />
 * 
 * // File input
 * <Input type="file" accept="image/*" />
 * 
 * // Input with error state
 * <Input 
 *   aria-invalid="true"
 *   placeholder="Invalid input"
 * />
 * 
 * // Controlled input
 * <Input 
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   placeholder="Controlled input"
 * />
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input Component
 * 
 * A styled input element that supports all HTML input types.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.type] - HTML input type (text, email, password, file, etc.)
 * @param {...any} props - All other props are passed to the underlying input element
 * @returns {JSX.Element} Input component
 * 
 * @example
 * // Basic text input
 * <Input placeholder="Enter text" />
 * 
 * @example
 * // Email input with validation
 * <Input 
 *   type="email" 
 *   placeholder="Enter email"
 *   required 
 * />
 * 
 * @example
 * // File upload input
 * <Input 
 *   type="file" 
 *   accept=".pdf,.doc,.docx"
 *   multiple 
 * />
 */
function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
