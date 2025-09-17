/**
 * @fileoverview Navigation User Component for Vire Workplace HR App
 * @description Displays user information in the sidebar with a dropdown menu for user actions
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Navigation User Component
 * 
 * Displays user information in the sidebar with a dropdown menu for user actions.
 * Includes account management options and logout functionality with confirmation dialog.
 * 
 * Features:
 * - User avatar and information display
 * - Dropdown menu with user actions
 * - Logout confirmation dialog
 * - Responsive design for mobile and desktop
 * - Toast notifications for user feedback
 * 
 * Props:
 * @param {Object} user - User object containing name, email, and avatar
 */

// ============================================================================
// REACT IMPORTS
// ============================================================================

// React core library for component creation and memoization
import React from "react"

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Tabler icons for user interface elements
import {
  IconCreditCard,         // Credit card icon for billing
  IconDotsVertical,       // Vertical dots for dropdown trigger
  IconLogout,             // Logout icon for sign out
  IconNotification,       // Notification icon for notifications
  IconUserCircle,         // User circle icon for account
} from "@tabler/icons-react"

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

// Avatar components for user profile display
import {
  Avatar,                 // Main avatar container
  AvatarFallback,         // Avatar fallback for missing images
  AvatarImage,            // Avatar image component
} from "@/components/ui/avatar"

// Dropdown menu components for user actions
import {
  DropdownMenu,           // Dropdown menu container
  DropdownMenuContent,    // Dropdown menu content area
  DropdownMenuGroup,      // Dropdown menu group container
  DropdownMenuItem,       // Individual dropdown menu item
  DropdownMenuLabel,      // Dropdown menu label
  DropdownMenuSeparator,  // Dropdown menu separator
  DropdownMenuTrigger,    // Dropdown menu trigger button
} from "@/components/ui/dropdown-menu"

// Alert dialog components for logout confirmation
import {
  AlertDialog,            // Alert dialog container
  AlertDialogAction,      // Alert dialog action button
  AlertDialogCancel,      // Alert dialog cancel button
  AlertDialogContent,     // Alert dialog content area
  AlertDialogDescription, // Alert dialog description text
  AlertDialogFooter,      // Alert dialog footer area
  AlertDialogHeader,      // Alert dialog header area
  AlertDialogTitle,       // Alert dialog title
  AlertDialogTrigger,     // Alert dialog trigger element
} from "@/components/ui/alert-dialog"

// Sidebar components for navigation structure
import {
  SidebarMenu,            // Sidebar menu container
  SidebarMenuButton,      // Sidebar menu button
  SidebarMenuItem,        // Sidebar menu item
  useSidebar,             // Sidebar hook for responsive behavior
} from "@/components/ui/sidebar"

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Custom authentication hook for user management
import { useAuth } from "@/hooks/useAuth"

// React Router hook for navigation
import { useNavigate } from "react-router-dom"

// Toast notification library for user feedback
import { toast } from "sonner"

/**
 * NavUser Component
 * @description Displays user information and provides a dropdown menu with user actions
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name, email, and avatar
 * @param {string} props.user.name - User's full name
 * @param {string} props.user.email - User's email address
 * @param {string} props.user.avatar - User's avatar image URL
 * @returns {JSX.Element} The navigation user component
 * 
 * Features:
 * - User avatar with fallback initials
 * - Dropdown menu with account options
 * - Logout confirmation dialog
 * - Responsive positioning for mobile/desktop
 * - Toast notifications for user feedback
 * - Account, billing, and notification options
 */
