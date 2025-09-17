/**
 * Avatar Utility Functions
 * @description Utility functions for handling user avatar URLs across the application
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Get user avatar URL from user object
 * @description Tries multiple possible field names for the avatar URL
 * @param {Object} user - User object
 * @returns {string|null} Avatar URL or null if not found
 *
 * @example
 * const avatarUrl = getUserAvatarUrl(user)
 * if (avatarUrl) {
 *   console.log('Avatar found:', avatarUrl)
 * }
 */
export const getUserAvatarUrl = (user) => {
  if (!user) return null;

  // Try multiple possible field names for the avatar
  const avatarUrl =
    user.avatar ||
    user.profileImage ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl ||
    null;

  // Add cache-busting parameter to prevent browser caching
  if (avatarUrl) {
    const separator = avatarUrl.includes("?") ? "&" : "?";
    // Use a stable cache-busting approach that only changes when the image actually changes
    const cacheKey = user.avatarUpdatedAt || user.updatedAt || "";
    // Only add cacheKey if available
    return cacheKey ? `${avatarUrl}${separator}v=${cacheKey}` : avatarUrl;
  }

  return null;
};

/**
 * Get user initials for fallback display
 * @description Generates initials from user's name
 * @param {Object} user - User object
 * @returns {string} User initials or fallback "U"
 *
 * @example
 * const initials = getUserInitials(user)
 * console.log('User initials:', initials) // "JD" for John Doe
 */
export const getUserInitials = (user) => {
  if (!user) return "U";

  // Try to get initials from firstName and lastName
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }

  // Try to get initials from full name
  if (user.name) {
    const parts = user.name.trim().split(/\s+/);
    const firstInitial = parts[0]?.[0] || "";
    const lastInitial = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${firstInitial}${lastInitial}`.toUpperCase() || "U";
  }

  // Fall back to email first letter
  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return "U";
};
