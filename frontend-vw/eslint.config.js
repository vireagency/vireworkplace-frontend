/**
 * @fileoverview ESLint Configuration for Vire Workplace HR App Frontend
 * @description Code quality and style enforcement configuration using ESLint 9.x flat config
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://eslint.org/docs/latest/use/configure/ ESLint Configuration Documentation}
 */

// ESLint core JavaScript rules and configurations
import js from '@eslint/js'

// Global variables definitions for different environments
import globals from 'globals'

// React Hooks linting rules for functional components
import reactHooks from 'eslint-plugin-react-hooks'

// React Refresh linting rules for Vite HMR
import reactRefresh from 'eslint-plugin-react-refresh'

// ESLint configuration utilities
import { defineConfig, globalIgnores } from 'eslint/config'

/**
 * ESLint Configuration Object
 * @description Configures code quality rules, React-specific linting, and development environment settings
 * @type {import('eslint').Linter.Config}
 */
export default defineConfig([
  // ============================================================================
  // GLOBAL IGNORES
  // ============================================================================
  
  // Ignore the dist/build directory completely
  globalIgnores(['dist']),
  
  // ============================================================================
  // MAIN CONFIGURATION
  // ============================================================================
  
  {
    // Apply to all JavaScript and JSX files in the project
    files: ['**/*.{js,jsx}'],
    
    // ========================================================================
    // EXTENDED CONFIGURATIONS
    // ========================================================================
    
    extends: [
      // ESLint recommended JavaScript rules
      js.configs.recommended,
      
      // React Hooks rules for functional components
      reactHooks.configs['recommended-latest'],
      
      // React Refresh rules for Vite development
      reactRefresh.configs.vite,
    ],
    
    // ========================================================================
    // LANGUAGE OPTIONS
    // ========================================================================
    
    languageOptions: {
      // ECMAScript version for parsing
      ecmaVersion: 2020,
      
      // Browser environment globals (window, document, etc.)
      globals: globals.browser,
      
      // Parser-specific options
      parserOptions: {
        ecmaVersion: 'latest',                    // Use latest ECMAScript features
        ecmaFeatures: { jsx: true },              // Enable JSX parsing
        sourceType: 'module',                     // Use ES modules
      },
    },
    
    // ========================================================================
    // CUSTOM RULES
    // ========================================================================
    
    rules: {
      // Allow unused variables that start with uppercase or underscore
      // Useful for React components, constants, and intentionally unused parameters
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^[A-Z_]' 
      }],
    },
  },
])
