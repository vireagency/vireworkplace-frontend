/**
 * Breadcrumb Components
 *
 * A composable breadcrumb navigation with accessible semantics.
 *
 * Usage:
 * ```jsx
 * <Breadcrumb>
 *   <BreadcrumbList>
 *     <BreadcrumbItem>
 *       <BreadcrumbLink href="/">Home</BreadcrumbLink>
 *     </BreadcrumbItem>
 *     <BreadcrumbSeparator />
 *     <BreadcrumbItem>
 *       <BreadcrumbPage>Settings</BreadcrumbPage>
 *     </BreadcrumbItem>
 *   </BreadcrumbList>
 * </Breadcrumb>
 * ```
 */

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Breadcrumb({
  ...props
}) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

/**
 * BreadcrumbList: container for breadcrumb items.
 */
function BreadcrumbList({
  className,
  ...props
}) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props} />
  );
}

/**
 * BreadcrumbItem: a single item in the breadcrumb.
 */
function BreadcrumbItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props} />
  );
}

/**
 * BreadcrumbLink: link element (or any child via asChild) for navigation.
 */
function BreadcrumbLink({
  asChild,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props} />
  );
}

/**
 * BreadcrumbPage: current page indicator with aria-current.
 */
function BreadcrumbPage({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props} />
  );
}

/**
 * BreadcrumbSeparator: visual separator between items.
 */
function BreadcrumbSeparator({
  children,
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

/**
 * BreadcrumbEllipsis: shows an ellipsis for collapsed items.
 */
function BreadcrumbEllipsis({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
