// Production Configuration
export const productionConfig = {
  API_URL: 'https://vireworkplace-backend-hpca.onrender.com/api/v1',
  APP_ENV: 'production',
  APP_NAME: 'Vire Workplace HR App',
  ENABLE_LOGGING: false,
  ENABLE_DEBUG: false
}

// Use this in your components for production
export const getApiUrl = () => {
  return productionConfig.API_URL
}
