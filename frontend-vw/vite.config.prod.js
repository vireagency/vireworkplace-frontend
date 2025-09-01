/**
 * @fileoverview Production Vite Configuration for Vire Workplace HR App
 * @description Optimized build configuration for production deployment
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 */

// Node.js path module for resolving file paths
import path from "path"

// Tailwind CSS Vite plugin for CSS processing
import tailwindcss from "@tailwindcss/vite"

// React Vite plugin for JSX transformation
import react from "@vitejs/plugin-react"

// Vite configuration function
import { defineConfig } from "vite"

/**
 * Production Vite Configuration
 * @description Optimized configuration for production builds
 * @returns {Object} Vite configuration object
 */
export default defineConfig({
  // ============================================================================
  // PLUGINS CONFIGURATION
  // ============================================================================
  
  plugins: [
    react(),        // React JSX transformation
    tailwindcss()   // Tailwind CSS processing
  ],
  
  // ============================================================================
  // PATH RESOLUTION
  // ============================================================================
  
  resolve: {
    alias: {
      // Create @ alias pointing to src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // ============================================================================
  // BUILD CONFIGURATION
  // ============================================================================
  
  build: {
    outDir: 'dist',           // Output directory
    sourcemap: false,         // Disable source maps for security
    minify: 'esbuild',        // Use esbuild for fast minification
    target: 'es2015',         // Target ES2015 for broader compatibility
    
    // Rollup-specific build options
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-select', 
            '@radix-ui/react-dropdown-menu'
          ],
          icons: ['@tabler/icons-react', 'lucide-react']
        },
        // Asset naming for better caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    
    // esbuild-specific options
    esbuild: {
      // Remove console.log and debugger statements
      drop: ['console', 'debugger'],
      // Optimize for production
      pure: ['console.log', 'console.info', 'console.debug']
    },
    
    // Build optimization
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    emptyOutDir: true
  },
  
  // ============================================================================
  // GLOBAL VARIABLES
  // ============================================================================
  
  define: {
    // Define production environment
    __APP_ENV__: JSON.stringify('production'),
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  
  // ============================================================================
  // OPTIMIZATION
  // ============================================================================
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vitejs/plugin-react']
  }
})
