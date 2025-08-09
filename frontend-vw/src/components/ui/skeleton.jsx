import { cn } from "@/lib/utils"

/**
 * Skeleton
 *
 * Animated placeholder for loading states.
 */

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props} />
  );
}

export { Skeleton }
