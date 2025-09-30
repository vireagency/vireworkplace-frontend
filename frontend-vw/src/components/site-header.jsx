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
import { Button } from "@/components/ui/button";

// Separator component for visual dividers
import { Separator } from "@/components/ui/separator";

// Sidebar trigger for mobile navigation
import { SidebarTrigger } from "@/components/ui/sidebar";

// Avatar components for user representation
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Input component for search functionality
import { Input } from "@/components/ui/input";

// ============================================================================
// ICON IMPORTS
// ============================================================================

// Search and notification icons from Lucide React
import { Search, Bell, X, Check, Trash2, Eye } from "lucide-react";

// Tabler icons for dropdown menu
import { IconUser, IconSettings, IconLogout } from "@tabler/icons-react";

// ============================================================================
// HOOK IMPORTS
// ============================================================================

// Custom authentication hook for user context
import { useAuth } from "@/hooks/useAuth";
import {
  getUserAvatarUrl,
  getSidebarAvatarUrl,
  getUserInitials as getInitials,
} from "@/utils/avatarUtils";

// React Router for navigation
import { useNavigate } from "react-router-dom";

// Notification context
import { useNotifications } from "@/contexts/NotificationProvider";

// React hooks for state management
import { useState, useEffect, useRef } from "react";

// ============================================================================
// API SERVICE IMPORTS
// ============================================================================

// Global search API service
import { globalSearchApi } from "@/services/globalSearchApi";

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================

// Search results component
import { SearchResults } from "@/components/search/SearchResults";

// Dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Alert dialog components
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
} from "@/components/ui/alert-dialog";

// ============================================================================
// UTILITY IMPORTS
// ============================================================================

