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

// React hooks for state management
import { useState, useEffect, useRef } from "react"

// ============================================================================
// API SERVICE IMPORTS
// ============================================================================

// Global search API service
import { globalSearchApi } from "@/services/globalSearchApi"

// ============================================================================
// COMPONENT IMPORTS
// ============================================================================

// Search results component
import { SearchResults } from "@/components/search/SearchResults"

// ============================================================================
// UTILITY IMPORTS
// ============================================================================

// Toast notifications
import { toast } from "sonner"

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
  const { user, accessToken } = useAuth();
  
  // ============================================================================
  // SEARCH STATE MANAGEMENT
  // ============================================================================
  
  // Search input value
  const [searchQuery, setSearchQuery] = useState('');
  
  // Search results data
  const [searchResults, setSearchResults] = useState(null);
  
  // Loading state for search
  const [isSearching, setIsSearching] = useState(false);
  
  // Search input ref for focus management
  const searchInputRef = useRef(null);
  
  // Search results container ref
  const searchResultsRef = useRef(null);
  
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
      toast.error('Authentication required for search');
      return;
    }
    
    setIsSearching(true);
    
    try {
      console.log('Performing global search with query:', query);
      const result = await globalSearchApi.search(query.trim(), accessToken);
      
      if (result.success) {
        console.log('Search results received:', result.data);
        // The API returns { success: true, message: "...", data: { tasks, users, performances } }
        const searchData = result.data.data || result.data;
        console.log('Search data structure:', searchData);
        console.log('Tasks found:', searchData.tasks?.length || 0);
        console.log('Users found:', searchData.users?.length || 0);
        console.log('Performances found:', searchData.performances?.length || 0);
        
        setSearchResults(searchData);
        
        const totalResults = (searchData.tasks?.length || 0) + (searchData.users?.length || 0) + (searchData.performances?.length || 0);
        if (totalResults > 0) {
          toast.success(`Found ${totalResults} results for "${query}"`);
        } else {
          toast.info(`No results found for "${query}"`);
        }
      } else {
        console.error('Search failed:', result.error);
        toast.error(result.error || 'Search failed');
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
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
    console.log('Search result clicked:', { type, data });
    
    // Close search results
    setSearchResults(null);
    setSearchQuery('');
    
    // Navigate based on result type
    switch (type) {
      case 'task':
        toast.info(`Opening task: ${data.title || data.name}`);
        // TODO: Navigate to task details
        break;
      case 'user':
        toast.info(`Opening user: ${data.firstName} ${data.lastName}`);
        // TODO: Navigate to user profile
        break;
      case 'performance':
        toast.info(`Opening performance: ${data.goalTitle || data.title}`);
        // TODO: Navigate to performance details
        break;
      default:
        toast.info('Result clicked');
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
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
