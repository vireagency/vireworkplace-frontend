// API Configuration for different environments
const getApiUrl = () => {
  // Always use the full URL to avoid proxy issues
  return 'https://vireworkplace-backend-hpca.onrender.com/api/v1'
}

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
