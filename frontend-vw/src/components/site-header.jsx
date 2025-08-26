import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, Bell } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export function SiteHeader() {
  const { user } = useAuth();
  
  // Get user initials from first and last name
  const getUserInitials = () => {
    if (user && user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return "U"; // Default fallback
  };

  return (
    <header
      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Type to search"
            className="pl-10 bg-transparent border-gray-200 focus:bg-white focus:border-gray-300"
          />
        </div>
        
        <div className="ml-auto flex items-center gap-4">
          {/* Notification Icon */}
          <Button variant="ghost" size="sm" className="relative p-2 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* User Avatar */}
          <Avatar className="h-8 w-8 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer">
            <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm hover:bg-green-500/10">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
