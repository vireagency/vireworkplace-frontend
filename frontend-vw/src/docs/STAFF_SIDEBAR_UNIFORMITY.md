# Staff Sidebar Uniformity Implementation

## Overview

This document describes the implementation of a uniform sidebar behavior across all staff pages in the Vire Workplace HR App. The solution ensures that the sidebar does not reload or remount when navigating between pages, and that badge counts remain stable and consistent.

## Problem Solved

Previously, each staff page was:

- Creating its own instance of the sidebar
- Fetching counts independently
- Causing the sidebar to remount on each navigation
- Showing flickering/disappearing badge numbers
- Providing inconsistent user experience

## Solution Architecture

### 1. Shared Context (`StaffSidebarContext`)

**File**: `src/contexts/StaffSidebarContext.jsx`

- Provides centralized state management for sidebar counts
- Fetches counts once and caches them for 5 minutes
- Uses React Context API for global state sharing
- Implements reducer pattern for predictable state updates
- Handles API calls with proper error handling and loading states

**Key Features**:

- Automatic count fetching on initialization
- Periodic refresh every 5 minutes
- Manual refresh capability
- Individual count update functions
- Error handling and loading states

### 2. Updated Sidebar Component (`StaffSidebar`)

**File**: `src/components/StaffSidebar.jsx`

- Now uses shared context instead of props for counts
- Memoized with `React.memo` to prevent unnecessary re-renders
- Simplified props interface (removed `itemCounts` and `isLoading`)
- Maintains all existing functionality and styling

### 3. Updated Layout Component (`StaffDashboardLayout`)

**File**: `src/components/dashboard/StaffDashboardLayout.jsx`

- Wraps content with `StaffSidebarProvider`
- Memoized to prevent unnecessary re-renders
- Simplified props interface
- Maintains all existing layout functionality

### 4. Updated Hook (`useStandardizedSidebar`)

**File**: `src/hooks/useStandardizedSidebar.js`

- Now uses shared context instead of individual API calls
- Provides access to update and refresh functions
- Maintains backward compatibility
- Simplified interface

### 5. Count Update Hook (`useSidebarCountUpdate`)

**File**: `src/hooks/useSidebarCountUpdate.js`

- Provides easy access to count update functions
- Includes helper functions for common operations
- Allows pages to update counts when performing actions

## Implementation Details

### Context Provider Structure

```javascript
const StaffSidebarProvider = ({ children }) => {
  // State management with reducer
  const [state, dispatch] = useReducer(sidebarReducer, initialState);

  // API functions
  const fetchAllCounts = useCallback(async (force = false) => {
    // Fetch counts from API with caching logic
  }, []);

  // Context value
  const contextValue = {
    counts: state.counts,
    loading: state.loading,
    error: state.error,
    updateCount,
    refreshCounts,
    fetchAllCounts,
  };

  return (
    <StaffSidebarContext.Provider value={contextValue}>
      {children}
    </StaffSidebarContext.Provider>
  );
};
```

### Count Fetching Strategy

1. **Initial Load**: Counts are fetched when the context is first initialized
2. **Caching**: Counts are cached for 5 minutes to prevent excessive API calls
3. **Periodic Refresh**: Automatic refresh every 5 minutes
4. **Manual Refresh**: Pages can trigger manual refresh when needed
5. **Individual Updates**: Pages can update specific counts after performing actions

### API Endpoints Used

- **Tasks**: `/api/v1/tasks`
- **Evaluations**: `/api/v1/dashboard/staff/evaluations/reviews`
- **Attendance**: `/api/v1/attendance/status`
- **Messages**: `/api/v1/notifications`

## Usage Guide

### For New Staff Pages

1. **Import the layout**:

```javascript
import StaffDashboardLayout from "@/components/dashboard/StaffDashboardLayout";
import { useStandardizedSidebar } from "@/hooks/useStandardizedSidebar";
```

2. **Use the hook**:

```javascript
const { sidebarConfig } = useStandardizedSidebar();
```

3. **Render with layout**:

```javascript
return (
  <StaffDashboardLayout
    sidebarConfig={sidebarConfig}
    showSectionCards={false}
    showChart={false}
    showDataTable={false}
  >
    {/* Your page content */}
  </StaffDashboardLayout>
);
```

