/**
 * Sonner Toast Component
 * 
 * A toast notification system built on top of Sonner.
 * Provides customizable toast notifications with different styles and positions.
 * 
 * Features:
 * - Success, error, warning, and normal toast types
 * - Customizable positioning
 * - Rich colors and styling
 * - Close button functionality
 * 
 * Usage:
 * ```jsx
 * import { toast } from "sonner"
 * 
 * // Basic toast
 * toast("Event has been created")
 * 
 * // Toast with description
 * toast("Event has been created", {
 *   description: "Sunday, December 03, 2023 at 9:00 AM"
 * })
 * 
 * // Success toast
 * toast.success("Successfully saved!")
 * 
 * // Error toast
 * toast.error("Something went wrong")
 * ```
 */

"use client";

import { Toaster as Sonner } from "sonner";

const Toaster = (props) => {
  const mergedToastOptions = {
    ...(props.toastOptions || {}),
    style: {
      // Reduce toast width and ensure long text wraps nicely
      maxWidth: "360px",
      whiteSpace: "normal",
      wordBreak: "break-word",
      lineHeight: 1.35,
      padding: "12px 14px",
      ...(props.toastOptions?.style || {}),
    },
  };

  return (
    <Sonner
      {...props}
      position="top-right"
      toastOptions={mergedToastOptions}
      style={{
        "--success-bg": "#16a34a",
        "--success-text": "#ffffff",
        "--success-border": "#15803d",

        "--error-bg": "#dc2626",
        "--error-text": "#ffffff",
        "--error-border": "#b91c1c",

        "--warning-bg": "#f59e0b",
        "--warning-text": "#000000",
        "--warning-border": "#d97706",

        "--normal-bg": "#f3f4f6",
        "--normal-text": "#111827",
        "--normal-border": "#d1d5db",
        ...(props.style || {}),
      }}
    />
  );
};

export { Toaster };
