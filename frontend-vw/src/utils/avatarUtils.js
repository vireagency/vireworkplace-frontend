/**
 * Avatar Utility Functions
 * @description Utility functions for handling user avatar URLs across the application
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Get user avatar URL from user object
 * @description Tries multiple possible field names for the avatar URL, prioritizing profileImage from API
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

  // Prioritize profileImage from API response (most reliable)
  const avatarUrl =
    user.profileImage ||
    user.avatar ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl ||
    null;

  // Validate the URL before processing
  if (avatarUrl) {
    // Check if it's a valid URL and not a broken Cloudinary URL
    try {
      const url = new URL(avatarUrl);
      // If it's a Cloudinary URL, check if it contains known broken patterns
      if (url.hostname.includes("cloudinary.com")) {
        // Check for known broken image patterns
        if (
          url.pathname.includes("default_profile_image_q5j98z") ||
          url.pathname.includes("default_profile_image") ||
          url.pathname.includes("broken") ||
          url.pathname.includes("404")
        ) {
          console.warn("Broken avatar URL detected:", avatarUrl);
          return null; // Return null to trigger fallback
        }
      }
    } catch (error) {
      console.warn("Invalid avatar URL:", avatarUrl, error);
      return null;
    }

    // Add stable cache-busting parameters that only change when the image actually changes
    const separator = avatarUrl.includes("?") ? "&" : "?";

    // Use profileImagePublicId for stable cache busting - only changes when image is updated
    const cacheKey =
      user.profileImagePublicId || user.avatarUpdatedAt || user.updatedAt;

    // Only add cache-busting if we have a stable cache key
    if (cacheKey) {
      return `${avatarUrl}${separator}v=${cacheKey}`;
    } else {
      // If no stable cache key, return the original URL without timestamp to prevent flickering
      return avatarUrl;
    }
  }

  return null;
};

/**
 * Get stable user avatar URL (memoized)
 * @description Returns a stable avatar URL that only changes when the image actually changes
 * @param {Object} user - User object
 * @returns {string|null} Stable avatar URL or null if not found
 *
 * @example
 * const stableAvatarUrl = getStableAvatarUrl(user)
 * // This URL will remain the same across re-renders unless the image changes
 */
