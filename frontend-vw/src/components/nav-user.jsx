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

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

/**
 * NavUser Component
 * 
 * Displays user information and provides a dropdown menu with user actions.
 * Includes logout functionality with confirmation dialog.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.user - User object with name, email, and avatar
 */
export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  // Compute initials from user name or email
  const getUserInitials = () => {
    if (user && typeof user.name === "string" && user.name.trim().length > 0) {
      const parts = user.name.trim().split(/\s+/)
      const firstInitial = parts[0]?.[0] || ""
      const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : ""
      const initials = `${firstInitial}${lastInitial}` || firstInitial
      return (initials || "U").toUpperCase()
    }
    if (user && typeof user.email === "string" && user.email.length > 0) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  /**
   * Handle logout confirmation
   * Signs out the user, shows success message, and navigates to landing page
   */
  const handleLogout = () => {
    // Sign out using the useAuth hook
    signOut()
    
          // Show success toast
      toast.success("Signed out successfully!")
    
    // Navigate to landing page
    navigate("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-gray-200 text-gray-700 font-medium text-sm">{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg bg-gray-200 text-gray-700 font-medium text-sm">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer">
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            
            {/* Logout with Alert Dialog Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                  <IconLogout />
                  Log out
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will be signed out of your account and redirected to the login page.
                    Any unsaved work may be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
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
}
