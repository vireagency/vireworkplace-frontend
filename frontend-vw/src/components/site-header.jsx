/**
 * @fileoverview Site Header Component for Vire Workplace HR App
 * @description Top navigation header with search, notifications, user avatar, and sidebar toggle
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Button component for interactive elements
import { Button } from "@/components/ui/button"

// Separator component for visual dividers
import { Separator } from "@/components/ui/separator"

// Sidebar trigger for mobile navigation
import { SidebarTrigger } from "@/components/ui/sidebar"

// Avatar components for user representation
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Input component for search functionality
import { Input } from "@/components/ui/input"

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Search and notification icons from Lucide React
import { Search, Bell } from "lucide-react"

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Custom authentication hook for user context
import { useAuth } from "@/hooks/useAuth"

/**
 * SiteHeader Component
 * @description Main site header with navigation controls, search, and user interface
 * @component
 * @returns {JSX.Element} The site header component
 * 
 * Features:
 * - Sidebar toggle for mobile navigation
 * - Global search functionality
 * - Notification bell with hover effects
 * - User avatar with initials display
 * - Responsive design for different screen sizes
 */
export function SiteHeader() {
  // Get current authenticated user from auth context
  const { user } = useAuth();
  
  /**
   * Generate user initials from first and last name
   * @description Creates a two-letter abbreviation for the user's name
   * @returns {string} Uppercase initials or fallback "U" if no name available
   * 
   * @example
   * getUserInitials() // Returns "JD" for "John Doe"
   * getUserInitials() // Returns "U" if no user or name data
   */
  const getUserInitials = () => {
    // Check if user exists and has both first and last names
    if (user && user.firstName && user.lastName) {
      // Extract first character of first and last name, convert to uppercase
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    // Default fallback for users without names or unauthenticated users
    return "U";
  };

  return (
    // ============================================================================
    // HEADER CONTAINER
    // ============================================================================
    
    <header
      // Dynamic height based on CSS custom property with responsive adjustments
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
    >
      {/* Main header content container */}
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        
        {/* ========================================================================
             LEFT SECTION - SIDEBAR TOGGLE
             ======================================================================== */}
        
        {/* Sidebar trigger button for mobile navigation */}
        <SidebarTrigger 
          className="-ml-1 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer" 
        />
        
        {/* Vertical separator between sidebar trigger and search */}
        <Separator 
          orientation="vertical" 
          className="mx-2 data-[orientation=vertical]:h-4" 
        />
        
        {/* ========================================================================
             CENTER SECTION - SEARCH FUNCTIONALITY
             ======================================================================== */}
        
        {/* Search input container with relative positioning */}
        <div className="relative flex-1 max-w-md">
          {/* Search icon positioned absolutely within the input */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          
          {/* Search input field with left padding for icon */}
          <Input
            type="text"
            placeholder="Type to search"
            className="pl-10 bg-transparent border-gray-200 focus:bg-white focus:border-gray-300"
          />
        </div>
        
        {/* ========================================================================
             RIGHT SECTION - USER INTERFACE ELEMENTS
             ======================================================================== */}
        
        {/* Right-aligned container for notifications and user avatar */}
        <div className="ml-auto flex items-center gap-4">
          
          {/* Notification Bell Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer"
          >
            {/* Bell icon for notifications */}
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* User Avatar with Initials */}
          <Avatar className="h-8 w-8 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer">
            {/* Avatar fallback showing user initials */}
            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm hover:bg-green-500/10">
              {/* Display user initials or fallback */}
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
