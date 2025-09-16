# Profile Image Upload Feature

## Overview
This feature allows users to upload, update, and remove their profile images across the Vire Workplace HR App. The profile image is displayed throughout the application with a fallback to user initials when no image is available.

## API Endpoints

### Upload Profile Image
- **URL**: `PATCH /api/v1/settings/profile-image`
- **Method**: PATCH
- **Content-Type**: multipart/form-data
- **Authentication**: Bearer token required
- **Description**: Uploads and updates the authenticated user's profile picture. The previous image is deleted from Cloudinary before saving the new one.

### Get User Profile
- **URL**: `GET /api/v1/status/profile`
- **Method**: GET
- **Content-Type**: application/json
- **Authentication**: Bearer token required
- **Description**: Returns the details of the currently authenticated user including profile image URL

## Components

### 1. ProfileImageUpload Component
**Location**: `src/components/ProfileImageUpload.jsx`

A reusable component that handles profile image upload, display, and removal.

**Props**:
- `size`: Avatar size class (default: "w-24 h-24")
- `currentImageUrl`: Current profile image URL
- `userName`: User's name for initials fallback
- `onImageUpdate`: Callback when image is updated
- `onImageRemove`: Callback when image is removed
- `showActions`: Whether to show action buttons (default: true)
- `showSizeHint`: Whether to show size recommendation (default: true)

**Features**:
- File validation (type and size)
- Image preview before upload
- Loading states during upload/removal
- Error handling with toast notifications
- Automatic user data update

### 2. Profile Image API Service
**Location**: `src/services/profileImageApi.js`

Handles all API interactions for profile image management.

**Functions**:
- `uploadProfileImage(file, token)`: Upload a new profile image
- `removeProfileImage(token)`: Not supported by API (returns error)
- `getUserProfile(token)`: Get user profile data including image URL

## Integration Points

### 1. HR Profile Settings
**Location**: `src/screens/UserDashboards/HRDashboard/HRProfileSettings.jsx`
- Replaced static profile image section with ProfileImageUpload component
- Users can upload/update/remove their profile image

### 2. HR Password Settings
**Location**: `src/screens/UserDashboards/HRDashboard/HRPasswordSettings.jsx`
- Updated profile section to use ProfileImageUpload component

### 3. Site Header
**Location**: `src/components/site-header.jsx`
- Updated to display user's profile image with fallback to initials
- Added AvatarImage component for proper image display

### 4. App Sidebar
**Location**: `src/components/app-sidebar.jsx`
- Updated to use user's actual avatar URL instead of default image

### 5. Staff Profile Settings
**Location**: `src/screens/UserDashboards/StaffDashboard/StaffProfileSettings.jsx`
- Already had proper AvatarImage implementation
- Will automatically display uploaded profile images

## File Validation & Processing
- **Allowed Types**: JPEG, JPG, PNG, GIF, WebP
- **Maximum Size**: 10MB (before resizing)
- **Automatic Resizing**: All images are automatically resized to 400×400px
- **Quality**: Images are compressed to 90% quality for optimal file size
- **Aspect Ratio**: Maintained during resizing with white background fill

## Error Handling
- Invalid file type
- File size too large
- Network errors
- Authentication errors
- Server errors

## User Experience
1. User clicks the green plus icon or "Update" button
2. File picker opens for image selection
3. Image is automatically resized to 400×400px (with loading indicator)
4. Resized image preview is shown immediately
5. Upload progress is indicated with loading state
6. Success/error feedback via toast notifications
7. Profile image updates across all components automatically
8. Remove functionality is not available (API limitation)

## Technical Details
- Uses FormData for multipart/form-data requests
- Implements proper error handling and user feedback
- Updates user context automatically after successful upload
- Maintains fallback to initials when image fails to load
- Responsive design with proper loading states

## Testing
The feature has been integrated and tested with:
- API endpoint validation
- File upload functionality
- Error handling scenarios
- UI component integration
- Cross-component image display

## Future Enhancements
- Image cropping/resizing before upload
- Multiple image format support
- Image compression
- Batch upload capabilities
- Image history/versioning