### For Updating Counts

1. **Import the update hook**:

```javascript
import { useSidebarCountUpdate } from "@/hooks/useSidebarCountUpdate";
```

2. **Use update functions**:

```javascript
const { incrementTasksCount, decrementTasksCount, updateTasksCount } =
  useSidebarCountUpdate();

// After adding a task
incrementTasksCount();

// After deleting a task
decrementTasksCount();

// After fetching new tasks
updateTasksCount(tasks.length);
```

### For Manual Refresh

```javascript
const { refreshCounts } = useStandardizedSidebar();

// Trigger manual refresh
refreshCounts();
```

## Benefits

### 1. Performance Improvements

- **No Remounting**: Sidebar stays mounted across navigation
- **Reduced API Calls**: Counts fetched once and cached
- **Memoization**: Components only re-render when necessary
- **Smooth Transitions**: No loading states during navigation

### 2. User Experience Improvements

- **Stable Badges**: Numbers don't disappear/reappear
- **Consistent Behavior**: Same sidebar behavior across all pages
- **Fast Navigation**: No loading delays between pages
- **Real-time Updates**: Counts update when actions are performed

### 3. Developer Experience Improvements

- **Simplified API**: Easier to use and maintain
- **Centralized Logic**: All sidebar logic in one place
- **Type Safety**: Better TypeScript support
- **Debugging**: Easier to debug sidebar issues

## Migration Guide

### For Existing Pages

1. **Remove unused props**:

```javascript
// Before
const { sidebarConfig, itemCounts, isLoading } = useStandardizedSidebar();

// After
const { sidebarConfig } = useStandardizedSidebar();
```

2. **Update layout usage**:

```javascript
// Before
<StaffDashboardLayout
  sidebarConfig={sidebarConfig}
  itemCounts={itemCounts}
  isLoading={isLoading}
  showSectionCards={false}
  showChart={false}
  showDataTable={false}
>

// After
<StaffDashboardLayout
  sidebarConfig={sidebarConfig}
  showSectionCards={false}
  showChart={false}
  showDataTable={false}
>
```

3. **Add count updates where needed**:

```javascript
import { useSidebarCountUpdate } from "@/hooks/useSidebarCountUpdate";

const { incrementTasksCount, decrementTasksCount } = useSidebarCountUpdate();

// After adding a task
const handleAddTask = async (taskData) => {
  // ... existing logic
  incrementTasksCount();
};

// After deleting a task
const handleDeleteTask = async (taskId) => {
  // ... existing logic
  decrementTasksCount();
};
```

## Testing

### Manual Testing Checklist

- [ ] Navigate between all staff pages
- [ ] Verify sidebar doesn't remount
- [ ] Check that badge numbers remain stable
- [ ] Test count updates when performing actions
- [ ] Verify loading states work correctly
- [ ] Test error handling
- [ ] Check periodic refresh functionality

### Automated Testing

The implementation includes:

- Context provider tests
- Hook tests
- Component tests
- Integration tests

## Troubleshooting

### Common Issues

1. **Counts not updating**:

   - Check if the page is wrapped with `StaffSidebarProvider`
   - Verify API endpoints are correct
   - Check network requests in browser dev tools

2. **Sidebar remounting**:

   - Ensure `StaffDashboardLayout` is used consistently
   - Check that the layout component is memoized
   - Verify context provider is at the right level

3. **Performance issues**:
   - Check if components are properly memoized
   - Verify API calls are not being made excessively
   - Check for memory leaks in useEffect hooks

### Debug Tools

1. **React DevTools**: Use to inspect context state
2. **Network Tab**: Monitor API calls
3. **Console Logs**: Check for error messages
4. **Performance Tab**: Monitor re-renders

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live count updates
2. **Offline Support**: Cache counts for offline usage
3. **Analytics**: Track sidebar usage patterns
4. **Customization**: Allow users to customize sidebar items
5. **Accessibility**: Enhanced keyboard navigation and screen reader support

## Conclusion

This implementation provides a robust, performant, and user-friendly sidebar experience across all staff pages. The shared context approach ensures consistency while the memoization and caching strategies provide excellent performance. The modular design makes it easy to maintain and extend in the future.
