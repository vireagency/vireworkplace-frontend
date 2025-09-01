/**
 * @fileoverview Documents Navigation Component for Vire Workplace HR App
 * @description Navigation component for document management with dropdown actions
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Client-side directive for Next.js compatibility
"use client"

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for document actions and navigation
import { IconDots, IconFolder, IconShare3, IconTrash } from "@tabler/icons-react";

// ============================================================================
// ROUTING IMPORTS
// ============================================================================

// React Router hooks for navigation and location
import { useNavigate, useLocation } from "react-router-dom";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Dropdown menu components for document actions
import {
  DropdownMenu,           // Dropdown menu container
  DropdownMenuContent,    // Dropdown menu content area
  DropdownMenuItem,       // Individual dropdown menu item
  DropdownMenuSeparator,  // Dropdown menu separator
  DropdownMenuTrigger,    // Dropdown menu trigger element
} from "@/components/ui/dropdown-menu"

// Sidebar components for navigation structure
import {
  SidebarGroup,           // Sidebar group container
  SidebarGroupLabel,      // Sidebar group label
  SidebarMenu,            // Sidebar menu container
  SidebarMenuAction,      // Sidebar menu action button
  SidebarMenuButton,      // Sidebar menu button
  SidebarMenuItem,        // Sidebar menu item
  useSidebar,             // Sidebar hook for responsive behavior
} from "@/components/ui/sidebar"

/**
 * NavDocuments Component
 * @description Navigation component for document management with dropdown actions for each document
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of document navigation items
 * @returns {JSX.Element|null} The documents navigation component or null if no items
 * 
 * Document Item Structure:
 * @param {string} item.name - Document name/title
 * @param {string} item.url - Document navigation URL
 * @param {React.Component} item.icon - Document icon component
 * 
 * Features:
 * - Document navigation with active state highlighting
 * - Dropdown actions for each document (Open, Share, Delete)
 * - Responsive positioning for mobile and desktop
 * - Hover effects with green theme colors
 * - Conditional rendering (hidden when no items)
 * - More documents button for additional access
 * - Mobile-optimized dropdown positioning
 * 
 * Document Actions:
 * - Open: Access the document
 * - Share: Share the document with others
 * - Delete: Remove the document (destructive action)
 */
export function NavDocuments({
  items                    // Array of document navigation items
}) {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  // Get sidebar state for responsive behavior
  const { isMobile } = useSidebar()
  
  // Navigation function for programmatic routing
  const navigate = useNavigate();
  
  // Current location for active state management
  const location = useLocation();
  
  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle navigation to specified URL
   * @description Navigates to the specified URL if it's valid
   * @param {string} url - URL to navigate to
   */
  const handleNavigation = (url) => {
    // Only navigate if URL exists and is not a placeholder
    if (url && url !== "#") {
      navigate(url);
    }
  };

  // ============================================================================
  // EARLY RETURN
  // ============================================================================
  
  // Don't render if no items or empty array
  // This prevents rendering empty document sections
  if (!items || items.length === 0) {
    return null;
  }

  return (
    // ============================================================================
    // DOCUMENTS SIDEBAR GROUP
    // ============================================================================
    
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      
      {/* Documents section label */}
      <SidebarGroupLabel>Documents</SidebarGroupLabel>
      
      <SidebarMenu>
        
        {/* ========================================================================
             DOCUMENT ITEMS MAPPING
             ========================================================================
             
             Map through document items with navigation and action dropdowns
             ======================================================================== */}
        
        {items.map((item) => {
          // Determine if current document item is active based on location
          const isActive = location.pathname === item.url;
          
          return (
            <SidebarMenuItem key={item.name}>
              
              {/* ====================================================================
                   DOCUMENT NAVIGATION BUTTON
                   ====================================================================
                   
                   Main document button for navigation
                   ==================================================================== */}
              
              <SidebarMenuButton 
                tooltip={item.name}          // Tooltip for document name
                onClick={() => handleNavigation(item.url)}  // Navigation handler
                className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
              >
                {/* Render document icon if provided */}
                {item.icon && <item.icon />}
                
                {/* Document name */}
                <span>{item.name}</span>
              </SidebarMenuButton>
              
              {/* ====================================================================
                   DOCUMENT ACTIONS DROPDOWN
                   ====================================================================
                   
                   Dropdown menu with document-specific actions
                   ==================================================================== */}
              
              <DropdownMenu>
                {/* Dropdown trigger button */}
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
                    <IconDots />
                    <span className="sr-only">More</span>  {/* Screen reader text */}
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                
                {/* Dropdown content with document actions */}
                <DropdownMenuContent
                  className="w-24 rounded-lg"
                  side={isMobile ? "bottom" : "right"}    // Responsive positioning
                  align={isMobile ? "end" : "start"}>     // Responsive alignment
                  
                  {/* Open document action */}
                  <DropdownMenuItem>
                    <IconFolder />
                    <span>Open</span>
                  </DropdownMenuItem>
                  
                  {/* Share document action */}
                  <DropdownMenuItem>
                    <IconShare3 />
                    <span>Share</span>
                  </DropdownMenuItem>
                  
                  {/* Separator between share and delete */}
                  <DropdownMenuSeparator />
                  
                  {/* Delete document action (destructive) */}
                  <DropdownMenuItem variant="destructive">
                    <IconTrash />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          );
        })}
        
        {/* ========================================================================
             MORE DOCUMENTS BUTTON
             ========================================================================
             
             Additional access button for more documents
             ======================================================================== */}
        
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconDots className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
