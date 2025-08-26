/**
 * Utility Functions
 * 
 * Common utility functions used throughout the Vire Workplace HR Application.
 * Provides helper functions for class name merging and conditional styling.
 * 
 * Dependencies:
 * - clsx: For conditional class name logic
 * - tailwind-merge: For merging Tailwind CSS classes with conflict resolution
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * Merge class names with Tailwind CSS conflict resolution
 * 
 * This function combines clsx for conditional logic and tailwind-merge
 * for proper Tailwind CSS class merging and conflict resolution.
 * 
 * @param {...any} inputs - Class names, objects, arrays, or conditional expressions
 * @returns {string} Merged class name string
 * 
 * @example
 * // Basic usage
 * cn("px-2 py-1", "bg-red-500")
 * // Returns: "px-2 py-1 bg-red-500"
 * 
 * @example
 * // Conditional classes
 * cn("base-class", isActive && "active-class", isDisabled && "disabled-class")
 * 
 * @example
 * // Object syntax
 * cn({
 *   "base-class": true,
 *   "active-class": isActive,
 *   "disabled-class": isDisabled
 * })
 * 
 * @example
 * // Tailwind conflict resolution
 * cn("px-2", "px-4") // Returns: "px-4" (px-4 overrides px-2)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}