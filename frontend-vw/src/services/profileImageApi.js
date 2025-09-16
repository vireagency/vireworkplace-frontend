/**
 * @fileoverview Profile Image API Service
 * @description Handles profile image upload and management
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import { apiConfig } from '@/config/apiConfig'

/**
 * Upload user profile image
 * @description Uploads a new profile image for the authenticated user
 * @param {File} file - The image file to upload
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} API response with success status and data
 * 
 * @example
 * const response = await uploadProfileImage(file, token)
 * if (response.success) {
 *   console.log('Profile image updated successfully')
 * }
 */
export const uploadProfileImage = async (file, token) => {
  try {
    // Validate file input
    if (!file) {
      throw new Error('No file provided')
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, or WebP)')
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 5MB')
    }

    // Create FormData for multipart/form-data request
    const formData = new FormData()
    formData.append('file', file)

    // Make API request
    const response = await fetch(`${apiConfig.baseURL}/settings/profile-image`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header - let browser set it with boundary
      },
      body: formData
    })

    // Parse response
    const data = await response.json()

    // Handle different response statuses
    if (!response.ok) {
      switch (response.status) {
        case 400:
          throw new Error(data.message || 'No file uploaded or unauthorized')
        case 401:
          throw new Error('Unauthorized. Please log in again')
        case 404:
          throw new Error('User not found')
        case 500:
          throw new Error('Internal server error. Please try again later')
        default:
          throw new Error(data.message || 'Failed to upload profile image')
      }
    }

    return {
      success: true,
      data: data.data || {},
      message: data.message || 'Profile picture updated successfully'
    }

  } catch (error) {
    console.error('Profile image upload error:', error)
    return {
      success: false,
      error: error.message || 'Failed to upload profile image',
      message: error.message || 'An error occurred while uploading the image'
    }
  }
}

/**
 * Remove user profile image
 * @description Removes the current profile image by uploading a default/empty image
 * Note: Since there's no DELETE endpoint, we'll handle this in the UI by not showing remove option
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} API response with success status
 * 
 * @example
 * const response = await removeProfileImage(token)
 * if (response.success) {
 *   console.log('Profile image removed successfully')
 * }
 */
export const removeProfileImage = async (token) => {
  // Since there's no DELETE endpoint, we'll return an error indicating this feature isn't available
  return {
    success: false,
    error: 'Remove functionality not available',
    message: 'Profile image removal is not currently supported by the API'
  }
}

/**
 * Get user profile data including image URL
 * @description Gets the current user profile data including profile image from the status endpoint
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} API response with user profile data
 * 
 * @example
 * const response = await getUserProfile(token)
 * if (response.success) {
 *   console.log('Profile image URL:', response.data.avatar)
 * }
 */
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${apiConfig.baseURL}/status/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      switch (response.status) {
        case 401:
          throw new Error('Unauthorized. Please log in again')
        case 404:
          throw new Error('User not found')
        case 500:
          throw new Error('Internal server error. Please try again later')
        default:
          throw new Error(data.message || 'Failed to get user profile')
      }
    }

    return {
      success: true,
      data: data.data || {},
      message: data.message || 'User profile retrieved successfully'
    }

  } catch (error) {
    console.error('User profile retrieval error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get user profile',
      message: error.message || 'An error occurred while retrieving the profile'
    }
  }
}
