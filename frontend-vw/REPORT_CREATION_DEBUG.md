# Report Creation Error - Debugging Guide

## Recent Fixes Applied

### 1. **Improved Error Logging**

- Added detailed console logs for request data
- Added error response details logging
- Added access token validation check

### 2. **Fixed Date Handling**

- Only send `dueDate` if it's provided and not empty
- Prevents sending empty strings to the API

### 3. **Enhanced Data Validation**

- Ensure recipients is always an array
- Trim whitespace from text fields
- Proper department mapping

## How to Debug the Error

### Step 1: Open Browser Console

1. Open DevTools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Clear the console (trash icon)

### Step 2: Try Creating a Report

1. Fill out the form with:
   - **Title**: Test Report
   - **Type**: Select any type (Performance, Attendance, etc.)
   - **Department**: Select any department
   - **Priority**: Select any priority
   - **Description**: Add some description
   - **Recipients**: (Optional) Select 1-2 employees
2. Click "Create Report"

### Step 3: Check Console Logs

Look for these specific logs:

```javascript
// Before submission
"Form data before mapping:" { title: "...", type: "...", ... }
"Submitting report data:" { reportTitle: "...", reportType: "...", ... }

// In API service
"Creating report with data:" { reportTitle: "...", ... }
"Recipients:" [...]
"Access token present:" true/false

// If error occurs
"Error creating report:" AxiosError { ... }
"Error response data:" { message: "...", ... }
"Error status:" 400/500/etc
```

### Step 4: Identify the Error Type

#### **Error 400 (Bad Request)**

- **Cause**: Missing or invalid data
- **Check**:
  - Are all required fields filled?
  - Is the data format correct?
- **Look for**: `error.response.data.message`

#### **Error 401 (Unauthorized)**

- **Cause**: No access token or invalid token
- **Check**:
  - "Access token present:" should be `true`
  - Try logging out and back in
- **Fix**: Refresh the page and login again

#### **Error 403 (Forbidden)**

- **Cause**: User doesn't have permission
- **Check**: User role should be "Human Resource Manager"
- **Fix**: Ensure you're logged in as HR Manager

#### **Error 500 (Server Error)**

- **Cause**: Backend issue
- **Check**:
  - Look at "Error response data:" for backend error message
  - Check if backend is running
- **Common Issues**:
  - Invalid department name
  - Invalid date format
  - Database connection issues

### Step 5: Check Network Tab

1. Go to **Network** tab in DevTools
2. Filter by "Fetch/XHR"
3. Find the `POST /api/v1/dashboard/reports` request
4. Click on it and check:
   - **Headers**: Verify Authorization header is present
   - **Payload**: See exactly what data was sent
   - **Response**: See the server's error message

## Common Issues & Solutions

### Issue 1: "Missing required fields"

**Solution**: Ensure both Title and Description are filled

### Issue 2: "Unauthorized"

**Solution**:

```javascript
// Check if user is logged in
console.log("User:", user);
console.log("Access Token:", accessToken ? "Present" : "Missing");
```

### Issue 3: "Invalid department"

**Solution**: Department should be one of:

- "Human Resource Management"
- "Engineering"
- "Operations"
- "Customer Support"
- "Finance"
- "Marketing"

### Issue 4: Recipients not being sent

**Solution**:

```javascript
// Check recipients array
console.log("Recipients:", formData.recipients);
// Should be: ["userId1", "userId2", ...]
```

### Issue 5: Date format error

**Solution**: Date should be in format: `YYYY-MM-DD`

```javascript
// Check date value
console.log("Due Date:", formData.dueDate);
// Should be: "2025-10-15" or undefined
```

## Testing Checklist

- [ ] User is logged in as HR Manager
- [ ] Access token is present
- [ ] Title field is filled
- [ ] Description field is filled
- [ ] Type is selected (or defaults to "General")
- [ ] Department is selected (or defaults to "Human Resource Management")
- [ ] Priority is selected (or defaults to "Medium")
- [ ] Due date is either empty or valid date (YYYY-MM-DD)
- [ ] Recipients is an array (can be empty)
- [ ] Console shows detailed logs
- [ ] Network tab shows the request

## Expected Request Format

```json
{
  "reportTitle": "Test Report",
  "reportDescription": "This is a test report description",
  "department": "Human Resource Management",
  "reportType": "Performance",
  "priorityLevel": "High",
  "dueDate": "2025-10-15",
  "recipients": ["userId1", "userId2"]
}
```

## If Error Persists

1. **Copy all console logs** (right-click → Save as...)
2. **Copy the Network request details**:
   - Request URL
   - Request Headers
   - Request Payload
   - Response
3. **Check backend logs** if you have access
4. **Share the error details** for further investigation

## Quick Test

Try creating a minimal report:

```javascript
// In console, run:
const testData = {
  reportTitle: "Test",
  reportDescription: "Test Description",
  department: "Human Resource Management",
  reportType: "General",
  priorityLevel: "Medium",
  recipients: [],
};
console.log("Test data:", testData);
```

This should help identify exactly where the error is occurring!
