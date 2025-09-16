/**
 * @fileoverview Search Results Component
 * @description Displays global search results in a dropdown format
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// UI COMPONENT IMPORTS
// ============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// ============================================================================
// ICON IMPORTS
// ============================================================================

import { 
  Search, 
  User, 
  CheckSquare, 
  TrendingUp, 
  FileText,
  Users,
  Target,
  Calendar
} from "lucide-react"

// ============================================================================
// SEARCH RESULTS COMPONENT
// ============================================================================

/**
 * SearchResults Component
 * @description Displays search results in organized sections
 * @param {Object} props - Component props
 * @param {Object} props.searchData - Search results data
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.query - Search query
 * @param {Function} props.onResultClick - Callback when a result is clicked
 * @returns {JSX.Element} Search results component
 */
export function SearchResults({ searchData, isLoading, query, onResultClick }) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
        <div className="p-4 text-center text-gray-500">
          <Search className="h-6 w-6 mx-auto mb-2 animate-spin" />
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  // Show no results state
  if (!searchData || (!searchData.tasks?.length && !searchData.users?.length && !searchData.performances?.length)) {
    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="p-4 text-center text-gray-500">
          <Search className="h-6 w-6 mx-auto mb-2" />
          <p>No results found for "{query}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            Results for "{query}"
          </span>
        </div>

        {/* Tasks Section */}
        {searchData.tasks?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-800">Tasks</h3>
              <Badge variant="secondary" className="text-xs">
                {searchData.tasks.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {searchData.tasks.slice(0, 3).map((task, index) => (
                <div
                  key={task._id || index}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border-l-2 border-blue-200"
                  onClick={() => onResultClick?.('task', task)}
                >
                  <p className="text-sm font-medium text-gray-900">{task.title || task.taskName || task.name}</p>
                  <p className="text-xs text-gray-500">{task.description || task.status || task.priority}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Section */}
        {searchData.users?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-green-500" />
              <h3 className="text-sm font-semibold text-gray-800">Users</h3>
              <Badge variant="secondary" className="text-xs">
                {searchData.users.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {searchData.users.slice(0, 3).map((user, index) => (
                <div
                  key={user._id || index}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border-l-2 border-green-200"
                  onClick={() => onResultClick?.('user', user)}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user.role || user.department || user.email}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Section */}
        {searchData.performances?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-800">Performance</h3>
              <Badge variant="secondary" className="text-xs">
                {searchData.performances.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {searchData.performances.slice(0, 3).map((performance, index) => (
                <div
                  key={performance._id || index}
                  className="p-2 hover:bg-gray-50 rounded cursor-pointer border-l-2 border-purple-200"
                  onClick={() => onResultClick?.('performance', performance)}
                >
                  <p className="text-sm font-medium text-gray-900">
                    {performance.goalTitle || performance.title || performance.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {performance.category || performance.department || performance.status || performance.goalType}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show more results if there are more than 3 in any category */}
        {(searchData.tasks?.length > 3 || searchData.users?.length > 3 || searchData.performances?.length > 3) && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Showing top 3 results per category. Refine your search for more specific results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