// Toast notifications
import { toast } from "sonner";

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
  const { user, accessToken, signOut } = useAuth();

  // Navigation hook
  const navigate = useNavigate();

  // Get notification context
  const {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    isConnected,
    isLoading: notificationsLoading,
    error: notificationsError,
  } = useNotifications();

  // ============================================================================
  // SEARCH STATE MANAGEMENT
  // ============================================================================

  // Search input value
  const [searchQuery, setSearchQuery] = useState("");

  // Search results data
  const [searchResults, setSearchResults] = useState(null);

  // Loading state for search
  const [isSearching, setIsSearching] = useState(false);

  // Search input ref for focus management
  const searchInputRef = useRef(null);

  // Search results container ref
  const searchResultsRef = useRef(null);

  // ============================================================================
  // NOTIFICATION STATE MANAGEMENT
  // ============================================================================

  // Notification dropdown visibility
  const [showNotifications, setShowNotifications] = useState(false);

  // Notification dropdown ref
  const notificationRef = useRef(null);

  // ============================================================================
  // USER PROFILE FUNCTIONALITY
  // ============================================================================

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  // ============================================================================
  // NOTIFICATION FUNCTIONALITY
  // ============================================================================

  /**
   * Handle notification bell click
   */
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  /**
   * Handle mark as read
   * @param {string} id - Notification ID
   */
  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  /**
   * Handle delete notification
   * @param {string} id - Notification ID
   */
  const handleDeleteNotification = async (id) => {
    await deleteNotification(id);
  };

  // Check if user is authenticated (notifications available for all authenticated users)
  const isAuthenticated = !!user && !!accessToken;

  /**
   * Format notification date
   * @param {string} dateString - Date string
   * @returns {string} Formatted date
   */
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  /**
   * Get notification icon based on type
   * @param {Object} notification - Notification object
   * @returns {JSX.Element} Icon component
   */
  const getNotificationIcon = (notification) => {
    const title = notification.title?.toLowerCase() || "";
    const message = notification.message?.toLowerCase() || "";

    if (title.includes("evaluation") || message.includes("evaluation")) {
      return (
        <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      );
    } else if (
      title.includes("performance") ||
      message.includes("performance")
    ) {
      return (
        <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
          <Eye className="w-4 h-4 text-orange-600" />
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
          <Bell className="w-4 h-4 text-blue-600" />
        </div>
      );
    }
  };

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // ============================================================================
  // SEARCH FUNCTIONALITY
  // ============================================================================

  /**
   * Perform global search
   * @param {string} query - Search query
   */
  const performSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults(null);
      return;
    }

    if (!accessToken) {
      toast.error("Authentication required for search");
      return;
    }

    setIsSearching(true);

    try {
      console.log("Performing global search with query:", query);
      const result = await globalSearchApi.search(query.trim(), accessToken);

      if (result.success) {
        console.log("Search results received:", result.data);
        // The API returns { success: true, message: "...", data: { tasks, users, performances } }
        const searchData = result.data.data || result.data;
        console.log("Search data structure:", searchData);
        console.log("Tasks found:", searchData.tasks?.length || 0);
        console.log("Users found:", searchData.users?.length || 0);
        console.log(
          "Performances found:",
          searchData.performances?.length || 0
        );

        setSearchResults(searchData);

        const totalResults =
          (searchData.tasks?.length || 0) +
          (searchData.users?.length || 0) +
          (searchData.performances?.length || 0);
        if (totalResults > 0) {
          toast.success(`Found ${totalResults} results for "${query}"`);
        } else {
          toast.info(`No results found for "${query}"`);
        }
      } else {
        console.error("Search failed:", result.error);
        toast.error(result.error || "Search failed");
        setSearchResults(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed. Please try again.");
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Handle search input change with debouncing
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        performSearch(searchQuery);
      } else {
        setSearchResults(null);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, accessToken]);

  /**
   * Handle search result click
   * @param {string} type - Result type (task, user, performance)
   * @param {Object} data - Result data
   */
  const handleResultClick = (type, data) => {
    console.log("Search result clicked:", { type, data });

    // Close search results
    setSearchResults(null);
    setSearchQuery("");

    // Navigate based on result type
    switch (type) {
      case "task":
        toast.info(`Opening task: ${data.title || data.name}`);
        // TODO: Navigate to task details
        break;
      case "user":
        toast.info(`Opening user: ${data.firstName} ${data.lastName}`);
        // TODO: Navigate to user profile
        break;
      case "performance":
        toast.info(`Opening performance: ${data.goalTitle || data.title}`);
        // TODO: Navigate to performance details
        break;
      default:
        toast.info("Result clicked");
    }
  };

  /**
   * Handle click outside search results to close them
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchResultsRef.current &&
        !searchResultsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setSearchResults(null);
      }

      // Close notification dropdown
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        !event.target.closest("[data-notification-bell]")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    return getInitials(user);
  };

  // Debug logging for user data
  useEffect(() => {
    if (user) {
      console.log("User data in site-header:", user);
      console.log("Avatar URL:", getSidebarAvatarUrl(user));
      console.log("User initials:", getUserInitials());
    }
  }, [user]);

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
        <SidebarTrigger className="-ml-1 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer" />

        {/* Vertical separator between sidebar trigger and search */}
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* ========================================================================
             CENTER SECTION - SEARCH FUNCTIONALITY
             ======================================================================== */}

        {/* Search input container with relative positioning */}
        <div className="relative flex-1 max-w-md" ref={searchResultsRef}>
          {/* Search icon positioned absolutely within the input */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />

          {/* Search input field with left padding for icon */}
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks, users, performance..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-transparent border-gray-200 focus:bg-white focus:border-gray-300"
            onFocus={() => {
              if (searchQuery.trim().length > 0 && searchResults) {
                // Keep results visible when focusing
              }
            }}
          />

          {/* Search Results Dropdown */}
          {(searchQuery.trim().length > 0 || searchResults) && (
            <SearchResults
              searchData={searchResults}
              isLoading={isSearching}
              query={searchQuery}
              onResultClick={handleResultClick}
            />
          )}
        </div>

        {/* ========================================================================
             RIGHT SECTION - USER INTERFACE ELEMENTS
             ======================================================================== */}

        {/* Right-aligned container for notifications and user avatar */}
        <div className="ml-auto flex items-center gap-4">
          {/* Notification Bell Button - All Authenticated Users */}
          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <Button
                variant="ghost"
                size="sm"
                className="relative p-2 hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer"
                onClick={handleNotificationClick}
                data-notification-bell
              >
                {/* Bell icon for notifications */}
                <Bell className="h-5 w-5" />

                {/* Connection status indicator */}
                {!isConnected && (
                  <div
                    className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full"
                    title="Disconnected - using fallback polling"
                  />
                )}

                {/* Unread count badge */}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {/* Header */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">
                        {notifications.length} total, {unreadCount} unread
                      </p>
                      <button
                        onClick={handleMarkAllAsRead}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        Mark all read
                      </button>
                    </div>

                    {/* New badge */}
                    {unreadCount > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {unreadCount} new
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification._id || notification.id}
                          className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            {/* Notification Icon */}
                            {getNotificationIcon(notification)}

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  {/* Unread indicator */}
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mb-1"></div>
                                  )}

                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {notification.title || "Notification"}
                                  </h4>

                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {notification.message || "No message"}
                                  </p>

                                  <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-gray-500">
                                      {formatNotificationDate(
                                        notification.createdAt
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center gap-1">
                                  {!notification.isRead && (
                                    <button
                                      onClick={() =>
                                        handleMarkAsRead(
                                          notification._id || notification.id
                                        )
                                      }
                                      className="text-gray-400 hover:text-green-600 transition-colors p-1 cursor-pointer"
                                      title="Mark as read"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() =>
                                      handleDeleteNotification(
                                        notification._id || notification.id
                                      )
                                    }
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                                    title="Delete notification"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => {
                          setShowNotifications(false);
                          // Navigate to full notifications page based on user role
                          const role = user?.role?.toLowerCase();
                          if (role === "staff") {
                            navigate("/staff/messages");
                          } else if (
                            role === "hr" ||
                            role === "human resource manager"
                          ) {
                            navigate("/human-resource-manager/messages");
                          } else if (role === "admin") {
                            navigate("/admin/messages");
                          } else {
                            navigate("/staff/messages");
                          }
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors cursor-pointer"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile Dropdown */}
          <DropdownMenu
            onOpenChange={(open) =>
              console.log("Site header dropdown menu open:", open)
            }
          >
            <DropdownMenuTrigger asChild>
              <Avatar
                key={
                  user?.profileImagePublicId ||
                  user?.profileImage ||
                  user?.avatar ||
                  "default"
                }
                className="h-8 w-8 rounded-full overflow-hidden hover:text-[#35983D] hover:bg-green-500/10 cursor-pointer"
              >
                <AvatarImage
                  src={getSidebarAvatarUrl(user) || "/staff.png"}
                  alt={user ? `${user.firstName} ${user.lastName}` : "User"}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
                <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm hover:bg-green-500/10 rounded-full">
                  {/* Display user initials or fallback */}
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* User Profile Header */}
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                      src={getSidebarAvatarUrl(user) || "/staff.png"}
                      alt={user ? `${user.firstName} ${user.lastName}` : "User"}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-700 font-medium text-sm rounded-full">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user ? `${user.firstName} ${user.lastName}` : "User"}
                    </span>
                    <span className="text-muted-foreground truncate text-xs">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("View profile clicked, user:", user);

                  // Small delay to ensure dropdown closes properly before navigation
                  setTimeout(() => {
                    // Navigate to profile based on user role
                    const role = user?.role?.toLowerCase();
                    console.log("User role for profile:", role);

                    if (role === "staff") {
                      console.log("Navigating to staff profile");
                      navigate("/staff/settings/profile");
                    } else if (
                      role === "hr" ||
                      role === "human resource manager"
                    ) {
                      console.log("Navigating to HR profile");
                      navigate("/human-resource-manager/settings/profile");
                    } else if (role === "admin") {
                      console.log("Navigating to admin profile");
                      navigate("/admin/settings/profile");
                    } else {
                      console.log("Unknown role, defaulting to staff profile");
                      navigate("/staff/settings/profile");
                    }
                  }, 100);
                }}
              >
                <IconUser className="mr-2 h-4 w-4" />
                View profile
              </DropdownMenuItem>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("Settings clicked, user:", user);

                  // Small delay to ensure dropdown closes properly before navigation
                  setTimeout(() => {
                    // Navigate to settings based on user role
                    const role = user?.role?.toLowerCase();
                    console.log("User role for settings:", role);

                    if (role === "staff") {
                      console.log("Navigating to staff settings");
                      navigate("/staff/settings");
                    } else if (
                      role === "hr" ||
                      role === "human resource manager"
                    ) {
                      console.log("Navigating to HR settings");
                      navigate("/human-resource-manager/settings");
                    } else if (role === "admin") {
                      console.log("Navigating to admin settings");
                      navigate("/admin/settings");
                    } else {
                      console.log("Unknown role, defaulting to staff settings");
                      navigate("/staff/settings");
                    }
                  }, 100);
                }}
              >
                <IconSettings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Logout with Confirmation */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <IconLogout className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to log out?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account and redirected to
                      the login page. Any unsaved work may be lost.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
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
        </div>
      </div>
    </header>
  );
}
