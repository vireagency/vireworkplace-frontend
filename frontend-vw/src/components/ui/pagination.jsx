/**
 * @fileoverview Pagination Component for Vire Workplace HR App
 * @description Accessible pagination component with navigation controls and page indicators
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// React core library for component creation
import * as React from "react"

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Navigation icons from Lucide React
import {
  ChevronLeftIcon,        // Left chevron for previous page
  ChevronRightIcon,       // Right chevron for next page
  MoreHorizontalIcon,     // Horizontal dots for ellipsis
} from "lucide-react"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

// Button variants for consistent styling
import { buttonVariants } from "@/components/ui/button";

/**
 * Pagination Component
 * @description Main pagination container with navigation role and accessibility
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Pagination content and controls
 * @param {...any} props - Additional props passed to the nav element
 * @returns {JSX.Element} The pagination component
 * 
 * Features:
 * - Semantic navigation element
 * - Accessibility labels and roles
 * - Centered layout by default
 * - Responsive design
 * - Customizable through className prop
 * 
 * Accessibility:
 * - role="navigation" for screen readers
 * - aria-label="pagination" for context
 * - Proper semantic structure
 * 
 * @example
 * <Pagination>
 *   <PaginationContent>
 *     <PaginationItem>
 *       <PaginationPrevious />
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink isActive>1</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationLink>2</PaginationLink>
 *     </PaginationItem>
 *     <PaginationItem>
 *       <PaginationNext />
 *     </PaginationItem>
 *   </PaginationContent>
 * </Pagination>
 */
