/**
 * Card Components
 * 
 * A collection of card-related components for creating structured content containers.
 * Provides a flexible layout system with header, content, footer, and action areas.
 * 
 * Features:
 * - Modular card structure (Card, CardHeader, CardContent, CardFooter, etc.)
 * - Responsive design with container queries
 * - Flexible layout with action positioning
 * - Consistent spacing and typography
 * - Dark mode support
 * - Accessibility features
 * 
 * Usage:
 * ```jsx
 * import { 
 *   Card, 
 *   CardHeader, 
 *   CardTitle, 
 *   CardDescription, 
 *   CardContent, 
 *   CardFooter,
 *   CardAction 
 * } from "@/components/ui/card"
 * 
 * // Basic card
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card Title</CardTitle>
 *     <CardDescription>Card description</CardDescription>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Card content goes here</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * 
 * // Card with action in header
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Card with Action</CardTitle>
 *     <CardDescription>Description</CardDescription>
 *     <CardAction>
 *       <Button variant="outline">Edit</Button>
 *     </CardAction>
 *   </CardHeader>
 *   <CardContent>Content</CardContent>
 * </Card>
 * ```
 */

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Card Component
 * 
 * The main container for card content. Provides the base styling and structure.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card container
 * 
 * @example
 * <Card className="max-w-sm">
 *   <CardContent>Content</CardContent>
 * </Card>
 */
function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props} />
  );
}

/**
 * CardHeader Component
 * 
 * Container for card title, description, and optional action.
 * Uses container queries for responsive layout.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card header container
 * 
 * @example
 * <CardHeader>
 *   <CardTitle>Title</CardTitle>
 *   <CardDescription>Description</CardDescription>
 *   <CardAction>
 *     <Button>Action</Button>
 *   </CardAction>
 * </CardHeader>
 */
function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props} />
  );
}

/**
 * CardTitle Component
 * 
 * The main title of the card. Styled with semibold font weight.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card title
 * 
 * @example
 * <CardTitle>User Profile</CardTitle>
 */
function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props} />
  );
}

/**
 * CardDescription Component
 * 
 * Secondary text that provides additional context for the card.
 * Styled with muted foreground color and smaller text size.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card description
 * 
 * @example
 * <CardDescription>Additional information about the card</CardDescription>
 */
function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

/**
 * CardAction Component
 * 
 * Container for action buttons or controls in the card header.
 * Automatically positioned to the right when used within CardHeader.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card action container
 * 
 * @example
 * <CardAction>
 *   <Button variant="outline">Edit</Button>
 *   <Button variant="destructive">Delete</Button>
 * </CardAction>
 */
function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

/**
 * CardContent Component
 * 
 * Main content area of the card. Provides consistent padding.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card content container
 * 
 * @example
 * <CardContent>
 *   <p>This is the main content of the card.</p>
 *   <ul>
 *     <li>Item 1</li>
 *     <li>Item 2</li>
 *   </ul>
 * </CardContent>
 */
function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-6", className)} {...props} />);
}

/**
 * CardFooter Component
 * 
 * Bottom section of the card for actions, metadata, or additional content.
 * Provides consistent padding and flex layout for action buttons.
 * 
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {...any} props - All other props are passed to the underlying div element
 * @returns {JSX.Element} Card footer container
 * 
 * @example
 * <CardFooter>
 *   <Button variant="outline">Cancel</Button>
 *   <Button>Save Changes</Button>
 * </CardFooter>
 */
function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
