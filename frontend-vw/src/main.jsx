/**
 * @fileoverview Main entry point for the Vire Workplace HR App Frontend
 * @description This file serves as the application bootstrap, rendering the root React component
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Import React 19's StrictMode for development-time checks and warnings
import { StrictMode } from 'react'

// Import React 19's createRoot API for concurrent rendering features
import { createRoot } from 'react-dom/client'

// Import global CSS styles for the application
import './index.css'

// Import the main App component that contains the entire application
import App from './App.jsx'

/**
 * Bootstrap the React application by creating a root and rendering the App component
 * @description This is the entry point that mounts the React application to the DOM
 * @type {void}
 */
createRoot(document.getElementById('root')).render(
  // StrictMode enables additional development-time checks and warnings
  <StrictMode>
    {/* Main application component that contains all routes and components */}
    <App />
  </StrictMode>,
)
