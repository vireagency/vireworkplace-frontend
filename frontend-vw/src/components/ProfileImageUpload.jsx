/**
 * @fileoverview Profile Image Upload Component
 * @description Reusable component for uploading and managing profile images
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { uploadProfileImage, removeProfileImage } from '@/services/profileImageApi'
import { IconPlus, IconTrash, IconUpload, IconX } from '@tabler/icons-react'
import { getUserAvatarUrl, getUserInitials as getInitials } from '@/utils/avatarUtils'

/**
 * ProfileImageUpload Component
 * @description Handles profile image upload, display, and removal
 * @param {Object} props - Component props
 * @param {string} [props.size] - Avatar size class (default: "w-24 h-24")
 * @param {string} [props.currentImageUrl] - Current profile image URL
 * @param {string} [props.userName] - User's name for initials fallback
 * @param {Function} [props.onImageUpdate] - Callback when image is updated
 * @param {Function} [props.onImageRemove] - Callback when image is removed
 * @param {boolean} [props.showActions] - Whether to show action buttons (default: true)
 * @param {boolean} [props.showSizeHint] - Whether to show size recommendation (default: true)
 * @returns {JSX.Element} The profile image upload component
 */
export default function ProfileImageUpload({
  size = "w-24 h-24",
  currentImageUrl,
  userName = "",
  onImageUpdate,
  onImageRemove,
  showActions = true,
  showSizeHint = true
}) {
  // ============================================================================
  // HOOKS AND STATE
  // ============================================================================
  
  const { user, accessToken, updateProfile, fetchUserProfile, setUser } = useAuth()
  const fileInputRef = useRef(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  /**
   * Resize image to 400x400px while maintaining aspect ratio
   * @param {File} file - Original image file
   * @param {number} maxSize - Maximum size in pixels (default: 400)
   * @param {number} quality - Image quality (0-1, default: 0.9)
   * @returns {Promise<File>} Resized image file
   */
  const resizeImage = (file, maxSize = 400, quality = 0.9) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }
        
        // Set canvas dimensions to create a perfect square
        canvas.width = maxSize
        canvas.height = maxSize
        
        // Fill with white background
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, maxSize, maxSize)
        
        // Calculate position to center the image and ensure it fills the square
        // Use the larger dimension to ensure the image covers the entire square
        const scale = Math.max(maxSize / width, maxSize / height)
        const scaledWidth = width * scale
        const scaledHeight = height * scale
        
        // Center the scaled image
        const x = (maxSize - scaledWidth) / 2
        const y = (maxSize - scaledHeight) / 2
        
        // Draw the resized image centered on canvas
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
        
        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with resized image
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(resizedFile)
            } else {
              reject(new Error('Failed to resize image'))
            }
          },
          file.type,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }
  
  /**
   * Get user initials for fallback
   * @returns {string} User initials
   */
  const getUserInitials = () => {
    if (userName) {
      const parts = userName.trim().split(/\s+/)
      const firstInitial = parts[0]?.[0] || ''
      const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : ''
      return `${firstInitial}${lastInitial}`.toUpperCase() || 'U'
    }
    
    return getInitials(user)
  }

  /**
   * Get current image URL (preview or current)
   * @returns {string|null} Image URL
   */
  const getCurrentImageUrl = () => {
    const userAvatarUrl = getUserAvatarUrl(user)
    
    console.log('getCurrentImageUrl - Debug:', {
      previewUrl,
      currentImageUrl,
      userAvatarUrl,
      userKeys: user ? Object.keys(user) : 'No user',
      fullUser: user
    })
    
    return previewUrl || currentImageUrl || userAvatarUrl
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle file selection
   * @param {Event} event - File input change event
   */
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload a valid image file (JPEG, PNG, GIF, or WebP)")
      return
    }

    // Validate file size (max 10MB before resizing)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.error("File too large. Please upload an image smaller than 10MB")
      return
    }

    try {
      // Show loading state
      setIsUploading(true)
      
      // Resize the image to 400x400px
      const resizedFile = await resizeImage(file, 400, 0.9)
      
      // Create preview URL from resized image
      const preview = URL.createObjectURL(resizedFile)
      setPreviewUrl(preview)

      // Upload the resized file
      await handleImageUpload(resizedFile)
      
    } catch (error) {
      console.error('Image processing error:', error)
      toast.error("Failed to process image. Please try again.")
      setIsUploading(false)
    }
  }

  /**
   * Handle image upload
   * @param {File} file - File to upload
   */
  const handleImageUpload = async (file) => {
    console.log('ProfileImageUpload - Debug Info:', {
      user: user,
      accessToken: accessToken ? 'Present' : 'Missing',
      tokenLength: accessToken?.length
    })
    
    if (!accessToken) {
      toast.error("Authentication required. Please log in to upload images")
      setIsUploading(false)
      return
    }

    try {
      const response = await uploadProfileImage(file, accessToken)
      
      console.log('Upload response:', response)
      
      if (response.success) {
        // Wait a moment for the image to be processed on the server
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Fetch updated user profile to get the new avatar URL
        const profileResult = await fetchUserProfile()
        
        console.log('Profile fetch result:', profileResult)
        
        if (profileResult.success) {
          // Add a timestamp to help with cache-busting
          const updatedUserData = {
            ...profileResult.data,
            avatarUpdatedAt: Date.now()
          }
          
          // Update the user context with the new profile data
          setUser(updatedUserData)
          
          // Check if the avatar field was updated
          if (profileResult.data?.avatar) {
            console.log('Avatar URL found and user context updated:', profileResult.data.avatar)
            toast.success("Profile image updated successfully!")
            setPreviewUrl(null) // Clear preview since user context is updated
          } else {
            console.log('No avatar field in profile data, trying alternative fields')
            // Try alternative field names
            const avatarUrl = profileResult.data?.profileImage || 
                             profileResult.data?.imageUrl || 
                             profileResult.data?.profilePicture ||
                             profileResult.data?.image
            
            if (avatarUrl) {
              console.log('Found avatar in alternative field and user context updated:', avatarUrl)
              toast.success("Profile image updated successfully!")
              setPreviewUrl(null) // Clear preview since user context is updated
            } else {
              console.log('No avatar field found in any expected location')
              toast.success("Profile image uploaded successfully, but there may be a delay in displaying the new image")
              setPreviewUrl(null)
            }
          }
          
          // Call callback if provided
          if (onImageUpdate) {
            onImageUpdate(profileResult.data)
          }
        } else {
          // If profile fetch fails, still show success but warn about potential display issues
          toast.success("Profile image uploaded successfully, but there may be a delay in displaying the new image")
          setPreviewUrl(null)
        }
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || "Failed to upload image. Please try again.")
      
      // Clear preview on error
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Handle image removal
   * Note: Remove functionality is not supported by the API
   */
  const handleImageRemove = async () => {
    toast.error("Profile image removal is not currently supported. Please contact support if you need to remove your image.")
  }

  /**
   * Handle upload button click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  /**
   * Handle cancel preview
   */
  const handleCancelPreview = () => {
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Image */}
      <div className="relative">
        <Avatar className={`${size} rounded-full overflow-hidden`} key={user?.avatarUpdatedAt || user?.avatar}>
          <AvatarImage 
            src={getCurrentImageUrl()} 
            alt={userName || "Profile"}
            className="object-cover w-full h-full"
          />
          <AvatarFallback className="text-lg bg-gray-200 text-gray-600 rounded-full">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload/Update Button Overlay */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition-colors">
          <IconPlus 
            className="w-3 h-3 text-white" 
            onClick={handleUploadClick}
          />
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && (
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUploadClick}
            disabled={isUploading}
            className="text-green-500 hover:text-green-600 hover:bg-green-50"
          >
            {isUploading ? (
              <>
                <IconUpload className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <IconUpload className="w-4 h-4 mr-2" />
                Update
              </>
            )}
          </Button>
          
          {/* Remove button is hidden since the API doesn't support image removal */}
          
          {previewUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelPreview}
              className="text-gray-500 hover:text-gray-600 hover:bg-gray-50"
            >
              <IconX className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      )}

      {/* Size Recommendation */}
      {showSizeHint && (
        <p className="text-sm text-gray-400">
          Images will be automatically resized to 400×400px
        </p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
