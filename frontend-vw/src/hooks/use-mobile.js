/**
 * Mobile Detection Hook
 * 
 * A custom React hook that detects if the current viewport is mobile-sized.
 * Uses window.matchMedia API to listen for viewport changes and provides
 * responsive behavior for mobile devices.
 * 
 * Features:
 * - Real-time viewport size detection
 * - Event listener for window resize changes
 * - Automatic cleanup of event listeners
 * - Configurable mobile breakpoint
 * 
 * Usage:
 * ```jsx
 * import { useIsMobile } from '@/hooks/use-mobile'
 * 
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *   
 *   return (
 *     <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
 *       {isMobile ? 'Mobile View' : 'Desktop View'}
 *     </div>
 *   )
 * }
 * ```
 * 
 * Breakpoint:
 * - Mobile: < 768px
 * - Desktop: >= 768px
 */

import * as React from "react"

// Mobile breakpoint in pixels (768px = md breakpoint in Tailwind)
const MOBILE_BREAKPOINT = 768

/**
 * useIsMobile Hook
 * 
 * Detects if the current viewport is mobile-sized and updates in real-time
 * when the window is resized.
 * 
 * @returns {boolean} True if viewport width is less than MOBILE_BREAKPOINT, false otherwise
 * 
 * @example
 * // Basic usage
 * const isMobile = useIsMobile()
 * 
 * @example
 * // Conditional rendering
 * {isMobile ? <MobileMenu /> : <DesktopMenu />}
 * 
 * @example
 * // Conditional styling
 * <div className={cn(
 *   "base-class",
 *   isMobile && "mobile-specific-class"
 * )}>
 */
export function useIsMobile() {
  // State to track mobile status (undefined initially for SSR compatibility)
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    // Create media query listener for mobile breakpoint
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler function to update mobile status
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Add event listener for viewport changes
    mql.addEventListener("change", onChange)
    
    // Set initial mobile status
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Cleanup: remove event listener when component unmounts
    return () => mql.removeEventListener("change", onChange);
  }, [])

  // Return boolean value (convert undefined to false for SSR compatibility)
  return !!isMobile
}
