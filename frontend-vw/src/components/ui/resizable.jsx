/**
 * @fileoverview Resizable Component for Vire Workplace HR App
 * @description Resizable panel system with drag handles and flexible layouts
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://react-resizable-panels.vercel.app/ React Resizable Panels Documentation}
 */

// React core library for component creation
import * as React from "react"

// Grip icon for resizable handle visualization
import { GripVerticalIcon } from "lucide-react"

// React Resizable Panels library for panel functionality
import * as ResizablePrimitive from "react-resizable-panels"

// Utility function for conditional class name merging
import { cn } from "@/lib/utils"

/**
 * ResizablePanelGroup Component
 * @description Container for resizable panels with flexible layout support
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.direction="horizontal"] - Panel group direction: 'horizontal' | 'vertical'
 * @param {boolean} [props.autoSaveId] - Auto-save ID for persisting panel sizes
 * @param {...any} props - Additional props passed to ResizablePrimitive.PanelGroup
 * @returns {JSX.Element} The resizable panel group component
 * 
 * Features:
 * - Horizontal and vertical panel layouts
 * - Automatic size persistence
 * - Flexible panel sizing
 * - Touch and mouse support
 * - Accessibility features
 * - Responsive design
 * 
 * Layout Behavior:
 * - horizontal: Panels arranged side by side (default)
 * - vertical: Panels arranged top to bottom
 * 
 * @example
 * <ResizablePanelGroup direction="horizontal">
 *   <ResizablePanel defaultSize={25}>
 *     <div>Left Panel (25%)</div>
 *   </ResizablePanel>
 *   <ResizableHandle />
 *   <ResizablePanel defaultSize={75}>
 *     <div>Right Panel (75%)</div>
 *   </ResizablePanel>
 * </ResizablePanelGroup>
 */
function ResizablePanelGroup({
  className,                  // Additional CSS classes
  ...props                    // Additional props for ResizablePrimitive.PanelGroup
}) {
  return (
    // ============================================================================
    // RESIZABLE PANEL GROUP CONTAINER
    // ============================================================================
    
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"                       // Data attribute for styling
      className={cn(
        // Base panel group styles
        "flex h-full w-full",                                 // Full size flexbox layout
        
        // Vertical direction styles
        "data-[panel-group-direction=vertical]:flex-col",     // Column layout for vertical direction
        
        className                                             // Custom classes
      )}
      {...props}                                             // Spread additional props
    />
  );
}

/**
 * ResizablePanel Component
 * @description Individual resizable panel within a panel group
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.defaultSize] - Default size percentage (0-100)
 * @param {number} [props.minSize] - Minimum size percentage
 * @param {number} [props.maxSize] - Maximum size percentage
 * @param {number} [props.order] - Panel order in the group
 * @param {React.ReactNode} props.children - Panel content
 * @param {...any} props - Additional props passed to ResizablePrimitive.Panel
 * @returns {JSX.Element} The resizable panel component
 * 
 * Features:
 * - Configurable default, minimum, and maximum sizes
 * - Order-based positioning
 * - Flexible content rendering
 * - Size constraints
 * - Smooth resizing
 * 
 * Size Constraints:
 * - defaultSize: Initial panel size (0-100)
 * - minSize: Smallest allowed size (0-100)
 * - maxSize: Largest allowed size (0-100)
 * 
 * @example
 * <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
 *   <div className="p-4">Sidebar content</div>
 * </ResizablePanel>
 */
function ResizablePanel({
  ...props                    // Additional props for ResizablePrimitive.Panel
}) {
  return (
    <ResizablePrimitive.Panel 
      data-slot="resizable-panel"                             // Data attribute for styling
      {...props}                                              // Spread additional props
    />
  );
}

/**
 * ResizableHandle Component
 * @description Drag handle for resizing panels with optional visual indicator
 * @component
 * @param {Object} props - Component props
 * @param {boolean} [props.withHandle=false] - Whether to show visual drag handle
 * @param {string} [props.className] - Additional CSS classes for styling
 * @param {string} [props.direction] - Handle direction (inherited from panel group)
 * @param {...any} props - Additional props passed to ResizablePrimitive.PanelResizeHandle
 * @returns {JSX.Element} The resizable handle component
 * 
 * Features:
 * - Visual drag handle option
 * - Direction-aware styling
 * - Focus and hover states
 * - Touch-friendly interaction
 * - Consistent with design system
 * 
 * Handle Behavior:
 * - withHandle=false: Invisible drag area (default)
 * - withHandle=true: Visible grip icon for better UX
 * 
 * Direction Support:
 * - horizontal: Vertical line with horizontal grip
 * - vertical: Horizontal line with vertical grip
 * 
 * @example
 * // Invisible handle
 * <ResizableHandle />
 * 
 * // Visible handle with grip icon
 * <ResizableHandle withHandle />
 * 
 * // Custom styled handle
 * <ResizableHandle withHandle className="bg-blue-200" />
 */
function ResizableHandle({
  withHandle,                 // Whether to show visual drag handle
  className,                  // Additional CSS classes
  ...props                    // Additional props for ResizablePrimitive.PanelResizeHandle
}) {
  return (
    // ============================================================================
    // RESIZABLE HANDLE CONTAINER
    // ============================================================================
    
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"                            // Data attribute for styling
      className={cn(
        // Base handle styles
        "bg-border relative flex w-px items-center justify-center",  // Background, positioning, layout
        
        // Focus states
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden",
        
        // Handle line positioning
        "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2",  // Horizontal line
        
        // ========================================================================
        // VERTICAL DIRECTION STYLES
        // ========================================================================
        
        // Vertical panel group styles
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",  // Full width, 1px height
        
        // Vertical handle line positioning
        "data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2",
        
        // Rotate grip icon for vertical direction
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        
        className                                             // Custom classes
      )}
      {...props}>                                            {/* Spread additional props */}
      
      {/* ========================================================================
           VISUAL DRAG HANDLE (OPTIONAL)
           ========================================================================
           
           Shows grip icon when withHandle is true
           ======================================================================== */}
      
      {withHandle && (
        <div
          className={cn(
            // Handle container styles
            "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border"  // Background, size, layout, shape
          )}>
          {/* Grip icon for visual feedback */}
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

// Export resizable components for external use
export { 
  ResizablePanelGroup,        // Panel group container
  ResizablePanel,             // Individual resizable panel
  ResizableHandle             // Resize drag handle
}
