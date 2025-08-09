/**
 * Alert Dialog Component
 * 
 * A modal dialog that interrupts the user with important content and expects a response.
 * Built on top of Radix UI's AlertDialog primitive with custom styling.
 * 
 * Features:
 * - Accessible modal dialog
 * - Customizable styling
 * - Animation support
 * - Responsive design
 * - Keyboard navigation
 * 
 * Usage:
 * ```jsx
 * <AlertDialog>
 *   <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Title</AlertDialogTitle>
 *       <AlertDialogDescription>Description</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Continue</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 * ```
 */

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * AlertDialog Root Component
 * 
 * The main container for the alert dialog.
 */
function AlertDialog(props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

/**
 * AlertDialog Trigger Component
 * 
 * The element that triggers the alert dialog to open.
 */
function AlertDialogTrigger(props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

/**
 * AlertDialog Portal Component
 * 
 * Portals the dialog content to the document body.
 */
function AlertDialogPortal(props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

/**
 * AlertDialog Overlay Component
 * 
 * The backdrop overlay that appears behind the dialog.
 */
function AlertDialogOverlay({ className, ...props }) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * AlertDialog Content Component
 * 
 * The main content container for the dialog.
 */
function AlertDialogContent({ className, ...props }) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

/**
 * AlertDialog Header Component
 * 
 * Container for the dialog title and description.
 */
function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * AlertDialog Footer Component
 * 
 * Container for the dialog action buttons.
 */
function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * AlertDialog Title Component
 * 
 * The main title of the dialog.
 */
function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

/**
 * AlertDialog Description Component
 * 
 * The description text of the dialog.
 */
function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * AlertDialog Action Component
 * 
 * The primary action button (usually "Continue" or "Confirm").
 */
function AlertDialogAction({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Action
      className={cn(buttonVariants(), className)}
      {...props}
    />
  )
}

/**
 * AlertDialog Cancel Component
 * 
 * The secondary action button (usually "Cancel").
 */
function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props}
    />
  )
}

// Export all components
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