export const getStableAvatarUrl = (user) => {
  if (!user) return null;

  // Prioritize profileImage from API response (most reliable)
  const avatarUrl =
    user.profileImage ||
    user.avatar ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl ||
    null;

  // Validate the URL before returning it
  if (avatarUrl) {
    // Check if it's a valid URL and not a broken Cloudinary URL
    try {
      const url = new URL(avatarUrl);
      // If it's a Cloudinary URL, check if it contains known broken patterns
      if (url.hostname.includes("cloudinary.com")) {
        // Check for known broken image patterns
        if (
          url.pathname.includes("default_profile_image_q5j98z") ||
          url.pathname.includes("default_profile_image") ||
          url.pathname.includes("broken") ||
          url.pathname.includes("404")
        ) {
          console.warn("Broken avatar URL detected:", avatarUrl);
          return null; // Return null to trigger fallback
        }
      }
      return avatarUrl;
    } catch (error) {
      console.warn("Invalid avatar URL:", avatarUrl, error);
      return null;
    }
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

/**
 * Force refresh avatar URL
 * @description Creates a new avatar URL with fresh cache-busting parameters
 * @param {Object} user - User object
 * @returns {string|null} Fresh avatar URL or null if not found
 */
export const getFreshAvatarUrl = (user) => {
  if (!user) return null;

  // Get base avatar URL without cache-busting
  const baseUrl =
    user.profileImage ||
    user.avatar ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl ||
    null;

  if (!baseUrl) return null;

  // Validate the URL before processing
  try {
    const url = new URL(baseUrl);
    // If it's a Cloudinary URL, check if it contains known broken patterns
    if (url.hostname.includes("cloudinary.com")) {
      // Check for known broken image patterns
      if (
        url.pathname.includes("default_profile_image_q5j98z") ||
        url.pathname.includes("default_profile_image") ||
        url.pathname.includes("broken") ||
        url.pathname.includes("404")
      ) {
        console.warn("Broken avatar URL detected:", baseUrl);
        return null; // Return null to trigger fallback
      }
    }
  } catch (error) {
    console.warn("Invalid avatar URL:", baseUrl, error);
    return null;
  }

  // Remove existing cache-busting parameters
  const cleanUrl = baseUrl.split("?")[0];

  // Add fresh cache-busting parameters
  const separator = "?";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);

  return `${cleanUrl}${separator}v=${timestamp}&t=${timestamp}&r=${random}&fresh=${Date.now()}`;
};

/**
 * Get stable avatar URL for sidebar and navigation components
 * @description Returns a stable avatar URL that doesn't change on every render
 * @param {Object} user - User object
 * @returns {string|null} Stable avatar URL or null if not found
 *
 * @example
 * const stableAvatarUrl = getSidebarAvatarUrl(user)
 * // This URL will remain stable across re-renders
 */
export const getSidebarAvatarUrl = (user) => {
  if (!user) return null;

  // Prioritize profileImage from API response (most reliable)
  const avatarUrl =
    user.profileImage ||
    user.avatar ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl ||
    null;

  // Validate the URL before returning it
  if (avatarUrl) {
    // Check if it's a valid URL and not a broken Cloudinary URL
    try {
      const url = new URL(avatarUrl);
      // If it's a Cloudinary URL, check if it contains known broken patterns
      if (url.hostname.includes("cloudinary.com")) {
        // Check for known broken image patterns
        if (
          url.pathname.includes("default_profile_image_q5j98z") ||
          url.pathname.includes("default_profile_image") ||
          url.pathname.includes("broken") ||
          url.pathname.includes("404")
        ) {
          console.warn("Broken avatar URL detected:", avatarUrl);
          return null; // Return null to trigger fallback
        }
      }
      return avatarUrl;
    } catch (error) {
      console.warn("Invalid avatar URL:", avatarUrl, error);
      return null;
    }
  }

  return null;
};

/**
 * Clean user data by removing broken avatar URLs
 * @description Removes broken Cloudinary URLs from user object to prevent 404 errors
 * @param {Object} user - User object
 * @returns {Object} Cleaned user object
 */
export const cleanUserAvatarData = (user) => {
  if (!user) return user;

  const cleanedUser = { ...user };
  const avatarFields = [
    "profileImage",
    "avatar",
    "imageUrl",
    "profilePicture",
    "image",
    "profileImageUrl",
  ];

  avatarFields.forEach((field) => {
    if (cleanedUser[field]) {
      try {
        const url = new URL(cleanedUser[field]);
        // If it's a Cloudinary URL, check if it contains known broken patterns
        if (url.hostname.includes("cloudinary.com")) {
          // Check for known broken image patterns
          if (
            url.pathname.includes("default_profile_image_q5j98z") ||
            url.pathname.includes("default_profile_image") ||
            url.pathname.includes("broken") ||
            url.pathname.includes("404")
          ) {
            console.warn(
              `Removing broken avatar URL from ${field}:`,
              cleanedUser[field]
            );
            cleanedUser[field] = null;
          }
        }
      } catch (error) {
        console.warn(
          `Removing invalid avatar URL from ${field}:`,
          cleanedUser[field],
          error
        );
        cleanedUser[field] = null;
      }
    }
  });

  return cleanedUser;
};

/**
 * Check if user has a profile image
 * @description Checks if user has any form of profile image
 * @param {Object} user - User object
 * @returns {boolean} True if user has profile image
 */
export const hasProfileImage = (user) => {
  if (!user) return false;

  return !!(
    user.profileImage ||
    user.avatar ||
    user.imageUrl ||
    user.profilePicture ||
    user.image ||
    user.profileImageUrl
  );
};
