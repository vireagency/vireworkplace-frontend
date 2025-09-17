/**
 * @fileoverview Vite Configuration for Vire Workplace HR App Frontend
 * @description Build tool configuration for development, building, and production deployment
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Node.js path module for resolving file paths
import path from "path"

// Tailwind CSS Vite plugin for CSS processing
import tailwindcss from "@tailwindcss/vite"

// React Vite plugin for JSX transformation and HMR
import react from "@vitejs/plugin-react"

// Vite configuration function
import { defineConfig } from "vite"

/**
 * Vite Configuration
 * @description Configures the build tool for development, building, and production
 * @param {Object} options - Configuration options
 * @param {string} options.command - Current command (serve/build)
 * @param {string} options.mode - Current mode (development/production)
 * @returns {Object} Vite configuration object
 * 
 * @see {@link https://vite.dev/config/ Vite Configuration Documentation}
 */
export default defineConfig(({ command, mode }) => {
  // Determine if we're in production mode for conditional configuration
  const isProduction = mode === 'production'
  
  return {
    // ============================================================================
    // PLUGINS CONFIGURATION
    // ============================================================================
    
    // Array of Vite plugins to use during build and development
    plugins: [
      react(),        // React JSX transformation and HMR support
      tailwindcss()   // Tailwind CSS processing and optimization
    ],
    
    // ============================================================================
    // PATH RESOLUTION
    // ============================================================================
    
    resolve: {
      alias: {
        // Create @ alias pointing to src directory for cleaner imports
        "@": path.resolve(__dirname, "./src"),
      },
    },
    
    // ============================================================================
    // DEVELOPMENT SERVER CONFIGURATION
    // ============================================================================
    
    server: {
      // Hot Module Replacement (HMR) configuration
      hmr: {
        overlay: false  // Disable error overlay for cleaner development experience
      },
      
      // Proxy configuration - only active during development (serve command)
      ...(command === 'serve' && {
        proxy: {
          // API proxy configuration for backend communication
          '/api': {
            target: 'https://vireworkplace-backend-hpca.onrender.com',  // Backend API endpoint
            changeOrigin: true,    // Change origin header for CORS
            secure: true,          // Use HTTPS for secure communication
            rewrite: (path) => path.replace(/^\/api/, '/api')  // Path rewriting for API calls
          }
        }
      })
    },
    
    // ============================================================================
    // BUILD CONFIGURATION
    // ============================================================================
    
    build: {
      outDir: 'dist',           // Output directory for built files
      sourcemap: false,         // Disable source maps in production for security
      minify: 'esbuild',        // Use esbuild for fast minification
      
      // Rollup-specific build options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching and loading performance
          manualChunks: {
            vendor: ['react', 'react-dom'],                    // Core React libraries
            ui: [                                             // UI component libraries
              '@radix-ui/react-dialog', 
              '@radix-ui/react-select', 
              '@radix-ui/react-dropdown-menu'
            ],
            icons: ['@tabler/icons-react', 'lucide-react']    // Icon libraries
          }
        }
      },
      
      // esbuild-specific options
      esbuild: {
        // Remove console.log and debugger statements in production
        drop: isProduction ? ['console', 'debugger'] : []
      }
    },
    
    // ============================================================================
    // GLOBAL VARIABLES
    // ============================================================================
    
    define: {
      // Define global constant for current environment mode
      __APP_ENV__: JSON.stringify(mode),
      // Polyfill process for browser environment
      'process.env': 'import.meta.env',
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process': '{}'
    }
  }
})