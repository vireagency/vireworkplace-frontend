/**
 * @fileoverview Secondary Navigation Component for Vire Workplace HR App
 * @description Secondary navigation menu with special HR settings popover functionality
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Client-side directive for Next.js compatibility
"use client";

// React core library for component creation
import * as React from "react"

// ============================================================================
// ROUTING IMPORTS
// ============================================================================

// React Router hooks for navigation and location
import { useNavigate, useLocation } from "react-router-dom";

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Popover components for dropdown functionality
import {
  Popover,               // Popover container
  PopoverContent,        // Popover content area
  PopoverTrigger,        // Popover trigger element
} from "@/components/ui/popover";

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for navigation items
import { IconUser, IconLock, IconBell } from "@tabler/icons-react";

// ============================================================================
// SIDEBAR COMPONENT IMPORTS
// ============================================================================

// Sidebar components for navigation structure
import {
  SidebarGroup,           // Sidebar group container
  SidebarGroupContent,    // Sidebar group content area
  SidebarMenu,            // Sidebar menu container
  SidebarMenuButton,      // Sidebar menu button
  SidebarMenuItem,        // Sidebar menu item
} from "@/components/ui/sidebar"

/**
 * NavSecondary Component
 * @description Secondary navigation component with special handling for HR settings
 * @component
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of secondary navigation items
 * @param {...any} props - Additional props passed to SidebarGroup
 * @returns {JSX.Element} The secondary navigation component
 * 
 * Navigation Item Structure:
 * @param {string} item.title - Navigation item title
 * @param {string} item.url - Navigation URL
 * @param {React.Component} item.icon - Navigation item icon
 * 
 * Special Features:
 * - HR Settings popover with Profile, Password, and Notification options
 * - Active state highlighting for current route
 * - Hover effects with green theme colors
 * - Responsive navigation handling
 * - Conditional rendering based on user role and location
 * 
 * HR Settings Popover Options:
 * - Profile: Navigate to HR profile settings
 * - Password: Navigate to HR password settings
 * - Notification: Navigate to HR notification settings
 */
export function NavSecondary({
  items,                   // Array of secondary navigation items
  ...props                 // Additional props for SidebarGroup
}) {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
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
  
  return (
    // ============================================================================
    // SIDEBAR GROUP CONTAINER
    // ============================================================================
    
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          
          {/* ========================================================================
               NAVIGATION ITEMS MAPPING
               ========================================================================
               
               Map through navigation items with special handling for HR settings
               ======================================================================== */}
          
          {items.map((item) => {
            // Determine if current item is active based on location
            const isActive = location.pathname === item.url;
            
            // Check if user is in HR dashboard section
            const isHR = location.pathname.startsWith('/human-resource-manager');
            
            // Check if current item is the Settings item
            const isSettings = item.title === 'Settings';

            // ========================================================================
            // HR SETTINGS POPOVER
            // ========================================================================
            
            // Custom HR Settings popover for enhanced navigation
            if (isHR && isSettings) {
              return (
                <SidebarMenuItem key={item.title}>
                  <Popover>
                    {/* Popover trigger button */}
                    <PopoverTrigger asChild>
                      <SidebarMenuButton 
                        tooltip={item.title}
                        className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                      >
                        {/* Render icon if provided */}
                        {item.icon && <item.icon />}
                        
                        {/* Navigation item title */}
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </PopoverTrigger>
                    
                    {/* Popover content with HR settings options */}
                    <PopoverContent align="start" side="right" className="w-36 p-1">
                      <div>
                        
                        {/* ================================================================
                             PROFILE SETTINGS BUTTON
                             ================================================================
                             
                             Navigate to HR profile settings page
                             ================================================================ */}
                        
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/profile')}
                          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer flex items-center space-x-2 ${
                            location.pathname === '/human-resource-manager/settings/profile' 
                              ? 'bg-green-500 text-white hover:bg-green-500'  // Active state
                              : 'hover:bg-green-500 hover:text-white'         // Hover state
                          }`}
                        >
                          <IconUser size={16} />
                          <span>Profile</span>
                        </button>
                        
                        {/* Separator between profile and password */}
                        <div className="h-px bg-gray-200 my-1"></div>
                        
                        {/* ================================================================
                             PASSWORD SETTINGS BUTTON
                             ================================================================
                             
                             Navigate to HR password settings page
                             ================================================================ */}
                        
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/password')}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white rounded-md transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <IconLock size={16} />
                          <span>Password</span>
                        </button>
                        
                        {/* Separator between password and notifications */}
                        <div className="h-px bg-gray-200 my-1"></div>
                        
                        {/* ================================================================
                             NOTIFICATION SETTINGS BUTTON
                             ================================================================
                             
                             Navigate to HR notification settings page
                             ================================================================ */}
                        
                        <button 
                          onClick={() => navigate('/human-resource-manager/settings/notifications')}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-green-500 hover:text-white rounded-md transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          <IconBell size={16} />
                          <span>Notification</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </SidebarMenuItem>
              );
            }

            // ========================================================================
            // DEFAULT SECONDARY NAVIGATION ITEM
            // ========================================================================
            
            // Standard navigation item without special handling
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  tooltip={item.title}          // Tooltip for navigation item
                  onClick={() => handleNavigation(item.url)}  // Navigation handler
                  className={`cursor-pointer hover:text-[#35983D] hover:bg-green-500/10 ${isActive ? "text-[#00DB12]" : ""}`}
                >
                  {/* Render icon if provided */}
                  {item.icon && <item.icon />}
                  
                  {/* Navigation item title */}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
