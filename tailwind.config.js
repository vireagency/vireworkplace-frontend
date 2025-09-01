/**
 * @fileoverview Tailwind CSS Configuration for Vire Workplace HR App Frontend
 * @description Custom Tailwind CSS configuration with extended design system, animations, and component-specific styles
 * @author Vire Development Team
 * @version 1.0.0
 * @since 2024
 * @see {@link https://tailwindcss.com/docs/configuration Tailwind CSS Configuration Documentation}
 */

/** @type {import('tailwindcss').Config} */
const config = {
  // ============================================================================
  // DARK MODE CONFIGURATION
  // ============================================================================
  
  // Enable class-based dark mode for dynamic theme switching
  darkMode: 'class',
  
  // ============================================================================
  // CONTENT PATHS
  // ============================================================================
  
  // Define which files Tailwind should scan for class usage
  content: [
    './screens/**/*.{js,jsx,ts,tsx}',      // Screen components
    './components/**/*.{js,jsx,ts,tsx}',   // Reusable components
    './app/**/*.{js,jsx,ts,tsx}',          // App-specific components
    './src/**/*.{js,jsx,ts,tsx}',          // Source directory components
  ],
  
  // ============================================================================
  // THEME CUSTOMIZATION
  // ============================================================================
  
  theme: {
    // ========================================================================
    // CONTAINER CONFIGURATION
    // ========================================================================
    
    container: {
      center: true,           // Center container horizontally
      padding: '2rem',        // Default horizontal padding
      screens: {
        '2xl': '1400px',      // Maximum width for 2xl breakpoint
      },
    },
    
    // ========================================================================
    // EXTENDED DESIGN SYSTEM
    // ========================================================================
    
    extend: {
      // ====================================================================
      // COLOR SYSTEM
      // ====================================================================
      
      colors: {
        // CSS Custom Properties for dynamic theming
        border: 'hsl(var(--border))',                    // Border colors
        input: 'hsl(var(--input))',                      // Input field colors
        ring: 'hsl(var(--ring))',                        // Focus ring colors
        background: 'hsl(var(--background))',            // Background colors
        foreground: 'hsl(var(--foreground))',            // Text colors
        
        // Primary color palette
        primary: {
          DEFAULT: 'hsl(var(--primary))',                // Main primary color
          foreground: 'hsl(var(--primary-foreground))',  // Text on primary
        },
        
        // Secondary color palette
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',              // Main secondary color
          foreground: 'hsl(var(--secondary-foreground))', // Text on secondary
        },
        
        // Destructive/error color palette
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',            // Error/danger colors
          foreground: 'hsl(var(--destructive-foreground))', // Text on destructive
        },
        
        // Muted/subtle color palette
        muted: {
          DEFAULT: 'hsl(var(--muted))',                  // Muted background
          foreground: 'hsl(var(--muted-foreground))',    // Muted text
        },
        
        // Accent color palette
        accent: {
          DEFAULT: 'hsl(var(--accent))',                 // Accent highlights
          foreground: 'hsl(var(--accent-foreground))',   // Text on accent
        },
        
        // Popover/modal color palette
        popover: {
          DEFAULT: 'hsl(var(--popover))',                // Popover background
          foreground: 'hsl(var(--popover-foreground))',  // Popover text
        },
        
        // Card component color palette
        card: {
          DEFAULT: 'hsl(var(--card))',                   // Card background
          foreground: 'hsl(var(--card-foreground))',     // Card text
        },
        
        // ================================================================
        // SIDEBAR-SPECIFIC COLORS
        // ================================================================
        
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',     // Main sidebar background
          foreground: 'hsl(var(--sidebar-foreground))',  // Sidebar text
          primary: 'hsl(var(--sidebar-primary))',        // Sidebar primary elements
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // Text on sidebar primary
          accent: 'hsl(var(--sidebar-accent))',          // Sidebar accent elements
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',   // Text on sidebar accent
          border: 'hsl(var(--sidebar-border))',          // Sidebar borders
          ring: 'hsl(var(--sidebar-ring))',              // Sidebar focus rings
        },
        
        // ================================================================
        // SPOTIFY-INSPIRED COLORS
        // ================================================================
        
        spotify: {
          green: '#1DB954',                              // Spotify brand green
          'green-light': '#1ed760',                      // Lighter green variant
          dark: '#191414',                               // Spotify dark theme
          'dark-light': '#121212',                       // Lighter dark variant
          gray: '#b3b3b3',                               // Spotify gray
        },
      },
      
      // ====================================================================
      // BORDER RADIUS SYSTEM
      // ====================================================================
      
      borderRadius: {
        lg: 'var(--radius)',                             // Large border radius
        md: 'calc(var(--radius) - 2px)',                // Medium border radius
        sm: 'calc(var(--radius) - 4px)',                // Small border radius
        '2xl': '1rem',                                   // Extra large border radius
        '3xl': '1.5rem',                                 // 3x large border radius
      },
      
      // ====================================================================
      // TYPOGRAPHY SYSTEM
      // ====================================================================
      
      fontFamily: {
        // Primary sans-serif font stack with Inter as the main font
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      // ====================================================================
      // ANIMATION KEYFRAMES
      // ====================================================================
      
      keyframes: {
        // Accordion component animations
        'accordion-down': {
          from: { height: '0' },                        // Start with 0 height
          to: { height: 'var(--radix-accordion-content-height)' }, // Expand to content height
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' }, // Start with content height
          to: { height: '0' },                          // Collapse to 0 height
        },
        
        // Fade-in animation for smooth content appearance
        'fade-in': {
          '0%': {
            opacity: '0',                                // Start invisible
            transform: 'translateY(10px)',               // Start slightly below
          },
          '100%': {
            opacity: '1',                                // End fully visible
            transform: 'translateY(0)',                  // End at normal position
          },
        },
        
        // Scale-in animation for modal/popover appearance
        'scale-in': {
          '0%': {
            transform: 'scale(0.95)',                    // Start slightly smaller
            opacity: '0',                                // Start invisible
          },
          '100%': {
            transform: 'scale(1)',                       // End at normal size
            opacity: '1',                                // End fully visible
          },
        },
      },
      
      // ====================================================================
      // ANIMATION CLASSES
      // ====================================================================
      
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',  // Smooth accordion expansion
        'accordion-up': 'accordion-up 0.2s ease-out',      // Smooth accordion collapse
        'fade-in': 'fade-in 0.3s ease-out',               // Smooth fade-in effect
        'scale-in': 'scale-in 0.2s ease-out',             // Smooth scale-in effect
      },
      
      // ====================================================================
      // BACKDROP BLUR UTILITIES
      // ====================================================================
      
      backdropBlur: {
        xs: '2px',                                       // Extra small backdrop blur
      },
    },
  },
  
  // ============================================================================
  // PLUGINS
  // ============================================================================
  
  // Array of Tailwind CSS plugins
  plugins: [
    require('tailwindcss-animate'),                      // Animation utilities plugin
  ],
};

// Export the configuration object
module.exports = config;
  