function Pagination({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the nav element
}) {
  return (
    // ============================================================================
    // PAGINATION NAVIGATION CONTAINER
    // ============================================================================
    
    <nav
      role="navigation"                                       // Semantic navigation role
      aria-label="pagination"                                 // Accessibility label
      data-slot="pagination"                                  // Data attribute for styling
      className={cn(
        "mx-auto flex w-full justify-center",                  // Centered layout
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * PaginationContent Component
 * @description Container for pagination items with consistent spacing
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {React.ReactNode} props.children - Pagination items and controls
 * @param {...any} props - Additional props passed to the ul element
 * @returns {JSX.Element} The pagination content component
 * 
 * Layout:
 * - Flexbox row layout
 * - Consistent gap between items
 * - Centered alignment
 * - Responsive spacing
 */
function PaginationContent({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the ul element
}) {
  return (
    <ul
      data-slot="pagination-content"                          // Data attribute for styling
      className={cn(
        "flex flex-row items-center gap-1",                    // Layout and spacing
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * PaginationItem Component
 * @description Individual pagination item wrapper
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Pagination link or control
 * @param {...any} props - Additional props passed to the li element
 * @returns {JSX.Element} The pagination item component
 * 
 * Purpose:
 * - Wraps pagination links and controls
 * - Provides semantic list structure
 * - Enables consistent styling
 */
function PaginationItem({
  ...props                    // Additional props for the li element
}) {
  return (
    <li 
      data-slot="pagination-item"                             // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * PaginationLink Component
 * @description Clickable pagination link with active state styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {boolean} [props.isActive=false] - Whether this link represents the current page
 * @param {string} [props.size="icon"] - Button size variant
 * @param {string} props.href - Navigation URL
 * @param {React.ReactNode} props.children - Link content (usually page number)
 * @param {...any} props - Additional props passed to the anchor element
 * @returns {JSX.Element} The pagination link component
 * 
 * Features:
 * - Active state styling
 * - Button variant integration
 * - Accessibility attributes
 * - Consistent with design system
 * 
 * Styling:
 * - Active: outline variant with current page indication
 * - Inactive: ghost variant for subtle appearance
 * - Icon size by default for page numbers
 * - Customizable through className prop
 * 
 * @example
 * // Current page
 * <PaginationLink isActive href="/page/1">1</PaginationLink>
 * 
 * // Other pages
 * <PaginationLink href="/page/2">2</PaginationLink>
 * 
 * // Custom styling
 * <PaginationLink 
 *   href="/page/3" 
 *   className="bg-blue-100" 
 * >3</PaginationLink>
 */
function PaginationLink({
  className,                  // Additional CSS classes
  isActive,                   // Whether this is the current page
  size = "icon",              // Button size variant (default: icon)
  ...props                    // Additional props for the anchor element
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}            // Accessibility for current page
      data-slot="pagination-link"                             // Data attribute for styling
      data-active={isActive}                                  // Data attribute for styling
      className={cn(
        // Apply button variants based on active state
        buttonVariants({
          variant: isActive ? "outline" : "ghost",            // Active: outline, Inactive: ghost
          size,                                               // Button size
        }), 
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * PaginationPrevious Component
 * @description Previous page navigation button with icon and text
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} props.href - Previous page URL
 * @param {Function} [props.onClick] - Click handler for navigation
 * @param {...any} props - Additional props passed to PaginationLink
 * @returns {JSX.Element} The previous page button component
 * 
 * Features:
 * - Left chevron icon
 * - "Previous" text (hidden on small screens)
 * - Default button size for better touch targets
 * - Accessibility label
 * - Responsive text display
 * 
 * Responsive Behavior:
 * - Small screens: Icon only
 * - Larger screens: Icon + "Previous" text
 * - Consistent spacing across breakpoints
 */
function PaginationPrevious({
  className,                  // Additional CSS classes
  ...props                    // Additional props for PaginationLink
}) {
  return (
    <PaginationLink
      aria-label="Go to previous page"                        // Accessibility label
      size="default"                                          // Default size for better UX
      className={cn(
        "gap-1 px-2.5 sm:pl-2.5",                            // Spacing and responsive padding
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Left chevron icon */}
      <ChevronLeftIcon />
      
      {/* Previous text (hidden on small screens) */}
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

/**
 * PaginationNext Component
 * @description Next page navigation button with icon and text
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} props.href - Next page URL
 * @param {Function} [props.onClick] - Click handler for navigation
 * @param {...any} props - Additional props passed to PaginationLink
 * @returns {JSX.Element} The next page button component
 * 
 * Features:
 * - Right chevron icon
 * - "Next" text (hidden on small screens)
 * - Default button size for better touch targets
 * - Accessibility label
 * - Responsive text display
 * 
 * Responsive Behavior:
 * - Small screens: Icon only
 * - Larger screens: Icon + "Next" text
 * - Consistent spacing across breakpoints
 */
function PaginationNext({
  className,                  // Additional CSS classes
  ...props                    // Additional props for PaginationLink
}) {
  return (
    <PaginationLink
      aria-label="Go to next page"                            // Accessibility label
      size="default"                                          // Default size for better UX
      className={cn(
        "gap-1 px-2.5 sm:pr-2.5",                            // Spacing and responsive padding
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Next text (hidden on small screens) */}
      <span className="hidden sm:block">Next</span>
      
      {/* Right chevron icon */}
      <ChevronRightIcon />
    </PaginationLink>
  );
}

/**
 * PaginationEllipsis Component
 * @description Ellipsis indicator for truncated page ranges
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {...any} props - Additional props passed to the span element
 * @returns {JSX.Element} The pagination ellipsis component
 * 
 * Features:
 * - Horizontal dots icon
 * - Hidden from screen readers (decorative)
 * - Consistent sizing with other pagination elements
 * - Centered content alignment
 * 
 * Usage:
 * - Indicates skipped page ranges
 * - Maintains visual consistency
 * - Non-interactive element
 * 
 * @example
 * // Between page ranges
 * <PaginationItem>
 *   <PaginationLink>1</PaginationLink>
 * </PaginationItem>
 * <PaginationItem>
 *   <PaginationEllipsis />
 * </PaginationItem>
 * <PaginationItem>
 *   <PaginationLink>10</PaginationLink>
 * </PaginationItem>
 */
function PaginationEllipsis({
  className,                  // Additional CSS classes
  ...props                    // Additional props for the span element
}) {
  return (
    <span
      aria-hidden                                             // Hidden from screen readers (decorative)
      data-slot="pagination-ellipsis"                        // Data attribute for styling
      className={cn(
        "flex size-9 items-center justify-center",            // Layout, size, and centering
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* Horizontal dots icon */}
      <MoreHorizontalIcon className="size-4" />
      
      {/* Screen reader text for context */}
      <span className="sr-only">More pages</span>
    </span>
  );
}

// Export all pagination components for external use
export {
  Pagination,                // Main pagination container
  PaginationContent,         // Pagination items container
  PaginationLink,            // Individual page link
  PaginationItem,            // Page item wrapper
  PaginationPrevious,        // Previous page button
  PaginationNext,            // Next page button
  PaginationEllipsis,        // Ellipsis indicator
}