export const NavUser = React.memo(function NavUser({
  user                      // User object containing profile information
}) {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  // Get sidebar state for responsive behavior
  const { isMobile } = useSidebar()
  
  // Get signOut function from authentication context
  const { signOut } = useAuth()
  
  // Navigation function for redirecting after logout
  const navigate = useNavigate()

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Compute user initials from name or email
   * @description Generates initials from user's name or falls back to email first letter
   * @returns {string} Uppercase initials or fallback "U"
   * 
   * Logic:
   * 1. Try to extract initials from full name (first + last initial)
   * 2. Fall back to first letter of email if name is not available
   * 3. Default to "U" if neither is available
   */
  const getUserInitials = () => {
    // Try to get initials from user's full name
    if (user && typeof user.name === "string" && user.name.trim().length > 0) {
      const parts = user.name.trim().split(/\s+/)                    // Split name by whitespace
      const firstInitial = parts[0]?.[0] || ""                      // First name initial
      const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""  // Last name initial
      const initials = `${firstInitial}${lastInitial}` || firstInitial  // Combine initials
      return (initials || "U").toUpperCase()                        // Convert to uppercase
    }
    
    // Fall back to email first letter if name is not available
    if (user && typeof user.email === "string" && user.email.length > 0) {
      return user.email[0].toUpperCase()                            // First letter of email
    }
    
    // Default fallback
    return "U"
  }

  /**
   * Handle logout confirmation and execution
   * @description Signs out the user, shows success message, and navigates to landing page
   * @returns {void}
   */
  const handleLogout = () => {
    // Sign out using the useAuth hook
    signOut()
    
    // Show success toast notification
    toast.success("Signed out successfully!")
    
    // Navigate to landing page
    navigate("/")
  }

  return (
    // ============================================================================
    // SIDEBAR MENU CONTAINER
    // ============================================================================
    
    <SidebarMenu>
      <SidebarMenuItem>
        
        {/* ========================================================================
             DROPDOWN MENU CONTAINER
             ========================================================================
             
             User profile dropdown with account management options
             ======================================================================== */}
        
        <DropdownMenu>
          
          {/* ====================================================================
               DROPDOWN TRIGGER
               ====================================================================
               
               User profile button that opens the dropdown menu
               ==================================================================== */}
          
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"                                                           // Large button size
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              
              {/* User avatar with fallback */}
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage 
                  src={user?.avatar || ''} 
                  alt={user?.name || 'User'} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <AvatarFallback className="rounded-lg bg-gray-200 text-gray-700 font-medium text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              
              {/* User information display */}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>          {/* User's name */}
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}                                                     {/* User's email */}
                </span>
              </div>
              
              {/* Dropdown indicator icon */}
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          {/* ====================================================================
               DROPDOWN MENU CONTENT
               ====================================================================
               
               Dropdown menu with user account options
               ==================================================================== */}
          
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}                    // Responsive positioning
            align="end"                                             // Align to end of trigger
            sideOffset={4}>                                         
            
            {/* ================================================================
                 USER PROFILE HEADER
                 ================================================================
                 
                 User information display in dropdown header
                 ================================================================ */}
            
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                {/* User avatar in dropdown */}
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage 
                    src={user?.avatar || ''} 
                    alt={user?.name || 'User'} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <AvatarFallback className="rounded-lg bg-gray-200 text-gray-700 font-medium text-sm">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                
                {/* User information in dropdown */}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            
            {/* Separator between header and menu items */}
            <DropdownMenuSeparator />
            
            {/* ================================================================
                 ACCOUNT MANAGEMENT OPTIONS
                 ================================================================
                 
                 Menu items for account, billing, and notifications
                 ================================================================ */}
            
            <DropdownMenuGroup>
              {/* Account management option */}
              <DropdownMenuItem className="cursor-pointer">
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              
              {/* Billing management option */}
              <DropdownMenuItem className="cursor-pointer">
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              
              {/* Notification settings option */}
              <DropdownMenuItem className="cursor-pointer">
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            
            {/* Separator between account options and logout */}
            <DropdownMenuSeparator />
            
            {/* ================================================================
                 LOGOUT SECTION
                 ================================================================
                 
                 Logout option with confirmation dialog
                 ================================================================ */}
            
            {/* Logout with Alert Dialog Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </AlertDialogTrigger>
              
              {/* Logout confirmation dialog */}
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your account and redirected to the login page.
                    Any unsaved work may be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                
                <AlertDialogFooter>
                  {/* Cancel button */}
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  
                  {/* Confirm logout button */}
                  <AlertDialogAction 
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
                  >
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
});
