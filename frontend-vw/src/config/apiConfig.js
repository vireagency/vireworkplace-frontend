// API Configuration for different environments
const getApiUrl = () => {
  // In development, use the proxy (relative URL)
  // In production, use the full URL
  if (import.meta.env.DEV) {
    return "/api/v1";
  }

  // Production API URL
  return "https://www.api.vire.agency/api/v1";
};

// API Configuration object
export const apiConfig = {
  baseURL: getApiUrl(),
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
  // Production-specific settings
  production: {
    enableLogging: false,
    enableDebug: false,
    retryAttempts: 3,
  },
  // Development-specific settings
  development: {
    enableLogging: true,
    enableDebug: true,
    retryAttempts: 1,
  },
};

// Get current environment config
export const getCurrentConfig = () => {
  return import.meta.env.DEV ? apiConfig.development : apiConfig.production;
};

// Export the function for direct use
export { getApiUrl };
