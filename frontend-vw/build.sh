#!/bin/bash

# 🚀 Vire Workplace HR App Build Script for Vercel
# This script is executed directly by Vercel during deployment

set -e  # Exit on any error

echo "🚀 Starting Vercel build process..."
echo "📍 Current directory: $(pwd)"
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if node_modules exists and install if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "📦 Dependencies already installed"
fi

# Verify Vite is available
echo "🔍 Checking Vite availability..."
if [ ! -f "node_modules/.bin/vite" ]; then
    echo "❌ Error: Vite not found in node_modules/.bin/"
    echo "📦 Reinstalling dependencies..."
    rm -rf node_modules package-lock.json
    npm install
    
    # Check again after reinstall
    if [ ! -f "node_modules/.bin/vite" ]; then
        echo "❌ Error: Vite still not available after reinstall"
        echo "📋 Listing node_modules/.bin contents:"
        ls -la node_modules/.bin/ || true
        exit 1
    fi
fi

echo "✅ Vite found at: $(which vite)"
echo "✅ Vite binary exists at: node_modules/.bin/vite"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist

# Set environment variables
export NODE_ENV=production
export VITE_APP_ENV=production

# Build the project
echo "🔨 Building project with Vite..."
echo "🔧 Using config: vite.config.prod.js"
echo "🌍 Environment: $NODE_ENV"

# Try multiple build approaches
if ./node_modules/.bin/vite build --config vite.config.prod.js; then
    echo "✅ Build completed successfully with explicit path!"
elif node_modules/.bin/vite build --config vite.config.prod.js; then
    echo "✅ Build completed successfully with relative path!"
elif npx vite build --config vite.config.prod.js; then
    echo "✅ Build completed successfully with npx!"
else
    echo "❌ All build approaches failed"
    echo "🔍 Debugging information:"
    echo "   - Current directory: $(pwd)"
    echo "   - Vite binary: $(ls -la node_modules/.bin/vite)"
    echo "   - Package.json scripts:"
    cat package.json | grep -A 20 '"scripts"'
    exit 1
fi

# Verify build output
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
    echo "✅ Build output verified successfully!"
    echo "📁 Build output:"
    ls -la dist/
    echo "📊 Build size:"
    du -sh dist/
    
    # Additional verification
    echo "🔍 Verifying key files:"
    if [ -f "dist/assets/index-*.js" ]; then
        echo "✅ JavaScript bundle found"
    fi
    if [ -f "dist/assets/index-*.css" ]; then
        echo "✅ CSS bundle found"
    fi
else
    echo "❌ Build verification failed! dist/ directory or index.html not found."
    echo "🔍 Current directory contents:"
    ls -la
    if [ -d "dist" ]; then
        echo "🔍 dist/ directory contents:"
        ls -la dist/ || true
    fi
    exit 1
fi

echo "🎉 Vercel build script completed successfully!"
echo "🚀 Ready for deployment!"
