/**
 * Dialog Components
 * 
 * A collection of modal dialog components built on top of Radix UI's Dialog primitive.
 * Provides accessible modal dialogs with proper focus management and keyboard navigation.
 * 
 * Features:
 * - Accessible modal dialogs
 * - Focus trap and keyboard navigation
 * - Backdrop overlay with click-to-close
 * - Smooth animations and transitions
 * - Responsive design
 * - Customizable close button
 * - Screen reader support
 * 
 * Usage:
 * ```jsx
 * import { 
 *   Dialog, 
 *   DialogTrigger, 
 *   DialogContent, 
 *   DialogHeader, 
 *   DialogTitle, 
 *   DialogDescription, 
 *   DialogFooter 
 * } from "@/components/ui/dialog"
 * 
 * // Basic dialog
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Dialog Title</DialogTitle>
 *       <DialogDescription>
 *         This is a description of the dialog content.
 *       </DialogDescription>
 *     </DialogHeader>
 *     <div>Dialog content goes here</div>
 *     <DialogFooter>
 *       <Button variant="outline">Cancel</Button>
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * 
 * // Dialog without close button
 * <DialogContent showCloseButton={false}>
 *   <DialogHeader>
 *     <DialogTitle>No Close Button</DialogTitle>
 *   </DialogHeader>
 *   <div>Content</div>
 * </DialogContent>
 * ```
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Dialog Root Component
 * 
 * The main container for the dialog. Manages the dialog state and accessibility.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI Dialog.Root
 * @returns {JSX.Element} Dialog root container
 * 
 * @example
 * <Dialog open={isOpen} onOpenChange={setIsOpen}>
 *   <DialogContent>Content</DialogContent>
 * </Dialog>
 */
function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Dialog Trigger Component
 * 
 * The element that triggers the dialog to open when clicked.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI Dialog.Trigger
 * @returns {JSX.Element} Dialog trigger element
 * 
 * @example
 * <DialogTrigger asChild>
 *   <Button>Open Dialog</Button>
 * </DialogTrigger>
 */
function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Dialog Portal Component
 * 
 * Portals the dialog content to the document body to avoid z-index issues.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI Dialog.Portal
 * @returns {JSX.Element} Dialog portal
 * 
 * @example
 * <DialogPortal>
 *   <DialogContent>Content</DialogContent>
 * </DialogPortal>
 */
function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Dialog Close Component
 * 
 * A button that closes the dialog when clicked.
 * 
 * @param {Object} props - Component props
 * @param {...any} props - All props are passed to Radix UI Dialog.Close
 * @returns {JSX.Element} Dialog close button
 * 
 * @example
 * <DialogClose asChild>
 *   <Button variant="outline">Cancel</Button>
 * </DialogClose>
 */
function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Dialog Overlay Component
 * 
 * The backdrop overlay that appears behind the dialog.
 * Provides visual separation and can be clicked to close the dialog.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI Dialog.Overlay
 * @returns {JSX.Element} Dialog overlay
 * 
 * @example
 * <DialogOverlay className="bg-black/60" />
 */
function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

/**
 * Dialog Content Component
 * 
 * The main content container for the dialog.
 * Includes the overlay and optional close button.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Dialog content
 * @param {boolean} [props.showCloseButton=true] - Whether to show the close button
 * @param {...any} props - All other props are passed to Radix UI Dialog.Content
 * @returns {JSX.Element} Dialog content container
 * 
 * @example
 * <DialogContent>
 *   <DialogHeader>
 *     <DialogTitle>Title</DialogTitle>
 *   </DialogHeader>
 *   <div>Content</div>
 * </DialogContent>
 * 
 * @example
 * <DialogContent showCloseButton={false}>
 *   <div>Content without close button</div>
 * </DialogContent>
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}>
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/**
 * Dialog Header Component
 * 
 * Container for the dialog title and description.
 * Provides consistent spacing and responsive text alignment.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Dialog header container
 * 
 * @example
 * <DialogHeader>
 *   <DialogTitle>Dialog Title</DialogTitle>
 *   <DialogDescription>Description text</DialogDescription>
 * </DialogHeader>
 */
function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />
  );
}

/**
 * Dialog Footer Component
 * 
 * Container for dialog action buttons.
 * Provides responsive layout with buttons stacked on mobile and side-by-side on desktop.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Dialog footer container
 * 
 * @example
 * <DialogFooter>
 *   <DialogClose asChild>
 *     <Button variant="outline">Cancel</Button>
 *   </DialogClose>
 *   <Button>Save Changes</Button>
 * </DialogFooter>
 */
function DialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />
  );
}

/**
 * Dialog Title Component
 * 
 * The main title of the dialog.
 * Styled with semibold font weight and proper heading semantics.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI Dialog.Title
 * @returns {JSX.Element} Dialog title
 * 
 * @example
 * <DialogTitle>Confirm Action</DialogTitle>
 */
function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props} />
  );
}

/**
 * Dialog Description Component
 * 
 * Secondary text that provides additional context for the dialog.
 * Styled with muted foreground color and smaller text size.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to Radix UI Dialog.Description
 * @returns {JSX.Element} Dialog description
 * 
 * @example
 * <DialogDescription>
 * This action cannot be undone. This will permanently delete your account.
 * </DialogDescription>
 */
function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
