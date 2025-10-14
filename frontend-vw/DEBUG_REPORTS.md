# Debug Guide: HR Reports Page Not Showing

## Issue

The HR Reports page at `/human-resource-manager/reports` is not displaying.

## Troubleshooting Steps

### 1. Check Browser Console

Open Developer Tools (F12) and check the Console tab for errors:

- Red error messages indicate a problem
- Look for import errors, component crashes, or API errors

### 2. Verify User Authentication & Role

```javascript
// Paste this in your browser console while on any HR page:
console.log("Current User:", localStorage.getItem("user"));
console.log("Access Token:", localStorage.getItem("accessToken"));

// The user object should show: "role": "Human Resource Manager"
```

### 3. Check Network Tab

- Open Developer Tools → Network tab
- Navigate to `/human-resource-manager/reports`
- Look for failed requests (red status codes)
- Check if the reports API endpoint is being called

### 4. Test Component Rendering

Add console logs to verify the component is mounting:

- If you see "HRReportsPage Mounted" in console, component is loading
- If not, there's an import or routing issue

### 5. Common Fixes

#### Fix A: Clear Cache & Reload

```bash
# In browser console:
localStorage.clear()
sessionStorage.clear()
location.reload()
```

Then log in again.

#### Fix B: Check if logged in as HR Manager

- Log out
- Log back in
- Ensure your account has "Human Resource Manager" role
- Try accessing the page again

#### Fix C: Restart Development Server

```bash
# Stop the server (Ctrl+C)
cd vireworkplace/frontend-vw
npm run dev
```

### 6. Verify Route Works

Try accessing other HR pages first:

- `/human-resource-manager/dashboard` - Should work
- `/human-resource-manager/evaluations` - Should work
- `/human-resource-manager/reports` - Test this last

If other pages work but reports doesn't, the issue is in the HRReportsPage component.

### 7. Check for JavaScript Errors

Look for these specific errors:

- `Cannot find module` - Missing import
- `undefined is not a function` - Missing dependency
- `Maximum update depth exceeded` - Infinite loop in useEffect
- `Failed to fetch` - API endpoint issue

### 8. Temporary Debug Component

If the page still doesn't show, temporarily replace the component with a simple test:

```javascript
// Temporary test - Add at the top of HRReportsPage.jsx
export default function HRReportsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">HR Reports Page - Test</h1>
      <p>If you see this, routing works!</p>
    </div>
  );
}
```

## Most Likely Causes

### 1. **Not Logged In or Wrong Role** (90% of cases)

- Solution: Log in with HR Manager account

### 2. **API Connection Error**

- The component tries to fetch reports on mount
- If API fails and error handling has an issue, page might crash
- Check browser console for fetch errors

### 3. **Missing Dependencies**

- Run: `npm install` in frontend-vw directory
- Ensure all packages are installed

### 4. **Build Cache Issue**

- Delete `.vite` cache folder
- Restart dev server

## Quick Test Checklist

- [ ] Browser console shows no errors
- [ ] Logged in as "Human Resource Manager"
- [ ] Access token exists in localStorage
- [ ] Other HR pages load successfully
- [ ] Development server is running
- [ ] No 404 or 401 errors in Network tab

## If Still Not Working

1. Share the browser console errors
2. Share the Network tab showing the failed request
3. Verify the user role in localStorage
4. Check if the component file exists at: `src/screens/UserDashboards/HRDashboard/HRReportsPage.jsx`
