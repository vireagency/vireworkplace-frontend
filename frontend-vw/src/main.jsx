/**
 * Application Entry Point
 * 
 * This is the main entry point for the Vire Workplace HR Application.
 * It renders the root App component into the DOM and sets up React StrictMode
 * for better development experience and error detection.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Create root element and render the app with StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
